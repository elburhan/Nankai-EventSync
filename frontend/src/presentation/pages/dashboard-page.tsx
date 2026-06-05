import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { eventService } from '../../business/services/event.service';
import { APP_ROUTES } from '../../shared/constants/app-route';
import { useAuth } from '../../shared/hooks/use-auth';
import { useNotification } from '../../shared/hooks/use-notification';
import type { RecommendedEventItem } from '../../shared/types/event';
import { ConfirmationDialog } from '../components/confirmation-dialog';
import { EmptyState } from '../components/empty-state';
import { ErrorState } from '../components/error-state';
import { LoadingState } from '../components/loading-state';
import { RecommendedEventList } from '../components/recommended-event-list';

const featureCards = [
  {
    key: 'discover',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" aria-hidden="true">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
    color: 'bg-brand-100 text-brand-600',
  },
  {
    key: 'sync',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" aria-hidden="true">
        <polyline points="23 4 23 10 17 10" />
        <polyline points="1 20 1 14 7 14" />
        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
      </svg>
    ),
    color: 'bg-emerald-100 text-emerald-600',
  },
  {
    key: 'manage',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" aria-hidden="true">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
    color: 'bg-gold-100 text-gold-600',
  },
] as const;

export const DashboardPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, deleteAccount } = useAuth();
  const { notify } = useNotification();
  const isOrganizer = user?.role === 'organizer';
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [recommendedEvents, setRecommendedEvents] = useState<RecommendedEventItem[]>([]);
  const [isRecommendationsLoading, setIsRecommendationsLoading] = useState(true);
  const [recommendationError, setRecommendationError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadRecommendations = async () => {
      setIsRecommendationsLoading(true);
      setRecommendationError(null);

      try {
        const feed = await eventService.getHomeFeed(6);

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
  }, [t]);

  const handleDeleteAccount = async () => {
    setIsDeletingAccount(true);

    try {
      const summary = await deleteAccount();
      notify({
        tone: 'success',
        title: t('toasts.accountDeleted'),
        description: t('toasts.accountDeletedDescription', {
          events: summary.deletedOwnedEventCount,
          rsvps: summary.deletedRsvpCount,
          messages: summary.deletedMessageCount,
        }),
      });
      navigate(APP_ROUTES.LOGIN, { replace: true });
    } catch (error) {
      notify({
        tone: 'error',
        title: t('dashboard.deleteTitle'),
        description: error instanceof Error ? error.message : t('toasts.genericError'),
      });
    } finally {
      setIsDeletingAccount(false);
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <div className="animate-fade-in space-y-8">
      <section className="relative overflow-hidden rounded-5xl bg-navy-gradient px-8 py-12 text-white shadow-lifted">
        <div className="pointer-events-none absolute inset-0 bg-hero-mesh opacity-50" />
        <div className="pointer-events-none absolute inset-0 bg-hero-grid bg-hero-grid opacity-20" />

        <div className="relative z-10">
          <span className="inline-flex items-center gap-2 rounded-full border border-gold-400/30 bg-gold-400/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-gold-300">
            {t('dashboard.eyebrow')}
          </span>

          <h1 className="mt-5 text-4xl font-extrabold tracking-tight sm:text-5xl">
            {t('dashboard.greeting', { name: user?.fullName ?? t('common.eventsync') })}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-300">
            {t('dashboard.description')}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              to={APP_ROUTES.EVENTS}
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-ink transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              {t('dashboard.explore')}
            </Link>
            {isOrganizer ? (
              <Link
                to={APP_ROUTES.CREATE_EVENT}
                className="inline-flex items-center gap-2 rounded-full bg-gold-shine px-6 py-3 text-sm font-semibold text-ink shadow-sm transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
              >
                {t('dashboard.createEvent')}
              </Link>
            ) : null}
            <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-white/80 backdrop-blur-sm">
              {t('dashboard.role', { role: t(`role.${user?.role ?? 'student'}`) })}
            </span>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {featureCards.map((card) => (
          <div
            key={card.key}
            className="group rounded-4xl border border-white/60 bg-white/90 p-6 shadow-card backdrop-blur transition hover:shadow-panel"
          >
            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${card.color} transition group-hover:scale-105`}>
              {card.icon}
            </div>
            <p className="mt-5 text-xs font-bold uppercase tracking-widest text-slate-400">
              {t(`dashboard.${card.key}`)}
            </p>
            <h2 className="mt-2 text-lg font-bold text-ink">
              {t(`dashboard.${card.key}Title`)}
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
              {card.key === 'manage'
                ? isOrganizer
                  ? t('dashboard.manageBodyOrganizer')
                  : t('dashboard.manageBodyStudent')
                : t(`dashboard.${card.key}Body`)}
            </p>
          </div>
        ))}
      </section>

      <section className="space-y-4">
        <div className="rounded-4xl border border-white/60 bg-white/90 p-6 shadow-card backdrop-blur">
          <p className="text-xs font-bold uppercase tracking-widest text-brand-700">
            {t('recommendations.title')}
          </p>
          <h2 className="mt-2 text-2xl font-bold text-ink">{t('recommendations.dashboardHeading')}</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            {t('recommendations.dashboardDescription')}
          </p>
        </div>

        {isRecommendationsLoading ? (
          <LoadingState
            title={t('recommendations.loadingTitle')}
            message={t('recommendations.loadingMessage')}
          />
        ) : null}
        {!isRecommendationsLoading && recommendationError ? (
          <ErrorState title={t('recommendations.errorTitle')} message={recommendationError} />
        ) : null}
        {!isRecommendationsLoading && !recommendationError && recommendedEvents.length > 0 ? (
          <RecommendedEventList items={recommendedEvents} />
        ) : null}
        {!isRecommendationsLoading && !recommendationError && recommendedEvents.length === 0 ? (
          <EmptyState
            title={t('recommendations.noUpcomingTitle')}
            message={t('recommendations.noUpcomingMessage')}
          />
        ) : null}
      </section>

      <section className="rounded-4xl border border-red-100 bg-white/90 p-8 shadow-card backdrop-blur">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-red-100 text-red-500">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14H6L5 6" />
              <path d="M10 11v6" />
              <path d="M14 11v6" />
              <path d="M9 6V4h6v2" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-xs font-bold uppercase tracking-widest text-red-500">
              {t('dashboard.accountSettings')}
            </p>
            <h2 className="mt-2 text-xl font-bold text-ink">{t('dashboard.deleteTitle')}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500">
              {t('dashboard.deleteDescription')}
            </p>
            <button
              type="button"
              onClick={() => setIsDeleteDialogOpen(true)}
              disabled={isDeletingAccount}
              className="mt-5 rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isDeletingAccount ? t('dashboard.deletingButton') : t('dashboard.deleteButton')}
            </button>
          </div>
        </div>
      </section>

      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        isBusy={isDeletingAccount}
        tone="danger"
        title={t('dashboard.deleteConfirmTitle')}
        message={t('dashboard.deleteConfirmMessage')}
        confirmLabel={t('dashboard.deleteButton')}
        onCancel={() => setIsDeleteDialogOpen(false)}
        onConfirm={() => void handleDeleteAccount()}
      />
    </div>
  );
};
