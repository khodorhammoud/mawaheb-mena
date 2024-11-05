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
  accountType: EmployerAccountType;
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

export interface EmployerSocialMediaLinks {
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
  socialMediaLinks?: EmployerSocialMediaLinks;
  account?: UserAccount;
  isOnboarded: boolean; // this is used in the loader :)
}

export interface Freelancer {
  id: number;
  accountId?: number;
  fieldsOfExpertise?: string[];
  portfolio?: string[];
  portfolioDescription?: string;
  cvLink?: string;
  videoLink?: string;
  certificatesLinks?: string[];
  yearsOfExperience?: string;
  languagesSpoken?: Language[];
  preferredProjectTypes?: ProjectType[];
  compensationType?: CompensationType[];
  account?: UserAccount;
}

export interface LoggedInUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

export interface EmployerBio {
  firstName: string;
  lastName: string;
  location: string;
  socialMediaLinks: EmployerSocialMediaLinks;
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
export interface OnboardingFields {
  accountType: AccountType;
  bioInfo: EmployerBio;
  employerIndustries: Industry[];
  allIndustries: Industry[];
  currentUser: Employer;
  yearsInBusiness: number;
  employerBudget: string;
  aboutEmployer: string;
  accountOnboarded: boolean;
  employer: Employer;
  activeJobCount: number;
  draftedJobCount: number;
  closedJobCount: number;
  totalJobCount: number;
}
