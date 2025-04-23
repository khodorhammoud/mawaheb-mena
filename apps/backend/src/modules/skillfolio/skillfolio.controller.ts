import { Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { SkillfolioService, Skillfolio } from './skillfolio.service';
import { KnowledgeGraphSeedService } from './knowledge-graph.seed';

@Controller('skillfolio')
export class SkillfolioController {
  constructor(
    private readonly skillfolioService: SkillfolioService,
    private readonly knowledgeGraphSeedService: KnowledgeGraphSeedService,
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
   * Seed the knowledge graph database with initial data
   * This endpoint is for testing purposes only and should be removed in production
   */
  @Post('seed-knowledge-graph')
  async seedKnowledgeGraph(): Promise<{ message: string }> {
    await this.knowledgeGraphSeedService.seedDatabase();
    return { message: 'Knowledge graph database seeded successfully' };
  }
}
