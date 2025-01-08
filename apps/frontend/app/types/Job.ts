import {
  /* jobApplicationsTable, */ jobsTable,
} from "~/db/drizzle/schemas/schema";
import { InferSelectModel } from "drizzle-orm";
import { JobApplicationStatus } from "./enums";

export type Job = InferSelectModel<typeof jobsTable>;

export interface JobCardData {
  job: Job;
  applications: JobApplication[];
  interviewedCount?: number;
}

export interface JobFilter {
  projectType?: string[];
  locationPreference?: string[];
  experienceLevel?: string[];
  employerId?: number;
  page?: number;
  pageSize?: number;
  jobIdsToExclude?: number[]; // add this to exclude job applied to
  query?: string;
}

export interface JobApplication {
  id: number;
  jobId: number;
  freelancerId: number;
  status: JobApplicationStatus;
  createdAt: string;
  job?: Job;
  freelancer?: {
    firstName: string;
    lastName: string;
  };
}
// export type JobApplication = InferSelectModel<typeof jobApplicationsTable>;
