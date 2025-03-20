import { db } from '../db/drizzle/connector';
import { and, desc, eq, ilike, inArray, isNull, not, or, sql } from 'drizzle-orm';
import { Job, JobApplication, JobCardData, JobFilter } from '~/types/Job';
import {
  jobApplicationsTable,
  jobCategoriesTable,
  jobsTable,
  freelancersTable,
  jobSkillsTable,
  skillsTable,
  reviewsTable,
  employersTable,
  accountsTable,
  UsersTable,
  freelancerSkillsTable,
  freelancerLanguagesTable,
  languagesTable,
} from '../db/drizzle/schemas/schema';
import { /*  Freelancer, */ JobCategory } from '../types/User';
import { JobApplicationStatus, JobStatus, ExperienceLevel } from '~/types/enums';
import { getUser, getUserIdFromFreelancerId } from './user.server';

export async function getAllJobCategories(): Promise<JobCategory[]> {
  try {
    const jobCategories = await db.select().from(jobCategoriesTable);
    if (!jobCategories) {
      throw new Error('Failed to get job categories');
    }
    return jobCategories;
  } catch (error) {
    console.error('Error getting job categories', error);
    throw error;
  }
}

// Create a job posting
export async function createJobPosting(
  jobData: Job,
  skills: { name: string; isStarred: boolean }[]
): Promise<{ success: boolean; error?: string }> {
  try {
    // ✅ Step 1: Insert the Job First
    const [job] = await db
      .insert(jobsTable)
      .values({
        employerId: jobData.employerId,
        title: jobData.title,
        description: jobData.description,
        jobCategoryId: jobData.jobCategoryId,
        workingHoursPerWeek: jobData.workingHoursPerWeek,
        locationPreference: jobData.locationPreference,
        projectType: jobData.projectType,
        budget: jobData.budget,
        experienceLevel: jobData.experienceLevel,
        status: jobData.status,
      })
      .returning({ id: jobsTable.id });

    if (!job) {
      console.error('❌ Job insertion failed: No rows returned.');
      throw new Error('Job insertion failed.');
    }

    // console.log("✅ New Job Created:", job.id);

    // ✅ Step 2: Process Each Skill Separately
    for (const skill of skills) {
      // 🔹 SPLIT skills if they come in as a comma-separated string
      const skillNames = skill.name.split(',').map(s => s.trim());

      for (const skillName of skillNames) {
        let [existingSkill] = await db
          .select({ id: skillsTable.id })
          .from(skillsTable)
          .where(eq(skillsTable.label, skillName));

        // ✅ Only insert new skills if they don't exist
        if (!existingSkill) {
          [existingSkill] = await db
            .insert(skillsTable)
            .values({ label: skillName }) // Insert skill separately
            .returning({ id: skillsTable.id });

          // console.log("🆕 Inserted new skill:", existingSkill.id, skillName);
        }

        // ✅ Insert into `jobSkillsTable` (Link Job & Skill)
        await db.insert(jobSkillsTable).values({
          jobId: job.id,
          skillId: existingSkill.id,
          isStarred: skill.isStarred,
        });

        // console.log(
        //   `🔗 Linked Skill ID ${existingSkill.id} (${skillName}) to Job ID ${job.id}`
        // );
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Detailed error during job creation:', error);
  }
  return { success: false };
}

/**
 * update a job posting
 *
 * @param jobId the Id of the job i wanna update
 * @param jobData the data i'll update in the job
 * @returns success or failure :)
 */
export async function updateJob(jobId: number, jobData: Partial<Job>) {
  try {
    const requiredSkills = Array.isArray(jobData.requiredSkills)
      ? jobData.requiredSkills.map(skill => ({
          id: skill.id,
          name: skill.name.trim(),
          isStarred: skill.isStarred || false,
        }))
      : [];

    await db.transaction(async tx => {
      // 🗑 1️⃣ Delete old skills to avoid duplicates
      await tx.delete(jobSkillsTable).where(eq(jobSkillsTable.jobId, jobId));

      // ✅ 2️⃣ Re-insert updated skills into `job_skills`
      if (requiredSkills.length > 0) {
        await tx.insert(jobSkillsTable).values(
          requiredSkills.map(skill => ({
            jobId,
            skillId: skill.id, // Skill ID must be valid
            isStarred: skill.isStarred, // ✅ Ensure this is inserted
          }))
        );
      }

      // 🔄 3️⃣ Update the main job details
      const updatedJob = await tx
        .update(jobsTable)
        .set({
          title: jobData.title?.trim(),
          description: jobData.description?.trim(),
          jobCategoryId: jobData.jobCategoryId || null,
          workingHoursPerWeek: jobData.workingHoursPerWeek || null,
          locationPreference: jobData.locationPreference?.trim(),
          projectType: jobData.projectType?.trim(),
          budget: jobData.budget || null,
          experienceLevel: jobData.experienceLevel?.trim(),
          status: jobData.status || 'draft', // ✅ Default to "draft" if null
        })
        .where(eq(jobsTable.id, jobId))
        .returning();

      if (!updatedJob || updatedJob.length === 0) {
        throw new Error('Job update failed: No rows returned.');
      }
    });

    return { success: true };
  } catch (error) {
    console.error('❌ Error during job update:', error);
    return { success: false, error: 'Failed to update job posting.' };
  }
}

// MANAGE JOBS
export async function getEmployerJobs(
  employerId: number
  // jobStatus?: JobStatus[]
): Promise<Job[]> {
  // Retrieves all jobs for a given employer
  // Joins the jobSkillsTable to get the skills linked to each job
  // Joins the skillsTable to get the skill names
  // Filters the jobs based on employerId to get only the relevant jobs
  const jobsQuery = db
    .select({
      id: jobsTable.id,
      employerId: jobsTable.employerId,
      title: jobsTable.title,
      description: jobsTable.description,
      workingHoursPerWeek: jobsTable.workingHoursPerWeek,
      locationPreference: jobsTable.locationPreference,
      projectType: jobsTable.projectType,
      budget: jobsTable.budget,
      experienceLevel: jobsTable.experienceLevel,
      status: jobsTable.status,
      createdAt: jobsTable.createdAt,
      jobCategoryId: jobsTable.jobCategoryId,
      fulfilledAt: jobsTable.fulfilledAt,
      skillId: jobSkillsTable.skillId,
      skillName: skillsTable.label,
      isStarred: jobSkillsTable.isStarred,
    })
    .from(jobsTable)
    .leftJoin(jobSkillsTable, eq(jobSkillsTable.jobId, jobsTable.id))
    .leftJoin(skillsTable, eq(jobSkillsTable.skillId, skillsTable.id))
    .where(eq(jobsTable.employerId, employerId));

  // runs the query
  const jobsRaw = await jobsQuery.execute();

  // This avoids duplicate job entries when multiple skills are attached to a job
  const jobsMap = new Map<number, Job>();

  // Loops through the raw job data
  // If the job doesn't exist in the map, it adds the job without skills
  // If a skill is found, it adds the skill to the job's requiredSkills list
  // This ensures that each job is stored once and its skills are properly grouped
  for (const row of jobsRaw) {
    if (!jobsMap.has(row.id)) {
      jobsMap.set(row.id, {
        id: row.id,
        employerId: row.employerId,
        title: row.title,
        description: row.description,
        workingHoursPerWeek: row.workingHoursPerWeek,
        locationPreference: row.locationPreference,
        projectType: row.projectType,
        budget: row.budget,
        experienceLevel: row.experienceLevel,
        status: row.status as JobStatus,
        createdAt: row.createdAt,
        jobCategoryId: row.jobCategoryId,
        fulfilledAt: row.fulfilledAt,
        requiredSkills: [],
      });
    }

    if (row.skillId) {
      jobsMap.get(row.id)?.requiredSkills.push({
        id: row.skillId,
        name: row.skillName,
        isStarred: row.isStarred,
      });
    }
  }

  // Converts the Map structure back into an array of jobs (which is the expected output format)
  // Now, each job has a clean list of skills inside requiredSkills
  return Array.from(jobsMap.values());
}

export async function getJobById(jobId: number): Promise<Job | null> {
  const jobQuery = db
    .select({
      id: jobsTable.id,
      employerId: jobsTable.employerId,
      title: jobsTable.title,
      description: jobsTable.description,
      workingHoursPerWeek: jobsTable.workingHoursPerWeek,
      locationPreference: jobsTable.locationPreference,
      projectType: jobsTable.projectType,
      budget: jobsTable.budget,
      experienceLevel: jobsTable.experienceLevel,
      status: jobsTable.status,
      createdAt: jobsTable.createdAt,
      jobCategoryId: jobsTable.jobCategoryId,
      fulfilledAt: jobsTable.fulfilledAt,
      skillId: jobSkillsTable.skillId,
      skillName: skillsTable.label,
      isStarred: jobSkillsTable.isStarred,
    })
    .from(jobsTable)
    .leftJoin(jobSkillsTable, eq(jobSkillsTable.jobId, jobsTable.id))
    .leftJoin(skillsTable, eq(jobSkillsTable.skillId, skillsTable.id))
    .where(eq(jobsTable.id, jobId));

  const jobRaw = await jobQuery.execute();

  if (!jobRaw.length) {
    return null;
  }

  // Group skills under `requiredSkills`
  const jobData: Job = {
    id: jobRaw[0].id,
    employerId: jobRaw[0].employerId,
    title: jobRaw[0].title,
    description: jobRaw[0].description,
    workingHoursPerWeek: jobRaw[0].workingHoursPerWeek,
    locationPreference: jobRaw[0].locationPreference,
    projectType: jobRaw[0].projectType,
    budget: jobRaw[0].budget,
    experienceLevel: jobRaw[0].experienceLevel,
    status: jobRaw[0].status as JobStatus,
    createdAt: jobRaw[0].createdAt,
    jobCategoryId: jobRaw[0].jobCategoryId,
    fulfilledAt: jobRaw[0].fulfilledAt,
    requiredSkills: [],
  };

  for (const row of jobRaw) {
    if (row.skillId) {
      jobData.requiredSkills.push({
        id: row.skillId,
        name: row.skillName,
        isStarred: row.isStarred,
      });
    }
  }

  return jobData;
}

/* export async function getFreelancerDesignJobs(): Promise<Job[]> {
  // freelancer: Freelancer
  // fetch Design jobs
  const DesignJobs = await db
    .select()
    .from(jobsTable)
    .where(
      and(
        eq(jobsTable.status, JobStatus.Active),
        eq(jobsTable.employerId, freelancer.id)
      )
    );
  return DesignJobs.map((job) => ({
    ...job,
    status: job.status as JobStatus,
  }));
} */

// ✅ Get Design Jobs (Jobs Freelancer Hasn't Applied To)
// export async function getDesignJobs(freelancerId: number) {
//   // Query to select all jobs that are active and the freelancer hasn't applied
//   const jobs = await db
//     .select({
//       id: jobsTable.id,
//       title: jobsTable.title,
//       description: jobsTable.description,
//       employerId: jobsTable.employerId,
//       status: jobsTable.status,
//       applicationStatus: jobApplicationsTable.status,
//       createdAt: jobsTable.createdAt,
//       budget: jobsTable.budget,
//       experienceLevel: jobsTable.experienceLevel,
//       jobCategoryId: jobsTable.jobCategoryId,
//       workingHoursPerWeek: jobsTable.workingHoursPerWeek,
//       locationPreference: jobsTable.locationPreference,
//       projectType: jobsTable.projectType,
//     })
//     .from(jobsTable)
//     .leftJoin(
//       jobApplicationsTable,
//       and(
//         eq(jobApplicationsTable.jobId, jobsTable.id),
//         eq(jobApplicationsTable.freelancerId, freelancerId)
//       )
//     )
//     .where(
//       and(
//         eq(jobsTable.status, JobStatus.Active),
//         isNull(jobApplicationsTable.id) // ✅ Exclude jobs where freelancer has applied
//       )
//     )
//     .orderBy(desc(jobsTable.createdAt));

//   return jobs;
// }

interface JobRecommendation {
  jobId: number;
  title: string;
  description: string;
  budget: number;
  workingHoursPerWeek: number;
  locationPreference: string;
  projectType: string;
  experienceLevel: ExperienceLevel;
  matchScore: number;
  skillsMatch: {
    matchingSkills: Array<{
      id: number;
      label: string;
      isStarred: boolean;
      freelancerYearsOfExperience: number;
    }>;
    missingSkills: Array<{
      id: number;
      label: string;
      isStarred: boolean;
    }>;
    matchPercentage: number;
  };
  createdAt: string;
}

function calculateMatchScore(
  freelancer: any,
  freelancerSkills: any[],
  job: any,
  jobSkills: any[]
): number {
  // console.log("🎯 Calculating match score for job:", job.id);

  let score = 0;
  const weights = {
    skills: 0.4, // 40% - Most important
    experience: 0.15, // 15% - Experience level match
    location: 0.1, // 10% - Location preference
    projectType: 0.1, // 10% - Project type match
    workingHours: 0.1, // 10% - Working hours compatibility
    languages: 0.1, // 10% - Language requirements
    description: 0.05, // 5%  - Description keyword match
  };

  // 1. Skills match (40%)
  const matchingSkillsCount = jobSkills.filter(jobSkill =>
    freelancerSkills.some(fs => fs.skillId === jobSkill.skillId)
  ).length;

  // Calculate base skills score
  let skillsScore = jobSkills.length > 0 ? matchingSkillsCount / jobSkills.length : 1;

  // Bonus for matching starred/important skills
  const starredSkills = jobSkills.filter(skill => skill.isStarred);
  if (starredSkills.length > 0) {
    const matchingStarredCount = starredSkills.filter(starredSkill =>
      freelancerSkills.some(fs => fs.skillId === starredSkill.skillId)
    ).length;
    const starredScore = matchingStarredCount / starredSkills.length;
    skillsScore = skillsScore * 0.7 + starredScore * 0.3; // Give 30% extra weight to starred skills
  }

  // Add experience bonus for matching skills
  const matchingSkills = jobSkills.filter(jobSkill =>
    freelancerSkills.some(fs => fs.skillId === jobSkill.skillId)
  );
  if (matchingSkills.length > 0) {
    let experienceBonus = 0;
    matchingSkills.forEach(jobSkill => {
      const freelancerSkill = freelancerSkills.find(fs => fs.skillId === jobSkill.skillId);
      if (freelancerSkill && freelancerSkill.yearsOfExperience >= 3) {
        experienceBonus += 0.1; // 10% bonus for each skill with 3+ years experience
      }
    });
    skillsScore = Math.min(1, skillsScore + experienceBonus);
  }

  score += skillsScore * weights.skills;
  // console.log("📊 Skills Score:", Math.round(skillsScore * 100) + "%");

  // 2. Experience level match (15%)
  const experienceLevels = Object.values(ExperienceLevel);

  // Function to map yearsOfExperience to an experience level
  function getExperienceLevel(yearsOfExperience: number): ExperienceLevel {
    if (yearsOfExperience <= 2) return ExperienceLevel.Entry;
    if (yearsOfExperience <= 4) return ExperienceLevel.Mid;
    return ExperienceLevel.Expert; // 5+ years
  }

  // 🏆 Get the highest years of experience from freelancer's skills
  const freelancerYearsOfExperience = Math.max(
    ...freelancerSkills.map(skill => skill.yearsOfExperience || 0),
    0 // Default value if no skills exist
  );

  // 🛠️ LOG FREELANCER YEARS OF EXPERIENCE
  // console.log(
  //   "📌 Freelancer Max Years of Experience:",
  //   freelancerYearsOfExperience
  // );

  // 🔄 Map to Experience Level
  const freelancerExpLevel = getExperienceLevel(freelancerYearsOfExperience);
  // console.log("📌 Mapped Freelancer Experience Level:", freelancerExpLevel);

  // ✅ Now use `experienceLevels` to get the correct index
  const freelancerExpIndex = experienceLevels.indexOf(freelancerExpLevel);
  const jobExpIndex = experienceLevels.indexOf(job.experienceLevel);

  // 🛠️ LOG EXPERIENCE INDEX VALUES
  // console.log(
  //   "👨‍💻 Freelancer Experience Level:",
  //   freelancerExpLevel,
  //   "➡ Index:",
  //   freelancerExpIndex
  // );
  // console.log(
  //   "🏢 Job Experience Level:",
  //   job.experienceLevel,
  //   "➡ Index:",
  //   jobExpIndex
  // );

  let experienceScore = 0;
  if (freelancerExpIndex >= jobExpIndex) {
    experienceScore = 1; // Fully qualified
    // console.log("✅ Freelancer meets or exceeds the required experience.");
  } else {
    const levelDiff = jobExpIndex - freelancerExpIndex;
    experienceScore = Math.max(0, 1 - levelDiff * 0.5); // Partial match for close levels
    // console.log(
    //   "⚠️ Freelancer has lower experience. Level difference:",
    //   levelDiff
    // );
    // console.log("📉 Adjusted Experience Score:", experienceScore);
  }

  score += experienceScore * weights.experience;
  // console.log(
  //   "📊 Final Weighted Experience Score:",
  //   experienceScore * weights.experience
  // );
  // console.log("🛠️ Updated Total Score:", score);

  // 3. Location preference match (10%)
  let locationScore = 0;
  if (job.locationPreference === 'Remote') {
    locationScore = 1; // Remote jobs are fully compatible
  } else if (job.locationPreference === freelancer.country) {
    locationScore = 1; // Same country/city is fully compatible
  } else if (job.locationPreference === 'Hybrid' && freelancer.country === job.locationPreference) {
    locationScore = 0.8; // Hybrid with matching location is highly compatible
  } else {
    locationScore = 0.2; // Different locations have low compatibility
  }

  score += locationScore * weights.location;
  // console.log("📊 Location Score:", Math.round(locationScore * 100) + "%");

  // 4. Project type match (10%)
  let projectTypeScore = 0;
  if (freelancer.preferredProjectTypes && Array.isArray(freelancer.preferredProjectTypes)) {
    projectTypeScore = freelancer.preferredProjectTypes.includes(job.projectType) ? 1 : 0.3;
  } else {
    projectTypeScore = 0.5; // Neutral score if no preferences set
  }

  score += projectTypeScore * weights.projectType;
  // console.log(
  //   "📊 Project Type Score:",
  //   Math.round(projectTypeScore * 100) + "%"
  // );

  // 5. Working hours compatibility (10%)
  let hoursScore = 0;
  const freelancerPreferredHours = freelancer.preferredWorkingHours || 40;
  const jobHours = job.workingHoursPerWeek;

  if (jobHours <= freelancerPreferredHours) {
    hoursScore = 1; // Job requires fewer or equal hours than preferred
  } else {
    const hoursDiff = jobHours - freelancerPreferredHours;
    hoursScore = Math.max(0, 1 - hoursDiff / 20); // Gradually reduce score for each extra hour
  }

  score += hoursScore * weights.workingHours;
  // console.log("📊 Working Hours Score:", Math.round(hoursScore * 100) + "%");

  // 6. Language match (10%)
  let languageScore = 0;
  if (freelancer.languages && Array.isArray(freelancer.languages)) {
    // Assuming job has required languages field
    const jobLanguages = job.languages || ['English']; // Default to English if not specified
    const matchingLanguages = freelancer.languages.filter(lang => jobLanguages.includes(lang));
    languageScore = jobLanguages.length > 0 ? matchingLanguages.length / jobLanguages.length : 1;
  } else {
    languageScore = 0.5; // Neutral score if no language info
  }

  score += languageScore * weights.languages;
  // console.log("📊 Language Score:", Math.round(languageScore * 100) + "%");

  // 7. Description keyword match (5%)
  let descriptionScore = 0;
  if (freelancer.fieldsOfExpertise && Array.isArray(freelancer.fieldsOfExpertise)) {
    const jobText = `${job.title} ${job.description}`.toLowerCase();
    const matchingKeywords = freelancer.fieldsOfExpertise.filter(keyword =>
      jobText.includes(keyword.toLowerCase())
    );
    descriptionScore = matchingKeywords.length > 0 ? Math.min(1, matchingKeywords.length / 3) : 0.2;
  } else {
    descriptionScore = 0.3; // Basic score if no expertise fields defined
  }

  score += descriptionScore * weights.description;
  // console.log(
  //   "📊 Description Match Score:",
  //   Math.round(descriptionScore * 100) + "%"
  // );

  // Calculate final score (0-100)
  const finalScore = Math.round(score * 100);
  // console.log("🎯 Final Match Score:", finalScore + "%");

  return finalScore;
}

export async function getJobRecommendations(
  freelancerId: number,
  limit: number = 10
): Promise<JobRecommendation[]> {
  try {
    // 1. Get freelancer data
    const freelancer = await db
      .select({
        id: freelancersTable.id,
        accountId: freelancersTable.accountId,
        about: freelancersTable.about,
        fieldsOfExpertise: freelancersTable.fieldsOfExpertise,
        yearsOfExperience: freelancersTable.yearsOfExperience,
        preferredProjectTypes: freelancersTable.preferredProjectTypes,
        availableForWork: freelancersTable.availableForWork,
        hoursAvailableFrom: freelancersTable.hoursAvailableFrom,
        hoursAvailableTo: freelancersTable.hoursAvailableTo,
        country: accountsTable.country,
      })
      .from(freelancersTable)
      .leftJoin(accountsTable, eq(accountsTable.id, freelancersTable.accountId))
      .where(eq(freelancersTable.id, freelancerId))
      .limit(1);

    if (!freelancer || freelancer.length === 0) {
      console.error(`Freelancer with ID ${freelancerId} not found`);
      throw new Error(`Freelancer with ID ${freelancerId} not found`);
    }

    const freelancerData = freelancer[0];

    // 2. Get freelancer skills with experience info
    const freelancerSkills = await db
      .select({
        skillId: freelancerSkillsTable.skillId,
        yearsOfExperience: freelancerSkillsTable.yearsOfExperience,
        label: skillsTable.label,
      })
      .from(freelancerSkillsTable)
      .leftJoin(skillsTable, eq(skillsTable.id, freelancerSkillsTable.skillId))
      .where(eq(freelancerSkillsTable.freelancerId, freelancerId));

    // 3. Get applied jobs to exclude
    const appliedJobIds = await db
      .select({ jobId: jobApplicationsTable.jobId })
      .from(jobApplicationsTable)
      .where(eq(jobApplicationsTable.freelancerId, freelancerId));

    const appliedJobIdsArray = appliedJobIds.map(item => item.jobId);

    // 4. Get active jobs from active employers - fetch more initially for better filtering
    const initialJobLimit = Math.max(limit * 4, 40);
    const activeJobs = await db
      .select({
        id: jobsTable.id,
        title: jobsTable.title,
        description: jobsTable.description,
        budget: jobsTable.budget,
        workingHoursPerWeek: jobsTable.workingHoursPerWeek,
        locationPreference: jobsTable.locationPreference,
        projectType: jobsTable.projectType,
        experienceLevel: jobsTable.experienceLevel,
        createdAt: jobsTable.createdAt,
      })
      .from(jobsTable)
      .leftJoin(employersTable, eq(employersTable.id, jobsTable.employerId))
      .leftJoin(accountsTable, eq(accountsTable.id, employersTable.accountId))
      .where(
        and(
          eq(jobsTable.status, JobStatus.Active),
          not(eq(accountsTable.accountStatus, 'deactivated')), // Exclude jobs from deactivated employers
          appliedJobIdsArray.length > 0 ? not(inArray(jobsTable.id, appliedJobIdsArray)) : undefined
        )
      )
      .limit(initialJobLimit);

    // 5. Calculate match scores and filter jobs
    const jobRecommendations: JobRecommendation[] = [];
    const MINIMUM_MATCH_SCORE = 50;

    for (const job of activeJobs) {
      const jobSkills = await db
        .select({
          skillId: jobSkillsTable.skillId,
          isStarred: jobSkillsTable.isStarred,
          label: skillsTable.label,
        })
        .from(jobSkillsTable)
        .leftJoin(skillsTable, eq(skillsTable.id, jobSkillsTable.skillId))
        .where(eq(jobSkillsTable.jobId, job.id));

      const matchScore = calculateMatchScore(freelancerData, freelancerSkills, job, jobSkills);

      if (matchScore >= MINIMUM_MATCH_SCORE) {
        const matchingSkills = jobSkills
          .filter(jobSkill => freelancerSkills.some(fs => fs.skillId === jobSkill.skillId))
          .map(jobSkill => ({
            id: jobSkill.skillId,
            label: jobSkill.label,
            isStarred: jobSkill.isStarred,
            freelancerYearsOfExperience:
              freelancerSkills.find(fs => fs.skillId === jobSkill.skillId)?.yearsOfExperience || 0,
          }));

        const missingSkills = jobSkills
          .filter(jobSkill => !freelancerSkills.some(fs => fs.skillId === jobSkill.skillId))
          .map(jobSkill => ({
            id: jobSkill.skillId,
            label: jobSkill.label,
            isStarred: jobSkill.isStarred,
          }));

        const skillsMatchPercentage =
          jobSkills.length > 0 ? (matchingSkills.length / jobSkills.length) * 100 : 100;

        jobRecommendations.push({
          jobId: job.id,
          title: job.title,
          description: job.description,
          budget: job.budget,
          workingHoursPerWeek: job.workingHoursPerWeek,
          locationPreference: job.locationPreference,
          projectType: job.projectType,
          experienceLevel: job.experienceLevel as ExperienceLevel,
          matchScore,
          skillsMatch: {
            matchingSkills,
            missingSkills,
            matchPercentage: skillsMatchPercentage,
          },
          createdAt: job.createdAt.toISOString(),
        });
      }
    }

    // Sort by match score (descending) and return top recommendations
    return jobRecommendations.sort((a, b) => b.matchScore - a.matchScore).slice(0, limit);
  } catch (error) {
    console.error('❌ Error getting job recommendations:', error);
    throw error;
  }
}

// ✅ Get All Jobs (No Restrictions)
export async function getAllJobs() {
  // Query to select all jobs that are active even if the freelancer applied
  const jobs = await db
    .select({
      id: jobsTable.id,
      title: jobsTable.title,
      description: jobsTable.description,
      employerId: jobsTable.employerId,
      status: jobsTable.status,
      applicationStatus: jobApplicationsTable.status,
      createdAt: jobsTable.createdAt,
      budget: jobsTable.budget,
      experienceLevel: jobsTable.experienceLevel,
      jobCategoryId: jobsTable.jobCategoryId,
      workingHoursPerWeek: jobsTable.workingHoursPerWeek,
      locationPreference: jobsTable.locationPreference,
      projectType: jobsTable.projectType,
    })
    .from(jobsTable)
    .leftJoin(jobApplicationsTable, eq(jobApplicationsTable.jobId, jobsTable.id))
    .leftJoin(employersTable, eq(employersTable.id, jobsTable.employerId))
    .leftJoin(accountsTable, eq(accountsTable.id, employersTable.accountId))
    .where(
      and(
        eq(jobsTable.status, JobStatus.Active),
        not(eq(accountsTable.accountStatus, 'deactivated')) // Use accountStatus instead of status
      )
    )
    .orderBy(desc(jobsTable.createdAt));

  return jobs;
}

// ✅ Get My Jobs (Jobs Freelancer Applied To)
export async function getMyJobs(freelancerId: number) {
  // Query to select all jobs that the freelancer has applied to
  const jobs = await db
    .select({
      id: jobsTable.id,
      title: jobsTable.title,
      description: jobsTable.description,
      employerId: jobsTable.employerId,
      status: jobsTable.status,
      applicationStatus: jobApplicationsTable.status,
      createdAt: jobsTable.createdAt,
      budget: jobsTable.budget,
      experienceLevel: jobsTable.experienceLevel,
      jobCategoryId: jobsTable.jobCategoryId,
      workingHoursPerWeek: jobsTable.workingHoursPerWeek,
      locationPreference: jobsTable.locationPreference,
      projectType: jobsTable.projectType,
    })
    .from(jobsTable)
    .innerJoin(
      jobApplicationsTable,
      and(
        eq(jobApplicationsTable.jobId, jobsTable.id),
        eq(jobApplicationsTable.freelancerId, freelancerId)
      )
    )
    .orderBy(desc(jobsTable.createdAt));

  return jobs;
}

// ✅ Check if a freelancer has at least one accepted job application with an employer
export async function hasAcceptedApplication(freelancerId: number, employerId: number) {
  // ✅ Join job applications with jobs to verify the employer
  const result = await db
    .select()
    .from(jobApplicationsTable)
    .innerJoin(jobsTable, eq(jobApplicationsTable.jobId, jobsTable.id)) // ✅ Join jobs table
    .where(
      and(
        eq(jobApplicationsTable.freelancerId, freelancerId),
        eq(jobsTable.employerId, employerId), // ✅ Ensure the job belongs to the employer
        eq(jobApplicationsTable.status, JobApplicationStatus.Approved) // ✅ Only check accepted applications
      )
    )
    .limit(1);

  return result.length > 0; // ✅ Returns true if at least one accepted job exists
}

// ✅ Retrieve all accepted job applications between a freelancer and an employer
export async function getJobApplicationsForFreelancer(freelancerId: number, employerId: number) {
  // ✅ Join job applications with jobs to verify employer-freelancer relation
  const result = await db
    .select()
    .from(jobApplicationsTable)
    .innerJoin(jobsTable, eq(jobApplicationsTable.jobId, jobsTable.id)) // ✅ Join jobs table
    .where(
      and(
        eq(jobApplicationsTable.freelancerId, freelancerId),
        eq(jobsTable.employerId, employerId), // ✅ Ensure employer owns the job
        eq(jobApplicationsTable.status, JobApplicationStatus.Approved) // ✅ Filter only accepted applications
      )
    );

  return result; // ✅ Returns a list of all accepted job applications
}

// ✅ Save Review to Database
export async function saveReview({
  employerId,
  freelancerId,
  rating,
  comment,
  reviewType,
}: {
  employerId: number;
  freelancerId: number;
  rating: number;
  comment?: string | null;
  reviewType: 'employer_review' | 'freelancer_review';
}) {
  try {
    // Ensure no undefined values are passed to the database
    const result = await db
      .insert(reviewsTable)
      .values({
        employerId,
        freelancerId,
        rating,
        comment: comment || '', // Convert undefined to empty string
        reviewType,
      } as typeof reviewsTable.$inferInsert)
      .returning({ id: reviewsTable.id });

    return {
      success: true,
      message: 'Review submitted successfully.',
      id: result[0].id,
    };
  } catch (error) {
    return { success: false, message: (error as Error).message };
  }
}

// ✅ Get Review for a Specific employer and freelancer
export async function getReview({
  employerId,
  freelancerId,
  reviewType,
}: {
  employerId: number;
  freelancerId: number;
  reviewType: 'employer_review' | 'freelancer_review';
}) {
  const result = await db
    .select()
    .from(reviewsTable)
    .where(
      and(
        eq(reviewsTable.employerId, employerId),
        eq(reviewsTable.freelancerId, freelancerId),
        eq(reviewsTable.reviewType, reviewType)
      )
    )
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function updateReview({
  employerId,
  freelancerId,
  rating,
  comment,
  reviewType,
}: {
  employerId: number;
  freelancerId: number;
  rating: number;
  comment?: string | null;
  reviewType: 'employer_review' | 'freelancer_review';
}) {
  const updateData: { rating: number; comment?: string | null } = { rating };
  // Handle undefined comment by setting it to empty string
  updateData.comment = comment || '';

  const result = await db
    .update(reviewsTable)
    .set(updateData)
    .where(
      and(
        eq(reviewsTable.employerId, employerId),
        eq(reviewsTable.freelancerId, freelancerId),
        eq(reviewsTable.reviewType, reviewType)
      )
    );

  return result;
}

/** ✅ Get employerId by Job ID */
export async function getEmployerIdByJobId(jobId: number) {
  // console.log("🔍 Fetching employerId for jobId:", jobId);

  const job = await db
    .select({ employerId: jobsTable.employerId })
    .from(jobsTable)
    .where(eq(jobsTable.id, jobId))
    .limit(1);

  // console.log("✅ Query Result:", job);

  return job.length > 0 ? job[0].employerId : null;
}

/** ✅ Get Freelancer ID by Account ID */
export async function getAccountIdbyUserId(userId: number): Promise<number | null> {
  // ✅ Fetch the freelancer account
  const account = await db
    .select({ id: accountsTable.id }) // Only select ID
    .from(accountsTable)
    .where(and(eq(accountsTable.userId, userId), eq(accountsTable.accountType, 'freelancer')))
    .limit(1);

  // ✅ Return the account ID if found
  return account.length > 0 ? account[0].id : null;
}

/** ✅ Get the Average Rating of a User */
export async function getFreelancerAverageRating(freelancerId: number) {
  const result = await db
    .select({
      avgRating: sql<number>`AVG(${reviewsTable.rating})`,
    })
    .from(reviewsTable)
    .where(
      and(
        eq(reviewsTable.freelancerId, freelancerId),
        eq(reviewsTable.reviewType, 'employer_review')
      )
    );

  return result.length > 0 && result[0].avgRating !== null
    ? parseFloat(result[0].avgRating.toFixed(1))
    : 0;
}

/** ✅ Get the Total Number of Reviews for a User */
export async function getFreelancerTotalReviews(freelancerId: number) {
  const result = await db
    .select({
      count: sql<number>`COUNT(*)`,
    })
    .from(reviewsTable)
    .where(
      and(
        eq(reviewsTable.freelancerId, freelancerId),
        eq(reviewsTable.reviewType, 'employer_review')
      )
    );

  return result[0].count || 0;
}

/** ✅ Get All Reviews for a User */
export async function getFreelancerReviews(freelancerId: number) {
  const reviews = await db
    .select({
      id: reviewsTable.id,
      rating: reviewsTable.rating,
      comment: reviewsTable.comment,
      createdAt: reviewsTable.createdAt,
      employerId: reviewsTable.employerId,
      reviewType: reviewsTable.reviewType,
    })
    .from(reviewsTable)
    .where(
      and(
        eq(reviewsTable.freelancerId, freelancerId),
        eq(reviewsTable.reviewType, 'employer_review')
      )
    )
    .orderBy(desc(reviewsTable.createdAt));

  return reviews;
}

// 👇 is not with 👆 :D
// export async function getJobApplicationStatus(jobId: number) {
//   const application = await db
//     .select({ status: jobApplicationsTable.status })
//     .from(jobApplicationsTable)
//     .where(eq(jobApplicationsTable.jobId, jobId))
//     .limit(1);

//   // console.log(`🔍 Job ${jobId} - Found Application Status:`, application);

//   return application.length > 0 ? application[0].status : null;
// }

// export async function getExistingReview(jobId: number, freelancerId: number) {
//   // const review = await db
//   //   .select({
//   //     rating: reviewsTable.rating,
//   //     comment: reviewsTable.comment,
//   //   })
//   //   .from(reviewsTable)
//   //   .where(
//   //     and(
//   //       eq(
//   //         reviewsTable.employerId,
//   //         db
//   //           .select({ employerId: jobsTable.employerId })
//   //           .from(jobsTable)
//   //           .where(eq(jobsTable.id, jobId))
//   //       ),
//   //       eq(reviewsTable.freelancerId, freelancerId)
//   //     )
//   //   )
//   //   .limit(1);
//   // return review.length > 0 ? review[0] : null;
// }

export async function getJobsFiltered(filter: JobFilter): Promise<Job[]> {
  const query = db
    .select({
      id: jobsTable.id,
      title: jobsTable.title,
      description: jobsTable.description,
      employerId: jobsTable.employerId,
      status: jobsTable.status,
      budget: jobsTable.budget,
      experienceLevel: jobsTable.experienceLevel,
      jobCategoryId: jobsTable.jobCategoryId,
      workingHoursPerWeek: jobsTable.workingHoursPerWeek,
      locationPreference: jobsTable.locationPreference,
      projectType: jobsTable.projectType,
      createdAt: jobsTable.createdAt,
      fulfilledAt: jobsTable.fulfilledAt,
    })
    .from(jobsTable)
    .leftJoin(employersTable, eq(employersTable.id, jobsTable.employerId))
    .leftJoin(accountsTable, eq(accountsTable.id, employersTable.accountId));

  const conditions = [];
  if (!filter.pageSize) {
    filter.pageSize = 10;
  }
  if (!filter.page) {
    filter.page = 1;
  }

  if (filter.projectType && filter.projectType.length > 0) {
    conditions.push(inArray(jobsTable.projectType, filter.projectType));
  }

  if (filter.locationPreference && filter.locationPreference.length > 0) {
    conditions.push(inArray(jobsTable.locationPreference, filter.locationPreference));
  }

  if (filter.experienceLevel && filter.experienceLevel.length > 0) {
    conditions.push(inArray(jobsTable.experienceLevel, filter.experienceLevel));
  }

  if (filter.employerId) {
    conditions.push(eq(jobsTable.employerId, filter.employerId));
  }

  if (filter.query) {
    conditions.push(
      or(
        ilike(jobsTable.title, `%${filter.query}%`),
        ilike(jobsTable.description, `%${filter.query}%`)
      )
    );
  }

  // Add status conditions
  conditions.push(eq(jobsTable.status, JobStatus.Active));
  conditions.push(not(eq(accountsTable.accountStatus, 'deactivated'))); // Use accountStatus instead of status

  // Apply all conditions using and()
  const jobs = await query
    .where(and(...conditions))
    .limit(filter.pageSize)
    .offset((filter.page - 1) * filter.pageSize);

  return jobs.map(job => ({
    ...job,
    status: job.status as JobStatus,
    requiredSkills: [], // Add empty array as default for required skills
  }));
}

/**
 * get a job application by job ID and freelancer ID
 *
 * @param jobId - the ID of the job
 * @param freelancerId - the ID of the freelancer
 * @returns the job application or null if it doesn't exist
 */
export async function getJobApplicationByJobIdAndFreelancerId(
  jobId: number,
  freelancerId: number
): Promise<JobApplication | null> {
  const jobApplication = await db
    .select()
    .from(jobApplicationsTable)
    .leftJoin(jobsTable, eq(jobApplicationsTable.jobId, jobsTable.id))
    .where(
      and(
        eq(jobApplicationsTable.jobId, jobId),
        eq(jobApplicationsTable.freelancerId, freelancerId)
      )
    );

  if (!jobApplication || jobApplication.length === 0) {
    return null;
  }
  const returnedJobApplication: JobApplication = {
    id: jobApplication[0].job_applications.id,
    jobId: jobApplication[0].job_applications.jobId,
    freelancerId: jobApplication[0].job_applications.freelancerId,
    status: jobApplication[0].job_applications.status as JobApplicationStatus,
    createdAt: jobApplication[0].job_applications.createdAt.toISOString(),
    job: jobApplication[0].jobs as unknown as Job,
  };
  return returnedJobApplication;
}

/**
 * Get job application Owner by application id
 * @param applicationId - the ID of the job application
 * @returns the job application
 */
export async function getJobApplicationOwnerByApplicationId(
  applicationId: number
): Promise<number | null> {
  const employerId = await db
    .select({
      employerId: jobsTable.employerId,
    })
    .from(jobApplicationsTable)
    .leftJoin(jobsTable, eq(jobApplicationsTable.jobId, jobsTable.id))
    .where(eq(jobApplicationsTable.id, applicationId));
  return employerId[0]?.employerId || null;
}

/**
 * get a job application by its ID
 *
 * @param jobApplicationId - the ID of the job application
 * @returns the job application or null if it doesn't exist
 */
export async function getJobApplicationById(
  jobApplicationId: number
): Promise<JobApplication | null> {
  const jobApplication = await db
    .select()
    .from(jobApplicationsTable)
    .where(eq(jobApplicationsTable.id, jobApplicationId));
  if (!jobApplication) {
    return null;
  }
  return jobApplication[0] as unknown as JobApplication;
}

/**
 * get all job applications by job ID
 * @param jobId - the ID of the job
 * @returns the job applications
 */
export async function getJobApplicationsByJobId(jobId: number): Promise<JobApplication[]> {
  // 1. Get job applications
  const jobApplications = await db
    .select()
    .from(jobApplicationsTable)
    .where(eq(jobApplicationsTable.jobId, jobId));

  // 2. Get unique freelancer IDs and fetch their user information
  const freelancerIds = [...new Set(jobApplications.map(app => app.freelancerId))];

  // Create a map of freelancerId to user info
  const freelancerUserMap = new Map();

  // Fetch user info for each freelancer
  await Promise.all(
    freelancerIds.map(async freelancerId => {
      const userId = await getUserIdFromFreelancerId(freelancerId);
      if (userId) {
        const user = await getUser({ userId });
        if (user) {
          freelancerUserMap.set(freelancerId, {
            firstName: user.firstName,
            lastName: user.lastName,
          });
        }
      }
    })
  );

  // 3. Combine the data
  return jobApplications.map(application => ({
    id: application.id,
    jobId: application.jobId,
    freelancerId: application.freelancerId,
    status: application.status as JobApplicationStatus,
    createdAt: application.createdAt.toISOString(),
    freelancer: freelancerUserMap.get(application.freelancerId),
  }));
}
/* export async function getJobApplicationsByJobId(
  jobId: number | number[]
): Promise<JobApplication[]> {
  if (Array.isArray(jobId)) {
    const jobApplications = await db
      .select()
      .from(jobApplicationsTable)
      .where(inArray(jobApplicationsTable.jobId, jobId));
    return jobApplications as unknown as JobApplication[];
  } else {
    const jobApplications = await db
      .select()
      .from(jobApplicationsTable)
      .where(eq(jobApplicationsTable.jobId, jobId));
    return jobApplications as unknown as JobApplication[];
  }
} */
/**
 * create a job application
 *
 * @param jobId - the ID of the job
 * @param freelancerId - the ID of the freelancer
 * @returns the job application
 */
export async function createJobApplication(
  jobId: number,
  freelancerId: number
): Promise<JobApplication> {
  const [jobApplication] = await db
    .insert(jobApplicationsTable)
    .values({
      jobId,
      freelancerId,
      status: JobApplicationStatus.Pending,
    })
    .returning();
  if (!jobApplication) {
    throw new Error('Failed to create job application');
  }
  return jobApplication as unknown as JobApplication;
}

export async function doesJobApplicationExist(jobId: number, freelancerId: number) {
  const jobApplication = await db
    .select()
    .from(jobApplicationsTable)
    .where(
      and(
        eq(jobApplicationsTable.jobId, jobId),
        eq(jobApplicationsTable.freelancerId, freelancerId)
      )
    );

  return jobApplication.length > 0 ? jobApplication[0] : null;
}

/**
 * get a job application by freelancer ID
 *
 * @param freelancerId - the ID of the freelancer
 * @param jobStatus - the status of the job
 * @returns the job application or null if it doesn't exist
 */

export async function getJobApplicationsByFreelancerId(freelancerId: number) {
  const jobApplications = await db
    .select({
      jobId: jobApplicationsTable.jobId, // Ensure column names match the table
    })
    .from(jobApplicationsTable)
    .where(eq(jobApplicationsTable.freelancerId, freelancerId));

  return jobApplications;
}

/**
 * Fetch job applications by job ID.
 *
 * @param jobId - The ID of the job to fetch applications for.
 * @returns The list of job applications.
 */
export async function fetchJobApplications(jobId: number): Promise<JobApplication[]> {
  const applications = await db
    .select()
    .from(jobApplicationsTable)
    .where(eq(jobApplicationsTable.jobId, jobId));

  return applications as unknown as JobApplication[];
}

/**
 * update status of a job application
 *
 * @param applicationId - Id of the job application we wanna update
 * @param newStatus - new status for the job application
 * @returns object indicating success or failure
 */
export async function updateJobApplicationStatus(
  applicationId: number,
  newStatus: JobApplicationStatus
) {
  try {
    await db
      .update(jobApplicationsTable)
      .set({ status: newStatus })
      .where(eq(jobApplicationsTable.id, applicationId));

    return { success: true };
  } catch (error) {
    console.error('Error updating job application status:', error);
    return { success: false, error };
  }
}

/**
 *
 * Fetches the applicants for a given jobs list
 * @param employerId
 * @returns Promise<Job[]> - A promise that resolves to an array of enriched job objects,
 *
 */
export async function fetchJobsWithApplications(employerId: number): Promise<JobCardData[]> {
  const jobs = await getEmployerJobs(employerId);
  return Promise.all(
    jobs.map(async job => {
      const applications = await fetchJobApplications(job.id);
      return {
        job: {
          ...job,
          // Convert Date objects to strings for JSON serialization
          createdAt: job.createdAt instanceof Date ? job.createdAt : new Date(job.createdAt),
          fulfilledAt: job.fulfilledAt
            ? job.fulfilledAt instanceof Date
              ? job.fulfilledAt
              : new Date(job.fulfilledAt)
            : null,
        },
        applications: applications,
        interviewedCount: applications.filter(
          app => app.status === JobApplicationStatus.Shortlisted
        ).length,
      };
    })
  );
}

/**
 *
 * get freelancers id's that are linked to a job using the same job id
 * @param jobId
 * @returns
 * @throws Error
 */
export async function getFreelancersIdsByJobId(jobId: number) {
  // Fetch job applications
  const applications = await fetchJobApplications(jobId);

  // Map applications to freelancer IDs
  const freelancerIds = applications.map(application => application.freelancerId);

  // ✅ Instead of throwing an error, return an empty array if no IDs are found
  return freelancerIds || [];
}

// ✅ Full Query: Fetch Freelancers with `account` and `user`
export async function getFreelancerDetails(freelancerIds: number[]) {
  if (freelancerIds.length === 0) {
    return [];
  }

  // Fetch Freelancer Basic Details
  const freelancers = await db
    .select({
      id: freelancersTable.id,
      accountId: freelancersTable.accountId,
      about: freelancersTable.about,
      fieldsOfExpertise: freelancersTable.fieldsOfExpertise,
      portfolio: freelancersTable.portfolio,
      workHistory: freelancersTable.workHistory,
      cvLink: freelancersTable.cvLink,
      videoLink: freelancersTable.videoLink,
      certificates: freelancersTable.certificates,
      educations: freelancersTable.educations,
      yearsOfExperience: freelancersTable.yearsOfExperience,
      hourlyRate: freelancersTable.hourlyRate,
      compensationType: freelancersTable.compensationType,
      availableForWork: freelancersTable.availableForWork,
      dateAvailableFrom: freelancersTable.dateAvailableFrom,
      hoursAvailableFrom: freelancersTable.hoursAvailableFrom,
      hoursAvailableTo: freelancersTable.hoursAvailableTo,
      accountType: accountsTable.accountType,
      slug: accountsTable.slug,
      isCreationComplete: accountsTable.isCreationComplete,
      country: accountsTable.country,
      address: accountsTable.address,
      region: accountsTable.region,
      phone: accountsTable.phone,
      websiteURL: accountsTable.websiteURL,
      socialMediaLinks: accountsTable.socialMediaLinks,
      userId: UsersTable.id,
      firstName: UsersTable.firstName,
      lastName: UsersTable.lastName,
      email: UsersTable.email,
      isVerified: UsersTable.isVerified,
      isOnboarded: UsersTable.isOnboarded,
    })
    .from(freelancersTable)
    .leftJoin(accountsTable, eq(accountsTable.id, freelancersTable.accountId))
    .leftJoin(UsersTable, eq(UsersTable.id, accountsTable.userId))
    .where(inArray(freelancersTable.id, freelancerIds));

  // Fetch Skills for the Freelancers
  const skills = await db
    .select({
      freelancerId: freelancerSkillsTable.freelancerId,
      skillId: skillsTable.id,
      label: skillsTable.label,
    })
    .from(freelancerSkillsTable)
    .leftJoin(skillsTable, eq(freelancerSkillsTable.skillId, skillsTable.id))
    .where(inArray(freelancerSkillsTable.freelancerId, freelancerIds));

  // Fetch Languages for the Freelancers
  const languages = await db
    .select({
      freelancerId: freelancerLanguagesTable.freelancerId,
      languageId: languagesTable.id,
      language: languagesTable.language,
    })
    .from(freelancerLanguagesTable)
    .leftJoin(languagesTable, eq(freelancerLanguagesTable.languageId, languagesTable.id))
    .where(inArray(freelancerLanguagesTable.freelancerId, freelancerIds));

  // Attach Skills and Languages to the Freelancer Data
  const freelancersWithSkillsAndLanguages = freelancers.map(freelancer => ({
    ...freelancer,
    skills: skills
      .filter(s => s.freelancerId === freelancer.id)
      .map(({ skillId, label }) => ({ skillId, label })),
    languages: languages
      .filter(l => l.freelancerId === freelancer.id)
      .map(({ languageId, language }) => ({ languageId, language })),
  }));

  return freelancersWithSkillsAndLanguages;
}

export async function updateJobStatus(jobId: number, newStatus: string): Promise<void> {
  try {
    await db.update(jobsTable).set({ status: newStatus }).where(eq(jobsTable.id, jobId));
  } catch (error) {
    console.error('Error updating job status:', error);
    throw new Error('Failed to update job status.');
  }
}

export async function getApplicationMatchScore(
  jobId: number,
  freelancerId: number
): Promise<number> {
  try {
    // console.log(
    //   `Calculating match score for job ${jobId} and freelancer ${freelancerId}`
    // );

    // 1. Get freelancer data
    const freelancer = await db
      .select({
        id: freelancersTable.id,
        accountId: freelancersTable.accountId,
        about: freelancersTable.about,
        fieldsOfExpertise: freelancersTable.fieldsOfExpertise,
        yearsOfExperience: freelancersTable.yearsOfExperience,
        preferredProjectTypes: freelancersTable.preferredProjectTypes,
        availableForWork: freelancersTable.availableForWork,
        hoursAvailableFrom: freelancersTable.hoursAvailableFrom,
        hoursAvailableTo: freelancersTable.hoursAvailableTo,
        country: accountsTable.country,
      })
      .from(freelancersTable)
      .leftJoin(accountsTable, eq(accountsTable.id, freelancersTable.accountId))
      .where(eq(freelancersTable.id, freelancerId))
      .limit(1);

    if (!freelancer || freelancer.length === 0) {
      console.error(`Freelancer with ID ${freelancerId} not found`);
      return 0;
    }

    const freelancerData = freelancer[0];

    // 2. Get freelancer skills
    const freelancerSkills = await db
      .select({
        skillId: freelancerSkillsTable.skillId,
        yearsOfExperience: freelancerSkillsTable.yearsOfExperience,
        label: skillsTable.label,
      })
      .from(freelancerSkillsTable)
      .leftJoin(skillsTable, eq(skillsTable.id, freelancerSkillsTable.skillId))
      .where(eq(freelancerSkillsTable.freelancerId, freelancerId));

    // 3. Get job data
    const job = await db
      .select({
        id: jobsTable.id,
        title: jobsTable.title,
        description: jobsTable.description,
        budget: jobsTable.budget,
        workingHoursPerWeek: jobsTable.workingHoursPerWeek,
        locationPreference: jobsTable.locationPreference,
        projectType: jobsTable.projectType,
        experienceLevel: jobsTable.experienceLevel,
        createdAt: jobsTable.createdAt,
      })
      .from(jobsTable)
      .where(eq(jobsTable.id, jobId))
      .limit(1);

    if (!job || job.length === 0) {
      console.error(`Job with ID ${jobId} not found`);
      return 0;
    }

    const jobData = job[0];

    // 4. Get job skills
    const jobSkills = await db
      .select({
        skillId: jobSkillsTable.skillId,
        isStarred: jobSkillsTable.isStarred,
        label: skillsTable.label,
      })
      .from(jobSkillsTable)
      .leftJoin(skillsTable, eq(skillsTable.id, jobSkillsTable.skillId))
      .where(eq(jobSkillsTable.jobId, jobId));

    // 5. Calculate match score
    const matchScore = calculateMatchScore(freelancerData, freelancerSkills, jobData, jobSkills);

    return matchScore;
  } catch (error) {
    console.error(`Error calculating match score: ${error}`);
    return 0;
  }
}
