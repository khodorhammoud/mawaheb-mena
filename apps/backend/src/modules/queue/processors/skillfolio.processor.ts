import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { JobType, JobData } from '../queue.service';
// import { DatabaseService } from '../../database/database.service'; // ← enable if boss needs DB

@Injectable()
@Processor('processQueue')
export class SkillFolioProcessor {
  constructor(
    @InjectQueue('processQueue') private readonly processQueue: Queue,
    private readonly eventEmitter: EventEmitter2,
    // private readonly databaseService: DatabaseService,
  ) {}

  /** ---------------------------------------------------------------
   *  PLACE FOR BOSS' REAL LOGIC
   *  Replace ALL the BODY of this method with the main algorithm.
   *  It must return the generated skillfolio object that will be sent back in job.completed and stored in notifications.
   *  --------------------------------------------------------------*/
  private async generateSkillFolio(
    userId: number,
    metadata: Record<string, any> = {},
  ) {
    /* === START placeholder === */
    console.log(`📊 [placeholder] generating skillfolio for user ${userId}`);
    await new Promise((r) => setTimeout(r, 2000)); // simulate work
    return {
      id: Math.floor(Math.random() * 1000),
      title: 'Generated SkillFolio',
      skills: ['JavaScript', 'TypeScript', 'React', 'Node.js'],
      score: Math.floor(Math.random() * 100),
      generatedAt: new Date().toISOString(),
    };
    /* === END placeholder === */
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

      console.log(
        `▶️  Processing skillfolio job #${job.id} for user ${userId}`,
      );
      await job.progress(0);

      /* === ACTUAL WORK === */
      const skillfolio = await this.generateSkillFolio(userId, metadata);
      await job.progress(50); // mid‑way marker
      await new Promise((r) => setTimeout(r, 500)); // optional extra work
      await job.progress(100);

      const result = {
        success: true,
        message: 'SkillFolio processed successfully',
        userId,
        data: { skillfolio },
      };

      console.log(`✅  Completed skillfolio job #${job.id} for user ${userId}`);

      /* emit general "completed" event */
      this.eventEmitter.emit('job.completed', {
        jobId: job.id,
        type: JobType.SKILLFOLIO,
        userId,
        result,
      });

      /* emit skillfolio-specific "completed" event */
      this.eventEmitter.emit('job.skillfolio.completed', {
        jobId: job.id,
        userId,
        result,
      });

      return result;
    } catch (error) {
      console.error(`❌  Failed skillfolio job #${job.id}:`, error.message);

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
