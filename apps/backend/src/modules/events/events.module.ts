// EventsModule — Handles SSE (Server-Sent Events), which is a way for the server to push events (job finished, message received, etc.) to the browser (frontend)
// SSE is like "The server keeps talking to the browser whenever something new happens — no need for the browser to keep asking."

import { Module } from '@nestjs/common';
import { EventsController } from './events.controller';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { NotificationsModule } from '../notifications/notification.module'; // ✅ import from correct location
import { JobEventsListener } from './job-events.listener';
import { QueueModule } from '../queue/queue.module';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    NotificationsModule,
    QueueModule,
    DatabaseModule,
  ],
  controllers: [EventsController],
  providers: [JobEventsListener],
})
export class EventsModule {}
