import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { eventService } from '../../business/services/event.service';
import {
  EVENT_CATEGORIES,
  getEventCategoryTranslationKey,
  type EventCategory,
} from '../../shared/constants/event-category';
import { APP_ROUTES } from '../../shared/constants/app-route';
import { useAuth } from '../../shared/hooks/use-auth';
import type { EventItem, RecommendedEventItem } from '../../shared/types/event';
import { resolveEventSection, type EventSectionKey } from '../../shared/utils/event-category';
import { EmptyState } from '../components/empty-state';
import { ErrorState } from '../components/error-state';
import { EventList } from '../components/event-list';
import { LoadingState } from '../components/loading-state';
import { RecommendedEventList } from '../components/recommended-event-list';

const sectionOrder: readonly EventSectionKey[] = EVENT_CATEGORIES;

const sectionIcons: Record<EventSectionKey, string> = {
  Academic: 'A',
  Sports: 'S',
  'Art and culture': 'C',
  Others: 'O',
};

const HOME_RECOMMENDATION_VISIBLE_LIMIT = 3;
const HOME_RECOMMENDATION_FETCH_LIMIT = HOME_RECOMMENDATION_VISIBLE_LIMIT + 1;

export const HomePage = () => {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [recommendedEvents, setRecommendedEvents] = useState<RecommendedEventItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRecommendationsLoading, setIsRecommendationsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [recommendationError, setRecommendationError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sectionFilter, setSectionFilter] = useState<'all' | EventCategory>('all');

  useEffect(() => {
    let isMounted = true;

    const loadEvents = async () => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const response = await eventService.getPublicEvents({
          status: 'published',
          upcoming: true,
          limit: 50,
        });

        if (!isMounted) {
          return;
        }

        setEvents(response.items);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setErrorMessage(error instanceof Error ? error.message : 'Unable to load events.');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadEvents();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setRecommendedEvents([]);
      setRecommendationError(null);
      setIsRecommendationsLoading(false);
      return;
    }

    let isMounted = true;

    const loadRecommendations = async () => {
      setIsRecommendationsLoading(true);
      setRecommendationError(null);

      try {
        const feed = await eventService.getHomeFeed(HOME_RECOMMENDATION_FETCH_LIMIT);

        if (!isMounted) {
          return;
        }

        setRecommendedEvents(feed.items);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        void error;
        setRecommendationError(t('recommendations.homeFeedErrorMessage'));
      } finally {
        if (isMounted) {
          setIsRecommendationsLoading(false);
        }
      }
    };

    void loadRecommendations();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, t]);

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const eventSection = resolveEventSection(event);
      const normalizedSearch = searchTerm.trim().toLowerCase();
      const matchesSection = sectionFilter === 'all' || eventSection === sectionFilter;
      const matchesSearch =
        normalizedSearch.length === 0 ||
        `${event.title} ${event.description} ${event.location} ${event.category} ${event.tags.join(' ')}`
          .toLowerCase()
          .includes(normalizedSearch);

      return matchesSection && matchesSearch;
    });
  }, [events, searchTerm, sectionFilter]);

  const hasActiveFilters = searchTerm.trim().length > 0 || sectionFilter !== 'all';
  const counterValue = hasActiveFilters ? filteredEvents.length : events.length;
  const counterLabel = hasActiveFilters ? t('home.matchingEvents') : t('home.upcomingEvents');
  const visibleRecommendedEvents = recommendedEvents.slice(0, HOME_RECOMMENDATION_VISIBLE_LIMIT);
  const hasMoreRecommendedEvents = recommendedEvents.length > visibleRecommendedEvents.length;

  const sections = useMemo(() => {
    return sectionOrder.map((sectionKey) => ({
      key: sectionKey,
      items: filteredEvents.filter((event) => resolveEventSection(event) === sectionKey),
    }));
  }, [filteredEvents]);

  const sectionMeta: Record<EventSectionKey, { title: string; description: string }> = {
    Academic: {
      title: t('categories.academic'),
      description: t('home.sectionDescriptionAcademic'),
    },
    Sports: {
      title: t('categories.sports'),
      description: t('home.sectionDescriptionSports'),
    },
    'Art and culture': {
      title: t('categories.artAndCulture'),
      description: t('home.sectionDescriptionCultural'),
    },
    Others: {
      title: t('categories.others'),
      description: t('home.sectionDescriptionOthers'),
    },
  };

  return (
    <div className="animate-fade-in space-y-10">
      <section className="relative overflow-hidden rounded-5xl bg-navy-gradient px-6 py-12 text-white shadow-lifted sm:px-10 lg:px-14">
        <div className="pointer-events-none absolute inset-0 bg-hero-mesh opacity-60" />
        <div className="pointer-events-none absolute inset-0 bg-hero-grid bg-hero-grid opacity-30" />

        <div className="relative z-10 grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="flex flex-col justify-center">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-gold-400/30 bg-gold-400/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-gold-300">
              <span className="h-1.5 w-1.5 rounded-full bg-gold-400" aria-hidden="true" />
              {t('home.heroEyebrow')}
            </span>
            <h1 className="mt-5 max-w-2xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-[3.25rem]">
              {t('home.heroTitle')}
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-300">
              {t('home.heroDescription')}
            </p>

            {!isAuthenticated ? (
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to={APP_ROUTES.LOGIN}
                  className="rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  {t('home.loginCta')}
                </Link>
                <Link
                  to={APP_ROUTES.REGISTER}
                  className="rounded-full bg-gold-shine px-6 py-3 text-sm font-semibold text-ink shadow-sm transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
                >
                  {t('home.registerCta')}
                </Link>
              </div>
            ) : (
              <div className="mt-8">
                <Link
                  to={APP_ROUTES.EVENTS}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-ink shadow-sm transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  {t('home.browseAll')}
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </Link>
              </div>
            )}
          </div>

          <div className="rounded-4xl border border-white/15 bg-white/10 p-6 backdrop-blur-md">
            <div className="grid gap-5">
              <label className="block">
                <span className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-gold-300">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5" aria-hidden="true">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  {t('home.searchLabel')}
                </span>
                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder={t('home.searchPlaceholder')}
                  className="w-full rounded-2xl border border-white/20 bg-white/90 px-4 py-3 text-sm text-ink placeholder-slate-400 outline-none transition focus:border-white focus:bg-white focus:ring-2 focus:ring-gold-400/30"
                />
              </label>

              <label className="block">
                <span className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-gold-300">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5" aria-hidden="true">
                    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                  </svg>
                  {t('home.categoryLabel')}
                </span>
                <select
                  value={sectionFilter}
                  onChange={(event) => setSectionFilter(event.target.value as 'all' | EventCategory)}
                  className="w-full rounded-2xl border border-white/20 bg-white/90 px-4 py-3 text-sm text-ink outline-none transition focus:border-white focus:bg-white focus:ring-2 focus:ring-gold-400/30"
                >
                  <option value="all">{t('home.allCategories')}</option>
                  {EVENT_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {t(getEventCategoryTranslationKey(category))}
                    </option>
                  ))}
                </select>
              </label>

              <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-center">
                <p className="text-2xl font-bold text-white">{counterValue}</p>
                <p className="text-xs text-slate-300">{counterLabel}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {isLoading ? (
        <LoadingState title={t('events.loadingTitle')} message={t('events.loadingMessage')} />
      ) : null}
      {!isLoading && errorMessage ? (
        <ErrorState
          title={t('events.errorTitle')}
          message={errorMessage}
          actionLabel={t('common.tryAgain')}
          onAction={() => window.location.reload()}
        />
      ) : null}
      {!isLoading && !errorMessage && events.length === 0 ? (
        <EmptyState title={t('home.emptyUpcomingTitle')} message={t('home.emptyUpcomingMessage')} />
      ) : null}
      {!isLoading && !errorMessage && events.length > 0 && filteredEvents.length === 0 ? (
        <EmptyState title={t('home.emptySearchTitle')} message={t('home.emptySearchMessage')} />
      ) : null}

      {isAuthenticated ? (
        <section className="space-y-4">
          <div className="rounded-[2rem] border border-white/60 bg-white/85 p-6 shadow-panel backdrop-blur">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-700">
              {t('recommendations.title')}
            </p>
            <p className="mt-2 text-sm text-slate-600">{t('recommendations.homeDescription')}</p>
          </div>

          {isRecommendationsLoading ? (
            <LoadingState
              title={t('recommendations.loadingTitle')}
              message={t('recommendations.loadingMessage')}
            />
          ) : null}
          {!isRecommendationsLoading && recommendationError ? (
            <ErrorState
              title={t('recommendations.errorTitle')}
              message={recommendationError}
            />
          ) : null}
          {!isRecommendationsLoading && !recommendationError && visibleRecommendedEvents.length > 0 ? (
            <>
              <RecommendedEventList items={visibleRecommendedEvents} />
              {hasMoreRecommendedEvents ? (
                <div className="flex justify-center">
                  <Link
                    to={APP_ROUTES.EVENTS}
                    className="inline-flex rounded-full border border-ink/10 bg-white px-5 py-2.5 text-sm font-semibold text-ink shadow-sm transition hover:border-gold-300 hover:text-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
                  >
                    {t('home.browseAll')}
                  </Link>
                </div>
              ) : null}
            </>
          ) : null}
          {!isRecommendationsLoading && !recommendationError && recommendedEvents.length === 0 ? (
            <EmptyState
              title={t('recommendations.noUpcomingTitle')}
              message={t('recommendations.noUpcomingMessage')}
            />
          ) : null}
        </section>
      ) : null}

      {!isLoading && !errorMessage && filteredEvents.length > 0
        ? sections.map((section) => (
            <section key={section.key} className="space-y-5">
              <div className="flex items-center gap-4">
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-ink text-sm font-bold text-white shadow-sm"
                  aria-hidden="true"
                >
                  {sectionIcons[section.key]}
                </span>
                <div className="flex-1 border-l-4 border-gold-400 pl-4">
                  <p className="text-base font-bold text-ink">{sectionMeta[section.key].title}</p>
                  <p className="text-xs text-slate-500">{sectionMeta[section.key].description}</p>
                </div>
              </div>

              {section.items.length > 0 ? (
                <EventList events={section.items} />
              ) : (
                <EmptyState title={sectionMeta[section.key].title} message={t('home.emptySection')} />
              )}
            </section>
          ))
        : null}
    </div>
  );
};
