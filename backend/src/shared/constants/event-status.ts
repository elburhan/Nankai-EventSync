export const EVENT_STATUSES = ['draft', 'published', 'cancelled', 'completed'] as const;

export type EventStatus = (typeof EVENT_STATUSES)[number];
