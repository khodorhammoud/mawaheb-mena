import { NotificationType } from './enums';

export interface Notification {
  id: number;
  userId: number;
  type: NotificationType;
  title: string;
  message: string;
  payload: Record<string, any> | null;
  isRead: boolean;
  createdAt: Date;
  readAt: Date | null;
}
