import { AccountType } from '@mawaheb/db';
import {
  AccountBio,
  CertificateFormFieldType,
  EducationFormFieldType,
  Industry,
  PortfolioFormFieldType,
  WorkHistoryFormFieldType,
} from '@mawaheb/db';

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
  currentProfile: AccountType;
  about: string;
  videoLink: string;
  hourlyRate: number;
  accountOnboarded: boolean;
  yearsOfExperience: number;
  portfolio: PortfolioFormFieldType[];
  certificates: CertificateFormFieldType[];
  educations: EducationFormFieldType[];
  workHistory: WorkHistoryFormFieldType[];
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
}
