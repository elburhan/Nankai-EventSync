import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { eventService } from '../../business/services/event.service';
import { APP_ROUTES, getEventDetailRoute } from '../../shared/constants/app-route';
import type { EventFormValues } from '../../shared/types/event';
import { useNotification } from '../../shared/hooks/use-notification';
import { EventForm } from '../components/event-form';

export const CreateEventPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { notify } = useNotification();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const initialValues = useMemo(() => eventService.toEventFormValues(), []);

  const handleSubmit = async (values: EventFormValues) => {
    setIsSubmitting(true);

    try {
      const event = await eventService.createEvent(values);
      notify({
        tone: 'success',
        title: t('toasts.eventCreated'),
        description: t('toasts.eventCreatedDescription'),
      });
      navigate(getEventDetailRoute(event.id));
    } catch (error) {
      notify({
        tone: 'error',
        title: t('eventForm.createEyebrow'),
        description: error instanceof Error ? error.message : t('toasts.genericError'),
      });
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Link to={APP_ROUTES.EVENTS} className="inline-flex rounded-full bg-white/80 px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:bg-white">
        {t('eventDetail.back')}
      </Link>

      <EventForm
        mode="create"
        initialValues={initialValues}
        isSubmitting={isSubmitting}
        submitLabel={t('eventForm.createSubmit')}
        onSubmit={handleSubmit}
      />
    </div>
  );
};
