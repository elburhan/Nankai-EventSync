import type { EventItem } from '../types/event';
import { normalizeEventCategory, type EventCategory } from '../constants/event-category';

export type EventSectionKey = EventCategory;

export const resolveEventSection = (event: EventItem): EventSectionKey => {
  const source = [event.category, event.title, event.tags.join(' ')].filter(Boolean).join(' ');
  return normalizeEventCategory(source);
};
