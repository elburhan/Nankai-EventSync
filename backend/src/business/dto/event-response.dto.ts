import type { EventStatus } from '../../shared/constants/event-status';

export interface EventOrganizerDto {
  id: string;
  fullName: string;
  email: string;
}

export interface EventResponseDto {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  timezone: string;
  startAt: Date;
  endAt: Date;
  posterUrl?: string;
  capacity?: number;
  attendeeCount: number;
  tags: string[];
  status: EventStatus;
  organizer: EventOrganizerDto;
  createdAt: Date;
  updatedAt: Date;
}
