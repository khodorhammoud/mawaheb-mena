import { db } from "../db/drizzle/connector";
import {
  accountsTable,
  employerIndustriesTable,
  employersTable,
  industriesTable,
  UsersTable,
  jobsTable,
  languagesTable,
} from "../db/drizzle/schemas/schema";
import { and, eq } from "drizzle-orm";
import {
  Employer,
  AccountBio,
  AccountSocialMediaLinks,
  Industry,
  UserAccount,
} from "../types/User";
import { SuccessVerificationLoaderStatus } from "~/types/misc";
import {
  checkUserExists,
  getCurrentProfileInfo,
  updateOnboardingStatus,
} from "./user.server";
// import { Skill } from "~/types/Skill"; // Import Job type to ensure compatibility
import { JobStatus } from "~/types/enums";
import DOMPurify from "isomorphic-dompurify";
import { redirect } from "@remix-run/react";

/***************************************************
 ************Insert/update employer info************
 *************************************************** */

export async function handleEmployerOnboardingAction(
  formData: FormData,
  employer: Employer
) {
  const target = formData.get("target-updated") as string;
  const userId = employer.account.user.id;

  async function handleEmployerAbout(formData: FormData, employer: Employer) {
    const aboutContent = formData.get("about") as string;
    const aboutStatus = await updateEmployerAbout(employer, aboutContent);
    return Response.json({ success: aboutStatus.success });
  }

  async function handleEmployerBio(
    formData: FormData,
    userId: number,
    employer: Employer
  ) {
    const bio = {
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      address: formData.get("address") as string,
      country: formData.get("country") as string,
      websiteURL: formData.get("website") as string,
      socialMediaLinks: {
        linkedin: formData.get("linkedin") as string,
        github: formData.get("github") as string,
        gitlab: formData.get("gitlab") as string,
        dribbble: formData.get("dribbble") as string,
        stackoverflow: formData.get("stackoverflow") as string,
      },
      userId: userId,
    };
    const bioStatus = await updateAccountBio(bio, employer.account);
    return Response.json({ success: bioStatus.success });
  }

  async function handleEmployerIndustries(
    formData: FormData,
    employer: Employer
  ) {
    const industries = formData.get("employer-industries") as string;
    const industriesIds = industries
      .split(",")
      .map((industry) => parseInt(industry));
    const industriesStatus = await updateEmployerIndustries(
      employer,
      industriesIds
    );
    return Response.json({ success: industriesStatus.success });
  }

  async function handleEmployerYearsInBusiness(
    formData: FormData,
    employer: Employer
  ) {
    const yearsInBusiness =
      parseInt(formData.get("yearsInBusiness") as string) || 0;

    const yearsStatus = await updateEmployerYearsInBusiness(
      employer,
      yearsInBusiness
    );
    return Response.json({ success: yearsStatus.success });
  }

  async function handleEmployerBudget(formData: FormData, employer: Employer) {
    const budgetValue = formData.get("employerBudget");
    const budget = parseInt(budgetValue as string, 10);

    const budgetStatus = await updateEmployerBudget(employer, budget);
    return Response.json({ success: budgetStatus.success });
  }

  async function handleEmployerOnboard(userId: number) {
    const userExists = await checkUserExists(userId);
    if (!userExists.length)
      return Response.json({
        success: false,
        error: { message: "User not found." },
        status: 404,
      });

    const result = await updateOnboardingStatus(userId);
    return result.length
      ? redirect("/dashboard")
      : Response.json({
          success: false,
          error: { message: "Failed to update onboarding status" },

          status: 500,
        });
  }

  switch (target) {
    case "employer-about":
      return handleEmployerAbout(formData, employer);
    case "employer-bio":
      return handleEmployerBio(formData, userId, employer);
    case "employer-industries":
      return handleEmployerIndustries(formData, employer);
    case "employer-years-in-business":
      return handleEmployerYearsInBusiness(formData, employer);
    case "employer-budget":
      return handleEmployerBudget(formData, employer);
    case "employer-onboard":
      return handleEmployerOnboard(userId);
    default:
      throw new Error("Unknown target update");
  }
}

export async function updateAccountBio(
  bio: AccountBio,
  account: UserAccount
): Promise<SuccessVerificationLoaderStatus> {
  const userId = account.user.id;
  const accountId = account.id;

  try {
    const res1 = await db
      .update(UsersTable)
      .set({
        firstName: bio.firstName,
        lastName: bio.lastName,
      } as unknown)
      .where(eq(UsersTable.id, userId))
      .returning({ id: UsersTable.id });

    const res2 = await db
      .update(accountsTable)
      .set({
        socialMediaLinks: bio.socialMediaLinks,
        websiteURL: bio.websiteURL,
      })
      .where(eq(accountsTable.id, accountId))
      .returning({ id: accountsTable.id });

    const res3 = await db
      .update(accountsTable)
      .set({
        address: bio.address,
        country: bio.country,
      })
      .where(eq(accountsTable.userId, userId))
      .returning({ id: accountsTable.id });

    if (!res1.length || !res2.length || !res3.length) {
      throw new Error("Failed to update employer bio");
    }
  } catch (error) {
    console.error("Error updating employer bio", error);
    throw error;
  }

  return { success: true };
}

export async function updateEmployerIndustries(
  employer: Employer,
  industries: number[]
): Promise<SuccessVerificationLoaderStatus> {
  const employerId = employer.id;
  try {
    // delete all existing employer industries
    await db
      .delete(employerIndustriesTable)
      .where(eq(employerIndustriesTable.employerId, employerId));

    // make sure industries are unique
    industries = [...new Set(industries)];

    // insert new industries
    for (const industry of industries) {
      await db.insert(employerIndustriesTable).values({
        employerId,
        industryId: industry,
      });
    }
  } catch (error) {
    console.error("Error updating employer industries", error);
    throw error;
  }
  return { success: true };
}

export async function updateEmployerYearsInBusiness(
  employer: Employer,
  yearsInBusiness: number
): Promise<SuccessVerificationLoaderStatus> {
  const accountId = employer.accountId;
  try {
    if (isNaN(yearsInBusiness)) {
      throw new Error("Years in business must be a number");
    }
    if (yearsInBusiness < 0) {
      throw new Error("Years in business must be a positive number");
    }
    if (yearsInBusiness > 30) {
      throw new Error("Years in business must be less than 30");
    }
    await db
      .update(employersTable)
      .set({ yearsInBusiness })
      .where(eq(employersTable.accountId, accountId));
  } catch (error) {
    console.error("Error updating employer years in business", error);
    throw error;
  }
  return { success: true };
}

export async function updateEmployerBudget(
  employer: Employer,
  budget: number
): Promise<SuccessVerificationLoaderStatus> {
  const accountId = employer.accountId;
  try {
    await db
      .update(employersTable)
      .set({ budget }) // Update the budget column
      .where(eq(employersTable.accountId, accountId));

    return { success: true };
  } catch (error) {
    console.error("Error updating employer budget", error);
    throw error;
  }
}

// Function to update the "About" section for an employer
export async function updateEmployerAbout(
  employer: Employer,
  aboutContent: string
): Promise<{ success: boolean }> {
  const accountId = employer.accountId;
  const sanitizedContent = DOMPurify.sanitize(aboutContent);

  try {
    await db
      .update(employersTable)
      .set({
        about: sanitizedContent, // Set the about column with the new content
      })
      .where(eq(employersTable.accountId, accountId));

    return { success: true };
  } catch (error) {
    console.error("Error updating employer about section", error);
    return { success: false }; // Return failure status
  }
}

/**
 * verify that a job belongs to an employer
 *
 * @param jobId - the ID of the job
 * @param employerId - the ID of the employer
 * @returns true if the job belongs to the employer, false otherwise
 */
export async function verifyJobBelongsToEmployer(
  jobId: number,
  employerId: number
): Promise<boolean> {
  const job = await db
    .select()
    .from(jobsTable)
    .where(and(eq(jobsTable.id, jobId), eq(jobsTable.employerId, employerId)));

  return job.length > 0;
}

/***************************************************
 ****************fetch employer info****************
 *************************************************** */

export async function getAccountBio(account: UserAccount): Promise<AccountBio> {
  const userId = account.user.id;
  try {
    const user = await db
      .select({
        firstName: UsersTable.firstName,
        lastName: UsersTable.lastName,
      })
      .from(UsersTable)
      .where(eq(UsersTable.id, userId));

    const emp = await db
      .select({
        address: accountsTable.address,
        country: accountsTable.country,
        websiteURL: accountsTable.websiteURL,
        socialMediaLinks: accountsTable.socialMediaLinks,
        firstName: UsersTable.firstName,
        lastName: UsersTable.lastName,
      })
      .from(UsersTable)
      .leftJoin(accountsTable, eq(UsersTable.id, accountsTable.userId))
      // .leftJoin(employersTable, eq(employersTable.accountId, accountsTable.id))
      .where(eq(UsersTable.id, userId));

    if (!user || !emp) {
      throw new Error("Failed to get employer bio");
    }
    return emp[0] as AccountBio;
  } catch (error) {
    console.error("Error getting employer bio", error);
    throw error;
  }
}

export async function getAllLanguages(): Promise<
  { id: number; name: string }[]
> {
  try {
    const languages = await db.select().from(languagesTable);
    if (!languages) {
      throw new Error("Failed to get languages");
    }
    return languages.map((lang) => ({ id: lang.id, name: lang.name }));
  } catch (error) {
    console.error("Error getting languages", error);
    throw error;
  }
}

export async function getAllIndustries(): Promise<Industry[]> {
  try {
    const industries = await db.select().from(industriesTable);
    if (!industries) {
      throw new Error("Failed to get industries");
    }
    return industries;
  } catch (error) {
    console.error("Error getting industries", error);
    throw error;
  }
}

export const getEmployerIndustries = async (
  employer: Employer
): Promise<Industry[]> => {
  const employerId = employer.id;
  try {
    const industries = await db
      .select({
        id: industriesTable.id,
        label: industriesTable.label,
        metadata: industriesTable.metadata,
      })
      .from(industriesTable)
      .leftJoin(
        employerIndustriesTable,
        eq(employerIndustriesTable.industryId, industriesTable.id)
      )
      .where(eq(employerIndustriesTable.employerId, employerId));
    if (!industries) {
      throw new Error("Failed to get employer industries");
    }
    return industries;
  } catch (error) {
    console.error("Error getting employer industries", error);
    throw error;
  }
};

export async function getEmployerYearsInBusiness(
  employer: Employer
): Promise<number> {
  const accountId = employer.accountId;

  try {
    const result = await db
      .select({
        yearsInBusiness: employersTable.yearsInBusiness, // Wrap in an object
      })
      .from(employersTable)
      .where(eq(employersTable.accountId, accountId))
      .limit(1);

    return result[0]?.yearsInBusiness ?? 0;
  } catch (error) {
    console.error("Error fetching employer years in business", error);
    throw error;
  }
}

export async function getEmployerBudget(
  employer: Employer
): Promise<string | null> {
  const accountId = employer.accountId;

  try {
    const result = await db
      .select({
        budget: employersTable.budget, // Fetch the budget column
      })
      .from(employersTable)
      .where(eq(employersTable.accountId, accountId))
      .limit(1); // Limit to 1 row since we're expecting one result

    // ✅ Return null if the budget is 0 or undefined
    return result[0]?.budget ? String(result[0].budget) : null;
  } catch (error) {
    console.error("Error fetching employer budget", error);
    throw error;
  }
}

export async function getEmployerAbout(employer: Employer): Promise<string> {
  const accountId = employer.accountId;

  try {
    const result = await db
      .select({
        about: employersTable.about, // Fetch the about column
      })
      .from(employersTable)
      .where(eq(employersTable.accountId, accountId))
      .limit(1); // Limit to 1 row since we're expecting one result

    // Return the fetched about content or default to an empty string if no result
    return result[0]?.about ? String(result[0].about) : "";
  } catch (error) {
    console.error("Error fetching employer about section", error);
    throw error; // Re-throw error for further handling
  }
}

export async function getEmployerDashboardData(request: Request) {
  try {
    // Fetch the current employer information based on the request
    const currentProfile = (await getCurrentProfileInfo(request)) as Employer;
    if (!currentProfile) {
      throw new Error("Current user not found.");
    }

    // Fetch counts for active, drafted, and closed jobs
    const [activeJobs, draftedJobs, closedJobs] = await Promise.all([
      db
        .select()
        .from(jobsTable)
        .where(
          and(
            eq(jobsTable.employerId, currentProfile.id),
            eq(jobsTable.status, JobStatus.Active)
          )
        ),
      db
        .select()
        .from(jobsTable)
        .where(
          and(
            eq(jobsTable.employerId, currentProfile.id),
            eq(jobsTable.status, JobStatus.Draft)
          )
        ),
      db
        .select()
        .from(jobsTable)
        .where(
          and(
            eq(jobsTable.employerId, currentProfile.id),
            eq(jobsTable.status, JobStatus.Closed)
          )
        ),
    ]);

    // Calculate the counts based on the length of the results
    const activeJobCount = activeJobs.length;
    const draftedJobCount = draftedJobs.length;
    const closedJobCount = closedJobs.length;

    // Return the job counts
    return { activeJobCount, draftedJobCount, closedJobCount };
  } catch (error) {
    console.error("Error fetching employer dashboard data:", error);
    throw error; // Re-throw the error for further handling
  }
}
