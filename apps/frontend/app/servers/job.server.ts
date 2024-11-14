import { Job } from "~/types/Job";
import { db } from "../db/drizzle/connector";

import { jobCategoriesTable, jobsTable } from "../db/drizzle/schemas/schema";
import { JobCategory } from "../types/User";

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
    const result = await db
      .insert(jobsTable)
      .values({
        employerId: jobData.employerId,
        title: jobData.title,
        description: jobData.description,
        jobCategoryId: jobData.jobCategoryId,
        workingHoursPerWeek: jobData.workingHoursPerWeek,
        locationPreference: jobData.locationPreference,
        requiredSkills: jobData.requiredSkills,
        projectType: jobData.projectType,
        budget: jobData.budget,
        experienceLevel: jobData.experienceLevel,
        status: jobData.status,
      })
      .returning();

    if (!result.length) {
      console.error("No rows returned after insertion, indicating a failure.");
      throw new Error("Job posting failed - no rows inserted.");
    }

    return { success: true };
  } catch (error) {
    console.error("Error creating job posting:", error);

    // Return success: false and a detailed error message
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
