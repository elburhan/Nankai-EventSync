import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { eventService } from '../../business/services/event.service';
import { APP_ROUTES, getEventDetailRoute } from '../../shared/constants/app-route';
import { useAuth } from '../../shared/hooks/use-auth';
import { useNotification } from '../../shared/hooks/use-notification';
import type { EventFormValues, EventItem } from '../../shared/types/event';
import { ErrorState } from '../components/error-state';
import { EventForm } from '../components/event-form';
import { LoadingState } from '../components/loading-state';

export const EditEventPage = () => {
  const { t } = useTranslation();
  const { eventId } = useParams<{ eventId: string }>();
  const { user } = useAuth();
  const { notify } = useNotification();
  const navigate = useNavigate();
  const [event, setEvent] = useState<EventItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!eventId) {
      return;
    }

    let isMounted = true;

    const loadEvent = async () => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const eventDetail = await eventService.getEventById(eventId);

        if (!isMounted) {
          return;
        }

        setEvent(eventDetail);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setErrorMessage(error instanceof Error ? error.message : 'Unable to load this event.');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadEvent();

    return () => {
      isMounted = false;
    };
  }, [eventId]);

  const initialValues = useMemo(() => eventService.toEventFormValues(event ?? undefined), [event]);

  if (!eventId) {
    return <Navigate to={APP_ROUTES.EVENTS} replace />;
  }

  if (isLoading) {
    return <LoadingState title={t('eventForm.editEyebrow')} message={t('eventDetail.loadingMessage')} />;
  }

  if (errorMessage || !event) {
    return (
      <ErrorState
        title={t('eventForm.editEyebrow')}
        message={errorMessage ?? 'This event could not be found.'}
        actionLabel={t('eventDetail.back')}
        onAction={() => navigate(APP_ROUTES.EVENTS)}
      />
    );
  }

  if (user?.id !== event.organizer.id) {
    return <Navigate to={getEventDetailRoute(event.id)} replace />;
  }

  const handleSubmit = async (values: EventFormValues) => {
    setIsSubmitting(true);

    try {
      const updatedEvent = await eventService.updateEvent(eventId, values);
      notify({
        tone: 'success',
        title: t('toasts.eventUpdated'),
        description: t('toasts.eventUpdatedDescription'),
      });
      navigate(getEventDetailRoute(updatedEvent.id));
    } catch (error) {
      notify({
        tone: 'error',
        title: t('eventForm.editEyebrow'),
        description: error instanceof Error ? error.message : t('toasts.genericError'),
      });
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Link to={getEventDetailRoute(event.id)} className="inline-flex rounded-full bg-white/80 px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:bg-white">
        {t('eventDetail.back')}
      </Link>

      <EventForm
        mode="edit"
        initialValues={initialValues}
        isSubmitting={isSubmitting}
        submitLabel={t('eventForm.editSubmit')}
        onSubmit={handleSubmit}
      />
    </div>
  );
};
