import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Body,
  HttpStatus,
  HttpCode,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { SkillfolioService, Skillfolio } from './skillfolio.service';
import { KnowledgeGraphSeedService } from './knowledge-graph.seed';
import { JobEventsListener } from '../events/job-events.listener';

interface TriggerSkillfolioDto {
  userId: number;
  accountId: number;
  previousStatus?: string;
  newStatus: string;
}

@Controller('skillfolio')
export class SkillfolioController {
  constructor(
    private readonly skillfolioService: SkillfolioService,
    private readonly knowledgeGraphSeedService: KnowledgeGraphSeedService,
    private readonly jobEventsListener: JobEventsListener,
  ) {}

  /**
   * Extract a skillfolio for a user
   * @param userId The ID of the user
   * @returns The skillfolio data
   */
  @Get(':userId')
  async extractSkillfolio(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<Skillfolio> {
    return this.skillfolioService.extractSkillfolio(userId);
  }

  /**
   * Manually trigger skillfolio generation for a user
   * This endpoint is called by the frontend when a user's account status is set to "Published"
   */
  @Post('trigger')
  @HttpCode(HttpStatus.OK)
  async triggerSkillfolio(
    @Body() dto: TriggerSkillfolioDto,
  ): Promise<{ success: boolean; jobId?: string }> {
    // Only proceed if the new status is "published"
    if (dto.newStatus !== 'published') {
      return { success: false };
    }

    try {
      // Trigger skillfolio generation
      const job = await this.jobEventsListener.triggerSkillfolioGeneration(
        dto.userId,
        dto.accountId,
      );

      return {
        success: true,
        jobId: job.id.toString(),
      };
    } catch (error) {
      console.error('Error triggering skillfolio generation:', error);
      return { success: false };
    }
  }

  /**
   * Seed the knowledge graph database with initial data
   * This endpoint is for testing purposes only and should be removed in production
   */
  @Post('seed-knowledge-graph')
  async seedKnowledgeGraph(): Promise<{ message: string }> {
    await this.knowledgeGraphSeedService.seedDatabase();
    return { message: 'Knowledge graph database seeded successfully' };
  }

  /**
   * Get a skillfolio from the database for a user
   */
  @Get('get/:userId')
  async getSkillfolio(@Param('userId') userId: string) {
    try {
      // Convert userId to number
      const userIdNum = parseInt(userId, 10);

      const skillfolio =
        await this.skillfolioService.getStoredSkillfolio(userIdNum);

      if (!skillfolio) {
        throw new NotFoundException(
          `No skillfolio found for user ID ${userId}`,
        );
      }

      return skillfolio;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Error retrieving skillfolio: ${error.message}`,
      );
    }
  }
}
