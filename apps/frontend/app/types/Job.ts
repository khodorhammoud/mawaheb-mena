import { jobApplicationsTable, jobsTable } from "~/db/drizzle/schemas/schema";
import { InferSelectModel } from "drizzle-orm";

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
}

export type JobApplication = InferSelectModel<typeof jobApplicationsTable>;
