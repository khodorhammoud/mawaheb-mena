import { db } from "../db/drizzle/connector";
import { and, desc, eq, ilike, inArray, isNull, or } from "drizzle-orm";
import { Job, JobApplication, JobCardData, JobFilter } from "~/types/Job";
import {
  jobApplicationsTable,
  jobCategoriesTable,
  jobsTable,
  freelancersTable,
} from "../db/drizzle/schemas/schema";
import { /*  Freelancer, */ JobCategory } from "../types/User";
import { JobApplicationStatus, JobStatus } from "~/types/enums";
import { getUser, getUserIdFromFreelancerId } from "./user.server";

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

/**
 * update a job posting
 *
 * @param jobId the Id of the job i wanna update
 * @param jobData the data i'll update in the job
 * @returns success or failure :)
 */
export async function updateJob(
  jobId: number,
  jobData: Partial<Job>
): Promise<{ success: boolean; error?: string }> {
  try {
    // validating and cleaning data before passing them to drizzle update or insert script 🍔
    const requiredSkills = Array.isArray(jobData.requiredSkills)
      ? jobData.requiredSkills.map((skill) => ({
          name: skill.name.trim(),
          isStarred: !!skill.isStarred,
        }))
      : [];

    const validatedJobData = {
      title: jobData.title?.trim(),
      description: jobData.description?.trim(),
      jobCategoryId: jobData.jobCategoryId || null,
      workingHoursPerWeek: jobData.workingHoursPerWeek || null,
      locationPreference: jobData.locationPreference?.trim(),
      requiredSkills:
        requiredSkills.length > 0
          ? {
              set: [], // Clear existing skills
              create: requiredSkills,
            }
          : undefined,
      projectType: jobData.projectType?.trim(),
      budget: jobData.budget || null,
      experienceLevel: jobData.experienceLevel?.trim(),
      status: jobData.status || null,
    };

    // Step 2: Perform the update using validated data
    const updatedJob = await db
      .update(jobsTable)
      .set(validatedJobData)
      .where(eq(jobsTable.id, jobId))
      .returning();

    // Step 3: Check if the update was successful
    if (!updatedJob || updatedJob.length === 0) {
      throw new Error("Job update failed: No rows returned.");
    }

    return { success: true };
  } catch (error) {
    console.error("Error during job update:", error);
    return {
      success: false,
      error: "Failed to update job posting.",
    };
  }
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

/* export async function getFreelancerRecommendedJobs(): Promise<Job[]> {
  // freelancer: Freelancer
  // fetch recommended jobs
  const recommendedJobs = await db
    .select()
    .from(jobsTable)
    .where(
      and(
        eq(jobsTable.status, JobStatus.Active),
        eq(jobsTable.employerId, freelancer.id)
      )
    );
  return recommendedJobs.map((job) => ({
    ...job,
    status: job.status as JobStatus,
  }));
} */

/**
 * get a single job by its ID
 *
 * @param jobId the ID of the job to get
 * @returns the job with the given ID or null if it doesn't exist
 */
export async function getJobById(jobId: number): Promise<Job | null> {
  const job = await db.select().from(jobsTable).where(eq(jobsTable.id, jobId));
  if (!job) {
    return null;
  }
  return job[0] as unknown as Job;
}

export async function getAllJobs(): Promise<Job[]> {
  // Query to select all jobs that are active
  const jobs = await db
    .select()
    .from(jobsTable)
    .where(eq(jobsTable.status, JobStatus.Active));

  return jobs.map((job) => ({
    ...job,
    status: job.status as JobStatus, // Ensuring correct enum typing
  }));
}

/**
 * A function to get recommended jobs for freelancers it does not return the jobs that the freelancer has already applied to
 *
 * @param freelancerId
 * @returns
 */
export async function getRecommendedJobs(freelancerId: number) {
  // Get jobs that the freelancer hasn't applied to yet
  const jobs = await db
    .select()
    .from(jobsTable)
    .leftJoin(
      jobApplicationsTable,
      and(
        eq(jobApplicationsTable.jobId, jobsTable.id),
        eq(jobApplicationsTable.freelancerId, freelancerId)
      )
    )
    .where(
      and(
        eq(jobsTable.status, JobStatus.Active),
        isNull(jobApplicationsTable.id)
      )
    )
    .orderBy(desc(jobsTable.createdAt));
  return jobs ? jobs.map((job) => job.jobs) : [];
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

  if (filter.query) {
    conditions.push(
      or(
        ilike(jobsTable.title, `%${filter.query}%`),
        ilike(jobsTable.description, `%${filter.query}%`)
      )
    );
  }

  // Add status condition
  conditions.push(eq(jobsTable.status, JobStatus.Active));

  // Apply all conditions using and()
  const jobs = await query
    .where(and(...conditions))
    .limit(filter.pageSize)
    .offset((filter.page - 1) * filter.pageSize);

  return jobs.map((job) => ({
    ...job,
    status: job.status as JobStatus,
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

  if (!jobApplication || jobApplication.length === 0) {
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
 * Get job application Owner by application id
 * @param applicationId - the ID of the job application
 * @returns the job application
 */
export async function getJobApplicationOwnerByApplicationId(
  applicationId: number
): Promise<number | null> {
  const employerId = await db
    .select({
      employerId: jobsTable.employerId,
    })
    .from(jobApplicationsTable)
    .leftJoin(jobsTable, eq(jobApplicationsTable.jobId, jobsTable.id))
    .where(eq(jobApplicationsTable.id, applicationId));
  return employerId[0]?.employerId || null;
}

/**
 * get a job application by its ID
 *
 * @param jobApplicationId - the ID of the job application
 * @returns the job application or null if it doesn't exist
 */
export async function getJobApplicationById(
  jobApplicationId: number
): Promise<JobApplication | null> {
  const jobApplication = await db
    .select()
    .from(jobApplicationsTable)
    .where(eq(jobApplicationsTable.id, jobApplicationId));
  if (!jobApplication) {
    return null;
  }
  return jobApplication[0] as unknown as JobApplication;
}

/**
 * get all job applications by job ID
 * @param jobId - the ID of the job
 * @returns the job applications
 */
export async function getJobApplicationsByJobId(
  jobId: number
): Promise<JobApplication[]> {
  // 1. Get job applications
  const jobApplications = await db
    .select()
    .from(jobApplicationsTable)
    .where(eq(jobApplicationsTable.jobId, jobId));

  // 2. Get unique freelancer IDs and fetch their user information
  const freelancerIds = [
    ...new Set(jobApplications.map((app) => app.freelancerId)),
  ];

  // Create a map of freelancerId to user info
  const freelancerUserMap = new Map();

  // Fetch user info for each freelancer
  await Promise.all(
    freelancerIds.map(async (freelancerId) => {
      const userId = await getUserIdFromFreelancerId(freelancerId);
      if (userId) {
        const user = await getUser({ userId });
        if (user) {
          freelancerUserMap.set(freelancerId, {
            firstName: user.firstName,
            lastName: user.lastName,
          });
        }
      }
    })
  );

  // 3. Combine the data
  return jobApplications.map((application) => ({
    id: application.id,
    jobId: application.jobId,
    freelancerId: application.freelancerId,
    status: application.status as JobApplicationStatus,
    createdAt: application.createdAt.toISOString(),
    freelancer: freelancerUserMap.get(application.freelancerId),
  }));
}
/* export async function getJobApplicationsByJobId(
  jobId: number | number[]
): Promise<JobApplication[]> {
  if (Array.isArray(jobId)) {
    const jobApplications = await db
      .select()
      .from(jobApplicationsTable)
      .where(inArray(jobApplicationsTable.jobId, jobId));
    return jobApplications as unknown as JobApplication[];
  } else {
    const jobApplications = await db
      .select()
      .from(jobApplicationsTable)
      .where(eq(jobApplicationsTable.jobId, jobId));
    return jobApplications as unknown as JobApplication[];
  }
} */
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

export async function doesJobApplicationExist(
  jobId: number,
  freelancerId: number
) {
  const jobApplication = await db
    .select()
    .from(jobApplicationsTable)
    .where(
      and(
        eq(jobApplicationsTable.jobId, jobId),
        eq(jobApplicationsTable.freelancerId, freelancerId)
      )
    );

  return jobApplication.length > 0 ? jobApplication[0] : null;
}

/**
 * get a job application by freelancer ID
 *
 * @param freelancerId - the ID of the freelancer
 * @param jobStatus - the status of the job
 * @returns the job application or null if it doesn't exist
 */

export async function getJobApplicationsByFreelancerId(freelancerId: number) {
  const jobApplications = await db
    .select({
      jobId: jobApplicationsTable.jobId, // Ensure column names match the table
    })
    .from(jobApplicationsTable)
    .where(eq(jobApplicationsTable.freelancerId, freelancerId));

  return jobApplications;
}

/**
 * Fetch job applications by job ID.
 *
 * @param jobId - The ID of the job to fetch applications for.
 * @returns The list of job applications.
 */
export async function fetchJobApplications(
  jobId: number
): Promise<JobApplication[]> {
  const applications = await db
    .select()
    .from(jobApplicationsTable)
    .where(eq(jobApplicationsTable.jobId, jobId));

  return applications as unknown as JobApplication[];
}

/**
 * update status of a job application
 *
 * @param applicationId - Id of the job application we wanna update
 * @param newStatus - new status for the job application
 * @returns object indicating success or failure
 */
export async function updateJobApplicationStatus(
  applicationId: number,
  newStatus: JobApplicationStatus
) {
  try {
    await db
      .update(jobApplicationsTable)
      .set({ status: newStatus })
      .where(eq(jobApplicationsTable.id, applicationId));

    return { success: true };
  } catch (error) {
    console.error("Error updating job application status:", error);
    return { success: false, error };
  }
}

/**
 *
 * Fetches the applicants for a given jobs list
 * @param employerId
 * @returns Promise<Job[]> - A promise that resolves to an array of enriched job objects,
 *
 */
export async function fetchJobsWithApplications(
  employerId: number
): Promise<JobCardData[]> {
  const jobs = await getEmployerJobs(employerId);
  return Promise.all(
    jobs.map(async (job) => {
      const applications = await fetchJobApplications(job.id);
      return {
        job: job,
        applications: applications,
        /* .map((applicant) => ({
          id: applicant.id,
          freelancerId: applicant.freelancerId,
          // TODO: Replace with actual logic
          photoUrl: `https://example.com/photos/${applicant.freelancerId}`,
          status: applicant.status,
        })), */
        interviewedCount: applications.filter(
          (app) => app.status === JobApplicationStatus.Shortlisted
        ).length,
        // bl mabda2, hayde ma 2ila 3azze 3ashen ma fi interviewed aplicants yet
      };
    })
  );
}

/**
 *
 * get freelancers id's that are linked to a job using the same job id
 * @param jobId
 * @returns
 * @throws Error
 */
export async function getFreelancersIdsByJobId(jobId: number) {
  // Fetch job applications
  const applications = await fetchJobApplications(jobId);

  // Map applications to freelancer IDs
  const freelancerIds = applications.map(
    (application) => application.freelancerId
  );

  // ✅ Instead of throwing an error, return an empty array if no IDs are found
  return freelancerIds || [];
}

/**
 *
 * get freelancers content
 * @param freelancerIds
 * @returns
 * @throws Error
 */
export async function getFreelancerDetails(freelancerIds: number[]) {
  if (freelancerIds.length === 0) {
    return [];
  }

  const freelancers = await db
    .select()
    .from(freelancersTable)
    .where(inArray(freelancersTable.id, freelancerIds));

  return freelancers; // Return the raw result directly
}

export async function updateJobStatus(
  jobId: number,
  newStatus: string
): Promise<void> {
  try {
    await db
      .update(jobsTable)
      .set({ status: newStatus })
      .where(eq(jobsTable.id, jobId));
  } catch (error) {
    console.error("Error updating job status:", error);
    throw new Error("Failed to update job status.");
  }
}
