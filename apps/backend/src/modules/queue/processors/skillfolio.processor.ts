import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { JobType, JobData } from '../queue.service';
import { SkillfolioService } from '../../skillfolio/skillfolio.service';
// import { DatabaseService } from '../../database/database.service'; // ← enable if boss needs DB

@Injectable()
@Processor('processQueue')
export class SkillFolioProcessor {
  private readonly logger = new Logger(SkillFolioProcessor.name);

  constructor(
    @InjectQueue('processQueue') private readonly processQueue: Queue,
    private readonly eventEmitter: EventEmitter2,
    private readonly skillfolioService: SkillfolioService,
    // private readonly databaseService: DatabaseService,
  ) {}

  /** ---------------------------------------------------------------
   *  Uses the SkillfolioService to extract the actual skillfolio data
   *  for the user and returns it to be included in the notification
   *  --------------------------------------------------------------*/
  async generateSkillFolio(job: Job<{ userId: string | number }>) {
    try {
      const rawUserId = job.data.userId;
      this.logger.log(
        `Starting to generate skillfolio for user id: ${rawUserId}`,
      );

      // Parse userId to number if it's a string
      const userId =
        typeof rawUserId === 'string' ? parseInt(rawUserId, 10) : rawUserId;

      // Emit started event
      this.eventEmitter.emit('job.skillfolio.started', {
        userId,
      });

      // Extract the skillfolio using the skillfolioService
      const skillfolio = await this.skillfolioService.extractSkillfolio(userId);

      // Emit completed event
      this.eventEmitter.emit('job.skillfolio.completed', {
        userId,
      });

      return {
        skillfolio,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(
        `Error generating skillfolio for userId: ${job.data.userId}`,
        error.stack,
      );

      // Parse userId to number if it's a string for the error event
      const userId =
        typeof job.data.userId === 'string'
          ? parseInt(job.data.userId, 10)
          : job.data.userId;

      this.eventEmitter.emit('job.skillfolio.failed', {
        userId,
        error: error.message,
      });

      throw error;
    }
  }

  /** Main BullMQ processor for JobType.SKILLFOLIO */
  @Process(JobType.SKILLFOLIO)
  async handleSkillFolioCreation(job: Job<JobData>) {
    const { userId, metadata } = job.data;

    try {
      /* emit general "started" event */
      this.eventEmitter.emit('job.started', {
        jobId: job.id,
        type: JobType.SKILLFOLIO,
        userId,
      });

      /* emit skillfolio-specific "started" event */
      this.eventEmitter.emit('job.skillfolio.started', {
        jobId: job.id,
        userId,
        metadata,
      });

      this.logger.log(
        `▶️ Processing skillfolio job #${job.id} for user ${userId}`,
      );
      await job.progress(0);

      /* === ACTUAL WORK === */
      // First check if a skillfolio already exists for this user
      this.logger.log(`Checking for existing skillfolio for user ${userId}`);
      let skillfolioData = null;

      try {
        skillfolioData =
          await this.skillfolioService.getStoredSkillfolio(userId);
        if (skillfolioData) {
          this.logger.log(
            `Found existing skillfolio for user ${userId}, using stored data`,
          );
          await job.progress(75); // Skip extraction since we already have data
        }
      } catch (error) {
        this.logger.warn(
          `Error checking for existing skillfolio: ${error.message}. Will extract new one.`,
        );
      }

      // If no existing skillfolio, extract a new one
      if (!skillfolioData) {
        this.logger.log(`Extracting new skillfolio for user ${userId}`);
        skillfolioData = await this.skillfolioService.extractSkillfolio(userId);
        await job.progress(50); // mid‑way marker
        await new Promise((r) => setTimeout(r, 500)); // optional extra work
      }

      await job.progress(100);

      const result = {
        success: true,
        message: 'SkillFolio processed successfully',
        userId,
        data: { skillfolio: skillfolioData },
      };

      this.logger.log(
        `✅ Completed skillfolio job #${job.id} for user ${userId}`,
      );

      /* emit general "completed" event */
      this.eventEmitter.emit('job.completed', {
        jobId: job.id,
        type: JobType.SKILLFOLIO,
        userId,
        result,
      });

      /* emit skillfolio-specific "completed" event with the result */
      this.eventEmitter.emit('job.skillfolio.completed', {
        jobId: job.id,
        userId,
        result,
      });

      return result;
    } catch (error) {
      this.logger.error(`❌ Failed skillfolio job #${job.id}:`, error.message);

      /* emit general "failed" event */
      this.eventEmitter.emit('job.failed', {
        jobId: job.id,
        type: JobType.SKILLFOLIO,
        userId,
        error: error.message || 'Unknown error',
      });

      /* emit skillfolio-specific "failed" event */
      this.eventEmitter.emit('job.skillfolio.failed', {
        jobId: job.id,
        userId,
        error: error.message || 'Unknown error',
      });

      throw error; // let BullMQ handle retries if configured
    }
  }
}
