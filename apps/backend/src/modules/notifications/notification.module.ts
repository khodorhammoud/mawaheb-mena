// NotificationsModule — Handles DB-based notifications and exposes REST APIs for the frontend.
// - Registers NotificationService and NotificationsController
// - Imports AuthModule and DatabaseModule
// - Exports NotificationService for use in EventsModule or other modules

import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationsController } from './notification.controller';
import { DatabaseModule } from '../database/database.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [NotificationsController],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationsModule {}
