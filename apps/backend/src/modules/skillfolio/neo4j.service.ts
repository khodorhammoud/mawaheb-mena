import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import neo4j from 'neo4j-driver';
import { Driver, Session } from 'neo4j-driver';
import { SkillfolioProfile } from './skillfolio.service';

@Injectable()
export class Neo4jService {
  private readonly driver: Driver;

  constructor(private configService: ConfigService) {
    // Initialize Neo4j driver
    const url =
      this.configService.get<string>('NEO4J_URL') || 'bolt://localhost:7687';
    const username =
      this.configService.get<string>('NEO4J_USERNAME') || 'neo4j';
    const password =
      this.configService.get<string>('NEO4J_PASSWORD') || 'password';

    this.driver = neo4j.driver(url, neo4j.auth.basic(username, password));
  }

  /**
   * Get the Neo4j driver instance
   */
  getDriver(): Driver {
    return this.driver;
  }

  /**
   * Maps a freelancer's profile to the knowledge graph
   */
  async mapProfileToKnowledge(profile: SkillfolioProfile): Promise<{
    domain: string;
    field: string;
    category?: string;
    subfield: string;
    strengths: string[];
    weaknesses: string[];
    gaps: string[];
  }> {
    const session = this.driver.session();
    try {
      // Extract skills for mapping
      const skillNames = profile.skills.map((skill) => skill.name);

      // Find the domain, field, and subfield that best match the skills
      const result = await this.findBestMatchingDomainAndField(
        session,
        skillNames,
      );

      // Identify strengths (skills with high proficiency)
      const strengths = profile.skills
        .filter(
          (skill) =>
            skill.proficiency === 'Advanced' || skill.proficiency === 'Expert',
        )
        .map((skill) => skill.name);

      // Identify weaknesses (skills with low proficiency)
      const weaknesses = profile.skills
        .filter((skill) => skill.proficiency === 'Beginner')
        .map((skill) => skill.name);

      // Find skill gaps in the selected domain/field
      const gaps = await this.findSkillGaps(
        session,
        result.subfield,
        skillNames,
      );

      return {
        domain: result.domain,
        field: result.field,
        category: result.category,
        subfield: result.subfield,
        strengths,
        weaknesses,
        gaps,
      };
    } finally {
      await session.close();
    }
  }

  /**
   * Finds the domain, field, and subfield that best match the given skills
   */
  private async findBestMatchingDomainAndField(
    session: Session,
    skills: string[],
  ): Promise<{
    domain: string;
    field: string;
    category?: string;
    subfield: string;
  }> {
    // Cypher query to find best matching subfield based on required skills
    const query = `
      // Find all skills that match the profile skills
      MATCH (s:Skill)
      WHERE s.id IN $skills
      
      // Find subfields that require these skills
      MATCH (subfield:Subfield)-[:REQUIRES]->(s)
      
      // Group by subfield and count matching skills
      WITH subfield, COUNT(s) AS matchCount
      ORDER BY matchCount DESC
      LIMIT 1
      
      // Find the field and domain for this subfield
      MATCH (subfield)-[:PART_OF]->(field:Field)-[:PART_OF]->(domain:Domain)
      
      // Optional match for category if it exists
      OPTIONAL MATCH (subfield)-[:PART_OF]->(category:Category)-[:PART_OF]->(field)
      
      RETURN domain.id AS domain, field.id AS field, 
             category.id AS category, subfield.id AS subfield
    `;

    // Execute the query
    const result = await session.run(query, { skills });

    // If no matches found, return default values
    if (result.records.length === 0) {
      return {
        domain: 'Unknown',
        field: 'Unknown',
        subfield: 'Unknown',
      };
    }

    // Extract the matched domain, field, and subfield
    const record = result.records[0];
    return {
      domain: record.get('domain'),
      field: record.get('field'),
      category: record.get('category'),
      subfield: record.get('subfield'),
    };
  }

  /**
   * Finds skill gaps based on the subfield and existing skills
   */
  private async findSkillGaps(
    session: Session,
    subfield: string,
    existingSkills: string[],
  ): Promise<string[]> {
    // Cypher query to find skill gaps
    const query = `
      // Find the subfield
      MATCH (subfield:Subfield {id: $subfield})
      
      // Find all skills required for this subfield
      MATCH (subfield)-[r:REQUIRES]->(s:Skill)
      WHERE NOT s.id IN $existingSkills
      
      // Return required skills that are missing, ordered by importance (level)
      RETURN s.id AS skill, r.level AS importance
      ORDER BY r.level DESC
    `;

    // Execute the query
    const result = await session.run(query, {
      subfield,
      existingSkills,
    });

    // Extract and return the skill gaps
    return result.records.map((record) => record.get('skill'));
  }

  /**
   * Closes the Neo4j driver when the application shuts down
   */
  async onApplicationShutdown() {
    await this.driver.close();
  }
}
