import { db } from '@mawaheb/db/server';
import { jobSkillsTable, skillsTable } from '@mawaheb/db';
import { eq } from 'drizzle-orm';
import { Skill } from '@mawaheb/db';

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
