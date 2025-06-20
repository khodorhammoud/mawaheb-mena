// Each module handles a specific concern (idea) in the system
// AppModule — The root module of the application, where we import all the modules

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './modules/database/database.module';
import { EventsModule } from './modules/events/events.module';
import { QueueModule } from './modules/queue/queue.module';
import { JobsModule } from './modules/jobs/jobs.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { SkillfolioModule } from './modules/skillfolio/skillfolio.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    EventEmitterModule.forRoot(),
    DatabaseModule,
    EventsModule,
    QueueModule,
    JobsModule,
    SkillfolioModule,
    HealthModule,
  ],
})
export class AppModule {}
