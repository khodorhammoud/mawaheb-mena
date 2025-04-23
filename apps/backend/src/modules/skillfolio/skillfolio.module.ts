import { Module } from '@nestjs/common';
import { SkillfolioController } from './skillfolio.controller';
import { SkillfolioService } from './skillfolio.service';
import { Neo4jService } from './neo4j.service';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '../database/database.module';
import { KnowledgeGraphSeedService } from './knowledge-graph.seed';

@Module({
  imports: [ConfigModule, DatabaseModule],
  controllers: [SkillfolioController],
  providers: [SkillfolioService, Neo4jService, KnowledgeGraphSeedService],
  exports: [SkillfolioService, KnowledgeGraphSeedService],
})
export class SkillfolioModule {}
