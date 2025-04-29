import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import neo4j from 'neo4j-driver';
import { Driver, Session } from 'neo4j-driver';
import { SkillfolioProfile } from './skillfolio.service';

@Injectable()
export class Neo4jService {
  private readonly driver: Driver;
  private readonly logger = new Logger(Neo4jService.name);

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
    this.logger.debug(
      `[mapProfileToKnowledge] Mapping profile with ${profile.skills.length} skills to knowledge graph`,
    );

    try {
      // Extract skills for mapping
      const skillNames = profile.skills.map((skill) => skill.name);
      this.logger.debug(
        `[mapProfileToKnowledge] Skill names: ${JSON.stringify(skillNames)}`,
      );

      // Find the domain, field, and subfield that best match the skills
      const result = await this.findBestMatchingDomainAndField(skillNames);
      this.logger.debug(
        `[mapProfileToKnowledge] Best matching domains: ${JSON.stringify(result)}`,
      );

      // Identify strengths (skills with high proficiency)
      const strengths = profile.skills
        .filter(
          (skill) =>
            skill.proficiency === 'Advanced' || skill.proficiency === 'Expert',
        )
        .map((skill) => skill.name);
      this.logger.debug(
        `[mapProfileToKnowledge] Identified ${strengths.length} strengths`,
      );

      // Identify weaknesses (skills with low proficiency)
      const weaknesses = profile.skills
        .filter((skill) => skill.proficiency === 'Beginner')
        .map((skill) => skill.name);
      this.logger.debug(
        `[mapProfileToKnowledge] Identified ${weaknesses.length} weaknesses`,
      );

      // Find skill gaps in the selected domain/field
      const gaps = await this.findSkillGaps(result.subfield, skillNames);
      this.logger.debug(
        `[mapProfileToKnowledge] Found ${gaps.length} skill gaps`,
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
    } catch (error) {
      this.logger.error(
        `[mapProfileToKnowledge] Error mapping profile: ${error.message}`,
        error.stack,
      );
      // Return default values on error
      return {
        domain: 'Unknown',
        field: 'Unknown',
        subfield: 'Unknown',
        strengths: [],
        weaknesses: [],
        gaps: [],
      };
    }
  }

  /**
   * Finds the domain, field, and subfield that best match the given skills
   */
  async findBestMatchingDomainAndField(skills: string[]): Promise<{
    domain: string;
    field: string;
    category?: string;
    subfield: string;
  }> {
    this.logger.debug(
      `[findBestMatchingDomainAndField] Skills: ${JSON.stringify(skills)}`,
    );
    // Create a session
    const session = this.driver.session();
    try {
      // Cypher query to find best matching subfield based on required skills
      const query = `
        // Find all skills that match the profile skills
        MATCH (s:Skill)
        WHERE s.id IN [${skills.map((skill) => `"${skill}"`).join(',')}]
        
        // Find subfields that require these skills
        MATCH (subfield:Subfield)-[:REQUIRES]->(s)
        
        // Group by subfield and count matching skills
        WITH subfield, COUNT(s) AS matchCount
        ORDER BY matchCount DESC
        // LIMIT 1
        
        // Find the category, field and domain for this subfield
        MATCH (subfield)-[:PART_OF]->(category:Category)-[:PART_OF]->(field:Field)-[:PART_OF]->(domain:Domain)
        
        // Optional match for category if it exists
        OPTIONAL MATCH (subfield)-[:PART_OF]->(category:Category)-[:PART_OF]->(field)
        
        RETURN domain.id AS domain, field.id AS field, 
              category.id AS category, subfield.id AS subfield
      `;

      this.logger.debug(`[findBestMatchingDomainAndField] Query: ${query}`);

      // Execute the query
      const result = await session.run(query, { skills });

      this.logger.debug(
        `[findBestMatchingDomainAndField] Result: ${JSON.stringify(result)}`,
      );

      // If no matches found, return default values
      if (result.records.length === 0) {
        return {
          domain: 'Unknown',
          category: 'Unknown',
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
    } finally {
      await session.close();
    }
  }

  /**
   * Finds skill gaps based on the subfield and existing skills
   */
  private async findSkillGaps(
    subfield: string,
    existingSkills: string[],
  ): Promise<string[]> {
    this.logger.debug(
      `[findSkillGaps] Subfield: ${subfield}, Existing Skills: ${JSON.stringify(existingSkills)}`,
    );

    const session = this.driver.session();
    try {
      // Cypher query to find skill gaps
      const query = `
        // Find the subfield
        MATCH (subfield:Subfield {id: "${subfield}"})
        
        // Find all skills required for this subfield
        MATCH (subfield)-[r:REQUIRES]->(s:Skill)
        WHERE NOT s.id IN [${existingSkills.map((skill) => `"${skill}"`).join(',')}]
        
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
    } finally {
      await session.close();
    }
  }

  /**
   * Retrieves tools associated with a specific subfield from the knowledge graph
   * @param subfield The subfield name to search tools for
   * @returns An array of tool names
   */
  async getToolsForSubfield(subfield?: string): Promise<string[]> {
    this.logger.debug(
      `[getToolsForSubfield] Querying tools for subfield: ${subfield || 'any'}`,
    );
    const session = this.driver.session();

    try {
      let query: string;

      if (subfield && subfield !== 'Unknown') {
        // Query for tools specifically related to the given subfield
        query = `
          // Find the subfield
          MATCH (subfield:Subfield {id: $subfield})
          
          // Find tools used in this subfield
          MATCH (subfield)-[:USES|REQUIRES]->(tool:Tool)
          
          // Return unique tools
          RETURN DISTINCT tool.id AS tool
        `;
      } else {
        // If no specific subfield, get all tools from the knowledge graph
        query = `
          // Find all tools in the knowledge graph
          MATCH (tool:Tool)
          RETURN DISTINCT tool.id AS tool
          LIMIT 200
        `;
      }

      // Execute the query
      const result = await session.run(query, { subfield });

      // Extract tool names from the result
      const tools = result.records.map((record) => record.get('tool'));
      this.logger.debug(
        `[getToolsForSubfield] Found ${tools.length} tools for subfield: ${subfield || 'any'}`,
      );

      return tools;
    } catch (error) {
      this.logger.error(
        `[getToolsForSubfield] Error querying tools: ${error.message}`,
      );
      return [];
    } finally {
      await session.close();
    }
  }

  /**
   * Retrieves required skills for a specific subfield from the knowledge graph with their importance levels
   * @param subfield The subfield name to search required skills for
   * @returns An array of required skills with their names and importance levels
   */
  async getRequiredSkillsForSubfield(
    subfield: string,
  ): Promise<{ name: string; importance: number }[]> {
    this.logger.debug(
      `[getRequiredSkillsForSubfield] Querying required skills for subfield: ${subfield}`,
    );
    const session = this.driver.session();

    try {
      // Cypher query to get required skills for the subfield with their importance level
      const query = `
        // Find the subfield
        MATCH (subfield:Subfield {id: $subfield})
        
        // Find all skills required for this subfield
        MATCH (subfield)-[r:REQUIRES]->(skill:Skill)
        
        // Return skills with their importance level
        RETURN 
          skill.id AS name,
          COALESCE(r.level, 1) AS importance
        ORDER BY importance DESC
      `;

      // Execute the query
      const result = await session.run(query, { subfield });

      // Extract skills and their importance from the result
      const requiredSkills = result.records.map((record) => ({
        name: record.get('name'),
        importance: parseInt(record.get('importance')) || 1,
      }));

      this.logger.debug(
        `[getRequiredSkillsForSubfield] Found ${requiredSkills.length} required skills for subfield: ${subfield}`,
      );

      return requiredSkills;
    } catch (error) {
      this.logger.error(
        `[getRequiredSkillsForSubfield] Error querying required skills: ${error.message}`,
      );
      return [];
    } finally {
      await session.close();
    }
  }

  /**
   * Retrieves recommended certifications for a specific subfield from the knowledge graph
   * @param subfield The subfield name to search certifications for
   * @returns An array of certification names
   */
  async getCertificationsForSubfield(subfield: string): Promise<string[]> {
    this.logger.debug(
      `[getCertificationsForSubfield] Querying certifications for subfield: ${subfield}`,
    );
    const session = this.driver.session();

    try {
      // Cypher query to get certifications that verify skills required for the subfield
      const query = `
        // Find the subfield
        MATCH (subfield:Subfield {id: $subfield})
        
        // Find skills required for this subfield
        MATCH (subfield)-[:REQUIRES]->(skill:Skill)
        
        // Find certifications that verify these skills
        MATCH (cert:Certification)-[:COVERS]->(skill)
        
        // Return unique certifications
        RETURN DISTINCT cert.id AS certification
      `;

      // Execute the query
      const result = await session.run(query, { subfield });

      // Extract certification names from the result
      const certifications = result.records.map((record) =>
        record.get('certification'),
      );

      this.logger.debug(
        `[getCertificationsForSubfield] Found ${certifications.length} certifications for subfield: ${subfield}`,
      );

      return certifications;
    } catch (error) {
      this.logger.error(
        `[getCertificationsForSubfield] Error querying certifications: ${error.message}`,
      );
      return [];
    } finally {
      await session.close();
    }
  }

  /**
   * Closes the Neo4j driver when the application shuts down
   */
  async onApplicationShutdown() {
    await this.driver.close();
  }
}
