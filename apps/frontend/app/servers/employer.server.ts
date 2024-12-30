// this carries the query functions such as (Select/From/Where.....)

// import { Employer } from "~/types/User";
// import { getCurrentUser } from "./user.server";

import { db } from "../db/drizzle/connector";
import {
  accountsTable,
  employerIndustriesTable,
  employersTable,
  industriesTable,
  UsersTable,
  jobsTable,
  freelancersTable,
  // languagesTable,
  // skillsTable,
} from "../db/drizzle/schemas/schema";
import { and, eq } from "drizzle-orm";
import {
  Employer,
  AccountBio,
  AccountSocialMediaLinks,
  Industry,
  UserAccount,
  Freelancer,
  PortfolioFormFieldType,
  WorkHistoryFormFieldType,
  CertificateFormFieldType,
  EducationFormFieldType,
} from "../types/User";
import { SuccessVerificationLoaderStatus } from "~/types/misc";
import { getCurrentProfileInfo } from "./user.server";
import { uploadFileToBucket } from "./cloudStorage.server";
// import { Skill } from "~/types/Skill"; // Import Job type to ensure compatibility
import { JobStatus } from "~/types/enums";
import DOMPurify from "isomorphic-dompurify";

export async function updateAccountBio(
  bio: AccountBio,
  account: UserAccount
): Promise<SuccessVerificationLoaderStatus> {
  const userId = account.user.id;
  const accountId = account.id;

  try {
    // update user info first
    const res1 = await db
      .update(UsersTable)
      .set({ firstName: bio.firstName, lastName: bio.lastName } as unknown) // Casting as any to bypass type check
      .where(eq(UsersTable.id, userId))
      .returning();

    // update employer info
    const socialMediaLinks: AccountSocialMediaLinks = bio.socialMediaLinks;

    const res2 = await db
      .update(accountsTable)
      .set({ socialMediaLinks, websiteURL: bio.websiteURL })
      .where(eq(accountsTable.id, accountId))
      .returning({ id: accountsTable.id });

    // update location in accounts table
    const res3 = await db
      .update(accountsTable)
      .set({ location: bio.location })
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
        location: accountsTable.location,
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

export async function updateFreelancerPortfolio(
  freelancer: Freelancer,
  portfolio: PortfolioFormFieldType[],
  portfolioImages: File[]
): Promise<SuccessVerificationLoaderStatus> {
  try {
    // upload portfolio Images
    for (let i = 0; i < portfolioImages.length; i++) {
      const file = portfolioImages[i];
      if (file && file.size > 0) {
        portfolio[i].projectImageUrl = (
          await uploadFileToBucket("portfolio", file)
        ).fileName;
      } else {
        portfolio[i].projectImageUrl = "";
      }
      portfolio[i].projectDescription = DOMPurify.sanitize(
        portfolio[i].projectDescription
      );
    }

    const res = await db
      .update(freelancersTable)
      .set({
        portfolio: JSON.stringify(portfolio),
      })
      .where(eq(freelancersTable.id, freelancer.id))
      .returning({ id: freelancersTable.id });

    if (!res.length) {
      throw new Error("Failed to update freelancer portfolio");
    }

    return { success: true };
  } catch (error) {
    console.error("Error updating freelancer portfolio", error);
    throw error;
  }
}

export async function updateFreelancerCertificates(
  freelancer: Freelancer,
  certificates: CertificateFormFieldType[],
  certificatesImages: File[]
): Promise<SuccessVerificationLoaderStatus> {
  try {
    // upload certificates Images
    for (let i = 0; i < certificatesImages.length; i++) {
      const file = certificatesImages[i];
      if (file && file.size > 0) {
        certificates[i].attachmentUrl = (
          await uploadFileToBucket("certificates", file)
        ).fileName;
      } else {
        certificates[i].attachmentUrl = "";
      }
    }

    const res = await db
      .update(freelancersTable)
      .set({ certificates: JSON.stringify(certificates) })
      .where(eq(freelancersTable.id, freelancer.id))
      .returning({ id: freelancersTable.id });

    if (!res.length) {
      throw new Error("Failed to update freelancer certificates");
    }
    return { success: true };
  } catch (error) {
    console.error("Error updating freelancer certificates", error);
    throw error;
  }
}

export async function updateFreelancerWorkHistory(
  freelancer: Freelancer,
  workHistory: WorkHistoryFormFieldType[]
): Promise<SuccessVerificationLoaderStatus> {
  for (let i = 0; i < workHistory.length; i++) {
    workHistory[i].jobDescription = DOMPurify.sanitize(
      workHistory[i].jobDescription
    );
  }
  try {
    const res = await db
      .update(freelancersTable)
      .set({ workHistory: JSON.stringify(workHistory) })
      .where(eq(freelancersTable.id, freelancer.id))
      .returning({ id: freelancersTable.id });

    if (!res.length) {
      throw new Error("Failed to update freelancer work history");
    }
    return { success: true };
  } catch (error) {
    console.error("Error updating freelancer work history", error);
    throw error;
  }
}

export async function updateFreelancerEducation(
  freelancer: Freelancer,
  education: EducationFormFieldType[]
): Promise<SuccessVerificationLoaderStatus> {
  try {
    const res = await db
      .update(freelancersTable)
      .set({ educations: JSON.stringify(education) })
      .where(eq(freelancersTable.id, freelancer.id))
      .returning({ id: freelancersTable.id });

    if (!res.length) {
      throw new Error("Failed to update freelancer education");
    }
    return { success: true };
  } catch (error) {
    console.error("Error updating freelancer education", error);
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

export async function getEmployerBudget(employer: Employer): Promise<string> {
  const accountId = employer.accountId;

  try {
    const result = await db
      .select({
        budget: employersTable.budget, // Fetch the budget column
      })
      .from(employersTable)
      .where(eq(employersTable.accountId, accountId))
      .limit(1); // Limit to 1 row since we're expecting one result

    // Return the fetched budget or default to "0" if no result
    return result[0]?.budget ? String(result[0].budget) : "0";
  } catch (error) {
    console.error("Error fetching employer budget", error);
    throw error; // Re-throw error for further handling
  }
}

// Function to fetch the "About" section content for an employer
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

// Function to fetch the "About" section content for a freelancer
export async function getFreelancerAbout(
  freelancer: Freelancer
): Promise<string> {
  const accountId = freelancer.accountId;

  try {
    const result = await db
      .select({
        about: freelancersTable.about, // Fetch the about column
      })
      .from(freelancersTable)
      .where(eq(freelancersTable.accountId, accountId))
      .limit(1); // Limit to 1 row since we're expecting one result

    // Return the fetched about content or default to an empty string if no result
    return result[0]?.about ? String(result[0].about) : "";
  } catch (error) {
    console.error("Error fetching freelancer about section", error);
    throw error; // Re-throw error for further handling
  }
}

export async function getFreelancerHourlyRate(
  freelancer: Freelancer
): Promise<number> {
  const accountId = freelancer.accountId;

  try {
    const result = await db
      .select({
        hourlyRate: freelancersTable.hourlyRate, // Fetch the hourlyRate column
      })
      .from(freelancersTable)
      .where(eq(freelancersTable.accountId, accountId))
      .limit(1); // Limit to 1 row since we're expecting one result

    // Return the fetched hourly rate or default to 0 if no result
    return result[0]?.hourlyRate ?? 0;
  } catch (error) {
    console.error("Error fetching freelancer hourly rate", error);
    throw error; // Re-throw error for further handling
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

// Function to update the "About" section for a freelancer
export async function updateFreelancerAbout(
  freelancer: Freelancer,
  aboutContent: string
): Promise<{ success: boolean }> {
  const accountId = freelancer.accountId;
  const sanitizedContent = DOMPurify.sanitize(aboutContent);
  try {
    await db
      .update(freelancersTable)
      .set({
        about: sanitizedContent, // Set the about column with the new content
      })
      .where(eq(freelancersTable.accountId, accountId));

    return { success: true };
  } catch (error) {
    console.error("Error updating freelancer about section", error);
    return { success: false }; // Return failure status
  }
}

export async function updateFreelancerVideoLink(
  freelancerId: number,
  videoLink: string
): Promise<{ success: boolean }> {
  return db
    .update(freelancersTable)
    .set({ videoLink: videoLink })
    .where(eq(freelancersTable.accountId, freelancerId))
    .then(() => ({ success: true }))
    .catch((error) => {
      console.error("Error updating freelancer video link", error);
      return { success: false };
    });
}

export async function updateFreelancerYearsOfExperience(
  freelancer: Freelancer,
  yearsOfExperience: number
): Promise<{ success: boolean }> {
  const accountId = freelancer.accountId;

  try {
    if (isNaN(yearsOfExperience)) {
      throw new Error("Years experience must be a number");
    }
    if (yearsOfExperience < 0) {
      throw new Error("Years experience must be a positive number");
    }
    if (yearsOfExperience > 30) {
      throw new Error("Years experience must be less than 30");
    }
    await db
      .update(freelancersTable)
      .set({ yearsOfExperience })
      .where(eq(freelancersTable.accountId, accountId));

    return { success: true };
  } catch (error) {
    console.error("Error updating freelancer years experience", error);
    return { success: false }; // Return failure status
  }
}

export async function updateFreelancerHourlyRate(
  freelancer: Freelancer,
  hourlyRate: number
): Promise<{ success: boolean }> {
  const accountId = freelancer.accountId;

  try {
    await db
      .update(freelancersTable)
      .set({
        hourlyRate, // Set the hourlyRate column with the new rate
      })
      .where(eq(freelancersTable.accountId, accountId));

    return { success: true };
  } catch (error) {
    console.error("Error updating freelancer hourly rate", error);
    return { success: false }; // Return failure status
  }
}

// Helper function to check if a user exists
export async function checkUserExists(userId: number) {
  return await db
    .select()
    .from(UsersTable)
    .where(eq(UsersTable.id, userId))
    .limit(1);
}

// Helper function to update onboarding status
export async function updateOnboardingStatus(userId: number) {
  const result = await db
    .update(UsersTable)
    .set({ isOnboarded: true } as unknown)
    .where(eq(UsersTable.id, userId))
    .returning();

  return result;
}

// fetch the job count
// fetch the job count
// fetch the job count
// DASHBOARD PAGE
// EASSY
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
