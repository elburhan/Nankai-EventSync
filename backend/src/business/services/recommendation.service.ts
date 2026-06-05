import { EventRepository } from '../../data-access/repositories/event.repository';
import { RsvpRepository } from '../../data-access/repositories/rsvp.repository';
import { env } from '../../integration/config/env';
import { logger } from '../../shared/utils/logger';
import type { AuthenticatedUser } from '../../shared/types/auth';
import type { EventResponseDto } from '../dto/event-response.dto';
import type { RecommendationResponseDto } from '../dto/recommendation-response.dto';
import { groqRecommendationClient } from '../../integration/ai/groq-recommendation-client';

interface UserPreferenceProfile {
  currentDate: string;
  favoriteCategories: string[];
  favoriteTags: string[];
  pastRsvpTitles: string[];
}

interface CachedRecommendationEntry {
  expiresAt: number;
  recommendations: RecommendationResponseDto[];
}

type HomeFeedFallbackPath = 'none' | 'fresh' | 'organizerSafe' | 'global';

interface HomeFeedResponse {
  items: RecommendationResponseDto[];
  meta: {
    interactionCount: number;
    isColdStart: boolean;
    usedFallback: boolean;
    debugFallbackPath?: HomeFeedFallbackPath;
    debugPersonalizedCount?: number;
    debugFallbackCount?: number;
  };
}

export interface RecommendationCandidateEvent {
  _id: { toString(): string };
  title: string;
  description: string;
  category: string;
  location: string;
  timezone: string;
  startAt: Date;
  endAt: Date;
  posterUrl?: string;
  capacity?: number;
  attendeeCount: number;
  tags: string[];
  status: EventResponseDto['status'];
  organizerId: unknown;
  createdAt: Date;
  updatedAt: Date;
  visibility?: 'public' | 'private' | 'internal' | string;
  isPrivate?: boolean;
  isInternal?: boolean;
}

const RECOMMENDATION_CACHE_TTL_MS = 30 * 60 * 1000;
const RECOMMENDATION_CANDIDATE_LIMIT = 24;
const HOME_FEED_INTERACTION_THRESHOLD = 3;
const recommendationCache = new Map<string, CachedRecommendationEntry>();

/**
 * Home-feed eligibility is intentionally strict:
 * - only `published` events are allowed into the feed
 * - events must not have started yet, so past/in-progress items are excluded
 * - private or internal events are excluded through either `visibility`
 *   or the legacy `isPrivate` / `isInternal` flags
 */
export const isEligibleFeedEvent = (event: RecommendationCandidateEvent): boolean => {
  const visibility = typeof event.visibility === 'string'
    ? event.visibility.toLowerCase()
    : 'public';

  const isPrivateOrInternal = visibility === 'private'
    || visibility === 'internal'
    || event.isPrivate === true
    || event.isInternal === true;

  return event.status === 'published'
    && event.startAt.getTime() >= Date.now()
    && !isPrivateOrInternal;
};

export const buildFreshFallback = (
  candidateEvents: RecommendationCandidateEvent[],
  authenticatedUserId: string,
  excludedEventIds: Set<string>,
): RecommendationCandidateEvent[] => {
  return candidateEvents.filter((event) => {
    const eventId = event._id.toString();

    return (
      isEligibleFeedEvent(event) &&
      extractOrganizerId(event.organizerId) !== authenticatedUserId &&
      !excludedEventIds.has(eventId)
    );
  });
};

export const buildOrganizerSafeFallback = (
  candidateEvents: RecommendationCandidateEvent[],
  authenticatedUserId: string,
): RecommendationCandidateEvent[] => {
  return candidateEvents.filter((event) => {
    return isEligibleFeedEvent(event) && extractOrganizerId(event.organizerId) !== authenticatedUserId;
  });
};

export const buildGlobalFallback = (
  candidateEvents: RecommendationCandidateEvent[],
): RecommendationCandidateEvent[] => {
  return candidateEvents.filter(isEligibleFeedEvent);
};

export const collectUniqueEvents = (
  eventGroups: RecommendationCandidateEvent[][],
  limit: number,
): RecommendationCandidateEvent[] => {
  const uniqueEvents = new Map<string, RecommendationCandidateEvent>();

  for (const group of eventGroups) {
    for (const event of group) {
      const eventId = event._id.toString();

      if (!uniqueEvents.has(eventId)) {
        uniqueEvents.set(eventId, event);
      }

      if (uniqueEvents.size >= limit) {
        return Array.from(uniqueEvents.values());
      }
    }
  }

  return Array.from(uniqueEvents.values());
};

const extractOrganizerId = (organizerId: unknown): string => {
  if (typeof organizerId === 'string') {
    return organizerId;
  }

  if (
    typeof organizerId === 'object' &&
    organizerId !== null &&
    'toString' in organizerId &&
    typeof organizerId.toString === 'function' &&
    !('id' in organizerId)
  ) {
    return organizerId.toString();
  }

  if (typeof organizerId === 'object' && organizerId !== null) {
    const populatedOrganizer = organizerId as {
      id?: string;
      _id?: { toString(): string };
    };

    return populatedOrganizer.id ?? populatedOrganizer._id?.toString() ?? '';
  }

  return '';
};

export class RecommendationService {
  constructor(
    private readonly eventRepository = new EventRepository(),
  private readonly rsvpRepository = new RsvpRepository(),
  ) {}

  public async getRecommendations(
    authenticatedUser: AuthenticatedUser,
    limit: number,
  ): Promise<RecommendationResponseDto[]> {
    const cacheKey = `${authenticatedUser.id}:${limit}`;
    const cachedEntry = recommendationCache.get(cacheKey);

    if (cachedEntry && cachedEntry.expiresAt > Date.now()) {
      return cachedEntry.recommendations;
    }

    const rsvps = await this.rsvpRepository.findGoingByUserId(authenticatedUser.id);
    const rsvpEventIds = rsvps.map((rsvp) => rsvp.eventId.toString());
    const [pastRsvpEvents, upcomingEvents] = await Promise.all([
      rsvpEventIds.length > 0
        ? this.eventRepository.findManyByIds(rsvpEventIds)
        : Promise.resolve([]),
      this.eventRepository.findUpcomingPublished(RECOMMENDATION_CANDIDATE_LIMIT),
    ]);

    const rsvpEventIdSet = new Set(rsvpEventIds);
    const candidateEvents = upcomingEvents.filter((event) => {
      const eventId = event._id.toString();
      const organizerId = extractOrganizerId(event.organizerId);

      if (!isEligibleFeedEvent(event)) {
        return false;
      }

      if (rsvpEventIdSet.has(eventId)) {
        return false;
      }

      if (organizerId === authenticatedUser.id) {
        return false;
      }

      return true;
    });

    const profile = this.buildUserPreferenceProfile(pastRsvpEvents);
    const recommendations = await this.buildRecommendations(
      authenticatedUser,
      profile,
      candidateEvents,
      limit,
    );

    recommendationCache.set(cacheKey, {
      expiresAt: Date.now() + RECOMMENDATION_CACHE_TTL_MS,
      recommendations,
    });

    return recommendations;
  }

  public async getHomeFeed(
    authenticatedUser: AuthenticatedUser,
    limit: number,
  ): Promise<HomeFeedResponse> {
    const rsvps = await this.rsvpRepository.findGoingByUserId(authenticatedUser.id);
    const interactionCount = rsvps.length;
    const isColdStart = interactionCount < HOME_FEED_INTERACTION_THRESHOLD;
    const recommendationLimit = Math.max(limit, 4);

    const personalizedRecommendations = isColdStart
      ? []
      : await this.getRecommendations(authenticatedUser, recommendationLimit);

    const fallbackFeed = await this.buildChronologicalFallbackFeed(
      authenticatedUser,
      recommendationLimit * 2,
      rsvps.map((rsvp) => rsvp.eventId.toString()),
    );

    const mergedItems = this.mergeRecommendationSets(
      personalizedRecommendations,
      fallbackFeed.items,
      limit,
    );
    const usedFallback = isColdStart || mergedItems.length > personalizedRecommendations.length;
    const fallbackPathUsed: HomeFeedFallbackPath = usedFallback ? fallbackFeed.path : 'none';

    logger.info({
      userId: authenticatedUser.id,
      personalizedCount: personalizedRecommendations.length,
      fallbackPath: fallbackPathUsed,
      interactionCount,
      resultCount: mergedItems.length,
      usedFallback,
    }, 'Home feed generated.');

    const meta: HomeFeedResponse['meta'] = {
      interactionCount,
      isColdStart,
      usedFallback,
    };

    // These debug-only fields are present for local/dev tuning and may be omitted in test/production.
    if (env.NODE_ENV === 'development') {
      meta.debugFallbackPath = fallbackPathUsed;
      meta.debugPersonalizedCount = personalizedRecommendations.length;
      meta.debugFallbackCount = fallbackFeed.items.length;
    }

    return {
      items: mergedItems,
      meta,
    };
  }

  private async buildRecommendations(
    authenticatedUser: AuthenticatedUser,
    profile: UserPreferenceProfile,
    candidateEvents: RecommendationCandidateEvent[],
    limit: number,
  ): Promise<RecommendationResponseDto[]> {
    if (candidateEvents.length === 0) {
      return [];
    }

    if (groqRecommendationClient.isConfigured()) {
      try {
        const aiRecommendations = await groqRecommendationClient.generateRecommendations(
          profile,
          candidateEvents.map((event) => ({
            id: event._id.toString(),
            title: event.title,
            category: event.category,
            startAt: event.startAt.toISOString(),
            tags: event.tags,
          })),
          limit,
        );

        const eventById = new Map(
          candidateEvents.map((event) => [event._id.toString(), event]),
        );

        const resolvedRecommendations = aiRecommendations
          .map((recommendation) => {
            const event = eventById.get(recommendation.eventId);

            if (!event) {
              return null;
            }

            return {
              event: this.mapEvent(event),
              reason: recommendation.reason,
            };
          })
          .filter((recommendation): recommendation is RecommendationResponseDto => recommendation !== null)
          .slice(0, limit);

        if (resolvedRecommendations.length > 0) {
          return resolvedRecommendations;
        }
      } catch (error) {
        logger.warn(
          {
            err: error,
            userId: authenticatedUser.id,
            role: authenticatedUser.role,
            favoriteCategories: profile.favoriteCategories,
            favoriteTags: profile.favoriteTags,
            candidateCount: candidateEvents.length,
            limit,
          },
          'Groq recommendation generation failed. Falling back to content-based matching.',
        );
      }
    }

    return this.buildFallbackRecommendations(profile, candidateEvents, limit);
  }

  private buildFallbackRecommendations(
    profile: UserPreferenceProfile,
    candidateEvents: RecommendationCandidateEvent[],
    limit: number,
  ): RecommendationResponseDto[] {
    const categoryWeightMap = new Map<string, number>();
    const tagWeightMap = new Map<string, number>();

    profile.favoriteCategories.forEach((category, index) => {
      categoryWeightMap.set(category, profile.favoriteCategories.length - index);
    });

    profile.favoriteTags.forEach((tag, index) => {
      tagWeightMap.set(tag.toLowerCase(), profile.favoriteTags.length - index);
    });

    const scoredEvents = candidateEvents
      .map((event) => {
        const categoryScore = categoryWeightMap.get(event.category) ?? 0;
        const tagScore = event.tags.reduce((score, tag) => {
          return score + (tagWeightMap.get(tag.toLowerCase()) ?? 0);
        }, 0);
        const recencyBonus = Math.max(0, 5 - Math.floor((event.startAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
        const totalScore = categoryScore * 3 + tagScore * 2 + recencyBonus;

        return {
          event,
          totalScore,
          reason: this.buildFallbackReason(event.category, event.tags, profile),
        };
      })
      .sort((first, second) => {
        if (second.totalScore !== first.totalScore) {
          return second.totalScore - first.totalScore;
        }

        return first.event.startAt.getTime() - second.event.startAt.getTime();
      })
      .slice(0, limit);

    return scoredEvents.map((entry) => ({
      event: this.mapEvent(entry.event),
      reason: entry.reason,
    }));
  }

  private async buildChronologicalFallbackFeed(
    authenticatedUser: AuthenticatedUser,
    limit: number,
    existingRsvpEventIds: string[],
  ): Promise<{ items: RecommendationResponseDto[]; path: HomeFeedFallbackPath }> {
    const excludedEventIds = new Set(existingRsvpEventIds);
    const candidateEvents = (await this.eventRepository.findUpcomingPublished(
      Math.max(limit * 4, RECOMMENDATION_CANDIDATE_LIMIT),
    )).filter(isEligibleFeedEvent);

    const freshFallbackEvents = buildFreshFallback(candidateEvents, authenticatedUser.id, excludedEventIds);
    const organizerSafeFallbackEvents = buildOrganizerSafeFallback(candidateEvents, authenticatedUser.id);
    const globalFallbackEvents = buildGlobalFallback(candidateEvents);

    const mergedFallbackEvents = collectUniqueEvents(
      [
        freshFallbackEvents,
        organizerSafeFallbackEvents,
        globalFallbackEvents,
      ],
      limit,
    );

    return {
      items: mergedFallbackEvents.map((event) => ({
        event: this.mapEvent(event),
        reason: `Upcoming ${event.category.toLowerCase()} event for your campus feed.`,
      })),
      path: this.resolveFallbackPath(
        mergedFallbackEvents,
        freshFallbackEvents,
        organizerSafeFallbackEvents,
      ),
    };
  }

  private mergeRecommendationSets(
    primaryItems: RecommendationResponseDto[],
    fallbackItems: RecommendationResponseDto[],
    limit: number,
  ): RecommendationResponseDto[] {
    const mergedItems = new Map<string, RecommendationResponseDto>();

    for (const item of primaryItems) {
      mergedItems.set(item.event.id, item);
    }

    for (const item of fallbackItems) {
      if (!mergedItems.has(item.event.id)) {
        mergedItems.set(item.event.id, item);
      }
    }

    return Array.from(mergedItems.values()).slice(0, limit);
  }

  private buildFallbackReason(
    category: string,
    tags: string[],
    profile: UserPreferenceProfile,
  ): string {
    const matchedCategory = profile.favoriteCategories.includes(category);

    if (matchedCategory) {
      return `Based on your interest in ${category} events.`;
    }

    const matchedTag = tags.find((tag) => profile.favoriteTags.includes(tag));

    if (matchedTag) {
      return `Recommended because you often RSVP to events tagged ${matchedTag}.`;
    }

    return `A strong upcoming ${category.toLowerCase()} event that matches your campus activity patterns.`;
  }

  private buildUserPreferenceProfile(
    pastRsvpEvents: RecommendationCandidateEvent[],
  ): UserPreferenceProfile {
    const categoryCounts = new Map<string, number>();
    const tagCounts = new Map<string, number>();

    pastRsvpEvents.forEach((event) => {
      categoryCounts.set(event.category, (categoryCounts.get(event.category) ?? 0) + 1);

      event.tags.forEach((tag) => {
        tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
      });
    });

    return {
      currentDate: new Date().toISOString(),
      favoriteCategories: this.sortKeysByCount(categoryCounts),
      favoriteTags: this.sortKeysByCount(tagCounts),
      pastRsvpTitles: pastRsvpEvents.map((event) => event.title).slice(0, 10),
    };
  }

  private sortKeysByCount(countMap: Map<string, number>): string[] {
    return [...countMap.entries()]
      .sort((first, second) => second[1] - first[1])
      .map(([key]) => key)
      .slice(0, 5);
  }

  private resolveFallbackPath(
    selectedEvents: RecommendationCandidateEvent[],
    freshFallbackEvents: RecommendationCandidateEvent[],
    organizerSafeFallbackEvents: RecommendationCandidateEvent[],
  ): HomeFeedFallbackPath {
    if (selectedEvents.length === 0) {
      return 'none';
    }

    const selectedEventIds = new Set(selectedEvents.map((event) => event._id.toString()));
    const freshEventIds = new Set(freshFallbackEvents.map((event) => event._id.toString()));
    const organizerSafeEventIds = new Set(
      organizerSafeFallbackEvents.map((event) => event._id.toString()),
    );

    const usedGlobalFallback = [...selectedEventIds].some((eventId) => !organizerSafeEventIds.has(eventId));

    if (usedGlobalFallback) {
      return 'global';
    }

    const usedOrganizerSafeFallback = [...selectedEventIds].some((eventId) => !freshEventIds.has(eventId));

    if (usedOrganizerSafeFallback) {
      return 'organizerSafe';
    }

    return 'fresh';
  }

  private mapEvent(event: RecommendationCandidateEvent): EventResponseDto {
    const organizer =
      typeof event.organizerId === 'object' && event.organizerId !== null
        ? {
            id: extractOrganizerId(event.organizerId),
            fullName:
              'fullName' in event.organizerId && typeof event.organizerId.fullName === 'string'
                ? event.organizerId.fullName
                : 'Unknown Organizer',
            email:
              'email' in event.organizerId && typeof event.organizerId.email === 'string'
                ? event.organizerId.email
                : 'unknown@example.com',
          }
        : {
            id: extractOrganizerId(event.organizerId),
            fullName: 'Unknown Organizer',
            email: 'unknown@example.com',
          };

    return {
      id: event._id.toString(),
      title: event.title,
      description: event.description,
      category: event.category,
      location: event.location,
      timezone: event.timezone,
      startAt: event.startAt,
      endAt: event.endAt,
      posterUrl: event.posterUrl,
      capacity: event.capacity,
      attendeeCount: event.attendeeCount,
      tags: event.tags,
      status: event.status,
      organizer,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
    };
  }
}
