import { db } from "~/db/drizzle/connector";
import { jobSkillsTable, skillsTable } from "~/db/drizzle/schemas/schema";
import { eq } from "drizzle-orm";
import { Skill } from "~/types/Skill";

export async function getJobSkills(jobId: number): Promise<Skill[]> {
  // console.log("🔍 Checking Job ID:", jobId);

  const jobSkills = await db
    .select({
      id: skillsTable.id,
      name: skillsTable.name,
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
      name: skillsTable.name,
    })
    .from(skillsTable);

  // console.log("📌 SQL Query Result (All Skills):", skills);
  return skills;
}
