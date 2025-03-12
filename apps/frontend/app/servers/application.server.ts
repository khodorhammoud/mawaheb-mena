import { eq, aliasedTable } from "drizzle-orm";
import { db } from "~/db/drizzle/connector";
import {
  jobApplicationsTable,
  jobsTable,
  freelancersTable,
  UsersTable,
  accountsTable,
  employersTable,
  jobCategoriesTable,
  skillsTable,
  jobSkillsTable,
  freelancerSkillsTable,
} from "~/db/drizzle/schemas/schema";
import { JobApplicationStatus, CompensationType } from "~/types/enums";

// Helper function to safely parse JSON
function safeParseJSON<T>(
  jsonString: string | null | undefined,
  defaultValue: T
): T {
  if (!jsonString) return defaultValue;
  try {
    return JSON.parse(jsonString) as T;
  } catch (error) {
    console.error("Error parsing JSON:", error);
    return defaultValue;
  }
}

export async function getApplicationDetails(applicationId: string) {
  // Create table aliases
  const freelancerAccountTable = aliasedTable(
    accountsTable,
    "freelancer_account"
  );
  const employerAccountTable = aliasedTable(accountsTable, "employer_account");
  const freelancerUserTable = aliasedTable(UsersTable, "freelancer_user");
  const employerUserTable = aliasedTable(UsersTable, "employer_user");

  const applicationDetails = await db
    .select({
      application: jobApplicationsTable,
      job: jobsTable,
      freelancer: freelancersTable,
      freelancerAccount: freelancerAccountTable,
      freelancerUser: freelancerUserTable,
      employer: employersTable,
      employerAccount: employerAccountTable,
      employerUser: employerUserTable,
      jobCategory: jobCategoriesTable,
    })
    .from(jobApplicationsTable)
    .where(eq(jobApplicationsTable.id, parseInt(applicationId)))
    .leftJoin(jobsTable, eq(jobApplicationsTable.jobId, jobsTable.id))
    .leftJoin(
      freelancersTable,
      eq(jobApplicationsTable.freelancerId, freelancersTable.id)
    )
    .leftJoin(
      freelancerAccountTable,
      eq(freelancersTable.accountId, freelancerAccountTable.id)
    )
    .leftJoin(
      freelancerUserTable,
      eq(freelancerAccountTable.userId, freelancerUserTable.id)
    )
    .leftJoin(employersTable, eq(jobsTable.employerId, employersTable.id))
    .leftJoin(
      employerAccountTable,
      eq(employersTable.accountId, employerAccountTable.id)
    )
    .leftJoin(
      employerUserTable,
      eq(employerAccountTable.userId, employerUserTable.id)
    )
    .leftJoin(
      jobCategoriesTable,
      eq(jobsTable.jobCategoryId, jobCategoriesTable.id)
    );

  if (applicationDetails.length === 0) {
    throw new Response("Application not found", { status: 404 });
  }

  // Fetch job skills
  const jobSkills = await db
    .select({
      id: skillsTable.id,
      label: skillsTable.label,
      isStarred: jobSkillsTable.isStarred,
    })
    .from(jobSkillsTable)
    .leftJoin(skillsTable, eq(jobSkillsTable.skillId, skillsTable.id))
    .where(eq(jobSkillsTable.jobId, applicationDetails[0].job.id));

  // Fetch freelancer skills
  const freelancerSkills = await db
    .select({
      id: skillsTable.id,
      label: skillsTable.label,
      yearsOfExperience: freelancerSkillsTable.yearsOfExperience,
    })
    .from(freelancerSkillsTable)
    .leftJoin(skillsTable, eq(freelancerSkillsTable.skillId, skillsTable.id))
    .where(
      eq(
        freelancerSkillsTable.freelancerId,
        applicationDetails[0].freelancer.id
      )
    );

  const { job, freelancer, freelancerUser, employerUser, ...rest } =
    applicationDetails[0];

  // Format the job data to match JobDetailsProps
  const formattedJob = {
    ...job,
    createdAt: job.createdAt.toISOString(),
    category: applicationDetails[0].jobCategory
      ? {
          label: applicationDetails[0].jobCategory.label,
        }
      : undefined,
    skills: jobSkills,
  };

  // Format the freelancer data
  const formattedFreelancer = {
    ...freelancer,
    compensationType: freelancer.compensationType as CompensationType,
    skills: freelancerSkills,
    fieldsOfExpertise: Array.isArray(freelancer.fieldsOfExpertise)
      ? freelancer.fieldsOfExpertise
      : safeParseJSON((freelancer.fieldsOfExpertise as string) || "[]", []),
    jobsOpenTo: Array.isArray(freelancer.jobsOpenTo)
      ? freelancer.jobsOpenTo
      : safeParseJSON((freelancer.jobsOpenTo as string) || "[]", []),
    preferredProjectTypes: Array.isArray(freelancer.preferredProjectTypes)
      ? freelancer.preferredProjectTypes
      : safeParseJSON((freelancer.preferredProjectTypes as string) || "[]", []),
    dateAvailableFrom:
      // Ensure dateAvailableFrom is properly formatted
      freelancer.dateAvailableFrom
        ? typeof freelancer.dateAvailableFrom === "object"
          ? (freelancer.dateAvailableFrom as Date).toISOString()
          : freelancer.dateAvailableFrom
        : null,
  };

  return {
    application: {
      application: {
        ...rest.application,
        status: rest.application.status as JobApplicationStatus,
      },
      freelancerUser: {
        firstName: freelancerUser.firstName,
        lastName: freelancerUser.lastName,
        email: freelancerUser.email,
      },
      employerUser: {
        firstName: employerUser.firstName,
        lastName: employerUser.lastName,
        email: employerUser.email,
      },
      job: formattedJob,
      freelancer: formattedFreelancer,
    },
  };
}

export async function updateApplicationStatus(
  applicationId: string,
  status: JobApplicationStatus
) {
  try {
    await db
      .update(jobApplicationsTable)
      .set({ status })
      .where(eq(jobApplicationsTable.id, parseInt(applicationId)));
    return { success: true };
  } catch (error) {
    console.error("Error updating application status:", error);
    return { success: false, error: "Failed to update application status" };
  }
}
