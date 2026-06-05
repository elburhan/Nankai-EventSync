import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { getEventDetailRoute } from '../../shared/constants/app-route';
import type { EventItem } from '../../shared/types/event';
import { formatEventDate } from '../../shared/utils/date-format';
import { EmptyState } from './empty-state';

interface AdminEventTableProps {
  events: EventItem[];
  deletingEventId: string | null;
  updatingEventId: string | null;
  actionErrorMessage: string | null;
  onDeleteRequest: (event: EventItem) => void;
  onStatusUpdate: (event: EventItem, status: EventItem['status']) => void;
  onDismissActionError: () => void;
}

export const AdminEventTable = ({
  events,
  deletingEventId,
  updatingEventId,
  actionErrorMessage,
  onDeleteRequest,
  onStatusUpdate,
  onDismissActionError,
}: AdminEventTableProps) => {
  const { t } = useTranslation();

  if (events.length === 0) {
    return (
      <EmptyState
        title={t('events.adminTableEmptyTitle')}
        message={t('events.adminTableEmptyMessage')}
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-4xl border border-white/60 bg-white/90 shadow-card backdrop-blur">
      {actionErrorMessage ? (
        <div className="border-b border-red-100 bg-red-50/90 px-5 py-4 text-sm text-red-900">
          <div className="flex items-start justify-between gap-4">
            <p className="leading-6">{actionErrorMessage}</p>
            <button
              type="button"
              onClick={onDismissActionError}
              className="shrink-0 rounded-full border border-red-200 px-3 py-1 text-xs font-semibold text-red-700 transition hover:bg-red-100"
            >
              {t('common.close')}
            </button>
          </div>
        </div>
      ) : null}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50/90">
            <tr className="text-left text-xs font-bold uppercase tracking-widest text-slate-500">
              <th className="px-5 py-4">{t('events.tableEvent')}</th>
              <th className="px-5 py-4">{t('events.tableOrganizer')}</th>
              <th className="px-5 py-4">{t('events.tableStatus')}</th>
              <th className="px-5 py-4">{t('events.tableStarts')}</th>
              <th className="px-5 py-4">{t('events.tableEnds')}</th>
              <th className="px-5 py-4">{t('events.tableActions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {events.map((event) => (
              <tr key={event.id} className="align-top text-sm text-slate-600">
                <td className="px-5 py-4">
                  <p className="font-semibold text-ink">{event.title}</p>
                  <p className="mt-1 text-xs text-slate-500">{event.category}</p>
                </td>
                <td className="px-5 py-4">
                  <p className="font-medium text-ink">{event.organizer.fullName}</p>
                  <p className="mt-1 text-xs text-slate-500">{event.organizer.email}</p>
                </td>
                <td className="px-5 py-4">
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-slate-600">
                    {t(`eventForm.labels.${event.status}`)}
                  </span>
                </td>
                <td className="px-5 py-4">{formatEventDate(event.startAt)}</td>
                <td className="px-5 py-4">{formatEventDate(event.endAt)}</td>
                <td className="px-5 py-4">
                  <div className="flex flex-wrap gap-2">
                    <Link
                      to={getEventDetailRoute(event.id)}
                      className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      {t('events.tableOpen')}
                    </Link>
                    <button
                      type="button"
                      onClick={() => onDeleteRequest(event)}
                      disabled={deletingEventId === event.id}
                      aria-label={`${t('events.tableDelete')} ${event.title}`}
                      className="inline-flex items-center rounded-full bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {deletingEventId === event.id ? t('events.tableDeleting') : t('events.tableDelete')}
                    </button>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {event.status !== 'published' ? (
                      <button
                        type="button"
                        onClick={() => onStatusUpdate(event, 'published')}
                        disabled={updatingEventId === event.id}
                        className="inline-flex items-center rounded-full border border-brand-200 bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700 transition hover:bg-brand-100 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {updatingEventId === event.id ? t('events.tableUpdating') : t('events.tablePublish')}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onStatusUpdate(event, 'draft')}
                        disabled={updatingEventId === event.id}
                        className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {updatingEventId === event.id ? t('events.tableUpdating') : t('events.tableMoveToDraft')}
                      </button>
                    )}
                    {event.status !== 'completed' ? (
                      <button
                        type="button"
                        onClick={() => onStatusUpdate(event, 'completed')}
                        disabled={updatingEventId === event.id}
                        className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {updatingEventId === event.id ? t('events.tableUpdating') : t('events.tableMarkCompleted')}
                      </button>
                    ) : null}
                    {event.status !== 'cancelled' ? (
                      <button
                        type="button"
                        onClick={() => onStatusUpdate(event, 'cancelled')}
                        disabled={updatingEventId === event.id}
                        className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {updatingEventId === event.id ? t('events.tableUpdating') : t('events.tableCancelEvent')}
                      </button>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
