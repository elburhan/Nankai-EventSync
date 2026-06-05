import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import {
  APP_ROUTES,
  getEditEventRoute,
  getEventDetailRoute,
} from '../../shared/constants/app-route';
import {
  getEventCategoryTranslationKey,
  normalizeEventCategory,
} from '../../shared/constants/event-category';
import { useAuth } from '../../shared/hooks/use-auth';
import type { EventItem } from '../../shared/types/event';
import { formatEventDate } from '../../shared/utils/date-format';
import { EventTemporalStatus } from './event-temporal-status';

interface EventCardProps {
  event: EventItem;
}

const statusColorMap: Record<EventItem['status'], string> = {
  published: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  draft: 'bg-amber-50 text-amber-700 border-amber-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
  completed: 'bg-slate-100 text-slate-600 border-slate-200',
};

export const EventCard = ({ event }: EventCardProps) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const canEdit = user?.role === 'organizer' && user.id === event.organizer.id;
  const normalizedCategory = normalizeEventCategory(event.category);
  const detailRoute = getEventDetailRoute(event.id);
  const detailTarget = user ? detailRoute : APP_ROUTES.LOGIN;
  const detailState = user ? undefined : { from: detailRoute };
  const detailCta = user
    ? t('events.openDetail')
    : t('events.signInToViewDetails');

  return (
    <article className="group flex flex-col overflow-hidden rounded-4xl border border-white/50 bg-white/95 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lifted">
      <div className="relative h-52 overflow-hidden bg-gradient-to-br from-brand-100 via-blue-50 to-gold-50">
        {event.posterUrl ? (
          <img
            src={event.posterUrl}
            alt={event.title}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/20 to-transparent" />

        <div className="absolute left-4 top-4 z-10">
          <span className="inline-flex items-center rounded-full border border-gold-200 bg-gold-50/90 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-gold-700 backdrop-blur-sm">
            {t(getEventCategoryTranslationKey(normalizedCategory))}
          </span>
        </div>

        <div className="absolute bottom-0 left-0 right-0 z-10 p-5">
          <h2 className="line-clamp-2 text-xl font-bold leading-snug text-white drop-shadow-sm">
            {event.title}
          </h2>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-200">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-3.5 w-3.5"
              aria-hidden="true"
            >
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {event.location}
          </p>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <EventTemporalStatus startAt={event.startAt} endAt={event.endAt} />
          <span
            className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${statusColorMap[event.status]}`}
          >
            {t(`eventForm.labels.${event.status}`)}
          </span>
        </div>

        <p className="line-clamp-2 flex-1 text-sm leading-relaxed text-slate-600">
          {event.description}
        </p>

        <div className="grid gap-2.5 sm:grid-cols-2">
          <div className="flex items-center gap-2.5 rounded-2xl bg-slate-50 px-4 py-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4 shrink-0 text-brand-400"
              aria-hidden="true"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-400">
                {t('events.starts')}
              </p>
              <p className="mt-0.5 text-sm font-medium text-ink">
                {formatEventDate(event.startAt)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 rounded-2xl bg-slate-50 px-4 py-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4 shrink-0 text-gold-500"
              aria-hidden="true"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-400">
                {t('eventDetail.organizer')}
              </p>
              <p className="mt-0.5 text-sm font-medium text-ink">
                {event.organizer.fullName}
              </p>
            </div>
          </div>
        </div>

        {event.tags.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {event.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700"
              >
                #{tag}
              </span>
            ))}
          </div>
        ) : null}

        <div className="flex flex-wrap gap-2 pt-1">
          <Link
            to={detailTarget}
            state={detailState}
            className="inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-ink focus:ring-offset-2"
          >
            {detailCta}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-3.5 w-3.5"
              aria-hidden="true"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
          {canEdit ? (
            <Link
              to={getEditEventRoute(event.id)}
              className="inline-flex items-center rounded-full border border-brand-200 bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-700 transition hover:bg-brand-100 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-2"
            >
              {t('events.editEvent')}
            </Link>
          ) : null}
        </div>
      </div>
    </article>
  );
};
