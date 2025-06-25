import {
  AccountStatus,
  AccountType,
  CompensationType,
  DayOfWeek,
  EmployerAccountType,
  Language,
  ProjectType,
  Provider,
} from './enums';

export type User = {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  passHash?: string;
  isVerified?: boolean;
  isOnboarded?: boolean;
  provider?: Provider;
  role?: 'admin' | 'user';
  deletionRequestedAt?: Date;
  finalDeletionAt?: Date;
};

export type PreferredWorkingTimes = {
  id: number;
  accountId: number;
  dayOfWeek: DayOfWeek;
  startTime: Date | string;
  endTime: Date | string;
};

export type SocialAccount = {
  id?: number;
  provider: string;
  providerAccountId: string;
  profileUrl?: string;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: Date | string;
  userId?: number;
};

export type UserAccount = {
  id: number;
  accountType: AccountType;
  slug: string;
  isCreationComplete: boolean;
  location?: string;
  country?: string;
  region?: string;
  accountStatus?: AccountStatus;
  phone?: string;
  languages?: Language[];
  preferredWorkingTimes?: PreferredWorkingTimes[];
  user: User;
  // socialAccounts?: SocialAccount[];
};

export type AccountSocialMediaLinks = {
  linkedin: string;
  github: string;
  gitlab: string;
  dribbble: string;
  stackoverflow: string;
};
export type Employer = {
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
  industries?: { id: number; name: string }[]; // <-- ADD THIS LINE
};

export type Freelancer = {
  id: number;
  accountId?: number;
  fieldsOfExpertise?: string[];
  portfolio?: PortfolioFormFieldType[];
  workHistory?: WorkHistoryFormFieldType[];
  portfolioDescription?: string;
  cvLink?: string;
  videoLink?: string;
  certificates?: CertificateFormFieldType[];
  educations?: EducationFormFieldType[];
  yearsOfExperience?: number;
  languagesSpoken?: Language[];
  preferredProjectTypes?: ProjectType[];
  hourlyRate?: number;
  compensationType?: CompensationType[];
  account?: UserAccount;

  // Availability related fields :)
  availableForWork?: boolean;
  availableFrom?: string;
  hoursAvailableFrom?: string;
  hoursAvailableTo?: string;
  jobsOpenTo?: string[];
};

export type LoggedInUser = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
};

export type AccountBio = {
  firstName: string;
  lastName: string;
  address: string;
  country: string;
  socialMediaLinks: AccountSocialMediaLinks;
  websiteURL: string;
  userId: number;
};

export type Industry = {
  id: number;
  label: string;
  metadata: string[];
};

export type JobCategory = {
  id: number;
  label: string;
};

export type LoaderFunctionError = {
  success: boolean;
  error: {
    message: string;
  };
  status: number;
};

/* 
These fields names also control their respective HTML input fields names
For example, we use the HTML input field name "employerBudget" to get/set the value for the employer budget
*/
export type OnboardingEmployerFields = {
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
};

export type OnboardingFreelancerFields = {
  accountType: AccountType;
  bioInfo: AccountBio;
  currentProfile: Freelancer;
  about: string;
  videoLink: string;
  accountOnboarded: boolean;
  hourlyRate: number;
  yearsOfExperience: number;
  portfolio?: PortfolioFormFieldType[];
  workHistory?: WorkHistoryFormFieldType[];
  certificates?: CertificateFormFieldType[];
  education?: EducationFormFieldType[];
};

export type PortfolioFormFieldType = {
  projectName: string;
  projectLink: string;
  projectDescription: string;
  attachmentId?: number; // This will be set in the function

  // Existing image fields:
  projectImageName?: string;
  projectImageUrl?: string;

  // Add these for PDFs, docs, etc:
  attachmentUrl?: string; // S3 signed URL or Google Drive link
  attachmentName?: string; // Name of the attached file (pdf/doc)
};

export type AttachmentsType = {
  key: string;
  metadata?: Record<string, any>; // Optional because JSONB has a default
};

export type WorkHistoryFormFieldType = {
  title: string;
  company: string;
  currentlyWorkingThere: boolean;
  startDate: Date | string;
  endDate: Date | string;
  jobDescription: string;
};

export type CertificateFormFieldType = {
  certificateName: string;
  issuedBy: string;
  yearIssued: number;
  attachmentId?: number;
  attachmentName?: string;
  attachmentUrl?: string; // Pre-signed URL for accessing the file
};

export type EducationFormFieldType = {
  degree: string;
  institution: string;
  graduationYear: number;
};

export type SettingsInfo = {
  firstName: string;
  lastName: string;
  email: string;
  country: string;
  address: string;
  region: string;
  phone: string;
  websiteURL?: string;
  socialMediaLinks?: Record<string, string>;
};
