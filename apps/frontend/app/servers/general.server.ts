import { eq, ilike, or } from 'drizzle-orm';
import { db } from '@mawaheb/db/server';
import { industriesTable, languagesTable, skillsTable } from '@mawaheb/db';

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
export async function fetchSkillsSearch(searchTerm: string, limit: number = 10) {
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
export async function fetchIndustriesSearch(searchTerm: string, limit: number = 10) {
  // console.log('🔍 [fetchIndustriesSearch] Called with searchTerm:', searchTerm);

  try {
    const industries = await db
      .select({ id: industriesTable.id, name: industriesTable.label })
      .from(industriesTable)
      .where(ilike(industriesTable.label, `%${searchTerm}%`))
      .limit(limit);

    // console.log('✅ [fetchIndustriesSearch] Found industries:', industries.length);
    return industries;
  } catch (error) {
    console.error('❌ [fetchIndustriesSearch] Error:', error);
    return [];
  }
}

// fetch languages that match or title search term
export async function fetchLanguagesSearch(searchTerm: string, limit: number = 10) {
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
