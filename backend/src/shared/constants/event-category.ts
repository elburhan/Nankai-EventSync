export const EVENT_CATEGORIES = ['Academic', 'Sports', 'Art and culture', 'Others'] as const;

export type EventCategory = (typeof EVENT_CATEGORIES)[number];
