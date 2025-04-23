import { Injectable } from '@nestjs/common';
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
  constructor(
    private readonly dbService: DatabaseService,
    private readonly neo4jService: Neo4jService,
  ) {}

  async extractSkillfolio(userId: number): Promise<Skillfolio> {
    // 1. Get user data from database
    const userData = await this.getUserData(userId);
    if (!userData) {
      throw new Error(`User with ID ${userId} not found`);
    }

    // 2. Extract profile data from user information
    const profile = this.extractProfileData(userData);

    // 3. Map to knowledge graph
    const graphMapping = await this.mapToKnowledgeGraph(profile);

    // 4. Calculate readiness score
    const readinessScore = this.calculateReadinessScore(profile, graphMapping);

    // 5. Build and return the skillfolio
    return {
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
  }

  private async getUserData(userId: number) {
    const {
      UsersTable,
      accountsTable,
      freelancersTable,
      freelancerSkillsTable,
      skillsTable,
    } = await import('@mawaheb/db');

    // Get user data from multiple tables using the db service
    const user = await this.dbService.db
      .select()
      .from(UsersTable)
      .where(sql`${UsersTable.id} = ${userId}`)
      .limit(1);

    if (!user || user.length === 0) {
      return null;
    }

    const account = await this.dbService.db
      .select()
      .from(accountsTable)
      .where(sql`${accountsTable.userId} = ${userId}`)
      .limit(1);
    if (!account || account.length === 0) {
      return null;
    }

    const freelancer = await this.dbService.db
      .select()
      .from(freelancersTable)
      .where(sql`${freelancersTable.accountId} = ${account[0].id}`)
      .limit(1);
    if (!freelancer || freelancer.length === 0) {
      return null;
    }

    // Get freelancer skills
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

    return {
      user: user[0],
      account: account[0],
      freelancer: freelancer[0],
      skills: freelancerSkills,
    };
  }

  private extractProfileData(userData: any): SkillfolioProfile {
    const { freelancer, skills } = userData;

    // Extract skills
    const extractedSkills: UserSkill[] = skills.map((item) => ({
      name: item.skill.label,
      // Determine proficiency based on years of experience
      proficiency: this.determineProficiencyLevel(item.years),
      yearsOfExperience: item.years || 0,
      // Add verification from portfolio projects that use this skill
      verifiedBy: this.findSkillVerifications(item.skill.label, freelancer),
    }));

    // Extract tools - these could be from portfolio or work history
    const tools = this.extractToolsFromPortfolioAndWork(freelancer);

    // Extract certifications from certificates in freelancer data
    const certifications = (freelancer.certificates || []).map(
      (cert) => cert.certificateName,
    );

    // Extract education data
    const education: Education[] = (freelancer.educations || []).map((edu) => ({
      degree: edu.degree,
      field: edu.field,
      institution: edu.institution,
      completedOn: edu.completedOn,
    }));

    // Extract experience data from work history
    const experience: Experience[] = (freelancer.workHistory || []).map(
      (work) => ({
        role: work.title,
        company: work.company,
        durationYears: this.calculateExperienceDuration(
          work.startDate,
          work.endDate,
          work.currentlyWorkingThere,
        ),
        projectDescriptions: [work.jobDescription].filter(Boolean),
      }),
    );

    // Build verifications from portfolio projects
    const verifications: Verification[] = this.buildVerifications(freelancer);

    return {
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
  }

  private determineProficiencyLevel(
    years: number,
  ): 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert' {
    if (!years) return 'Beginner';
    if (years < 2) return 'Beginner';
    if (years < 5) return 'Intermediate';
    if (years < 8) return 'Advanced';
    return 'Expert';
  }

  private findSkillVerifications(skillName: string, freelancer: any): string[] {
    const verifications: string[] = [];

    // Check if skill is mentioned in portfolio projects
    if (freelancer.portfolio && Array.isArray(freelancer.portfolio)) {
      for (const project of freelancer.portfolio) {
        if (
          project.projectDescription &&
          project.projectDescription
            .toLowerCase()
            .includes(skillName.toLowerCase())
        ) {
          verifications.push('Project');
          break;
        }
      }
    }

    // Check if skill is mentioned in certificates
    if (freelancer.certificates && Array.isArray(freelancer.certificates)) {
      for (const cert of freelancer.certificates) {
        if (
          cert.certificateName &&
          cert.certificateName.toLowerCase().includes(skillName.toLowerCase())
        ) {
          verifications.push('Certificate');
          break;
        }
      }
    }

    return verifications;
  }

  private extractToolsFromPortfolioAndWork(freelancer: any): string[] {
    const tools = new Set<string>();

    // Extract tools mentioned in portfolio descriptions
    if (freelancer.portfolio && Array.isArray(freelancer.portfolio)) {
      for (const project of freelancer.portfolio) {
        if (project.projectDescription) {
          // A simple extraction approach - in a real system, you'd use NLP or predefined tool lists
          const words = project.projectDescription.split(/\s+/);
          for (const word of words) {
            if (this.isLikelyTool(word)) {
              tools.add(word);
            }
          }
        }
      }
    }

    // Extract tools from work history
    if (freelancer.workHistory && Array.isArray(freelancer.workHistory)) {
      for (const work of freelancer.workHistory) {
        if (work.jobDescription) {
          const words = work.jobDescription.split(/\s+/);
          for (const word of words) {
            if (this.isLikelyTool(word)) {
              tools.add(word);
            }
          }
        }
      }
    }

    return Array.from(tools);
  }

  private isLikelyTool(word: string): boolean {
    // A simplistic approach - in a real system, you'd have a list of known tools
    // or use a more sophisticated mechanism to identify tools
    const commonTools = [
      'git',
      'github',
      'react',
      'angular',
      'vue',
      'node',
      'postgres',
      'mysql',
      'mongodb',
      'firebase',
      'aws',
      'docker',
      'kubernetes',
      'terraform',
      'javascript',
      'typescript',
      'python',
      'java',
      'c#',
      'php',
      'ruby',
    ];

    return commonTools.some((tool) =>
      word.toLowerCase().includes(tool.toLowerCase()),
    );
  }

  private calculateExperienceDuration(
    startDate: string,
    endDate: string,
    currentlyWorkingThere: boolean,
  ): number {
    if (!startDate) return 0;

    const start = new Date(startDate);
    const end = currentlyWorkingThere
      ? new Date()
      : endDate
        ? new Date(endDate)
        : new Date();

    // Calculate difference in years
    const diffInYears =
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    return Math.max(0, Math.round(diffInYears * 10) / 10); // Round to 1 decimal place
  }

  private buildVerifications(freelancer: any): Verification[] {
    const verifications: Verification[] = [];

    // Portfolio projects serve as verification
    if (freelancer.portfolio && Array.isArray(freelancer.portfolio)) {
      for (const project of freelancer.portfolio) {
        verifications.push({
          type: 'Project Use',
          evidence: `Project: ${project.projectName}${project.projectLink ? ` (${project.projectLink})` : ''}`,
        });
      }
    }

    // Certificates serve as verification
    if (freelancer.certificates && Array.isArray(freelancer.certificates)) {
      for (const cert of freelancer.certificates) {
        verifications.push({
          type: 'Certificate',
          evidence: `${cert.certificateName} issued by ${cert.issuedBy} in ${cert.yearIssued}`,
        });
      }
    }

    // CV serves as verification
    if (freelancer.cvLink) {
      verifications.push({
        type: 'CV',
        evidence: freelancer.cvLink,
      });
    }

    return verifications;
  }

  private async mapToKnowledgeGraph(profile: SkillfolioProfile): Promise<any> {
    // This would call the Neo4j service to map the profile to the knowledge graph
    return this.neo4jService.mapProfileToKnowledge(profile);
  }

  private calculateReadinessScore(
    profile: SkillfolioProfile,
    graphMapping: any,
  ): number {
    // Calculate a score based on profile completeness and alignment with knowledge graph
    let score = 0;
    const maxScore = 100;

    // Basic profile completeness (50%)
    if (profile.skills.length > 0) score += 10;
    if (profile.tools.length > 0) score += 5;
    if (profile.certifications.length > 0) score += 10;
    if (profile.education.length > 0) score += 10;
    if (profile.experience.length > 0) score += 15;

    // Knowledge graph alignment (50%)
    if (graphMapping.domain) score += 10;
    if (graphMapping.field) score += 10;
    if (graphMapping.subfield) score += 10;

    // Gap analysis
    const gapPenalty = Math.min(20, graphMapping.gaps?.length * 2 || 0);
    score = Math.max(0, score - gapPenalty);

    // Add bonus for strength alignment
    const strengthBonus = Math.min(20, graphMapping.strengths?.length * 2 || 0);
    score = Math.min(maxScore, score + strengthBonus);

    return score;
  }
}
