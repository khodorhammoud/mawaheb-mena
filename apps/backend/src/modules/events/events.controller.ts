// EventsController — Handles real-time notifications via Server-Sent Events (SSE)
// This controller is used to send notifications to the frontend (browser) when a job is finished, started, or failed.

import { Controller, Sse, Param, Res, Header } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationService } from '../notifications/notification.service';
import { Response } from 'express';

interface NotificationData {
  type: string;
  message?: string;
  timestamp?: string;
  jobId?: string;
  logicalJobId?: number;
  userId?: number;
  result?: any;
  error?: string;
  notification?: any; // Add notification field for notification events
}

@Controller('events')
export class EventsController {
  private clients: Map<number, any> = new Map();

  constructor(private readonly notificationService: NotificationService) {
    // Initialize with empty map
  }

  @Sse('notifications')
  @Header('Cache-Control', 'no-cache')
  @Header('Connection', 'keep-alive')
  @Header('Content-Type', 'text/event-stream')
  notifications(): Observable<MessageEvent> {
    return new Observable<MessageEvent>((subscriber) => {
      // Send initial connection event
      const connectionEvent = new MessageEvent('message', {
        data: JSON.stringify({
          type: 'connection',
          message: 'Connected to notification stream',
          timestamp: new Date().toISOString(),
        } as NotificationData),
      });
      subscriber.next(connectionEvent);

      // Keep the connection alive with heartbeats - more frequent to prevent timeouts
      const interval = setInterval(() => {
        try {
          const heartbeatEvent = new MessageEvent('message', {
            data: JSON.stringify({
              type: 'heartbeat',
              timestamp: new Date().toISOString(),
            } as NotificationData),
          });
          subscriber.next(heartbeatEvent);
        } catch (error) {
          console.error('Error sending heartbeat:', error);
        }
      }, 15000); // Reduced from 30s to 15s

      return () => {
        clearInterval(interval);
      };
    });
  }

  @Sse('notifications/:userId')
  @Header('Cache-Control', 'no-cache')
  @Header('Connection', 'keep-alive')
  @Header('Content-Type', 'text/event-stream')
  userNotifications(@Param('userId') userId: string): Observable<MessageEvent> {
    const userIdNum = parseInt(userId, 10);

    return new Observable<MessageEvent>((subscriber) => {
      // Store the subscriber for this user
      this.clients.set(userIdNum, subscriber);

      // Send initial connection event
      try {
        const connectionEvent = new MessageEvent('message', {
          data: JSON.stringify({
            type: 'connection',
            message: `Connected to notification stream for user ${userIdNum}`,
            timestamp: new Date().toISOString(),
          } as NotificationData),
        });
        subscriber.next(connectionEvent);
      } catch (error) {
        console.error(
          `Error sending initial connection event to user ${userIdNum}:`,
          error,
        );
      }

      // Keep the connection alive with more frequent heartbeats
      const interval = setInterval(() => {
        try {
          const heartbeatEvent = new MessageEvent('message', {
            data: JSON.stringify({
              type: 'heartbeat',
              timestamp: new Date().toISOString(),
            } as NotificationData),
          });
          subscriber.next(heartbeatEvent);
        } catch (error) {
          console.error(`Error sending heartbeat to user ${userIdNum}:`, error);
          // Don't remove client on heartbeat error - the connection might recover
        }
      }, 15000); // More frequent heartbeats (15s instead of 30s)

      return () => {
        clearInterval(interval);
        this.clients.delete(userIdNum);
      };
    });
  }

  // Event handlers for job events
  @OnEvent('job.added')
  async handleJobAdded(payload: any) {
    try {
      // Don't create a database notification for the general job.added event
      // We only want to show specific event types (skillfolio_initiated, skillfolio_started, etc.)

      // Still emit the event via SSE for any connected clients that need real-time updates
      // but it won't be saved in notifications or shown to the user
      this.sendNotificationToUser(payload.userId, {
        type: 'job_added',
        message: `Job ${payload.type} has been added to the queue`,
        jobId: payload.jobId,
        logicalJobId: payload.logicalJobId,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error(
        `Error handling job.added event for user ${payload.userId}:`,
        error,
      );
    }
  }

  @OnEvent('job.started')
  async handleJobStarted(payload: any) {
    try {
      // Don't create a database notification for the general job.started event
      // We only want to show specific event types (skillfolio_initiated, skillfolio_started, etc.)

      // Still emit the event via SSE for any connected clients that need real-time updates
      // but it won't be saved in notifications or shown to the user
      this.sendNotificationToUser(payload.userId, {
        type: 'job_started',
        message: `Job ${payload.type} is now being processed`,
        jobId: payload.jobId,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error(
        `Error handling job.started event for user ${payload.userId}:`,
        error,
      );
    }
  }

  @OnEvent('job.completed')
  async handleJobCompleted(payload: any) {
    try {
      // Skip creating a notification if the payload indicates one was already created
      if (payload.notificationCreated) {
        // Still send an SSE message if a client is connected
        if (payload.notification) {
          this.sendNotificationToUser(payload.userId, {
            type: 'notification',
            message: `Job ${payload.type} has been completed successfully`,
            jobId: payload.jobId,
            result: payload.result,
            timestamp: new Date().toISOString(),
            notification: payload.notification,
          });
        }
        return;
      }

      // Don't create a database notification for the general job.completed event
      // We only want to show specific event types (skillfolio_initiated, skillfolio_started, etc.)

      // Still emit the event via SSE for any connected clients that need real-time updates
      // but it won't be saved in notifications or shown to the user
      this.sendNotificationToUser(payload.userId, {
        type: 'job_completed',
        message: `Job ${payload.type} has been completed successfully`,
        jobId: payload.jobId,
        timestamp: new Date().toISOString(),
        result: payload.result,
      });
    } catch (error) {
      console.error(
        `Error handling job.completed event for user ${payload.userId}:`,
        error,
      );
    }
  }

  @OnEvent('job.failed')
  async handleJobFailed(payload: any) {
    try {
      // Don't create a database notification for the general job.failed event
      // We only want to show specific event types (skillfolio_initiated, skillfolio_started, etc.)

      // Still emit the event via SSE for any connected clients that need real-time updates
      // but it won't be saved in notifications or shown to the user
      this.sendNotificationToUser(payload.userId, {
        type: 'job_failed',
        message: `Job ${payload.type} processing has failed`,
        jobId: payload.jobId,
        timestamp: new Date().toISOString(),
        error: payload.error,
      });
    } catch (error) {
      console.error(
        `Error handling job.failed event for user ${payload.userId}:`,
        error,
      );
    }
  }

  // Add a new event handler for notification creation
  @OnEvent('notification.created')
  async handleNotificationCreated(payload: {
    userId: number;
    notification: any;
  }) {
    try {
      // Send notification to connected user
      this.sendNotificationToUser(payload.userId, {
        type: 'notification',
        notification: payload.notification,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error(
        `Error handling notification.created event for user ${payload.userId}:`,
        error,
      );
    }
  }

  private sendNotificationToUser(
    userId: number,
    notification: NotificationData,
  ) {
    try {
      const client = this.clients.get(userId);
      if (client) {
        const event = new MessageEvent('message', {
          data: JSON.stringify(notification),
        });
        client.next(event);
      } else {
      }
    } catch (error) {
      console.error(`Error sending notification to user ${userId}:`, error);
    }
  }
}
