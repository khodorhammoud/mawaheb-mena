import { AccountType } from '@mawaheb/db/enums';
import {
  AccountBio,
  CertificateFormFieldType,
  EducationFormFieldType,
  Industry,
  PortfolioFormFieldType,
  WorkHistoryFormFieldType,
  Freelancer,
} from '@mawaheb/db/types';

export type EmployerOnboardingData = {
  accountType: AccountType;
  bioInfo: AccountBio;
  employerIndustries: Industry[];
  allIndustries: Industry[];
  currentProfile: AccountType;
  yearsInBusiness: number;
  employerBudget: string;
  about: string;
  accountOnboarded: boolean;
  activeJobCount: number;
  draftedJobCount: number;
  closedJobCount: number;
  totalJobCount: number;
};

export type FreelancerOnboardingData = {
  accountType: AccountType;
  bioInfo: AccountBio;
  currentProfile: Freelancer;
  about: string;
  videoLink: string;
  hourlyRate: number;
  accountOnboarded: boolean;
  yearsOfExperience: number;
  portfolio: PortfolioFormFieldType[];
  certificates: CertificateFormFieldType[];
  educations: EducationFormFieldType[];
  workHistory: WorkHistoryFormFieldType[];
  freelancerSkills: FreelancerSkill[];
  freelancerLanguages: { id: number; language: string }[];
};

export interface Skill {
  id: number;
  label: string;
  metaData: Record<string, string>;
  isHot: boolean;
}

export interface FreelancerSkill {
  skillId: number;
  label?: string;
  yearsOfExperience: number;
  isStarred?: boolean;
}
