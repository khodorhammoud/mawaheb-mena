import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import {
  HealthController,
  DatabaseHealthIndicator,
  QueueHealthIndicator,
} from './health.controller';
import { DatabaseModule } from '../modules/database/database.module';
import { QueueModule } from '../modules/queue/queue.module';

@Module({
  imports: [TerminusModule, DatabaseModule, QueueModule],
  controllers: [HealthController],
  providers: [DatabaseHealthIndicator, QueueHealthIndicator],
})
export class HealthModule {}
