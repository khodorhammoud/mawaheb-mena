import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { Neo4jService } from './neo4j.service';

import { sql } from 'drizzle-orm';

interface UserSkill {
  name: string;
  proficiency: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  yearsOfExperience?: number;
  lastUsed?: string;
  verifiedBy?: string[];
}

interface Education {
  degree: string;
  field: string;
  institution: string;
  completedOn: string;
}

interface Experience {
  role: string;
  company?: string;
  durationYears?: number;
  technologies?: string[];
  projectDescriptions?: string[];
}

interface Verification {
  type: string;
  evidence?: string;
}

export interface SkillfolioProfile {
  skills: UserSkill[];
  tools: string[];
  certifications: string[];
  education: Education[];
  experience: Experience[];
  verifications?: Verification[];
  custom?: Record<string, any>;
}

export interface Skillfolio {
  userId: number;
  domain: string;
  field: string;
  category?: string;
  subfield: string;
  readinessScore: number;
  strengths: string[];
  weaknesses: string[];
  gaps: string[];
  profile: SkillfolioProfile;
  createdAt: string;
  updatedAt: string;
}

@Injectable()
export class SkillfolioService {
  private readonly logger = new Logger(SkillfolioService.name);

  constructor(
    private readonly dbService: DatabaseService,
    private readonly neo4jService: Neo4jService,
  ) {}

  async extractSkillfolio(userId: number): Promise<Skillfolio> {
    this.logger.log(`Starting skillfolio extraction for userId: ${userId}`);

    try {
      // 1. Get user data from database
      this.logger.debug(`[Step 1] Fetching user data for userId: ${userId}`);
      const userData = await this.getUserData(userId);
      if (!userData) {
        this.logger.warn(`[Step 1] User with ID ${userId} not found`);
        throw new Error(`User with ID ${userId} not found`);
      }
      this.logger.debug(
        `[Step 1] User data retrieved successfully: ${JSON.stringify({
          userId: userData.user.id,
          accountId: userData.account.id,
          freelancerId: userData.freelancer.id,
          skillsCount: userData.skills.length,
        })}`,
      );

      // 2. Extract profile data from user information
      this.logger.debug(
        `[Step 2] Extracting profile data from user information`,
      );
      const profile = await this.extractProfileData(userData);
      this.logger.debug(
        `[Step 2] Profile data extracted: ${JSON.stringify({
          skills: profile.skills,
          tools: profile.tools,
          certifications: profile.certifications,
          education: profile.education,
          experience: profile.experience,
        })}`,
      );

      // 3. Map to knowledge graph
      this.logger.debug(`[Step 3] Mapping profile to knowledge graph`);
      const graphMapping = await this.mapToKnowledgeGraph(profile);
      this.logger.debug(
        `[Step 3] Knowledge graph mapping completed: ${JSON.stringify({
          domain: graphMapping.domain,
          field: graphMapping.field,
          category: graphMapping.category,
          subfield: graphMapping.subfield,
          strengths: graphMapping.strengths,
          weaknesses: graphMapping.weaknesses,
          gaps: graphMapping.gaps,
        })}`,
      );

      // 4. Calculate readiness score
      this.logger.debug(`[Step 4] Calculating readiness score`);
      const readinessScore = await this.calculateReadinessScore(
        profile,
        graphMapping,
      );
      this.logger.debug(
        `[Step 4] Readiness score calculated: ${readinessScore}`,
      );

      // 5. Build and return the skillfolio
      this.logger.debug(`[Step 5] Building final skillfolio object`);
      const skillfolio = {
        userId,
        domain: graphMapping.domain || 'Unknown',
        field: graphMapping.field || 'Unknown',
        category: graphMapping.category,
        subfield: graphMapping.subfield || 'Unknown',
        readinessScore,
        strengths: graphMapping.strengths || [],
        weaknesses: graphMapping.weaknesses || [],
        gaps: graphMapping.gaps || [],
        profile,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.logger.log(
        `Skillfolio extraction completed successfully for userId: ${userId}`,
      );

      return skillfolio;
    } catch (error) {
      this.logger.error(
        `Error extracting skillfolio for userId: ${userId}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Get user data from the database, format: { user: User, account: Account, freelancer: Freelancer, skills: Skill[] }
   * @param userId The ID of the user
   * @returns The user data
   */
  private async getUserData(userId: number) {
    this.logger.debug(`[getUserData] Retrieving data for userId: ${userId}`);

    const {
      UsersTable,
      accountsTable,
      freelancersTable,
      freelancerSkillsTable,
      skillsTable,
    } = await import('@mawaheb/db');

    // Get user data from multiple tables using the db service
    this.logger.debug(
      `[getUserData] Querying UsersTable for userId: ${userId}`,
    );
    const user = await this.dbService.db
      .select()
      .from(UsersTable)
      .where(sql`${UsersTable.id} = ${userId}`)
      .limit(1);

    if (!user || user.length === 0) {
      this.logger.warn(`[getUserData] No user found with ID: ${userId}`);
      return null;
    }
    this.logger.debug(
      `[getUserData] Found user: ${JSON.stringify({ id: user[0].id, email: user[0].email })}`,
    );

    this.logger.debug(
      `[getUserData] Querying accountsTable for userId: ${userId}`,
    );
    const account = await this.dbService.db
      .select()
      .from(accountsTable)
      .where(sql`${accountsTable.userId} = ${userId}`)
      .limit(1);
    if (!account || account.length === 0) {
      this.logger.warn(`[getUserData] No account found for userId: ${userId}`);
      return null;
    }
    this.logger.debug(
      `[getUserData] Found account: ${JSON.stringify({ id: account[0].id })}`,
    );

    this.logger.debug(
      `[getUserData] Querying freelancersTable for accountId: ${account[0].id}`,
    );
    const freelancer = await this.dbService.db
      .select()
      .from(freelancersTable)
      .where(sql`${freelancersTable.accountId} = ${account[0].id}`)
      .limit(1);
    if (!freelancer || freelancer.length === 0) {
      this.logger.warn(
        `[getUserData] No freelancer found for accountId: ${account[0].id}`,
      );
      return null;
    }
    this.logger.debug(
      `[getUserData] Found freelancer: ${JSON.stringify({ id: freelancer[0].id })}`,
    );

    // Get freelancer skills
    this.logger.debug(
      `[getUserData] Querying freelancer skills for freelancerId: ${freelancer[0].id}`,
    );
    const freelancerSkills = await this.dbService.db
      .select({
        skill: skillsTable,
        years: freelancerSkillsTable.yearsOfExperience,
      })
      .from(freelancerSkillsTable)
      .innerJoin(
        skillsTable,
        sql`${freelancerSkillsTable.skillId} = ${skillsTable.id}`,
      )
      .where(sql`${freelancerSkillsTable.freelancerId} = ${freelancer[0].id}`);

    this.logger.debug(
      `[getUserData] Found ${JSON.stringify(freelancerSkills)} skills for freelancerId: ${freelancer[0].id}`,
    );

    const result = {
      user: user[0],
      account: account[0],
      freelancer: freelancer[0],
      skills: freelancerSkills,
    };

    this.logger.debug(
      `[getUserData] Completed retrieving data for userId: ${userId}`,
    );
    return result;
  }

  /**
   * Extract profile data from user data
   * @param userData The user data
   * @returns @type {SkillfolioProfile} The profile data
   */
  private async extractProfileData(userData: any): Promise<SkillfolioProfile> {
    this.logger.debug(`[extractProfileData] Starting profile data extraction`);
    const { freelancer, skills } = userData;

    // First, determine domain and subfield from skills to use in tool extraction
    let subfield: string | undefined;

    try {
      // Get mapping to determine most appropriate subfield for tool query
      this.logger.debug(
        `[extractProfileData] Determining subfield for tool extraction`,
      );
      const skillNames = skills.map((item) => item.skill.label);

      // Use our Neo4j service to map profile skills to get the subfield
      const tempProfile: SkillfolioProfile = {
        skills: skillNames.map((name) => ({ name, proficiency: 'Beginner' })),
        tools: [],
        certifications: [],
        education: [],
        experience: [],
      };

      const mapping =
        await this.neo4jService.mapProfileToKnowledge(tempProfile);
      subfield = mapping.subfield;

      this.logger.debug(
        `[extractProfileData] Determined subfield: ${subfield || 'unknown'} for tool extraction`,
      );
    } catch (error) {
      this.logger.warn(
        `[extractProfileData] Error determining subfield: ${error.message}`,
      );
      // Continue without subfield context if there's an error
    }

    // Extract skills
    this.logger.debug(
      `[extractProfileData] Extracting ${skills.length} skills`,
    );
    const extractedSkills: UserSkill[] = skills.map((item) => {
      const proficiency = this.determineProficiencyLevel(item.years);
      const verifications = this.findSkillVerifications(
        item.skill.label,
        freelancer,
      );
      this.logger.debug(
        `[extractProfileData] Processed skill: ${item.skill.label}, proficiency: ${proficiency}, years: ${item.years}, verifications: ${verifications.length}`,
      );

      return {
        name: item.skill.label,
        proficiency,
        yearsOfExperience: item.years || 0,
        verifiedBy: verifications,
      };
    });

    // Extract tools - these could be from portfolio or work history
    this.logger.debug(
      `[extractProfileData] Extracting tools from portfolio and work history`,
    );
    const tools = await this.extractToolsFromPortfolioAndWork(
      freelancer,
      subfield,
    );
    this.logger.debug(`[extractProfileData] Extracted ${tools.length} tools`);

    // Extract certifications from certificates in freelancer data
    this.logger.debug(`[extractProfileData] Extracting certifications`);
    const certifications = (freelancer.certificates || []).map(
      (cert) => cert.certificateName,
    );
    this.logger.debug(
      `[extractProfileData] Extracted ${certifications.length} certifications`,
    );

    // Extract education data
    this.logger.debug(`[extractProfileData] Extracting education data`);
    const education: Education[] = (freelancer.educations || []).map((edu) => ({
      degree: edu.degree,
      field: edu.field,
      institution: edu.institution,
      completedOn: edu.completedOn,
    }));
    this.logger.debug(
      `[extractProfileData] Extracted ${education.length} education entries`,
    );

    // Extract experience data from work history
    this.logger.debug(`[extractProfileData] Extracting experience data`);
    const experience: Experience[] = (freelancer.workHistory || []).map(
      (work) => {
        const duration = this.calculateExperienceDuration(
          work.startDate,
          work.endDate,
          work.currentlyWorkingThere,
        );
        this.logger.debug(
          `[extractProfileData] Processed work experience: ${work.title} at ${work.company}, duration: ${duration} years`,
        );

        return {
          role: work.title,
          company: work.company,
          durationYears: duration,
          projectDescriptions: [work.jobDescription].filter(Boolean),
        };
      },
    );
    this.logger.debug(
      `[extractProfileData] Extracted ${experience.length} experience entries`,
    );

    // Build verifications from portfolio projects
    this.logger.debug(`[extractProfileData] Building verifications`);
    const verifications: Verification[] = this.buildVerifications(freelancer);
    this.logger.debug(
      `[extractProfileData] Built ${verifications.length} verifications`,
    );

    const profile = {
      skills: extractedSkills,
      tools,
      certifications,
      education,
      experience,
      verifications,
      // Add any other custom data that doesn't fit the standard schema
      custom: {
        fieldsOfExpertise: freelancer.fieldsOfExpertise || [],
        yearsOfExperience: freelancer.yearsOfExperience,
        cvLink: freelancer.cvLink,
        videoLink: freelancer.videoLink,
      },
    };

    this.logger.debug(`[extractProfileData] Profile data extraction completed`);
    return profile;
  }

  private determineProficiencyLevel(
    years: number,
  ): 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert' {
    this.logger.debug(
      `[determineProficiencyLevel] Determining proficiency for ${years} years of experience`,
    );

    let proficiency: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
    if (!years) proficiency = 'Beginner';
    else if (years < 2) proficiency = 'Beginner';
    else if (years < 5) proficiency = 'Intermediate';
    else if (years < 8) proficiency = 'Advanced';
    else proficiency = 'Expert';

    this.logger.debug(
      `[determineProficiencyLevel] Determined proficiency: ${proficiency} for ${years} years`,
    );
    return proficiency;
  }

  private findSkillVerifications(skillName: string, freelancer: any): string[] {
    this.logger.debug(
      `[findSkillVerifications] Finding verifications for skill: ${skillName}`,
    );
    const verifications: string[] = [];

    // Check if skill is mentioned in portfolio projects
    if (freelancer.portfolio && Array.isArray(freelancer.portfolio)) {
      this.logger.debug(
        `[findSkillVerifications] Checking ${freelancer.portfolio.length} portfolio projects`,
      );
      for (const project of freelancer.portfolio) {
        if (
          project.projectDescription &&
          project.projectDescription
            .toLowerCase()
            .includes(skillName.toLowerCase())
        ) {
          verifications.push('Project');
          this.logger.debug(
            `[findSkillVerifications] Found verification in project: ${project.projectName}`,
          );
          break;
        }
      }
    }

    // Check if skill is mentioned in certificates
    if (freelancer.certificates && Array.isArray(freelancer.certificates)) {
      this.logger.debug(
        `[findSkillVerifications] Checking ${freelancer.certificates.length} certificates`,
      );
      for (const cert of freelancer.certificates) {
        if (
          cert.certificateName &&
          cert.certificateName.toLowerCase().includes(skillName.toLowerCase())
        ) {
          verifications.push('Certificate');
          this.logger.debug(
            `[findSkillVerifications] Found verification in certificate: ${cert.certificateName}`,
          );
          break;
        }
      }
    }

    this.logger.debug(
      `[findSkillVerifications] Found ${verifications.length} verifications for skill: ${skillName}`,
    );
    return verifications;
  }

  private async extractToolsFromPortfolioAndWork(
    freelancer: any,
    subfield?: string,
  ): Promise<string[]> {
    this.logger.debug(
      `[extractToolsFromPortfolioAndWork] Extracting tools from portfolio and work history for subfield: ${subfield || 'unknown'}`,
    );
    const tools = new Set<string>();
    // Query the knowledge graph for tools related to the given subfield or any tools
    const knownTools = await this.neo4jService.getToolsForSubfield(subfield);

    this.logger.debug(
      `[isLikelyTool] Found ${knownTools.length} tools in knowledge graph for subfield: ${subfield || 'unknown'}`,
    );

    // Extract tools mentioned in portfolio descriptions
    if (freelancer.portfolio && Array.isArray(freelancer.portfolio)) {
      this.logger.debug(
        `[extractToolsFromPortfolioAndWork] Analyzing ${freelancer.portfolio.length} portfolio projects`,
      );
      for (const project of freelancer.portfolio) {
        if (project.projectDescription) {
          // A simple extraction approach - in a real system, you'd use NLP or predefined tool lists
          const words = project.projectDescription
            .split(/[\s,.;:_\-\/\n]+/)
            .map((word) => word.replace(/^[^\w]+|[^\w]+$/g, '')) // remove non-word chars at start/end
            .filter(Boolean);
          for (const word of words) {
            if (await this.isLikelyTool(word, knownTools)) {
              tools.add(word);
              this.logger.debug(
                `[extractToolsFromPortfolioAndWork] Found tool in portfolio: ${word}`,
              );
            }
          }
        }
      }
    }

    // Extract tools from work history
    if (freelancer.workHistory && Array.isArray(freelancer.workHistory)) {
      this.logger.debug(
        `[extractToolsFromPortfolioAndWork] Analyzing ${freelancer.workHistory.length} work history entries`,
      );

      for (const work of freelancer.workHistory) {
        if (work.jobDescription) {
          const words = work.jobDescription
            .split(/[\s,.;:_\-\\/]+/)
            .map((word) => word.replace(/^[^\w]+|[^\w]+$/g, '')) // remove non-word chars at start/end
            .filter(Boolean);
          for (const word of words) {
            if (await this.isLikelyTool(word, knownTools)) {
              tools.add(word);
              this.logger.debug(
                `[extractToolsFromPortfolioAndWork] Found tool in work history: ${word}`,
              );
            }
          }
        }
      }
    }

    const result = Array.from(tools);
    this.logger.debug(
      `[extractToolsFromPortfolioAndWork] Extracted ${result.length} unique tools for subfield: ${subfield || 'unknown'}: ${result.join(', ')}`,
    );
    return result;
  }

  private async isLikelyTool(
    word: string,
    // subfield?: string,
    knownTools: string[],
  ): Promise<boolean> {
    this.logger.debug(`[isLikelyTool] Checking if '${word}' is a tool`);

    // First, clean and normalize the word
    const normalizedWord = word
      .toLowerCase()
      .trim()
      .replace(/[^\w\s]/g, '');
    if (!normalizedWord || normalizedWord.length < 2) {
      return false;
    }

    try {
      /* // Query the knowledge graph for tools related to the given subfield or any tools
      const knownTools = await this.neo4jService.getToolsForSubfield(subfield);

      this.logger.debug(
        `[isLikelyTool] Found ${knownTools.length} tools in knowledge graph for subfield: ${subfield || 'unknown'}`,
      ); */

      // Check if the word matches any of the tools from the knowledge graph
      const isToolMatch = knownTools.some(
        (tool) => normalizedWord.toLowerCase() === tool.toLowerCase(),
      );
      /* const isToolMatch = knownTools.some(
        (tool) =>
          normalizedWord === tool.toLowerCase() ||
          normalizedWord.includes(tool.toLowerCase()) ||
          tool.toLowerCase().includes(normalizedWord),
      ); */

      if (isToolMatch) {
        this.logger.debug(`[isLikelyTool] Matched '${word}' as a known tool`);
        console.log(
          `knownTools: ${knownTools}, normalizedWord: ${normalizedWord}`,
        );
        return true;
      }

      // possibility to add Fallback to common tools if no match found in knowledge graph
    } catch (error) {
      this.logger.error(`[isLikelyTool] Error checking tool: ${error.message}`);

      // On error, possibility to fall back to the original implementation
      return false;
    }
  }

  private calculateExperienceDuration(
    startDate: string,
    endDate: string,
    currentlyWorkingThere: boolean,
  ): number {
    this.logger.debug(
      `[calculateExperienceDuration] Calculating duration from ${startDate} to ${endDate || 'present'}, currently working: ${currentlyWorkingThere}`,
    );

    if (!startDate) {
      this.logger.debug(
        `[calculateExperienceDuration] No start date provided, returning 0`,
      );
      return 0;
    }

    const start = new Date(startDate);
    const end = currentlyWorkingThere
      ? new Date()
      : endDate
        ? new Date(endDate)
        : new Date();

    // Calculate difference in years
    const diffInYears =
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    const duration = Math.max(0, Math.round(diffInYears * 10) / 10); // Round to 1 decimal place

    this.logger.debug(
      `[calculateExperienceDuration] Calculated duration: ${duration} years`,
    );
    return duration;
  }

  private buildVerifications(freelancer: any): Verification[] {
    this.logger.debug(
      `[buildVerifications] Building verifications from freelancer data`,
    );
    const verifications: Verification[] = [];

    // Portfolio projects serve as verification
    if (freelancer.portfolio && Array.isArray(freelancer.portfolio)) {
      this.logger.debug(
        `[buildVerifications] Processing ${freelancer.portfolio.length} portfolio projects`,
      );
      for (const project of freelancer.portfolio) {
        const verification = {
          type: 'Project Use',
          evidence: `Project: ${project.projectName}${project.projectLink ? ` (${project.projectLink})` : ''}`,
        };
        verifications.push(verification);
        this.logger.debug(
          `[buildVerifications] Added project verification: ${verification.evidence}`,
        );
      }
    }

    // Certificates serve as verification
    if (freelancer.certificates && Array.isArray(freelancer.certificates)) {
      this.logger.debug(
        `[buildVerifications] Processing ${freelancer.certificates.length} certificates`,
      );
      for (const cert of freelancer.certificates) {
        const verification = {
          type: 'Certificate',
          evidence: `${cert.certificateName} issued by ${cert.issuedBy} in ${cert.yearIssued}`,
        };
        verifications.push(verification);
        this.logger.debug(
          `[buildVerifications] Added certificate verification: ${verification.evidence}`,
        );
      }
    }

    // CV serves as verification
    if (freelancer.cvLink) {
      const verification = {
        type: 'CV',
        evidence: freelancer.cvLink,
      };
      verifications.push(verification);
      this.logger.debug(
        `[buildVerifications] Added CV verification: ${verification.evidence}`,
      );
    }

    this.logger.debug(
      `[buildVerifications] Built ${verifications.length} verifications total`,
    );
    return verifications;
  }

  private async mapToKnowledgeGraph(profile: SkillfolioProfile): Promise<any> {
    this.logger.debug(
      `[mapToKnowledgeGraph] Starting knowledge graph mapping with ${profile.skills.length} skills`,
    );

    // This would call the Neo4j service to map the profile to the knowledge graph
    const result = await this.neo4jService.mapProfileToKnowledge(profile);

    this.logger.debug(
      `[mapToKnowledgeGraph] Completed knowledge graph mapping: ${JSON.stringify(
        {
          domain: result.domain,
          field: result.field,
          category: result.category,
          subfield: result.subfield,
          strengths: result.strengths,
          weaknesses: result.weaknesses,
          gaps: result.gaps,
        },
      )}`,
    );

    return result;
  }

  private async calculateReadinessScore(
    profile: SkillfolioProfile,
    graphMapping: any,
  ): Promise<number> {
    this.logger.debug(
      `[calculateReadinessScore] Starting advanced readiness score calculation`,
    );

    const subfield = graphMapping.subfield;
    if (!subfield || subfield === 'Unknown') {
      this.logger.warn(
        `[calculateReadinessScore] No valid subfield identified, using basic scoring method`,
      );
      return this.calculateBasicReadinessScore(profile, graphMapping);
    }

    try {
      // Maximum possible score is 100
      const maxScore = 100;

      // Initialize score components
      let skillScore = 0;
      let toolScore = 0;
      let certificationScore = 0;
      let educationScore = 0;
      let experienceScore = 0;

      // Get required skills for this subfield from knowledge graph
      const requiredSkills =
        await this.neo4jService.getRequiredSkillsForSubfield(subfield);
      this.logger.debug(
        `[calculateReadinessScore] Found ${requiredSkills.length} required skills for subfield: ${subfield}`,
      );

      // Get recommended tools for this subfield
      const recommendedTools =
        await this.neo4jService.getToolsForSubfield(subfield);
      this.logger.debug(
        `[calculateReadinessScore] Found ${recommendedTools.length} recommended tools for subfield: ${subfield}`,
      );

      // Get recommended certifications for this subfield
      const recommendedCertifications =
        await this.neo4jService.getCertificationsForSubfield(subfield);
      this.logger.debug(
        `[calculateReadinessScore] Found ${recommendedCertifications.length} recommended certifications for subfield: ${subfield}`,
      );

      // 1. Calculate skill coverage and proficiency (40% of total score)
      if (requiredSkills.length > 0) {
        // Create a map of user skills for easy lookup
        const userSkillMap = new Map(
          profile.skills.map((skill) => [skill.name.toLowerCase(), skill]),
        );

        let coveredSkillsCount = 0;
        let proficiencyScore = 0;
        const proficiencyWeights = {
          Beginner: 0.25,
          Intermediate: 0.5,
          Advanced: 0.75,
          Expert: 1.0,
        };

        for (const reqSkill of requiredSkills) {
          // Check if user has this skill
          const userSkill = Array.from(userSkillMap.entries()).find(
            ([name]) => name.toLowerCase() === reqSkill.name.toLowerCase(),
          );

          if (userSkill) {
            coveredSkillsCount++;
            // Calculate proficiency score based on skill level
            proficiencyScore +=
              proficiencyWeights[userSkill[1].proficiency] *
              reqSkill.importance;
            this.logger.debug(
              `[calculateReadinessScore] Matched skill: ${reqSkill.name} with proficiency: ${userSkill[1].proficiency}, importance: ${reqSkill.importance}`,
            );
          } else {
            this.logger.debug(
              `[calculateReadinessScore] Missing skill: ${reqSkill.name}, importance: ${reqSkill.importance}`,
            );
          }
        }

        // Calculate skill coverage percentage
        const skillCoverage =
          requiredSkills.length > 0
            ? coveredSkillsCount / requiredSkills.length
            : 0;

        // Calculate total possible proficiency score
        const maxProficiencyScore = requiredSkills.reduce(
          (sum, skill) => sum + skill.importance,
          0,
        );

        // Normalize proficiency score
        const normalizedProficiency =
          maxProficiencyScore > 0 ? proficiencyScore / maxProficiencyScore : 0;

        // Combine coverage and proficiency for final skill score (40% of total)
        skillScore = (skillCoverage * 0.6 + normalizedProficiency * 0.4) * 40;

        this.logger.debug(
          `[calculateReadinessScore] Skill coverage: ${(skillCoverage * 100).toFixed(2)}%, Proficiency: ${(normalizedProficiency * 100).toFixed(2)}%, Skill score: ${skillScore.toFixed(2)}/40`,
        );
      } else {
        // Fallback if no required skills in knowledge graph
        skillScore = profile.skills.length > 0 ? 20 : 0;
        this.logger.debug(
          `[calculateReadinessScore] No required skills in knowledge graph, using fallback: ${skillScore}/40`,
        );
      }

      // 2. Calculate tool coverage (20% of total score)
      if (recommendedTools.length > 0) {
        // Normalize tools to lowercase for comparison
        const userToolsLower = profile.tools.map((tool) => tool.toLowerCase());

        // Count matches
        let toolMatches = 0;
        for (const recTool of recommendedTools) {
          if (userToolsLower.some((t) => t === recTool.toLowerCase())) {
            toolMatches++;
            this.logger.debug(
              `[calculateReadinessScore] Matched tool: ${recTool}`,
            );
          }
        }

        // Calculate tool score as percentage of recommended tools
        toolScore = (toolMatches / recommendedTools.length) * 20;
        this.logger.debug(
          `[calculateReadinessScore] Tool coverage: ${((toolMatches / recommendedTools.length) * 100).toFixed(2)}%, Tool score: ${toolScore.toFixed(2)}/20`,
        );
      } else {
        // Fallback if no recommended tools
        toolScore = profile.tools.length > 0 ? 10 : 0;
        this.logger.debug(
          `[calculateReadinessScore] No recommended tools in knowledge graph, using fallback: ${toolScore}/20`,
        );
      }

      // 3. Calculate certification coverage (15% of total score)
      if (recommendedCertifications.length > 0) {
        // Normalize certifications to lowercase for comparison
        const userCertsLower = profile.certifications.map((cert) =>
          cert.toLowerCase(),
        );

        // Count matches
        let certMatches = 0;
        for (const recCert of recommendedCertifications) {
          if (
            userCertsLower.some(
              (c) =>
                c === recCert.toLowerCase() ||
                c.includes(recCert.toLowerCase()) ||
                recCert.toLowerCase().includes(c),
            )
          ) {
            certMatches++;
            this.logger.debug(
              `[calculateReadinessScore] Matched certification: ${recCert}`,
            );
          }
        }

        // Calculate certification score
        certificationScore =
          (certMatches / recommendedCertifications.length) * 15;
        this.logger.debug(
          `[calculateReadinessScore] Certification coverage: ${((certMatches / recommendedCertifications.length) * 100).toFixed(2)}%, Cert score: ${certificationScore.toFixed(2)}/15`,
        );
      } else {
        // Fallback if no recommended certifications
        certificationScore = profile.certifications.length > 0 ? 7.5 : 0;
        this.logger.debug(
          `[calculateReadinessScore] No recommended certifications in knowledge graph, using fallback: ${certificationScore}/15`,
        );
      }

      // 4. Calculate education score (10% of total score)
      // Knowledge graph typically doesn't have education requirements, so use static scoring
      if (profile.education.length > 0) {
        // Score based on education level (degree type)
        const degreeWeights = {
          doctorate: 1.0,
          phd: 1.0,
          master: 0.8,
          masters: 0.8,
          bachelor: 0.6,
          bachelors: 0.6,
          undergraduate: 0.6,
          associate: 0.4,
          certificate: 0.3,
          diploma: 0.3,
          'high school': 0.2,
        };

        let highestEducationScore = 0;
        for (const edu of profile.education) {
          // Find the highest degree weight
          for (const [degreeType, weight] of Object.entries(degreeWeights)) {
            if (
              (edu.degree && edu.degree.toLowerCase().includes(degreeType)) ||
              (edu.field && edu.field.toLowerCase().includes(degreeType))
            ) {
              highestEducationScore = Math.max(highestEducationScore, weight);
              break;
            }
          }
        }

        // Calculate education score
        educationScore = highestEducationScore * 10;
        this.logger.debug(
          `[calculateReadinessScore] Education score based on highest degree: ${educationScore.toFixed(2)}/10`,
        );
      }

      // 5. Calculate experience score (15% of total score)
      if (profile.experience.length > 0) {
        // Calculate total years of relevant experience
        const totalYears = profile.experience.reduce(
          (sum, exp) => sum + (exp.durationYears || 0),
          0,
        );

        // Score experience (capped at 10 years for max score)
        const maxYears = 10;
        experienceScore = Math.min(totalYears / maxYears, 1) * 15;
        this.logger.debug(
          `[calculateReadinessScore] Experience score based on ${totalYears} years: ${experienceScore.toFixed(2)}/15`,
        );
      }

      // Calculate total score
      const totalScore = Math.round(
        skillScore +
          toolScore +
          certificationScore +
          educationScore +
          experienceScore,
      );

      // Ensure score is within 0-100 range
      const finalScore = Math.max(0, Math.min(totalScore, maxScore));

      this.logger.debug(
        `[calculateReadinessScore] Final score components: Skills=${skillScore.toFixed(2)}, Tools=${toolScore.toFixed(2)}, Certifications=${certificationScore.toFixed(2)}, Education=${educationScore.toFixed(2)}, Experience=${experienceScore.toFixed(2)}`,
      );
      this.logger.debug(
        `[calculateReadinessScore] Final readiness score: ${finalScore}/100`,
      );

      return finalScore;
    } catch (error) {
      this.logger.error(
        `[calculateReadinessScore] Error calculating score: ${error.message}`,
        error.stack,
      );
      // Fall back to basic scoring if there's an error
      return this.calculateBasicReadinessScore(profile, graphMapping);
    }
  }

  // Fallback basic scoring method
  private calculateBasicReadinessScore(
    profile: SkillfolioProfile,
    graphMapping: any,
  ): number {
    this.logger.debug(
      `[calculateBasicReadinessScore] Using basic scoring method`,
    );
    let score = 0;
    const maxScore = 100;

    // Basic profile completeness (50%)
    if (profile.skills.length > 0) {
      score += 10;
      this.logger.debug(
        `[calculateBasicReadinessScore] Added 10 points for having skills, current score: ${score}`,
      );
    }
    if (profile.tools.length > 0) {
      score += 5;
      this.logger.debug(
        `[calculateBasicReadinessScore] Added 5 points for having tools, current score: ${score}`,
      );
    }
    if (profile.certifications.length > 0) {
      score += 10;
      this.logger.debug(
        `[calculateBasicReadinessScore] Added 10 points for having certifications, current score: ${score}`,
      );
    }
    if (profile.education.length > 0) {
      score += 10;
      this.logger.debug(
        `[calculateBasicReadinessScore] Added 10 points for having education, current score: ${score}`,
      );
    }
    if (profile.experience.length > 0) {
      score += 15;
      this.logger.debug(
        `[calculateBasicReadinessScore] Added 15 points for having experience, current score: ${score}`,
      );
    }

    // Knowledge graph alignment (50%)
    if (graphMapping.domain) {
      score += 10;
      this.logger.debug(
        `[calculateBasicReadinessScore] Added 10 points for domain alignment (${graphMapping.domain}), current score: ${score}`,
      );
    }
    if (graphMapping.field) {
      score += 10;
      this.logger.debug(
        `[calculateBasicReadinessScore] Added 10 points for field alignment (${graphMapping.field}), current score: ${score}`,
      );
    }
    if (graphMapping.subfield) {
      score += 10;
      this.logger.debug(
        `[calculateBasicReadinessScore] Added 10 points for subfield alignment (${graphMapping.subfield}), current score: ${score}`,
      );
    }

    // Gap analysis
    const gapPenalty = Math.min(20, graphMapping.gaps?.length * 2 || 0);
    score = Math.max(0, score - gapPenalty);
    this.logger.debug(
      `[calculateBasicReadinessScore] Applied gap penalty of ${gapPenalty} points, current score: ${score}`,
    );

    // Add bonus for strength alignment
    const strengthBonus = Math.min(20, graphMapping.strengths?.length * 2 || 0);
    score = Math.min(maxScore, score + strengthBonus);
    this.logger.debug(
      `[calculateBasicReadinessScore] Applied strength bonus of ${strengthBonus} points, final score: ${score}`,
    );

    this.logger.debug(
      `[calculateBasicReadinessScore] Completed basic readiness score calculation: ${score}`,
    );
    return score;
  }
}
