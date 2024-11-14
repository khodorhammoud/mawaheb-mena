import {
  AccountStatus,
  AccountType,
  CompensationType,
  DayOfWeek,
  EmployerAccountType,
  Language,
  ProjectType,
} from "./enums";

export interface User {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  passHash?: string;
  isVerified?: boolean;
  isOnboarded?: boolean;
}

export interface PreferredWorkingTimes {
  id: number;
  accountId: number;
  dayOfWeek: DayOfWeek;
  startTime: Date;
  endTime: Date;
}

export interface UserAccount {
  id: number;
  accountType: AccountType;
  isCreationComplete: boolean;
  location?: string;
  country?: string;
  region?: string;
  accountStatus?: AccountStatus;
  phone?: string;
  languages?: Language[];
  preferredWorkingTimes?: PreferredWorkingTimes[];
  user: User;
}

export interface AccountSocialMediaLinks {
  linkedin: string;
  github: string;
  gitlab: string;
  dribbble: string;
  stackoverflow: string;
}
export interface Employer {
  id?: number;
  employerAccountType: EmployerAccountType;
  accountId?: number;
  companyName?: string;
  employerName?: string;
  companyEmail?: string;
  industrySector?: string;
  yearsInBusiness?: number;
  companyRepName?: string;
  companyRepEmail?: string;
  companyRepPosition?: string;
  companyRepPhone?: string;
  taxIdNumber?: string;
  taxIdDocumentLink?: string;
  businessLicenseLink?: string;
  certificationOfIncorporationLink?: string;
  WebsiteURL?: string;
  socialMediaLinks?: AccountSocialMediaLinks;
  account?: UserAccount;
  isOnboarded: boolean; // this is used in the loader :)
}

export interface Freelancer {
  id: number;
  accountId?: number;
  fieldsOfExpertise?: string[];
  portfolio?: PortfolioFormFieldType[];
  portfolioDescription?: string;
  cvLink?: string;
  videoLink?: string;
  certificatesLinks?: string[];
  yearsOfExperience?: number;
  languagesSpoken?: Language[];
  preferredProjectTypes?: ProjectType[];
  hourlyRate?: number;
  compensationType?: CompensationType[];
  account?: UserAccount;
}

export interface LoggedInUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

export interface AccountBio {
  firstName: string;
  lastName: string;
  location: string;
  socialMediaLinks: AccountSocialMediaLinks;
  websiteURL: string;
  userId: number; // Add this property
}

export interface Industry {
  id: number;
  label: string;
  metadata: string[];
}

export interface JobCategory {
  id: number;
  label: string;
}

export interface LoaderFunctionError {
  success: boolean;
  error: {
    message: string;
  };
  status: number;
}

/* 
These fields names also control their respective HTML input fields names
For example, we use the HTML input field name "employerBudget" to get/set the value for the employer budget
*/
export interface OnboardingEmployerFields {
  accountType: AccountType;
  bioInfo: AccountBio;
  employerIndustries: Industry[];
  allIndustries: Industry[];
  currentProfile: Employer;
  yearsInBusiness: number;
  employerBudget: string;
  about: string;
  accountOnboarded: boolean;
  activeJobCount: number;
  draftedJobCount: number;
  closedJobCount: number;
  totalJobCount: number;
}

export interface OnboardingFreelancerFields {
  accountType: AccountType;
  bioInfo: AccountBio;
  currentProfile: Freelancer;
  about: string;
  videoLink: string;
  accountOnboarded: boolean;
  hourlyRate: number;
  yearsOfExperience: number;
  portfolio?: PortfolioFormFieldType[];
}

export interface PortfolioFormFieldType {
  projectName: string;
  projectLink: string;
  projectDescription: string;
  projectImageName: string;
  projectImageUrl: string | null;
}

export interface WorkHistoryFormFieldType {}

export interface CertificatesFormFieldType {}

export interface EducationFormFieldType {}
