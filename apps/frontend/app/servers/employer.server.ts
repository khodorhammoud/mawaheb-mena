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
