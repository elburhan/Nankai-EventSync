export interface RsvpResponseDto {
  eventId: string;
  attendeeCount: number;
  status: 'going' | 'cancelled';
}
