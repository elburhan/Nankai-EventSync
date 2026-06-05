import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { eventService } from '../../business/services/event.service';
import { APP_ROUTES } from '../../shared/constants/app-route';
import { useAuth } from '../../shared/hooks/use-auth';
import { useEventDateRangeQuery } from '../../shared/hooks/use-event-date-range-query';
import { useNotification } from '../../shared/hooks/use-notification';
import type { EventItem } from '../../shared/types/event';
import { formatEventDate } from '../../shared/utils/date-format';
import { AdminEventTable } from '../components/admin-event-table';
import { CalendarView } from '../components/calendar-view';
import { ConfirmationDialog } from '../components/confirmation-dialog';
import { EmptyState } from '../components/empty-state';
import { ErrorState } from '../components/error-state';
import { EventList } from '../components/event-list';
import { LoadingState } from '../components/loading-state';

export const EventsPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { notify } = useNotification();
  const isAdmin = user?.role === 'admin';
  const isOrganizer = user?.role === 'organizer';
  const [events, setEvents] = useState<EventItem[]>([]);
  const [adminEvents, setAdminEvents] = useState<EventItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [adminActionErrorMessage, setAdminActionErrorMessage] = useState<string | null>(null);
  const [eventPendingDeletion, setEventPendingDeletion] = useState<EventItem | null>(null);
  const [deletingEventId, setDeletingEventId] = useState<string | null>(null);
  const [updatingEventId, setUpdatingEventId] = useState<string | null>(null);
  const {
    currentMonth,
    filters,
    visibleRange,
    setFromDate,
    setToDate,
    setStatusFilter,
    setOrganizerFilter,
    setSearchText,
    goToPreviousMonth,
    goToNextMonth,
    buildCalendarQuery,
    buildEventListQuery,
  } = useEventDateRangeQuery();

  const loadEvents = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const calendarQuery = buildCalendarQuery();
      const adminEventQuery = buildEventListQuery({
        page: 1,
        limit: 50,
      });

      if (!isAdmin) {
        delete adminEventQuery.organizerId;
      }

      const [calendarEvents, adminEventResponse] = await Promise.all([
        eventService.getCalendarEvents(calendarQuery),
        isAdmin
          ? eventService.getEvents(adminEventQuery)
          : Promise.resolve({ items: [], pagination: undefined }),
      ]);

      setEvents(calendarEvents);
      setAdminEvents(adminEventResponse.items);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to load events.');
    } finally {
      setIsLoading(false);
    }
  }, [buildCalendarQuery, buildEventListQuery, isAdmin]);

  useEffect(() => {
    void loadEvents();
  }, [loadEvents]);

  const handleDeleteEvent = async () => {
    if (!eventPendingDeletion) {
      return;
    }

    setAdminActionErrorMessage(null);
    setDeletingEventId(eventPendingDeletion.id);

    try {
      await eventService.deleteEvent(eventPendingDeletion.id);
      setAdminActionErrorMessage(null);
      notify({
        tone: 'success',
        title: t('toasts.eventDeleted'),
        description: t('toasts.eventDeletedDescription'),
      });
      await loadEvents();
    } catch (error) {
      void error;
      setAdminActionErrorMessage(t('events.adminTableDeleteErrorMessage'));
    } finally {
      setDeletingEventId(null);
      setEventPendingDeletion(null);
    }
  };

  const handleStatusUpdate = async (
    event: EventItem,
    status: EventItem['status'],
  ) => {
    setAdminActionErrorMessage(null);
    setUpdatingEventId(event.id);

    try {
      await eventService.updateEventStatus(event.id, status);
      setAdminActionErrorMessage(null);
      notify({
        tone: 'success',
        title: t('toasts.statusUpdated'),
        description: t('toasts.statusUpdatedDescription', {
          status: t(`eventForm.labels.${status}`),
        }),
      });
      await loadEvents();
    } catch (error) {
      void error;
      setAdminActionErrorMessage(t('events.adminTableStatusErrorMessage'));
    } finally {
      setUpdatingEventId(null);
    }
  };

  const hasVisibleEvents = events.length > 0;
  const hasVisibleAdminEvents = isAdmin && adminEvents.length > 0;

  return (
    <div className="animate-fade-in space-y-8">
      <section className="rounded-4xl border border-white/60 bg-white/85 p-8 shadow-panel backdrop-blur">
        <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gold-600">
          <span className="h-1.5 w-1.5 rounded-full bg-gold-500" aria-hidden="true" />
          {t('events.eyebrow')}
        </span>
        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-ink">{t('events.title')}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500">
              {t('events.description')}
            </p>
          </div>
          {isOrganizer ? (
            <Link
              to={APP_ROUTES.CREATE_EVENT}
              className="inline-flex shrink-0 items-center gap-2 rounded-full bg-gold-shine px-5 py-2.5 text-sm font-semibold text-ink shadow-sm transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              {t('events.create')}
            </Link>
          ) : null}
        </div>
        <div className="mt-6 grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_12rem_10rem_10rem_auto_auto]">
          <input
            value={filters.searchText}
            onChange={(event) => setSearchText(event.target.value)}
            placeholder={t('events.searchPlaceholder')}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
          {isAdmin ? (
            <input
              value={filters.organizerId}
              onChange={(event) => setOrganizerFilter(event.target.value)}
              placeholder={t('events.organizerFilterPlaceholder')}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
          ) : null}
          <select
            value={filters.status}
            onChange={(event) => setStatusFilter(event.target.value as 'all' | EventItem['status'])}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          >
            <option value="all">{t('events.allStatuses')}</option>
            <option value="published">{t('eventForm.labels.published')}</option>
            <option value="completed">{t('eventForm.labels.completed')}</option>
            <option value="cancelled">{t('eventForm.labels.cancelled')}</option>
            {user?.role !== 'student' ? <option value="draft">{t('eventForm.labels.draft')}</option> : null}
          </select>
          <input
            type="date"
            value={visibleRange.fromDate}
            onChange={(event) => setFromDate(event.target.value)}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            aria-label={t('events.fromDate')}
          />
          <input
            type="date"
            value={visibleRange.toDate}
            onChange={(event) => setToDate(event.target.value)}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            aria-label={t('events.toDate')}
          />
          <button
            type="button"
            onClick={goToPreviousMonth}
            className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            {t('events.previousMonth')}
          </button>
          <button
            type="button"
            onClick={goToNextMonth}
            className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            {t('events.nextMonth')}
          </button>
        </div>
        <p className="mt-3 text-xs text-slate-500">
          {isAdmin
            ? t('events.adminScope')
            : isOrganizer
              ? t('events.organizerScope')
              : t('events.studentScope')}
        </p>
      </section>

      {isLoading ? (
        <LoadingState title={t('events.loadingTitle')} message={t('events.loadingMessage')} />
      ) : null}
      {!isLoading && errorMessage ? (
        <ErrorState
          title={t('events.errorTitle')}
          message={errorMessage}
          actionLabel={t('common.tryAgain')}
          onAction={() => void loadEvents()}
        />
      ) : null}
      {!isLoading && !errorMessage && !hasVisibleEvents && !hasVisibleAdminEvents ? (
        <EmptyState title={t('events.emptyTitle')} message={t('events.emptyMessage')} />
      ) : null}
      {!isLoading && !errorMessage && (hasVisibleEvents || hasVisibleAdminEvents) ? (
        <>
          {hasVisibleEvents ? <CalendarView events={events} baseDate={currentMonth} /> : null}
          {isAdmin ? (
            <section className="space-y-4">
              <div className="rounded-4xl border border-white/60 bg-white/90 p-6 shadow-card backdrop-blur">
                <p className="text-xs font-bold uppercase tracking-widest text-brand-700">
                  {t('events.adminTableEyebrow')}
                </p>
                <h2 className="mt-2 text-2xl font-bold text-ink">{t('events.adminTableTitle')}</h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">
                  {t('events.adminTableDescription')}
                </p>
              </div>
              <AdminEventTable
                events={adminEvents}
                deletingEventId={deletingEventId}
                updatingEventId={updatingEventId}
                actionErrorMessage={adminActionErrorMessage}
                onDeleteRequest={(event) => setEventPendingDeletion(event)}
                onStatusUpdate={handleStatusUpdate}
                onDismissActionError={() => setAdminActionErrorMessage(null)}
              />
            </section>
          ) : null}
          {hasVisibleEvents ? <EventList events={events} /> : null}
        </>
      ) : null}

      <ConfirmationDialog
        isOpen={Boolean(eventPendingDeletion)}
        isBusy={Boolean(deletingEventId)}
        tone="danger"
        title={t('events.adminTableDeleteConfirmTitle')}
        message={
          eventPendingDeletion
            ? t('events.adminTableDeleteConfirmMessage', {
                title: eventPendingDeletion.title,
                date: formatEventDate(eventPendingDeletion.startAt),
              })
            : ''
        }
        confirmLabel={t('events.tableDelete')}
        onCancel={() => setEventPendingDeletion(null)}
        onConfirm={() => void handleDeleteEvent()}
      />
    </div>
  );
};
