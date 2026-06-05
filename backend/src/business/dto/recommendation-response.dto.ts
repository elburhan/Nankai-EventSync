import type { EventResponseDto } from './event-response.dto';

export interface RecommendationResponseDto {
  event: EventResponseDto;
  reason: string;
}
