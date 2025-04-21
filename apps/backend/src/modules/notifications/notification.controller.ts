// NotificationsController — Exposes REST API endpoints for user notifications.
// - GET /notifications/user/:userId → Returns notifications for a user

import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { NotificationService } from './notification.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationService: NotificationService) {}

  /** GET /notifications/user/:userId */
  @Get('user/:userId')
  async getUserNotifications(
    @Param('userId', ParseIntPipe) userId: number,
    @Query('limit') limit?: string,
  ) {
    // console.log(`[NotificationsController] GET /notifications/user/${userId}`);

    const parsedLimit = limit ? parseInt(limit, 10) : 100;
    const notes = await this.notificationService.getUserNotifications(
      userId,
      parsedLimit,
    );

    // console.log(
    // `[NotificationsController] → returning ${notes.length} notifications`,
    // );
    return notes;
  }
}
