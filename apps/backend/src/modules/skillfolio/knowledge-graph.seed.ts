import { Injectable } from '@nestjs/common';
import { Neo4jService } from './neo4j.service';

/**
 * Service for seeding the Neo4j knowledge graph with initial data
 */
@Injectable()
export class KnowledgeGraphSeedService {
  constructor(private readonly neo4jService: Neo4jService) {}

  /**
   * Seeds the Neo4j database with initial knowledge graph structure and data
   */
  async seedDatabase(): Promise<void> {
    const session = this.neo4jService.getDriver().session();

    try {
      // Clear existing data (for testing purposes)
      await session.run('MATCH (n) DETACH DELETE n');

      // Create constraint to ensure unique IDs
      await session.run(
        'CREATE CONSTRAINT IF NOT EXISTS FOR (d:Domain) REQUIRE d.id IS UNIQUE',
      );
      await session.run(
        'CREATE CONSTRAINT IF NOT EXISTS FOR (f:Field) REQUIRE f.id IS UNIQUE',
      );
      await session.run(
        'CREATE CONSTRAINT IF NOT EXISTS FOR (s:Subfield) REQUIRE s.id IS UNIQUE',
      );
      await session.run(
        'CREATE CONSTRAINT IF NOT EXISTS FOR (s:Skill) REQUIRE s.id IS UNIQUE',
      );
      await session.run(
        'CREATE CONSTRAINT IF NOT EXISTS FOR (t:Tool) REQUIRE t.id IS UNIQUE',
      );
      await session.run(
        'CREATE CONSTRAINT IF NOT EXISTS FOR (c:Certification) REQUIRE c.id IS UNIQUE',
      );
      await session.run(
        'CREATE CONSTRAINT IF NOT EXISTS FOR (v:Verification) REQUIRE v.id IS UNIQUE',
      );
      await session.run(
        'CREATE CONSTRAINT IF NOT EXISTS FOR (g:CompetencyGroup) REQUIRE g.id IS UNIQUE',
      );

      // Create domains
      await session.run(`
        CREATE (:Domain {id: 'Technology', name: 'Technology'})
        CREATE (:Domain {id: 'Design', name: 'Design'})
        CREATE (:Domain {id: 'Marketing', name: 'Marketing'})
      `);

      // Create fields under Technology domain
      await session.run(`
        MATCH (d:Domain {id: 'Technology'})
        CREATE (f:Field {id: 'Software Engineering', name: 'Software Engineering'})-[:PART_OF]->(d)
        CREATE (f2:Field {id: 'Data Science', name: 'Data Science'})-[:PART_OF]->(d)
        CREATE (f3:Field {id: 'IT Infrastructure', name: 'IT Infrastructure'})-[:PART_OF]->(d)
      `);

      // Create subfields under Software Engineering
      await session.run(`
        MATCH (f:Field {id: 'Software Engineering'})
        CREATE (s:Subfield {id: 'Backend Development', name: 'Backend Development'})-[:PART_OF]->(f)
        CREATE (s2:Subfield {id: 'Frontend Development', name: 'Frontend Development'})-[:PART_OF]->(f)
        CREATE (s3:Subfield {id: 'Mobile Development', name: 'Mobile Development'})-[:PART_OF]->(f)
        CREATE (s4:Subfield {id: 'DevOps', name: 'DevOps'})-[:PART_OF]->(f)
      `);

      // Create competency groups for Backend Development
      await session.run(`
        MATCH (s:Subfield {id: 'Backend Development'})
        CREATE (g:CompetencyGroup {id: 'API Design', name: 'API Design'})-[:BELONGS_TO]->(s)
        CREATE (g2:CompetencyGroup {id: 'Database Management', name: 'Database Management'})-[:BELONGS_TO]->(s)
        CREATE (g3:CompetencyGroup {id: 'Server Architecture', name: 'Server Architecture'})-[:BELONGS_TO]->(s)
        CREATE (g4:CompetencyGroup {id: 'Authentication', name: 'Authentication & Authorization'})-[:BELONGS_TO]->(s)
      `);

      // Create skills for Backend Development
      await session.run(`
        MATCH (s:Subfield {id: 'Backend Development'})
        MATCH (g:CompetencyGroup {id: 'API Design'})
        CREATE (skill:Skill {id: 'REST API Design', name: 'REST API Design'})-[:BELONGS_TO_GROUP]->(g)
        CREATE (skill2:Skill {id: 'GraphQL', name: 'GraphQL'})-[:BELONGS_TO_GROUP]->(g)
        CREATE (skill3:Skill {id: 'Microservices', name: 'Microservices Architecture'})-[:BELONGS_TO_GROUP]->(g)
        
        CREATE (s)-[:REQUIRES {level: 4}]->(skill)
        CREATE (s)-[:REQUIRES {level: 2}]->(skill2)
        CREATE (s)-[:REQUIRES {level: 3}]->(skill3)
      `);

      // Create more backend skills for Database Management
      await session.run(`
        MATCH (s:Subfield {id: 'Backend Development'})
        MATCH (g:CompetencyGroup {id: 'Database Management'})
        CREATE (skill:Skill {id: 'SQL', name: 'SQL Databases'})-[:BELONGS_TO_GROUP]->(g)
        CREATE (skill2:Skill {id: 'NoSQL', name: 'NoSQL Databases'})-[:BELONGS_TO_GROUP]->(g)
        CREATE (skill3:Skill {id: 'ORM', name: 'ORM Frameworks'})-[:BELONGS_TO_GROUP]->(g)
        
        CREATE (s)-[:REQUIRES {level: 4}]->(skill)
        CREATE (s)-[:REQUIRES {level: 3}]->(skill2)
        CREATE (s)-[:REQUIRES {level: 3}]->(skill3)
      `);

      // Create programming language skills
      await session.run(`
        MATCH (s:Subfield {id: 'Backend Development'})
        CREATE (skill:Skill {id: 'Node.js', name: 'Node.js'})
        CREATE (skill2:Skill {id: 'Python', name: 'Python'})
        CREATE (skill3:Skill {id: 'Java', name: 'Java'})
        
        CREATE (s)-[:REQUIRES {level: 3}]->(skill)
        CREATE (s)-[:REQUIRES {level: 3}]->(skill2)
        CREATE (s)-[:REQUIRES {level: 3}]->(skill3)
      `);

      // Create tools for backend development
      await session.run(`
        MATCH (skill:Skill {id: 'Node.js'})
        CREATE (tool:Tool {id: 'Express.js', name: 'Express.js'})
        CREATE (tool2:Tool {id: 'NestJS', name: 'NestJS'})
        CREATE (skill)-[:USES]->(tool)
        CREATE (skill)-[:USES]->(tool2)
        
        MATCH (skill:Skill {id: 'SQL'})
        CREATE (tool:Tool {id: 'PostgreSQL', name: 'PostgreSQL'})
        CREATE (tool2:Tool {id: 'MySQL', name: 'MySQL'})
        CREATE (skill)-[:USES]->(tool)
        CREATE (skill)-[:USES]->(tool2)
        
        MATCH (skill:Skill {id: 'NoSQL'})
        CREATE (tool:Tool {id: 'MongoDB', name: 'MongoDB'})
        CREATE (tool2:Tool {id: 'Redis', name: 'Redis'})
        CREATE (skill)-[:USES]->(tool)
        CREATE (skill)-[:USES]->(tool2)
      `);

      // Create certifications
      await session.run(`
        MATCH (skill:Skill {id: 'MongoDB'})
        CREATE (cert:Certification {id: 'MongoDB Certified Developer', name: 'MongoDB Certified Developer'})
        CREATE (cert)-[:COVERS]->(skill)
        
        MATCH (skill:Skill {id: 'Node.js'})
        CREATE (cert:Certification {id: 'OpenJS Node.js Application Developer', name: 'OpenJS Node.js Application Developer'})
        CREATE (cert)-[:COVERS]->(skill)
      `);

      // Create verification methods
      await session.run(`
        CREATE (v:Verification {id: 'Project Use', name: 'Project Use'})
        CREATE (v2:Verification {id: 'Code Sample', name: 'Code Sample'})
        CREATE (v3:Verification {id: 'Certification', name: 'Certification'})
        CREATE (v4:Verification {id: 'Technical Assessment', name: 'Technical Assessment'})
      `);

      // Link skills to verification methods
      await session.run(`
        MATCH (skill:Skill {id: 'Node.js'})
        MATCH (v:Verification {id: 'Project Use'})
        MATCH (v2:Verification {id: 'Code Sample'})
        MATCH (v3:Verification {id: 'Certification'})
        CREATE (skill)-[:CAN_BE_VERIFIED_BY]->(v)
        CREATE (skill)-[:CAN_BE_VERIFIED_BY]->(v2)
        CREATE (skill)-[:CAN_BE_VERIFIED_BY]->(v3)
      `);

      // Create frontend subfield skills
      await session.run(`
        MATCH (s:Subfield {id: 'Frontend Development'})
        CREATE (skill:Skill {id: 'React', name: 'React'})
        CREATE (skill2:Skill {id: 'Angular', name: 'Angular'})
        CREATE (skill3:Skill {id: 'Vue', name: 'Vue.js'})
        CREATE (skill4:Skill {id: 'CSS', name: 'CSS'})
        CREATE (skill5:Skill {id: 'HTML', name: 'HTML'})
        
        CREATE (s)-[:REQUIRES {level: 4}]->(skill)
        CREATE (s)-[:REQUIRES {level: 3}]->(skill2)
        CREATE (s)-[:REQUIRES {level: 3}]->(skill3)
        CREATE (s)-[:REQUIRES {level: 5}]->(skill4)
        CREATE (s)-[:REQUIRES {level: 5}]->(skill5)
      `);

      console.log('Knowledge graph database successfully seeded!');
    } catch (error) {
      console.error('Error seeding knowledge graph database:', error);
      throw error;
    } finally {
      await session.close();
    }
  }
}
