import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  buildFreshFallback,
  buildGlobalFallback,
  buildOrganizerSafeFallback,
  collectUniqueEvents,
  isEligibleFeedEvent,
  RecommendationService,
} from '../../src/business/services/recommendation.service';
import type { EventRepository } from '../../src/data-access/repositories/event.repository';
import type { RsvpRepository } from '../../src/data-access/repositories/rsvp.repository';
import type { AuthenticatedUser } from '../../src/shared/types/auth';

const buildEventFixture = (id: string, overrides: Partial<Record<string, unknown>> = {}) => ({
  _id: { toString: () => id },
  title: `Event ${id}`,
  description: 'Recommendation test event description.',
  category: 'Academic',
  location: 'Main Hall',
  timezone: 'Asia/Shanghai',
  startAt: new Date('2026-06-10T10:00:00.000Z'),
  endAt: new Date('2026-06-10T12:00:00.000Z'),
  attendeeCount: 0,
  tags: ['ai', 'campus'],
  status: 'published',
  organizerId: {
    id: `organizer-${id}`,
    fullName: `Organizer ${id}`,
    email: `organizer-${id}@eventsync.test`,
  },
  createdAt: new Date('2026-06-01T10:00:00.000Z'),
  updatedAt: new Date('2026-06-01T10:00:00.000Z'),
  ...overrides,
});

describe('RecommendationService', () => {
  let recommendationService: RecommendationService;
  let mockEventRepository: vi.Mocked<EventRepository>;
  let mockRsvpRepository: vi.Mocked<RsvpRepository>;

  const mockUser: AuthenticatedUser = {
    id: 'student-1',
    role: 'student',
  };

  beforeEach(() => {
    vi.restoreAllMocks();

    mockEventRepository = {
      findManyByIds: vi.fn(),
      findUpcomingPublished: vi.fn(),
    } as unknown as vi.Mocked<EventRepository>;

    mockRsvpRepository = {
      findGoingByUserId: vi.fn(),
    } as unknown as vi.Mocked<RsvpRepository>;

    recommendationService = new RecommendationService(mockEventRepository, mockRsvpRepository);
  });

  describe('fallback strategy helpers', () => {
    it('buildFreshFallback excludes RSVPd events and organizer-owned events', () => {
      const candidateEvents = [
        buildEventFixture('event-1', {
          organizerId: { id: 'student-1', fullName: 'Self', email: 'self@eventsync.test' },
        }),
        buildEventFixture('event-2'),
        buildEventFixture('event-3'),
      ];

      const result = buildFreshFallback(candidateEvents as never, 'student-1', new Set(['event-3']));

      expect(result.map((event) => event._id.toString())).toEqual(['event-2']);
    });

    it('buildOrganizerSafeFallback excludes only organizer-owned events', () => {
      const candidateEvents = [
        buildEventFixture('event-1', {
          organizerId: { id: 'student-1', fullName: 'Self', email: 'self@eventsync.test' },
        }),
        buildEventFixture('event-2'),
      ];

      const result = buildOrganizerSafeFallback(candidateEvents as never, 'student-1');

      expect(result.map((event) => event._id.toString())).toEqual(['event-2']);
    });

    it('handles missing or malformed organizer data without throwing', () => {
      const candidateEvents = [
        buildEventFixture('event-1', { organizerId: undefined }),
        buildEventFixture('event-2', { organizerId: null }),
        buildEventFixture('event-3', { organizerId: { foo: 'bar' } }),
      ];

      expect(() => buildFreshFallback(candidateEvents as never, 'student-1', new Set())).not.toThrow();
      expect(() => buildOrganizerSafeFallback(candidateEvents as never, 'student-1')).not.toThrow();
      expect(buildFreshFallback(candidateEvents as never, 'student-1', new Set())).toHaveLength(3);
      expect(buildOrganizerSafeFallback(candidateEvents as never, 'student-1')).toHaveLength(3);
    });

    it('identifies only published future public events as eligible', () => {
      expect(isEligibleFeedEvent(buildEventFixture('eligible-1') as never)).toBe(true);
      expect(isEligibleFeedEvent(buildEventFixture('past-1', {
        startAt: new Date('2020-06-10T10:00:00.000Z'),
      }) as never)).toBe(false);
      expect(isEligibleFeedEvent(buildEventFixture('cancelled-1', {
        status: 'cancelled',
      }) as never)).toBe(false);
      expect(isEligibleFeedEvent(buildEventFixture('malformed-status-1', {
        status: 'private',
      }) as never)).toBe(false);
      expect(isEligibleFeedEvent(buildEventFixture('private-1', {
        visibility: 'private',
      }) as never)).toBe(false);
      expect(isEligibleFeedEvent(buildEventFixture('internal-1', {
        visibility: 'internal',
      }) as never)).toBe(false);
    });

    it('collectUniqueEvents keeps insertion order and removes duplicates across strategy groups', () => {
      const eventOne = buildEventFixture('event-1');
      const eventTwo = buildEventFixture('event-2');
      const eventThree = buildEventFixture('event-3');

      const result = collectUniqueEvents(
        [
          [eventOne, eventTwo],
          [eventTwo, eventThree],
          [eventOne],
        ] as never,
        3,
      );

      expect(result.map((event) => event._id.toString())).toEqual(['event-1', 'event-2', 'event-3']);
      expect(buildGlobalFallback([eventOne, eventTwo]).map((event) => event._id.toString())).toEqual([
        'event-1',
        'event-2',
      ]);
    });

    it('buildGlobalFallback filters clearly ineligible events out of the fallback pool', () => {
      const result = buildGlobalFallback([
        buildEventFixture('event-1'),
        buildEventFixture('event-2', { status: 'cancelled' }),
        buildEventFixture('event-3', { visibility: 'private' }),
      ] as never);

      expect(result.map((event) => event._id.toString())).toEqual(['event-1']);
    });
  });

  it('returns a non-empty home feed during cold start when upcoming published events exist', async () => {
    mockRsvpRepository.findGoingByUserId.mockResolvedValue([]);
    mockEventRepository.findUpcomingPublished.mockResolvedValue([
      buildEventFixture('event-1'),
      buildEventFixture('event-2'),
    ] as never);

    const result = await recommendationService.getHomeFeed(mockUser, 4);

    expect(result.meta.isColdStart).toBe(true);
    expect(result.meta.interactionCount).toBe(0);
    expect(typeof result.meta.usedFallback).toBe('boolean');
    expect(result.items).toHaveLength(2);
    expect(result.items[0]?.event.id).toBe('event-1');
  });

  it('fills with fallback events when personalized recommendations are too small', async () => {
    mockRsvpRepository.findGoingByUserId.mockResolvedValue([
      { eventId: { toString: () => 'rsvp-1' } },
      { eventId: { toString: () => 'rsvp-2' } },
      { eventId: { toString: () => 'rsvp-3' } },
    ] as never);
    mockEventRepository.findUpcomingPublished.mockResolvedValue([
      buildEventFixture('event-1'),
      buildEventFixture('event-2'),
      buildEventFixture('event-3'),
    ] as never);

    vi.spyOn(recommendationService, 'getRecommendations').mockResolvedValue([
      {
        event: {
          id: 'event-1',
          title: 'Event event-1',
          description: 'Recommendation test event description.',
          category: 'Academic',
          location: 'Main Hall',
          timezone: 'Asia/Shanghai',
          startAt: new Date('2026-06-10T10:00:00.000Z'),
          endAt: new Date('2026-06-10T12:00:00.000Z'),
          attendeeCount: 0,
          tags: ['ai', 'campus'],
          status: 'published',
          organizer: {
            id: 'organizer-event-1',
            fullName: 'Organizer event-1',
            email: 'organizer-event-1@eventsync.test',
          },
          createdAt: new Date('2026-06-01T10:00:00.000Z'),
          updatedAt: new Date('2026-06-01T10:00:00.000Z'),
        },
        reason: 'Because you liked similar events.',
      },
    ]);

    const result = await recommendationService.getHomeFeed(mockUser, 3);

    expect(result.meta.isColdStart).toBe(false);
    expect(result.meta.usedFallback).toBe(true);
    expect(result.items).toHaveLength(3);
    expect(result.items.map((item) => item.event.id)).toEqual(['event-1', 'event-2', 'event-3']);
  });

  it('returns exactly the requested limit when many eligible fallback candidates exist', async () => {
    mockRsvpRepository.findGoingByUserId.mockResolvedValue([]);
    mockEventRepository.findUpcomingPublished.mockResolvedValue([
      buildEventFixture('event-1'),
      buildEventFixture('event-2'),
      buildEventFixture('event-3'),
      buildEventFixture('event-4'),
      buildEventFixture('event-5'),
    ] as never);

    const result = await recommendationService.getHomeFeed(mockUser, 3);

    expect(result.items).toHaveLength(3);
    expect(new Set(result.items.map((item) => item.event.id)).size).toBe(3);
  });

  it('returns an empty home feed explicitly when no upcoming published events exist', async () => {
    mockRsvpRepository.findGoingByUserId.mockResolvedValue([]);
    mockEventRepository.findUpcomingPublished.mockResolvedValue([] as never);

    const result = await recommendationService.getHomeFeed(mockUser, 4);

    expect(result.items).toEqual([]);
    expect(result.meta.isColdStart).toBe(true);
    expect(result.meta.usedFallback).toBe(true);
  });

  it('returns only eligible published upcoming events in the home feed', async () => {
    mockRsvpRepository.findGoingByUserId.mockResolvedValue([]);
    const candidateEvents = [
      buildEventFixture('event-1', {
        status: 'published',
        startAt: new Date('2099-06-10T10:00:00.000Z'),
      }),
      buildEventFixture('event-2', {
        status: 'cancelled',
        startAt: new Date('2099-06-10T10:00:00.000Z'),
      }),
      buildEventFixture('event-3', {
        status: 'private',
        startAt: new Date('2099-06-10T10:00:00.000Z'),
      }),
      buildEventFixture('event-4', {
        status: 'published',
        startAt: new Date('2020-06-10T10:00:00.000Z'),
      }),
    ];
    mockEventRepository.findUpcomingPublished.mockResolvedValue(candidateEvents as never);

    const result = await recommendationService.getHomeFeed(mockUser, 4);
    const eligibleIds = candidateEvents
      .filter((event) => isEligibleFeedEvent(event as never))
      .map((event) => event._id.toString());

    expect(result.items.map((item) => item.event.id)).toEqual(['event-1']);
    expect(result.items.every((item) => eligibleIds.includes(item.event.id))).toBe(true);
    expect(result.items.every((item) => item.event.status === 'published')).toBe(true);
    expect(result.items.every((item) => item.event.startAt.getTime() >= Date.now())).toBe(true);
    expect(result.meta).toMatchObject({
      interactionCount: 0,
      isColdStart: true,
      usedFallback: true,
    });
  });

  it('fills sparse personalized recommendations with eligible fallback events only', async () => {
    mockRsvpRepository.findGoingByUserId.mockResolvedValue([
      { eventId: { toString: () => 'rsvp-1' } },
      { eventId: { toString: () => 'rsvp-2' } },
      { eventId: { toString: () => 'rsvp-3' } },
    ] as never);
    mockEventRepository.findUpcomingPublished.mockResolvedValue([
      buildEventFixture('event-1', {
        status: 'published',
        startAt: new Date('2099-06-10T10:00:00.000Z'),
      }),
      buildEventFixture('event-2', {
        status: 'published',
        startAt: new Date('2099-06-11T10:00:00.000Z'),
      }),
      buildEventFixture('event-3', {
        status: 'cancelled',
        startAt: new Date('2099-06-12T10:00:00.000Z'),
      }),
    ] as never);

    vi.spyOn(recommendationService, 'getRecommendations').mockResolvedValue([
      {
        event: {
          id: 'event-1',
          title: 'Event event-1',
          description: 'Recommendation test event description.',
          category: 'Academic',
          location: 'Main Hall',
          timezone: 'Asia/Shanghai',
          startAt: new Date('2099-06-10T10:00:00.000Z'),
          endAt: new Date('2099-06-10T12:00:00.000Z'),
          attendeeCount: 0,
          tags: ['ai', 'campus'],
          status: 'published',
          organizer: {
            id: 'organizer-event-1',
            fullName: 'Organizer event-1',
            email: 'organizer-event-1@eventsync.test',
          },
          createdAt: new Date('2026-06-01T10:00:00.000Z'),
          updatedAt: new Date('2026-06-01T10:00:00.000Z'),
        },
        reason: 'Because you liked similar events.',
      },
    ]);

    const result = await recommendationService.getHomeFeed(mockUser, 3);

    expect(result.items.map((item) => item.event.id)).toEqual(['event-1', 'event-2']);
    expect(result.items.some((item) => item.event.status !== 'published')).toBe(false);
  });

  it('returns fewer than the requested limit when only a small eligible set exists', async () => {
    mockRsvpRepository.findGoingByUserId.mockResolvedValue([]);
    mockEventRepository.findUpcomingPublished.mockResolvedValue([
      buildEventFixture('event-1'),
      buildEventFixture('event-2', { status: 'cancelled' }),
    ] as never);

    const result = await recommendationService.getHomeFeed(mockUser, 4);

    expect(result.items).toHaveLength(1);
    expect(result.items[0]?.event.id).toBe('event-1');
    expect(new Set(result.items.map((item) => item.event.id)).size).toBe(result.items.length);
  });
});
