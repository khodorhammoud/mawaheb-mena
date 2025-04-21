// NotificationService — Handles all business logic related to notifications.
// - Creates new notification records in the database
// - Fetches notifications for a specific user
// This service is used by both the REST API and event-driven systems (like SSE).

import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

export interface CreateNotificationDto {
  userId: number;
  type: string;
  message: string;
  payload?: Record<string, any>;
}

@Injectable()
export class NotificationService {
  constructor(private readonly databaseService: DatabaseService) {}

  /** Persist a new notification row */
  async create(notification: CreateNotificationDto) {
    const { notificationsTable } = await import('@mawaheb/db');

    const [result] = await this.databaseService.db
      .insert(notificationsTable)
      .values({
        userId: notification.userId,
        type: notification.type,
        title: notification.type,
        message: notification.message,
        payload: notification.payload ?? {},
        isRead: false,
      })
      .returning();

    return result;
  }

  /** Fetch all notifications for a user */
  async getUserNotifications(userId: number, limit = 100, offset = 0) {
    // Use SQL template literals instead of the eq operator
    const { notificationsTable } = await import('@mawaheb/db');
    const { sql, desc } = await import('drizzle-orm');

    const rows = await this.databaseService.db
      .select()
      .from(notificationsTable)
      .where(sql`${notificationsTable.userId} = ${userId}`)
      .orderBy(sql`${notificationsTable.createdAt} DESC`) // Sort by newest first
      .limit(limit)
      .offset(offset);

    return rows;
  }
}
