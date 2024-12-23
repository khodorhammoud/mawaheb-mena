import { Skill } from "./Skill";
import { JobApplicationStatus /* JobStatus */ } from "./enums";

export interface Job {
  id?: number;
  employerId: number;
  title: string;
  description: string;
  jobCategoryId?: number;
  workingHoursPerWeek: number;
  locationPreference: string;
  requiredSkills: Skill[];
  projectType: string;
  budget: number;
  experienceLevel: string;
  // status: JobStatus;
  status: string;
  createdAt?: string; // Keep as string for JSON compatibility
  fulfilledAt?: string;
}

export interface JobFilter {
  projectType?: string[];
  locationPreference?: string[];
  experienceLevel?: string[];
  employerId?: number;
  page?: number;
  pageSize?: number;
}

export interface JobApplication {
  id: number;
  jobId: number;
  freelancerId: number;
  status: JobApplicationStatus;
  createdAt: string;
  job?: Job;
}
