export interface EventQueryDto {
  q?: string;
  category?: string;
  status?: string;
  organizerId?: string;
  upcoming?: boolean;
  from?: string;
  to?: string;
  page: number;
  limit: number;
}

export interface CalendarEventQueryDto {
  q?: string;
  status?: string;
  organizerId?: string;
  from: string;
  to: string;
}
