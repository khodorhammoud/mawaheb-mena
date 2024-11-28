import { Job, JobFilter } from "~/types/Job";
import { db } from "../db/drizzle/connector";
import { jobCategoriesTable, jobsTable } from "../db/drizzle/schemas/schema";
import { Freelancer, JobCategory } from "../types/User";
import { JobStatus } from "~/types/enums";
import { and, eq, inArray } from "drizzle-orm";
import { getProfileInfo } from "./user.server";

export async function getAllJobCategories(): Promise<JobCategory[]> {
  try {
    const jobCategories = await db.select().from(jobCategoriesTable);
    if (!jobCategories) {
      throw new Error("Failed to get job categories");
    }
    return jobCategories;
  } catch (error) {
    console.error("Error getting job categories", error);
    throw error;
  }
}

// Create a job posting
export async function createJobPosting(
  jobData: Job
): Promise<{ success: boolean; error?: string }> {
  try {
    const [job] = await db
      .insert(jobsTable)
      .values({
        employerId: jobData.employerId,
        title: jobData.title,
        description: jobData.description,
        jobCategoryId: jobData.jobCategoryId,
        workingHoursPerWeek: jobData.workingHoursPerWeek,
        locationPreference: jobData.locationPreference,
        projectType: jobData.projectType,
        budget: jobData.budget,
        experienceLevel: jobData.experienceLevel,
        status: jobData.status,
      })
      .returning();

    if (!job) {
      console.error("Job insertion failed: No rows returned after insertion.");
      throw new Error("Job insertion failed, no rows returned.");
    }
    return { success: true };
  } catch (error) {
    console.error("Detailed error during job creation:");
  }
  // Return a more specific error message if possible
  return {
    success: false,
  };
}

export async function getEmployerJobs(
  employerId: number,
  jobStatus?: JobStatus[]
): Promise<Job[]> {
  // Fetch all jobs from the database that relate to current user
  let jobs = null;
  if (jobStatus) {
    jobs = await db
      .select()
      .from(jobsTable)
      .where(
        and(
          eq(jobsTable.employerId, employerId),
          inArray(jobsTable.status, jobStatus)
        )
      );
  } else {
    jobs = await db
      .select()
      .from(jobsTable)
      .where(eq(jobsTable.employerId, employerId));
  }

  // Map each job result to a structured object
  return jobs.map((job) => ({
    id: job.id,
    employerId: job.employerId,
    title: job.title,
    description: job.description,
    workingHoursPerWeek: job.workingHoursPerWeek,
    locationPreference: job.locationPreference,
    // requiredSkills: job.requiredSkills as Skill[],
    requiredSkills: Array.isArray(job.requiredSkills) ? job.requiredSkills : [],
    projectType: job.projectType,
    budget: job.budget,
    experienceLevel: job.experienceLevel,
    status: job.status as JobStatus,
    createdAt: job.createdAt?.toISOString(),
  }));
}

export async function getFreelancerRecommendedJobs(
  freelancer: Freelancer
): Promise<Job[]> {
  // fetch recommended jobs
  const recommendedJobs = await db
    .select()
    .from(jobsTable)
    .where(eq(jobsTable.status, JobStatus.Active));
  return recommendedJobs.map((job) => ({
    id: job.id,
    employerId: job.employerId,
    title: job.title,
    description: job.description,
    workingHoursPerWeek: job.workingHoursPerWeek,
    locationPreference: job.locationPreference,
    requiredSkills: Array.isArray(job.requiredSkills) ? job.requiredSkills : [],
    projectType: job.projectType,
    budget: job.budget,
    experienceLevel: job.experienceLevel,
    status: job.status as JobStatus,
    createdAt: job.createdAt?.toISOString(),
  }));
}

export async function getJobsFiltered(filter: JobFilter): Promise<Job[]> {
  const query = db.select().from(jobsTable);

  const conditions = [];
  if (!filter.pageSize) {
    filter.pageSize = 10;
  }
  if (!filter.page) {
    filter.page = 1;
  }

  if (filter.projectType && filter.projectType.length > 0) {
    conditions.push(inArray(jobsTable.projectType, filter.projectType));
  }

  if (filter.locationPreference && filter.locationPreference.length > 0) {
    conditions.push(
      inArray(jobsTable.locationPreference, filter.locationPreference)
    );
  }

  if (filter.experienceLevel && filter.experienceLevel.length > 0) {
    conditions.push(inArray(jobsTable.experienceLevel, filter.experienceLevel));
  }

  if (filter.employerId) {
    conditions.push(eq(jobsTable.employerId, filter.employerId));
  }

  // Add status condition
  conditions.push(eq(jobsTable.status, JobStatus.Active));

  // Apply all conditions using and()
  const jobs = await query
    .where(and(...conditions))
    .limit(filter.pageSize)
    .offset((filter.page - 1) * filter.pageSize);

  return jobs.map((job) => ({
    id: job.id,
    employerId: job.employerId,
    title: job.title,
    description: job.description,
    workingHoursPerWeek: job.workingHoursPerWeek,
    locationPreference: job.locationPreference,
    requiredSkills: Array.isArray(job.requiredSkills) ? job.requiredSkills : [],
    projectType: job.projectType,
    budget: job.budget,
    experienceLevel: job.experienceLevel,
    status: job.status as JobStatus,
    createdAt: job.createdAt?.toISOString(),
  }));
}
