// JobsModule — Exposes REST endpoints that allow the frontend to trigger background jobs
// This module is responsible for exposing the endpoints that allow the frontend to trigger background jobs

import { Module } from '@nestjs/common';
import { JobsController } from './jobs.controller';
import { QueueModule } from '../queue/queue.module';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [QueueModule, EventEmitterModule.forRoot()],
  controllers: [JobsController],
})
export class JobsModule {}
