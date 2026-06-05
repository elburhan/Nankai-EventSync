import type { MessageResponseDto } from './message-response.dto';

export interface EventRoomStateDto {
  eventId: string;
  attendeeCount: number;
  isAttending: boolean;
  canChat: boolean;
  messages: MessageResponseDto[];
}
