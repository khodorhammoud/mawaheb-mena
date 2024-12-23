import { Job, JobApplication, JobFilter } from "~/types/Job";
import { db } from "../db/drizzle/connector";
import {
  jobApplicationsTable,
  jobCategoriesTable,
  jobsTable,
} from "../db/drizzle/schemas/schema";
import { /*  Freelancer, */ JobCategory } from "../types/User";
import { JobApplicationStatus, JobStatus } from "~/types/enums";
import { and, eq, inArray } from "drizzle-orm";
// import { getProfileInfo } from "./user.server";

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

export async function getFreelancerRecommendedJobs(): Promise<Job[]> {
  // freelancer: Freelancer
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

/**
 * get a single job by its ID
 *
 * @param jobId - the ID of the job to get
 * @returns the job with the given ID or null if it doesn't exist
 */
export async function getJobById(jobId: number): Promise<Job | null> {
  const job = await db.select().from(jobsTable).where(eq(jobsTable.id, jobId));
  if (!job) {
    return null;
  }
  return job[0] as unknown as Job;
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

/**
 * get a job application by job ID and freelancer ID
 *
 * @param jobId - the ID of the job
 * @param freelancerId - the ID of the freelancer
 * @returns the job application or null if it doesn't exist
 */
export async function getJobApplicationByJobIdAndFreelancerId(
  jobId: number,
  freelancerId: number
): Promise<JobApplication | null> {
  const jobApplication = await db
    .select()
    .from(jobApplicationsTable)
    .leftJoin(jobsTable, eq(jobApplicationsTable.jobId, jobsTable.id))
    .where(
      and(
        eq(jobApplicationsTable.jobId, jobId),
        eq(jobApplicationsTable.freelancerId, freelancerId)
      )
    );
  if (!jobApplication) {
    return null;
  }
  const returnedJobApplication: JobApplication = {
    id: jobApplication[0].job_applications.id,
    jobId: jobApplication[0].job_applications.jobId,
    freelancerId: jobApplication[0].job_applications.freelancerId,
    status: jobApplication[0].job_applications.status as JobApplicationStatus,
    createdAt: jobApplication[0].job_applications.createdAt.toISOString(),
    job: jobApplication[0].jobs as unknown as Job,
  };
  return returnedJobApplication;
}

/**
 * create a job application
 *
 * @param jobId - the ID of the job
 * @param freelancerId - the ID of the freelancer
 * @returns the job application
 */
export async function createJobApplication(
  jobId: number,
  freelancerId: number
): Promise<JobApplication> {
  const [jobApplication] = await db
    .insert(jobApplicationsTable)
    .values({
      jobId,
      freelancerId,
      status: JobApplicationStatus.Pending,
    })
    .returning();
  if (!jobApplication) {
    throw new Error("Failed to create job application");
  }
  return jobApplication as unknown as JobApplication;
}

/**
 * get a job application by freelancer ID
 *
 * @param freelancerId - the ID of the freelancer
 * @param jobStatus - the status of the job
 * @returns the job application or null if it doesn't exist
 */
export async function getJobApplicationsByFreelancerId(
  freelancerId: number,
  jobStatus?: JobStatus[]
): Promise<JobApplication[]> {
  if (!jobStatus) {
    jobStatus = [JobStatus.Active];
  }
  const jobApplications = await db
    .select()
    .from(jobApplicationsTable)
    .where(
      and(
        eq(jobApplicationsTable.freelancerId, freelancerId),
        inArray(jobApplicationsTable.status, jobStatus)
      )
    );
  return jobApplications as unknown as JobApplication[];
}
