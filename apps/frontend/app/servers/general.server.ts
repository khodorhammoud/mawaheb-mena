import { eq, ilike, or } from "drizzle-orm";
import { db } from "~/db/drizzle/connector";
import {
  industriesTable,
  languagesTable,
  skillsTable,
} from "~/db/drizzle/schemas/schema";

// fetch all skills
export async function fetchSkills(isHot: boolean = false, limit: number = 10) {
  try {
    if (isHot) {
      const skills = await db
        .select()
        .from(skillsTable)
        .where(eq(skillsTable.isHot, isHot))
        .limit(limit);
      return skills;
    }
    const skills = await db.select().from(skillsTable).limit(limit);
    return skills;
  } catch (error) {
    console.error(error);
    return [];
  }
}

// fetch skills that match metadata search term or title search term
export async function fetchSkillsSearch(
  searchTerm: string,
  limit: number = 10
) {
  try {
    const skills = await db
      .select()
      .from(skillsTable)
      .where(
        or(
          /* sql`EXISTS (
            SELECT 1 FROM jsonb_array_elements_text(
              ${skillsTable.metaData}::jsonb
            ) AS elem
            WHERE elem ILIKE ${"%" + searchTerm + "%"}
          )`,
          ilike(skillsTable.label, `%${searchTerm}%`) */
          ilike(skillsTable.metaData, `%${searchTerm}%`),
          ilike(skillsTable.label, `%${searchTerm}%`)
        )
      )
      .limit(limit);
    return skills;
  } catch (error) {
    console.error(error);
    return [];
  }
}

// fetch industries that match metadata search term or title search term
export async function fetchIndustriesSearch(
  searchTerm: string,
  limit: number = 10
) {
  try {
    const industries = await db
      .select()
      .from(industriesTable)
      .where(
        or(
          ilike(industriesTable.metadata, `%${searchTerm}%`),
          ilike(industriesTable.label, `%${searchTerm}%`)
        )
      )
      .limit(limit);
    return industries;
  } catch (error) {
    console.error(error);
    return [];
  }
}

// fetch languages that match or title search term
export async function fetchLanguagesSearch(
  searchTerm: string,
  limit: number = 10
) {
  try {
    const languages = await db
      .select()
      .from(languagesTable)
      .where(ilike(languagesTable.language, `%${searchTerm}%`))
      .limit(limit);
    return languages;
  } catch (error) {
    console.error(error);
    return [];
  }
}
