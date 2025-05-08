// QueueModule — Sets up queues, and manages them using BullMQ and Redis
// BullMQ is the Job logic, where it add, run, retry, and remove jobs.
// Redis stores every job & its status
// BullMQ queues jobs (add jobs to queue) → Redis stores them → processors run them

import { Module, forwardRef } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { QueueService } from './queue.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SkillFolioProcessor } from './processors/skillfolio.processor';
import { SkillfolioModule } from '../skillfolio/skillfolio.module';
// TODO: When adding a new process type, import its processor here
// Example: import { ResumeProcessor } from './processors/resume.processor';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        redis: {
          host: configService.get('REDIS_HOST', 'localhost'),
          port: configService.get('REDIS_PORT', 6379),
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue({
      name: 'processQueue', // Queue name we created, and we are ready to put jobs (processes) inside it
    }), // registerQueue() so that : "Hey, make this queue injectable via @InjectQueue('processQueue') anywhere in the app, so when we do inject, we will get this queue."
    forwardRef(() => SkillfolioModule), // Use forwardRef to break circular dependency
  ],
  providers: [
    QueueService, // QueueService is the service that add methods that add jobs to the queue (like addJob)
    SkillFolioProcessor, // Background processor that listens (is responsible) for 'skillfolio' jobs from the queue
    // TODO: When adding a new process type, add its processor here
    // Example: ResumeProcessor,
  ],
  exports: [QueueService], // this is to make the queue service available anywhere in the app
})
export class QueueModule {}
