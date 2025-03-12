import {
  /* jobApplicationsTable, */ jobsTable,
} from "~/db/drizzle/schemas/schema";
import { InferSelectModel } from "drizzle-orm";
import { JobApplicationStatus } from "./enums";

// Create a modified version of the Job type that accepts both Date and string for date fields
type JobBase = Omit<
  InferSelectModel<typeof jobsTable>,
  "createdAt" | "fulfilledAt"
>;

export type Job = JobBase & {
  createdAt: Date | string;
  fulfilledAt: Date | string | null;
  requiredSkills?: { id: number; name: string; isStarred: boolean }[];
};

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
