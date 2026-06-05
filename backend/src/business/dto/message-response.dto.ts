import type { MessageType } from '../../data-access/models/message.model';
import type { UserRole } from '../../shared/constants/user-role';

export interface MessageResponseDto {
  id: string;
  eventId: string;
  sender: {
    id: string;
    fullName: string;
    role: UserRole;
  };
  body: string;
  messageType: MessageType;
  isEdited: boolean;
  createdAt: Date;
  updatedAt: Date;
}
