import {
  AccountStatus,
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

export interface Employer {
  id?: number;
  employerAccountType: EmployerAccountType;
  accountId?: number;
  companyName?: string;
  employerName?: string;
  companyEmail?: string;
  industrySector?: string;
  companyRepName?: string;
  companyRepEmail?: string;
  companyRepPosition?: string;
  companyRepPhone?: string;
  taxIdNumber?: string;
  taxIdDocumentLink?: string;
  businessLicenseLink?: string;
  certificationOfIncorporationLink?: string;
  WebsiteURL?: string;
  socialMediaLinks?: string[];
  account?: UserAccount;
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
