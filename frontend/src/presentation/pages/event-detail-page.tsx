import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { eventService } from '../../business/services/event.service';
import { eventRoomService } from '../../business/services/event-room.service';
import { getEventCategoryTranslationKey, normalizeEventCategory } from '../../shared/constants/event-category';
import { APP_ROUTES, getEditEventRoute } from '../../shared/constants/app-route';
import { useAuth } from '../../shared/hooks/use-auth';
import { useNotification } from '../../shared/hooks/use-notification';
import type { EventItem, EventMessage, EventRoomState } from '../../shared/types/event';
import type { MessageCreatedPayload, RsvpUpdatedPayload } from '../../shared/types/socket';
import { formatEventDate } from '../../shared/utils/date-format';
import { AttendeeCounter } from '../components/attendee-counter';
import { ChatPanel } from '../components/chat-panel';
import { ConfirmationDialog } from '../components/confirmation-dialog';
import { DateBadge } from '../components/date-badge';
import { ErrorState } from '../components/error-state';
import { EventTemporalStatus } from '../components/event-temporal-status';
import { LoadingState } from '../components/loading-state';
import { RsvpActionCard } from '../components/rsvp-action-card';

const statusOptions = [
  { value: 'draft' as const },
  { value: 'published' as const },
  { value: 'completed' as const },
  { value: 'cancelled' as const },
];

const statusPillStyles: Record<string, string> = {
  published: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  draft: 'border-amber-200 bg-amber-50 text-amber-700',
  cancelled: 'border-red-200 bg-red-50 text-red-700',
  completed: 'border-slate-200 bg-slate-100 text-slate-600',
};

const mergeMessages = (currentMessages: EventMessage[], incomingMessage: EventMessage): EventMessage[] => {
  const nextMessages = currentMessages.filter((message) => message.id !== incomingMessage.id);
  nextMessages.push(incomingMessage);
  return nextMessages.sort((firstMessage, secondMessage) => {
    return new Date(firstMessage.createdAt).getTime() - new Date(secondMessage.createdAt).getTime();
  });
};

interface CanSendEventMessagesOptions {
  currentUserId?: string;
  currentUserRole?: string;
  organizerId?: string;
  roomCanChat?: boolean;
}

const canSendEventMessages = ({
  currentUserId,
  currentUserRole,
  organizerId,
  roomCanChat,
}: CanSendEventMessagesOptions): boolean => {
  if (currentUserRole === 'admin') return true;
  if (currentUserId && organizerId && currentUserId === organizerId) return true;

  return roomCanChat === true;
};

export const EventDetailPage = () => {
  const { t } = useTranslation();
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const { notify } = useNotification();

  const [event, setEvent] = useState<EventItem | null>(null);
  const [roomState, setRoomState] = useState<EventRoomState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRsvpSaving, setIsRsvpSaving] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [isDeletingEvent, setIsDeletingEvent] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [socketError, setSocketError] = useState<string | null>(null);

  const isOwnerOrganizer = useMemo(() => {
    return Boolean(user && event && user.id === event.organizer.id);
  }, [event, user]);
  const isAdmin = user?.role === 'admin';
  const canDeleteEvent = Boolean(isOwnerOrganizer || isAdmin);

  const canSendMessages = useMemo(() => {
    return canSendEventMessages({
      currentUserId: user?.id,
      currentUserRole: user?.role,
      organizerId: event?.organizer.id,
      roomCanChat: roomState?.canChat,
    });
  }, [event?.organizer.id, roomState?.canChat, user?.id, user?.role]);
  const isAttending = roomState?.isAttending ?? false;

  const currentStatus = event?.status ?? 'draft';
  const normalizedCategory = event ? normalizeEventCategory(event.category) : null;

  useEffect(() => {
    if (!eventId || !token) return;

    let isMounted = true;
    let cleanupJoined: () => void = () => undefined;
    let cleanupRsvp: () => void = () => undefined;
    let cleanupMessage: () => void = () => undefined;
    let cleanupSocketError: () => void = () => undefined;

    const loadPage = async () => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const eventDetail = await eventRoomService.getEventById(eventId);

        if (!isMounted) return;

        setEvent(eventDetail);
        eventRoomService.connect(token);

        cleanupJoined = eventRoomService.onEventJoined((payload) => {
          if (!isMounted || payload.eventId !== eventId) return;
          setRoomState(payload);
          setEvent((currentEvent) => {
            if (!currentEvent) return currentEvent;
            return eventRoomService.mergeRoomState(currentEvent, payload);
          });
          setSocketError(null);
        });

        cleanupRsvp = eventRoomService.onRsvpUpdated((payload: RsvpUpdatedPayload) => {
          if (!isMounted || payload.eventId !== eventId) return;
          setEvent((currentEvent) =>
            currentEvent ? { ...currentEvent, attendeeCount: payload.attendeeCount } : currentEvent,
          );
          setRoomState((currentRoomState) =>
            currentRoomState
              ? { ...currentRoomState, attendeeCount: payload.attendeeCount }
              : currentRoomState,
          );
        });

        cleanupMessage = eventRoomService.onMessageCreated((payload: MessageCreatedPayload) => {
          if (!isMounted || payload.eventId !== eventId) return;
          setRoomState((currentRoomState) =>
            currentRoomState
              ? { ...currentRoomState, messages: mergeMessages(currentRoomState.messages, payload.message) }
              : currentRoomState,
          );
        });

        cleanupSocketError = eventRoomService.onSocketError((payload) => {
          if (!isMounted) return;
          setSocketError(payload.message);
        });

        eventRoomService.joinRoom(eventId);
      } catch (error) {
        if (!isMounted) return;
        setErrorMessage(error instanceof Error ? error.message : 'Unable to load this event right now.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    void loadPage();

    return () => {
      isMounted = false;
      eventRoomService.leaveRoom(eventId);
      cleanupJoined();
      cleanupRsvp();
      cleanupMessage();
      cleanupSocketError();
    };
  }, [eventId, token]);

  useEffect(() => {
    if (!import.meta.env.DEV) return;

    console.debug('[EventSync] Event chat permission', {
      currentUserId: user?.id ?? null,
      currentUserRole: user?.role ?? null,
      eventOrganizerId: event?.organizer.id ?? null,
      isAttending,
      roomCanChat: roomState?.canChat ?? null,
      canSendMessages,
    });
  }, [canSendMessages, event?.organizer.id, isAttending, roomState?.canChat, user?.id, user?.role]);

  const handleToggleRsvp = async () => {
    if (!eventId || !event || isOwnerOrganizer || isAdmin) return;

    const nextIsAttending = !isAttending;
    const previousAttendeeCount = event.attendeeCount;
    const optimisticAttendeeCount = Math.max(previousAttendeeCount + (nextIsAttending ? 1 : -1), 0);

    setIsRsvpSaving(true);
    setSocketError(null);
    setRoomState((currentRoomState) =>
      currentRoomState
        ? { ...currentRoomState, isAttending: nextIsAttending, canChat: nextIsAttending, attendeeCount: optimisticAttendeeCount }
        : currentRoomState,
    );
    setEvent({ ...event, attendeeCount: optimisticAttendeeCount });

    try {
      const response = nextIsAttending
        ? await eventRoomService.createRsvp(eventId)
        : await eventRoomService.cancelRsvp(eventId);

      setRoomState((currentRoomState) =>
        currentRoomState
          ? {
              ...currentRoomState,
              isAttending: response.status === 'going',
              canChat: response.status === 'going',
              attendeeCount: response.attendeeCount,
            }
          : currentRoomState,
      );
      setEvent((currentEvent) =>
        currentEvent ? { ...currentEvent, attendeeCount: response.attendeeCount } : currentEvent,
      );
    } catch (error) {
      setRoomState((currentRoomState) =>
        currentRoomState
          ? { ...currentRoomState, isAttending, canChat: isAttending, attendeeCount: previousAttendeeCount }
          : currentRoomState,
      );
      setEvent({ ...event, attendeeCount: previousAttendeeCount });
      setSocketError(error instanceof Error ? error.message : 'Unable to update your RSVP right now.');
      notify({
        tone: 'error',
        title: 'RSVP update failed',
        description: error instanceof Error ? error.message : 'Unable to update your RSVP right now.',
      });
    } finally {
      setIsRsvpSaving(false);
    }
  };

  const handleSendMessage = async (body: string) => {
    if (!eventId) return;
    setIsSendingMessage(true);
    setSocketError(null);
    try {
      await eventRoomService.sendMessage(eventId, body);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to send that message.';
      setSocketError(message);
      notify({
        tone: 'error',
        title: 'Message not sent',
        description: message,
      });
      throw error;
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleDeleteEvent = async () => {
    if (!event || !canDeleteEvent) return;
    setIsDeletingEvent(true);
    try {
      await eventService.deleteEvent(event.id);
      notify({
        tone: 'success',
        title: t('toasts.eventDeleted'),
        description: t('toasts.eventDeletedDescription'),
      });
      eventRoomService.leaveRoom(event.id);
      navigate(APP_ROUTES.EVENTS, { replace: true });
    } catch (error) {
      notify({
        tone: 'error',
        title: t('eventDetail.delete'),
        description: error instanceof Error ? error.message : t('toasts.genericError'),
      });
    } finally {
      setIsDeletingEvent(false);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleStatusChange = async (status: EventItem['status']) => {
    if (!event || !isOwnerOrganizer || event.status === status) return;
    setIsUpdatingStatus(true);
    try {
      const updatedEvent = await eventService.updateEventStatus(event.id, status);
      setEvent(updatedEvent);
      notify({
        tone: 'success',
        title: t('toasts.statusUpdated'),
        description: t('toasts.statusUpdatedDescription', { status: t(`eventForm.labels.${status}`) }),
      });
    } catch (error) {
      notify({
        tone: 'error',
        title: t('eventDetail.statusPanel'),
        description: error instanceof Error ? error.message : t('toasts.genericError'),
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  if (isLoading) {
    return <LoadingState title={t('eventDetail.loadingTitle')} message={t('eventDetail.loadingMessage')} />;
  }

  if (errorMessage || !event) {
    return (
      <ErrorState
        title={t('events.errorTitle')}
        message={errorMessage ?? t('eventDetail.notFound')}
        actionLabel={t('eventDetail.back')}
        onAction={() => { window.location.assign(APP_ROUTES.EVENTS); }}
      />
    );
  }

  return (
    <div className="animate-fade-in space-y-8">
      {/* ─── Top action bar ──────────────────────────────────── */}
      <div className="flex flex-wrap gap-2">
        <Link
          to={APP_ROUTES.EVENTS}
          className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-medium text-slate-600 shadow-card transition hover:bg-white hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5" aria-hidden="true">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          {t('eventDetail.back')}
        </Link>
        {isOwnerOrganizer ? (
          <Link
            to={getEditEventRoute(event.id)}
            className="inline-flex items-center gap-1.5 rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
          >
            {t('eventDetail.edit')}
          </Link>
        ) : null}
        {canDeleteEvent ? (
          <button
            type="button"
            onClick={() => setIsDeleteDialogOpen(true)}
            disabled={isDeletingEvent}
            className="inline-flex items-center gap-1.5 rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isDeletingEvent ? t('eventDetail.deleting') : t('eventDetail.delete')}
          </button>
        ) : null}
      </div>

      {/* ─── Main event card ─────────────────────────────────── */}
      <section className="overflow-hidden rounded-5xl border border-white/50 bg-white/90 shadow-lifted backdrop-blur">
        <div className="grid gap-0 lg:grid-cols-[1.2fr_0.8fr]">
          {/* Left: event info */}
          <div className="space-y-6 px-6 py-8 sm:px-10 lg:px-12">
            {/* Header row */}
            <div className="flex flex-wrap items-start gap-5">
              <DateBadge value={event.startAt} />
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-gold-200 bg-gold-50 px-3 py-0.5 text-xs font-semibold uppercase tracking-widest text-gold-700">
                    {normalizedCategory ? t(getEventCategoryTranslationKey(normalizedCategory)) : event.category}
                  </span>
                  <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${statusPillStyles[event.status] ?? 'bg-slate-100 text-slate-600'}`}>
                    {t(`eventForm.labels.${event.status}`)}
                  </span>
                </div>
                <h1 className="mt-3 text-3xl font-extrabold leading-snug text-ink sm:text-4xl">
                  {event.title}
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">{event.description}</p>
                <div className="mt-4">
                  <EventTemporalStatus startAt={event.startAt} endAt={event.endAt} />
                </div>
              </div>
            </div>

            {/* Info tiles */}
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                {
                  label: t('eventDetail.starts'),
                  value: formatEventDate(event.startAt),
                  icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
                      <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                  ),
                  color: 'text-brand-500',
                },
                {
                  label: t('eventDetail.ends'),
                  value: formatEventDate(event.endAt),
                  icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
                      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                    </svg>
                  ),
                  color: 'text-slate-400',
                },
                {
                  label: t('eventDetail.location'),
                  value: event.location,
                  icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                    </svg>
                  ),
                  color: 'text-gold-500',
                },
                {
                  label: t('eventDetail.organizer'),
                  value: event.organizer.fullName,
                  icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                    </svg>
                  ),
                  color: 'text-ink',
                },
              ].map((tile) => (
                <div key={tile.label} className="flex items-start gap-3 rounded-3xl bg-slate-50 px-5 py-4">
                  <span className={`mt-0.5 shrink-0 ${tile.color}`}>{tile.icon}</span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">{tile.label}</p>
                    <p className="mt-1 text-sm font-medium text-ink">{tile.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Tags */}
            {event.tags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-ink px-3 py-1 text-xs font-semibold uppercase tracking-widest text-white">
                  {t(`eventForm.labels.${event.status}`)}
                </span>
                {event.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
                    #{tag}
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          {/* Right: poster */}
          <div className="relative min-h-72 overflow-hidden bg-gradient-to-br from-brand-100 via-blue-50 to-gold-50 lg:min-h-[22rem]">
            {event.posterUrl ? (
              <img
                src={event.posterUrl}
                alt={event.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-10 text-center bg-navy-gradient">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-12 w-12 text-gold-200"
                  aria-hidden="true"
                >
                  <rect x="3" y="4" width="18" height="17" rx="2" />
                  <path d="M8 2v4M16 2v4M3 10h18" />
                </svg>
                <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-gold-300">
                  {t('eventDetail.liveDemoReady')}
                </p>
                <p className="mt-2 text-xl font-bold text-white">{event.title}</p>
                <p className="mt-2 text-sm text-slate-300">{t('eventDetail.liveDemoDescription')}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ─── Socket error ─────────────────────────────────────── */}
      {socketError ? (
        <ErrorState title={t('eventDetail.liveRoomNotice')} message={socketError} />
      ) : null}

      {/* ─── Live room + sidebar ──────────────────────────────── */}
      <div className="grid gap-6 xl:grid-cols-[0.72fr_0.28fr]">
        <ChatPanel
          currentUserId={user?.id ?? null}
          messages={roomState?.messages ?? []}
          canChat={canSendMessages}
          isSending={isSendingMessage}
          onSend={handleSendMessage}
        />

        <div className="space-y-5">
          {/* Status control (organizer only) */}
          {isOwnerOrganizer ? (
            <section className="rounded-4xl border border-white/60 bg-white/90 p-5 shadow-panel backdrop-blur">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                {t('eventDetail.statusPanel')}
              </p>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-400">
                {t('eventDetail.statusPanelDescription')}
              </p>
              <div className="mt-4 grid gap-2">
                {statusOptions.map((option) => {
                  const isActive = currentStatus === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      disabled={isUpdatingStatus}
                      onClick={() => void handleStatusChange(option.value)}
                      className={`rounded-2xl border px-4 py-2.5 text-left text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                        isActive
                          ? `${statusPillStyles[option.value] ?? 'bg-slate-100 text-slate-600'} ring-2 ring-offset-1 ring-current/20`
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {t(`eventForm.labels.${option.value}`)}
                    </button>
                  );
                })}
              </div>
            </section>
          ) : null}

          <AttendeeCounter isLive={Boolean(roomState)} />
          <RsvpActionCard
            isPrivilegedUser={Boolean(isOwnerOrganizer || isAdmin)}
            isAdmin={Boolean(isAdmin)}
            isAttending={Boolean(isAttending)}
            isBusy={isRsvpSaving}
            onToggleRsvp={handleToggleRsvp}
          />
        </div>
      </div>

      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        isBusy={isDeletingEvent}
        tone="danger"
        title={t('eventDetail.deleteTitle')}
        message={t('eventDetail.deleteMessage')}
        confirmLabel={t('eventDetail.delete')}
        onCancel={() => setIsDeleteDialogOpen(false)}
        onConfirm={() => void handleDeleteEvent()}
      />
    </div>
  );
};
