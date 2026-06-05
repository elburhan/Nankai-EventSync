import { useTranslation } from 'react-i18next';

import type { EventItem } from '../../shared/types/event';
import { EmptyState } from './empty-state';
import { EventCard } from './event-card';

interface EventListProps {
  events: EventItem[];
}

export const EventList = ({ events }: EventListProps) => {
  const { t } = useTranslation();

  if (events.length === 0) {
    return (
      <EmptyState
        title={t('events.noEvents')}
        message={t('events.emptyMessage')}
      />
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
};
