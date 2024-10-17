// import { Employer } from "~/types/User";
// import { getCurrentUser } from "./user.server";

import { db } from "../db/drizzle/connector";
import {
  accountsTable,
  employerIndustriesTable,
  employersTable,
  industriesTable,
  UsersTable,
} from "../db/drizzle/schemas/schema";
import { eq } from "drizzle-orm";
import {
  Employer,
  EmployerBio,
  EmployerSocialMediaLinks,
  Industry,
} from "../types/User";
import { SuccessVerificationLoaderStatus } from "~/types/misc";

export async function updateEmployerBio(
  bio: EmployerBio,
  employer: Employer
): Promise<SuccessVerificationLoaderStatus> {
  const userId = employer.account.user.id;
  const accountId = employer.accountId;

  try {
    // update user info first
    const res1 = await db
      .update(UsersTable)
      .set({ firstName: bio.firstName, lastName: bio.lastName })
      .where(eq(UsersTable.id, userId))
      .returning({ id: UsersTable.id });

    // update employer info
    const socialMediaLinks: EmployerSocialMediaLinks = bio.socialMediaLinks;

    const res2 = await db
      .update(employersTable)
      .set({ socialMediaLinks, websiteURL: bio.websiteURL })
      .where(eq(employersTable.accountId, accountId))
      .returning({ id: employersTable.id });

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

export async function getEmployerBio(employer: Employer): Promise<EmployerBio> {
  const userId = employer.account.user.id;

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
        websiteURL: employersTable.websiteURL,
        socialMediaLinks: employersTable.socialMediaLinks,
        firstName: UsersTable.firstName,
        lastName: UsersTable.lastName,
      })
      .from(UsersTable)
      .leftJoin(accountsTable, eq(UsersTable.id, accountsTable.userId))
      .leftJoin(employersTable, eq(employersTable.accountId, accountsTable.id))
      .where(eq(UsersTable.id, userId));

    if (!user || !emp) {
      throw new Error("Failed to get employer bio");
    }
    return emp[0] as EmployerBio;
  } catch (error) {
    console.error("Error getting employer bio", error);
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
  budget: string
): Promise<SuccessVerificationLoaderStatus> {
  const accountId = employer.accountId;
  try {
    // Ensure budget is a valid number
    if (!budget || isNaN(parseFloat(budget))) {
      throw new Error("Budget must be a valid number");
    }

    // Update the employer's budget in the database
    await db
      .update(employersTable)
      .set({ budget }) // Update the budget column
      .where(eq(employersTable.accountId, accountId));

    return { success: true };
  } catch (error) {
    console.error("Error updating employer budget", error);
    throw error; // Re-throw error for further handling
  }
}

export async function getEmployerBudget(employer: Employer): Promise<string> {
  const accountId = employer.accountId;

  console.log("Employer Account ID: ", accountId); // Log to ensure it's valid

  try {
    const result = await db
      .select({
        budget: employersTable.budget, // Fetch the budget column
      })
      .from(employersTable)
      .where(eq(employersTable.accountId, accountId))
      .limit(1); // Limit to 1 row since we're expecting one result

    // Log the result for debugging
    console.log("Budget Result: ", result);

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

  console.log("Employer Account ID: ", accountId); // Log to ensure it's valid

  try {
    const result = await db
      .select({
        about: employersTable.about, // Fetch the about column
      })
      .from(employersTable)
      .where(eq(employersTable.accountId, accountId))
      .limit(1); // Limit to 1 row since we're expecting one result

    // Log the result for debugging
    console.log("About Result: ", result);

    // Return the fetched about content or default to an empty string if no result
    return result[0]?.about ? String(result[0].about) : "";
  } catch (error) {
    console.error("Error fetching employer about section", error);
    throw error; // Re-throw error for further handling
  }
}

// Function to update the "About" section for an employer
export async function updateEmployerAbout(
  employer: Employer,
  aboutContent: string
): Promise<{ success: boolean }> {
  const accountId = employer.accountId;

  console.log("Employer Account ID: ", accountId); // Log to ensure it's valid
  console.log("New About Content: ", aboutContent); // Log the content being updated

  try {
    const result = await db
      .update(employersTable)
      .set({
        about: aboutContent, // Set the about column with the new content
      })
      .where(eq(employersTable.accountId, accountId));

    // Log the update result for debugging
    console.log("Update About Result: ", result);

    return { success: true };
  } catch (error) {
    console.error("Error updating employer about section", error);
    return { success: false }; // Return failure status
  }
}
