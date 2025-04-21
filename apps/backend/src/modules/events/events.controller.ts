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
    console.log('EventsController initialized');
  }

  @Sse('notifications')
  @Header('Cache-Control', 'no-cache')
  @Header('Connection', 'keep-alive')
  @Header('Content-Type', 'text/event-stream')
  notifications(): Observable<MessageEvent> {
    console.log('SSE connection initiated for general notifications');

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
        console.log('SSE general connection closed');
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
    console.log(`SSE connection initiated for user ${userIdNum}`);

    return new Observable<MessageEvent>((subscriber) => {
      // Store the subscriber for this user
      this.clients.set(userIdNum, subscriber);
      console.log(
        `Client for user ${userIdNum} registered, total clients: ${this.clients.size}`,
      );

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
        console.log(`Initial connection event sent to user ${userIdNum}`);
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
        console.log(
          `SSE connection for user ${userIdNum} closed, removing client`,
        );
        clearInterval(interval);
        this.clients.delete(userIdNum);
        console.log(`Remaining clients: ${this.clients.size}`);
      };
    });
  }

  // Event handlers for job events
  @OnEvent('job.added')
  async handleJobAdded(payload: any) {
    try {
      console.log(
        `Handling job.added event for user ${payload.userId}, job ${payload.jobId}`,
      );

      // Save to database
      const notification = await this.notificationService.create({
        userId: payload.userId,
        type: 'job_added',
        message: `Job ${payload.type} has been added to the queue as job #${payload.logicalJobId}`,
        payload: {
          jobId: payload.jobId,
          logicalJobId: payload.logicalJobId,
        },
      });

      // Also send via SSE if client is connected
      this.sendNotificationToUser(payload.userId, {
        type: 'notification',
        message: `Job ${payload.type} has been added to the queue as job #${payload.logicalJobId}`,
        jobId: payload.jobId,
        logicalJobId: payload.logicalJobId,
        timestamp: new Date().toISOString(),
        notification: notification,
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
      console.log(
        `Handling job.started event for user ${payload.userId}, job ${payload.jobId}`,
      );

      // Save to database
      const notification = await this.notificationService.create({
        userId: payload.userId,
        type: 'job_started',
        message: `Job ${payload.type} #${payload.logicalJobId} is now being processed`,
        payload: {
          jobId: payload.jobId,
          logicalJobId: payload.logicalJobId,
        },
      });

      // Also send via SSE if client is connected
      this.sendNotificationToUser(payload.userId, {
        type: 'notification',
        message: `Job ${payload.type} #${payload.logicalJobId} is now being processed`,
        jobId: payload.jobId,
        logicalJobId: payload.logicalJobId,
        timestamp: new Date().toISOString(),
        notification: notification,
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
      console.log(
        `EventsController: Received job.completed event for job #${payload.jobId} (logical ID: ${payload.logicalJobId})`,
      );

      // Skip creating a notification if the payload indicates one was already created
      if (payload.notificationCreated) {
        console.log(
          `EventsController: Skipping notification creation for job #${payload.jobId} (logical ID: ${payload.logicalJobId}) as it was already created`,
        );
        // Still send an SSE message if a client is connected
        if (payload.notification) {
          this.sendNotificationToUser(payload.userId, {
            type: 'notification',
            message: `Job ${payload.type} #${payload.logicalJobId} has been completed successfully`,
            jobId: payload.jobId,
            logicalJobId: payload.logicalJobId,
            result: payload.result,
            timestamp: new Date().toISOString(),
            notification: payload.notification,
          });
        }
        return;
      }

      // Save to database
      const notification = await this.notificationService.create({
        userId: payload.userId,
        type: 'job_completed',
        message: `Job ${payload.type} #${payload.logicalJobId} has been completed successfully`,
        payload: {
          jobId: payload.jobId,
          logicalJobId: payload.logicalJobId,
          result: payload.result,
        },
      });

      console.log(
        `EventsController: Created notification id=${notification.id} for job #${payload.jobId} (logical ID: ${payload.logicalJobId})`,
      );

      // Also send via SSE if client is connected
      this.sendNotificationToUser(payload.userId, {
        type: 'notification',
        message: `Job ${payload.type} #${payload.logicalJobId} has been completed successfully`,
        jobId: payload.jobId,
        logicalJobId: payload.logicalJobId,
        result: payload.result,
        timestamp: new Date().toISOString(),
        notification: notification,
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
      console.log(
        `Handling job.failed event for user ${payload.userId}, job ${payload.jobId}`,
      );

      // Save to database
      const notification = await this.notificationService.create({
        userId: payload.userId,
        type: 'job_failed',
        message: `Job ${payload.type} has failed: ${payload.error}`,
        payload: {
          jobId: payload.jobId,
          error: payload.error,
        },
      });

      // Also send via SSE if client is connected
      this.sendNotificationToUser(payload.userId, {
        type: 'notification',
        message: `Job ${payload.type} has failed: ${payload.error}`,
        jobId: payload.jobId,
        error: payload.error,
        timestamp: new Date().toISOString(),
        notification: notification,
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
      console.log(`🔔 Notification created for user ${payload.userId}`);

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
        console.log(
          `Sending notification to user ${userId}: ${notification.type}`,
        );
        const event = new MessageEvent('message', {
          data: JSON.stringify(notification),
        });
        client.next(event);
      } else {
        console.log(`No active SSE connection for user ${userId}`);
      }
    } catch (error) {
      console.error(`Error sending notification to user ${userId}:`, error);
    }
  }
}
