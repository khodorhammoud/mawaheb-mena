import { db } from '~/db/drizzle/connector';
import { notificationsTable } from '@mawaheb/db/src/schema/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { Notification } from '@mawaheb/db/src/types/notifications';
import { NotificationType } from '@mawaheb/db/src/types/enums';

export async function getNotifications(userId: number): Promise<Notification[]> {
  if (!userId) {
    return [];
  }

  try {
    const results = await db
      .select()
      .from(notificationsTable)
      .where(eq(notificationsTable.userId, userId))
      .orderBy(desc(notificationsTable.createdAt));

    // Map and return notifications with correct types
    return results.map(notification => {
      // Ensure ID is a number
      const id =
        typeof notification.id === 'string' ? parseInt(notification.id, 10) : notification.id;

      return {
        ...notification,
        id, // Use the processed numeric ID
        type: notification.type as NotificationType,
        createdAt: new Date(notification.createdAt),
        readAt: notification.readAt ? new Date(notification.readAt) : null,
      };
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return []; // Return empty array on error
  }
}

export async function getUnreadNotificationsCount(userId: number) {
  try {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(notificationsTable)
      .where(and(eq(notificationsTable.userId, userId), eq(notificationsTable.isRead, false)));

    return result[0].count;
  } catch (error) {
    console.error('Error fetching unread notifications count:', error);
    throw error;
  }
}

export async function markNotificationAsRead(notificationId: number, userId: number) {
  if (!notificationId || !userId) {
    throw new Error('Invalid notification ID or user ID');
  }

  try {
    const result = await db
      .update(notificationsTable)
      .set({
        isRead: true,
        readAt: new Date(),
      })
      .where(and(eq(notificationsTable.id, notificationId), eq(notificationsTable.userId, userId)))
      .returning();

    return result[0];
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
}

export async function createNotification({
  userId,
  type,
  title,
  message,
  payload = {},
}: {
  userId: number;
  type: NotificationType;
  title: string;
  message: string;
  payload?: Record<string, any>;
}) {
  try {
    const result = await db
      .insert(notificationsTable)
      .values({
        userId,
        type,
        title,
        message,
        payload,
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
}

export async function markAllNotificationsAsRead(userId: number) {
  try {
    const result = await db
      .update(notificationsTable)
      .set({
        isRead: true,
        readAt: new Date(),
      })
      .where(and(eq(notificationsTable.userId, userId), eq(notificationsTable.isRead, false)))
      .returning();

    return result;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
}

export async function getNotificationById(
  notificationId: number,
  userId: number
): Promise<Notification | null> {
  if (!notificationId || !userId) {
    return null;
  }

  try {
    const results = await db
      .select()
      .from(notificationsTable)
      .where(and(eq(notificationsTable.id, notificationId), eq(notificationsTable.userId, userId)))
      .limit(1);

    if (results.length === 0) {
      return null;
    }

    const notification = results[0];
    // Ensure ID is a number
    const id =
      typeof notification.id === 'string' ? parseInt(notification.id, 10) : notification.id;

    return {
      ...notification,
      id, // Use the processed numeric ID
      type: notification.type as NotificationType,
      createdAt: new Date(notification.createdAt),
      readAt: notification.readAt ? new Date(notification.readAt) : null,
    };
  } catch (error) {
    console.error('Error fetching notification by ID:', error);
    return null;
  }
}
