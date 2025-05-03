import { Module, forwardRef } from '@nestjs/common';
import { SkillfolioController } from './skillfolio.controller';
import { SkillfolioService } from './skillfolio.service';
import { Neo4jService } from './neo4j.service';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '../database/database.module';
import { KnowledgeGraphSeedService } from './knowledge-graph.seed';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [ConfigModule, DatabaseModule, forwardRef(() => EventsModule)],
  controllers: [SkillfolioController],
  providers: [SkillfolioService, Neo4jService, KnowledgeGraphSeedService],
  exports: [SkillfolioService, KnowledgeGraphSeedService],
})
export class SkillfolioModule {}
