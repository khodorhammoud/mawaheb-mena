// ~/types.ts

import { AccountStatus, CompensationType, JobApplicationStatus } from '@mawaheb/db/enums';

/** For arrays in the freelancer object */
export interface Portfolio {
  projectName: string;
  projectLink: string;
  projectDescription: string;
  projectImageName: string;
  projectImageUrl: string;
  attachmentName: string;
  attachmentId: number;
}

export interface Certificate {
  certificateName: string;
  issuedBy: string;
  yearIssued: number;
  attachmentName: string | null;
  attachmentUrl: string;
  attachmentId: number | null;
}

export interface Education {
  degree: string;
  institution: string;
  graduationYear: number;
}

export interface WorkHistory {
  title: string;
  company: string;
  currentlyWorkingThere: boolean;
  startDate: string;
  endDate: string;
  jobDescription: string;
}

/** The main freelancer data structure */
export interface FreelancerData {
  freelancer: {
    id: number;
    accountId: number;
    about: string;
    fieldsOfExpertise: string[];
    yearsOfExperience: number;
    hourlyRate: number;
    compensationType: CompensationType;
    availableForWork: boolean;
    dateAvailableFrom: string;
    hoursAvailableFrom: string;
    hoursAvailableTo: string;
    jobsOpenTo: string[];
    preferredProjectTypes: string[];
    portfolio: Portfolio[];
    cvLink: string;
    videoLink: string;
    certificates: Certificate[];
    educations: Education[];
    workHistory: WorkHistory[];
  };
  account: {
    id: number;
    accountStatus: AccountStatus;
    country: string;
    address: string;
    region: string;
    phone: string;
    websiteURL: string;
    socialMediaLinks: Record<string, string>;
  };
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

/** For each Job Application record */
export interface JobApplication {
  id: number;
  jobId: number;
  jobTitle: string;
  status: JobApplicationStatus;
  createdAt: string;
  freelancerId: number;
  matchScore?: number;
  employerId?: number;
  employerFirstName?: string;
  employerLastName?: string;
  employerEmail?: string;
  employerAccountStatus?: string;
}

/** The loader data structure */
export interface LoaderData {
  freelancer: FreelancerData;
  applications: JobApplication[];
  applicationCount: number;
}

/** Action response shape */
export interface ActionResponse {
  success: boolean;
  error?: string;
}
