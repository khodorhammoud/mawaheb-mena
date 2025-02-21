import { db } from "../db/drizzle/connector";
import { and, desc, eq, ilike, inArray, isNull, or } from "drizzle-orm";
import { Job, JobApplication, JobCardData, JobFilter } from "~/types/Job";
import {
  jobApplicationsTable,
  jobCategoriesTable,
  jobsTable,
  freelancersTable,
  jobSkillsTable,
  skillsTable,
  reviewsTable,
  employersTable,
  accountsTable,
  UsersTable,
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
  jobData: Job,
  skills: { name: string; isStarred: boolean }[]
): Promise<{ success: boolean; error?: string }> {
  try {
    // ✅ Step 1: Insert the Job First
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
      .returning({ id: jobsTable.id });

    if (!job) {
      console.error("❌ Job insertion failed: No rows returned.");
      throw new Error("Job insertion failed.");
    }

    // console.log("✅ New Job Created:", job.id);

    // ✅ Step 2: Process Each Skill Separately
    for (const skill of skills) {
      // 🔹 SPLIT skills if they come in as a comma-separated string
      const skillNames = skill.name.split(",").map((s) => s.trim());

      for (const skillName of skillNames) {
        let [existingSkill] = await db
          .select({ id: skillsTable.id })
          .from(skillsTable)
          .where(eq(skillsTable.label, skillName));

        // ✅ Only insert new skills if they don’t exist
        if (!existingSkill) {
          [existingSkill] = await db
            .insert(skillsTable)
            .values({ label: skillName }) // Insert skill separately
            .returning({ id: skillsTable.id });

          // console.log("🆕 Inserted new skill:", existingSkill.id, skillName);
        }

        // ✅ Insert into `jobSkillsTable` (Link Job & Skill)
        await db.insert(jobSkillsTable).values({
          jobId: job.id,
          skillId: existingSkill.id,
          isStarred: skill.isStarred,
        });

        // console.log(
        //   `🔗 Linked Skill ID ${existingSkill.id} (${skillName}) to Job ID ${job.id}`
        // );
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Detailed error during job creation:", error);
  }
  return { success: false };
}

/**
 * update a job posting
 *
 * @param jobId the Id of the job i wanna update
 * @param jobData the data i'll update in the job
 * @returns success or failure :)
 */
export async function updateJob(jobId: number, jobData: Partial<Job>) {
  try {
    const requiredSkills = Array.isArray(jobData.requiredSkills)
      ? jobData.requiredSkills.map((skill) => ({
          id: skill.id,
          name: skill.name.trim(),
          isStarred: skill.isStarred || false,
        }))
      : [];

    await db.transaction(async (tx) => {
      // 🗑 1️⃣ Delete old skills to avoid duplicates
      await tx.delete(jobSkillsTable).where(eq(jobSkillsTable.jobId, jobId));

      // ✅ 2️⃣ Re-insert updated skills into `job_skills`
      if (requiredSkills.length > 0) {
        await tx.insert(jobSkillsTable).values(
          requiredSkills.map((skill) => ({
            jobId,
            skillId: skill.id, // Skill ID must be valid
            isStarred: skill.isStarred, // ✅ Ensure this is inserted
          }))
        );
      }

      // 🔄 3️⃣ Update the main job details
      const updatedJob = await tx
        .update(jobsTable)
        .set({
          title: jobData.title?.trim(),
          description: jobData.description?.trim(),
          jobCategoryId: jobData.jobCategoryId || null,
          workingHoursPerWeek: jobData.workingHoursPerWeek || null,
          locationPreference: jobData.locationPreference?.trim(),
          projectType: jobData.projectType?.trim(),
          budget: jobData.budget || null,
          experienceLevel: jobData.experienceLevel?.trim(),
          status: jobData.status || "draft", // ✅ Default to "draft" if null
        })
        .where(eq(jobsTable.id, jobId))
        .returning();

      if (!updatedJob || updatedJob.length === 0) {
        throw new Error("Job update failed: No rows returned.");
      }
    });

    return { success: true };
  } catch (error) {
    console.error("❌ Error during job update:", error);
    return { success: false, error: "Failed to update job posting." };
  }
}

// MANAGE JOBS
export async function getEmployerJobs(
  employerId: number
  // jobStatus?: JobStatus[]
): Promise<Job[]> {
  // Retrieves all jobs for a given employer
  // Joins the jobSkillsTable to get the skills linked to each job
  // Joins the skillsTable to get the skill names
  // Filters the jobs based on employerId to get only the relevant jobs
  const jobsQuery = db
    .select({
      id: jobsTable.id,
      employerId: jobsTable.employerId,
      title: jobsTable.title,
      description: jobsTable.description,
      workingHoursPerWeek: jobsTable.workingHoursPerWeek,
      locationPreference: jobsTable.locationPreference,
      projectType: jobsTable.projectType,
      budget: jobsTable.budget,
      experienceLevel: jobsTable.experienceLevel,
      status: jobsTable.status,
      createdAt: jobsTable.createdAt,
      jobCategoryId: jobsTable.jobCategoryId,
      fulfilledAt: jobsTable.fulfilledAt,
      skillId: jobSkillsTable.skillId,
      skillName: skillsTable.label,
      isStarred: jobSkillsTable.isStarred,
    })
    .from(jobsTable)
    .leftJoin(jobSkillsTable, eq(jobSkillsTable.jobId, jobsTable.id))
    .leftJoin(skillsTable, eq(jobSkillsTable.skillId, skillsTable.id))
    .where(eq(jobsTable.employerId, employerId));

  // runs the query
  const jobsRaw = await jobsQuery.execute();

  // This avoids duplicate job entries when multiple skills are attached to a job
  const jobsMap = new Map<number, Job>();

  // Loops through the raw job data
  // If the job doesn’t exist in the map, it adds the job without skills
  // If a skill is found, it adds the skill to the job’s requiredSkills list
  // This ensures that each job is stored once and its skills are properly grouped
  for (const row of jobsRaw) {
    if (!jobsMap.has(row.id)) {
      jobsMap.set(row.id, {
        id: row.id,
        employerId: row.employerId,
        title: row.title,
        description: row.description,
        workingHoursPerWeek: row.workingHoursPerWeek,
        locationPreference: row.locationPreference,
        projectType: row.projectType,
        budget: row.budget,
        experienceLevel: row.experienceLevel,
        status: row.status as JobStatus,
        createdAt: row.createdAt,
        jobCategoryId: row.jobCategoryId,
        fulfilledAt: row.fulfilledAt,
        requiredSkills: [],
      });
    }

    if (row.skillId) {
      jobsMap.get(row.id)?.requiredSkills.push({
        id: row.skillId,
        name: row.skillName,
        isStarred: row.isStarred,
      });
    }
  }

  // Converts the Map structure back into an array of jobs (which is the expected output format)
  // Now, each job has a clean list of skills inside requiredSkills
  return Array.from(jobsMap.values());
}

export async function getJobById(jobId: number): Promise<Job | null> {
  const jobQuery = db
    .select({
      id: jobsTable.id,
      employerId: jobsTable.employerId,
      title: jobsTable.title,
      description: jobsTable.description,
      workingHoursPerWeek: jobsTable.workingHoursPerWeek,
      locationPreference: jobsTable.locationPreference,
      projectType: jobsTable.projectType,
      budget: jobsTable.budget,
      experienceLevel: jobsTable.experienceLevel,
      status: jobsTable.status,
      createdAt: jobsTable.createdAt,
      jobCategoryId: jobsTable.jobCategoryId,
      fulfilledAt: jobsTable.fulfilledAt,
      skillId: jobSkillsTable.skillId,
      skillName: skillsTable.label,
      isStarred: jobSkillsTable.isStarred,
    })
    .from(jobsTable)
    .leftJoin(jobSkillsTable, eq(jobSkillsTable.jobId, jobsTable.id))
    .leftJoin(skillsTable, eq(jobSkillsTable.skillId, skillsTable.id))
    .where(eq(jobsTable.id, jobId));

  const jobRaw = await jobQuery.execute();

  if (!jobRaw.length) {
    return null;
  }

  // Group skills under `requiredSkills`
  const jobData: Job = {
    id: jobRaw[0].id,
    employerId: jobRaw[0].employerId,
    title: jobRaw[0].title,
    description: jobRaw[0].description,
    workingHoursPerWeek: jobRaw[0].workingHoursPerWeek,
    locationPreference: jobRaw[0].locationPreference,
    projectType: jobRaw[0].projectType,
    budget: jobRaw[0].budget,
    experienceLevel: jobRaw[0].experienceLevel,
    status: jobRaw[0].status as JobStatus,
    createdAt: jobRaw[0].createdAt,
    jobCategoryId: jobRaw[0].jobCategoryId,
    fulfilledAt: jobRaw[0].fulfilledAt,
    requiredSkills: [],
  };

  for (const row of jobRaw) {
    if (row.skillId) {
      jobData.requiredSkills.push({
        id: row.skillId,
        name: row.skillName,
        isStarred: row.isStarred,
      });
    }
  }

  return jobData;
}

/* export async function getFreelancerDesignJobs(): Promise<Job[]> {
  // freelancer: Freelancer
  // fetch Design jobs
  const DesignJobs = await db
    .select()
    .from(jobsTable)
    .where(
      and(
        eq(jobsTable.status, JobStatus.Active),
        eq(jobsTable.employerId, freelancer.id)
      )
    );
  return DesignJobs.map((job) => ({
    ...job,
    status: job.status as JobStatus,
  }));
} */

// ✅ Get Design Jobs (Jobs Freelancer Hasn't Applied To)
export async function getDesignJobs(freelancerId: number) {
  // Query to select all jobs that are active and the freelancer hasn't applied
  const jobs = await db
    .select({
      id: jobsTable.id,
      title: jobsTable.title,
      description: jobsTable.description,
      employerId: jobsTable.employerId,
      status: jobsTable.status,
      applicationStatus: jobApplicationsTable.status,
      createdAt: jobsTable.createdAt,
      budget: jobsTable.budget,
      experienceLevel: jobsTable.experienceLevel,
      jobCategoryId: jobsTable.jobCategoryId,
      workingHoursPerWeek: jobsTable.workingHoursPerWeek,
      locationPreference: jobsTable.locationPreference,
      projectType: jobsTable.projectType,
    })
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
        isNull(jobApplicationsTable.id) // ✅ Exclude jobs where freelancer has applied
      )
    )
    .orderBy(desc(jobsTable.createdAt));

  return jobs;
}

// ✅ Get All Jobs (No Restrictions)
export async function getAllJobs() {
  // Query to select all jobs that are active even if the freelancer applied
  const jobs = await db
    .select({
      id: jobsTable.id,
      title: jobsTable.title,
      description: jobsTable.description,
      employerId: jobsTable.employerId,
      status: jobsTable.status,
      applicationStatus: jobApplicationsTable.status,
      createdAt: jobsTable.createdAt,
      budget: jobsTable.budget,
      experienceLevel: jobsTable.experienceLevel,
      jobCategoryId: jobsTable.jobCategoryId,
      workingHoursPerWeek: jobsTable.workingHoursPerWeek,
      locationPreference: jobsTable.locationPreference,
      projectType: jobsTable.projectType,
    })
    .from(jobsTable)
    .leftJoin(
      jobApplicationsTable,
      eq(jobApplicationsTable.jobId, jobsTable.id) // ✅ LEFT JOIN ensures all jobs are included
    )
    .where(eq(jobsTable.status, JobStatus.Active)) // Only active jobs
    .orderBy(desc(jobsTable.createdAt));

  return jobs;
}

// ✅ Get My Jobs (Jobs Freelancer Applied To)
export async function getMyJobs(freelancerId: number) {
  // Query to select all jobs that the freelancer has applied to
  const jobs = await db
    .select({
      id: jobsTable.id,
      title: jobsTable.title,
      description: jobsTable.description,
      employerId: jobsTable.employerId,
      status: jobsTable.status,
      applicationStatus: jobApplicationsTable.status,
      createdAt: jobsTable.createdAt,
      budget: jobsTable.budget,
      experienceLevel: jobsTable.experienceLevel,
      jobCategoryId: jobsTable.jobCategoryId,
      workingHoursPerWeek: jobsTable.workingHoursPerWeek,
      locationPreference: jobsTable.locationPreference,
      projectType: jobsTable.projectType,
    })
    .from(jobsTable)
    .innerJoin(
      jobApplicationsTable,
      and(
        eq(jobApplicationsTable.jobId, jobsTable.id),
        eq(jobApplicationsTable.freelancerId, freelancerId)
      )
    )
    .orderBy(desc(jobsTable.createdAt));

  return jobs;
}

// ✅ Ensure the freelancer has an accepted job application before reviewing
export async function hasAcceptedApplication(
  freelancerId: number,
  employerId: number
) {
  // ✅ Join job applications with jobs to check employer
  const result = await db
    .select()
    .from(jobApplicationsTable)
    .innerJoin(jobsTable, eq(jobApplicationsTable.jobId, jobsTable.id)) // ✅ Join jobs table
    .where(
      and(
        eq(jobApplicationsTable.freelancerId, freelancerId),
        eq(jobsTable.employerId, employerId), // ✅ Check for employer, not just jobId
        eq(jobApplicationsTable.status, "accepted") // ✅ Ensure status is "accepted"
      )
    )
    .limit(1);

  // console.log("📨 Retrieved Applications:", result);
  return result.length > 0;
}

// ✅ Save Review to Database
// ✅ Ensure freelancer exists before saving review
export async function saveReview({
  employerId,
  freelancerId,
  rating,
  comment,
}: {
  employerId: number;
  freelancerId: number;
  rating: number;
  comment: string;
}) {
  try {
    const result = await db
      .insert(reviewsTable)
      .values({
        employerId,
        freelancerId,
        rating,
        comment,
      } as typeof reviewsTable.$inferInsert)
      .returning({ id: reviewsTable.id }); // ✅ Ensure an ID is returned

    return { success: true, message: "Review submitted successfully." };
  } catch (error) {
    return { success: false, message: (error as Error).message };
  }
}

// ✅ Get Review for a Specific Freelancer and Employer
export async function getReview(freelancerId: number, employerId: number) {
  const result = await db
    .select()
    .from(reviewsTable)
    .where(
      and(
        eq(reviewsTable.freelancerId, freelancerId),
        eq(reviewsTable.employerId, employerId)
      )
    )
    .limit(1);

  return result.length > 0 ? result[0] : null; // ✅ Ensure `null` is returned if no review exists
}

export async function updateReview({
  employerId,
  freelancerId,
  rating,
  comment,
}: {
  employerId: number;
  freelancerId: number;
  rating: number;
  comment?: string | null;
}) {
  const updateData: { rating: number; comment?: string | null } = { rating };
  if (comment !== undefined) {
    updateData.comment = comment;
  }

  const result = await db
    .update(reviewsTable)
    .set(updateData)
    .where(
      and(
        eq(reviewsTable.freelancerId, freelancerId),
        eq(reviewsTable.employerId, employerId)
      )
    );

  return result;
}

// used in the laoder for the review task
// used in the laoder for the review task

/** ✅ Get employerId by Job ID */
export async function getEmployerIdByJobId(jobId: number) {
  const job = await db
    .select({ employerId: jobsTable.employerId })
    .from(jobsTable)
    .where(eq(jobsTable.id, jobId))
    .limit(1);

  return job.length > 0 ? job[0].employerId : null;
}

/** ✅ Get Freelancer ID by Account ID */
export async function getFreelancerIdbyAccountId(accountId: number) {
  const freelancer = await db
    .select()
    .from(freelancersTable)
    .where(eq(freelancersTable.accountId, accountId))
    .limit(1);

  return freelancer.length > 0 ? freelancer[0].id : null;
}

// used in the laoder for the review task
// used in the laoder for the review task

// 👇 is not with 👆 :D
// export async function getJobApplicationStatus(jobId: number) {
//   const application = await db
//     .select({ status: jobApplicationsTable.status })
//     .from(jobApplicationsTable)
//     .where(eq(jobApplicationsTable.jobId, jobId))
//     .limit(1);

//   // console.log(`🔍 Job ${jobId} - Found Application Status:`, application);

//   return application.length > 0 ? application[0].status : null;
// }

// export async function getExistingReview(jobId: number, freelancerId: number) {
//   // const review = await db
//   //   .select({
//   //     rating: reviewsTable.rating,
//   //     comment: reviewsTable.comment,
//   //   })
//   //   .from(reviewsTable)
//   //   .where(
//   //     and(
//   //       eq(
//   //         reviewsTable.employerId,
//   //         db
//   //           .select({ employerId: jobsTable.employerId })
//   //           .from(jobsTable)
//   //           .where(eq(jobsTable.id, jobId))
//   //       ),
//   //       eq(reviewsTable.freelancerId, freelancerId)
//   //     )
//   //   )
//   //   .limit(1);
//   // return review.length > 0 ? review[0] : null;
// }

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

// ✅ Full Query: Fetch Freelancers with `account` and `user`
export async function getFreelancerDetails(freelancerIds: number[]) {
  if (freelancerIds.length === 0) {
    return [];
  }

  const freelancers = await db
    .select({
      // 🆕 Freelancer Fields
      id: freelancersTable.id,
      accountId: freelancersTable.accountId,
      about: freelancersTable.about,
      fieldsOfExpertise: freelancersTable.fieldsOfExpertise,
      portfolio: freelancersTable.portfolio,
      workHistory: freelancersTable.workHistory,
      cvLink: freelancersTable.cvLink,
      videoLink: freelancersTable.videoLink,
      certificates: freelancersTable.certificates,
      educations: freelancersTable.educations,
      yearsOfExperience: freelancersTable.yearsOfExperience,
      hourlyRate: freelancersTable.hourlyRate,
      compensationType: freelancersTable.compensationType,
      availableForWork: freelancersTable.availableForWork,
      dateAvailableFrom: freelancersTable.dateAvailableFrom,
      hoursAvailableFrom: freelancersTable.hoursAvailableFrom,
      hoursAvailableTo: freelancersTable.hoursAvailableTo,

      // 🆕 UserAccount Fields
      accountType: accountsTable.accountType,
      slug: accountsTable.slug,
      isCreationComplete: accountsTable.isCreationComplete,
      country: accountsTable.country,
      address: accountsTable.address,
      region: accountsTable.region,
      phone: accountsTable.phone,
      websiteURL: accountsTable.websiteURL,
      socialMediaLinks: accountsTable.socialMediaLinks,

      // 🆕 User Fields
      userId: UsersTable.id,
      firstName: UsersTable.firstName,
      lastName: UsersTable.lastName,
      email: UsersTable.email,
      isVerified: UsersTable.isVerified,
      isOnboarded: UsersTable.isOnboarded,
    })
    .from(freelancersTable)
    .leftJoin(
      accountsTable,
      eq(accountsTable.id, freelancersTable.accountId) // ✅ FIXED: Proper eq() usage
    )
    .leftJoin(
      UsersTable,
      eq(UsersTable.id, accountsTable.userId) // ✅ FIXED: Proper eq() usage
    )
    .where(inArray(freelancersTable.id, freelancerIds));

  // ✅ Return Results Directly
  return freelancers;
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
