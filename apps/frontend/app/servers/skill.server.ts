import { db } from '@mawaheb/db/server';
import { jobSkillsTable, skillsTable } from '@mawaheb/db';
import { eq, sql } from 'drizzle-orm';
import { Skill } from '@mawaheb/db/types';

export async function getJobSkills(jobId: number): Promise<Skill[]> {
  // console.log("🔍 Checking Job ID:", jobId);

  const jobSkills = await db
    .select({
      id: skillsTable.id,
      name: skillsTable.label,
      isStarred: jobSkillsTable.isStarred,
    })
    .from(jobSkillsTable)
    .innerJoin(skillsTable, eq(jobSkillsTable.skillId, skillsTable.id))
    .where(eq(jobSkillsTable.jobId, jobId));

  // console.log("📌 SQL Query Result (jobSkills):", jobSkills);

  return jobSkills;
}

export async function getAllSkills(): Promise<Skill[]> {
  // console.log("🔍 Fetching all skills from DB...");

  const skills = await db
    .select({
      id: skillsTable.id,
      name: skillsTable.label,
    })
    .from(skillsTable);

  // console.log("📌 SQL Query Result (All Skills):", skills);
  return skills;
}

// Inside your skills utils file

export async function getSkillsByQuery(query: string): Promise<Skill[]> {
  if (!query.trim()) return [];
  // Adjust column name if needed: assuming skillsTable.label is your display name
  const skills = await db
    .select({
      id: skillsTable.id,
      name: skillsTable.label,
    })
    .from(skillsTable)
    .where(sql`LOWER(${skillsTable.label}) LIKE LOWER(${`%${query}%`})`)

    .limit(10);
  return skills;
}

export async function addSkillIfNotExists(skillName: string): Promise<Skill> {
  if (!skillName.trim()) throw new Error('Skill name is empty');

  // Check if skill already exists (case-insensitive)
  const [existing] = await db
    .select({ id: skillsTable.id, name: skillsTable.label })
    .from(skillsTable)
    .where(sql`LOWER(${skillsTable.label}) = LOWER(${skillName})`)
    .limit(1);

  if (existing) return existing;

  // Insert new skill
  const [created] = await db
    .insert(skillsTable)
    .values({ label: skillName })
    .returning({ id: skillsTable.id, name: skillsTable.label });

  if (!created) throw new Error('Failed to create skill');
  return created;
}
