// app/servers/test.server.ts
import { db } from '@mawaheb/db/server';
import { jobsTable, jobSkillsTable, jobApplicationsTable } from '@mawaheb/db';
import { eq, inArray, sql } from 'drizzle-orm';

const TAG = '[test.server]';

/** ─────────────────────────────────────────────────────────────
 * Small helpers
 * ───────────────────────────────────────────────────────────── */

export async function countEmployerJobs(employerId: number): Promise<number> {
  const [{ c }] = await db
    .select({ c: sql<number>`cast(count(*) as int)` })
    .from(jobsTable)
    .where(eq(jobsTable.employerId, employerId));
  const num = Number(c ?? 0);
  console.log(`${TAG} countEmployerJobs employer=${employerId} ->`, num);
  return num;
}

/** Count job applications for all jobs that belong to this employer */
export async function countEmployerApplications(employerId: number): Promise<number> {
  const jobIds = (
    await db
      .select({ id: jobsTable.id })
      .from(jobsTable)
      .where(eq(jobsTable.employerId, employerId))
  ).map(r => r.id);

  console.log(`${TAG} countEmployerApplications employer=${employerId} jobIds=`, jobIds);

  if (jobIds.length === 0) {
    console.log(`${TAG} countEmployerApplications employer=${employerId} -> 0 (no jobs)`);
    return 0;
  }

  const [{ c }] = await db
    .select({ c: sql<number>`cast(count(*) as int)` })
    .from(jobApplicationsTable)
    .where(inArray(jobApplicationsTable.jobId, jobIds));

  const num = Number(c ?? 0);
  console.log(`${TAG} countEmployerApplications employer=${employerId} ->`, num);
  return num;
}

/** Seed N jobs for an employer (useful for local testing) */
export async function seedEmployerJobs(
  employerId: number,
  count: number,
  opts?: { status?: string }
): Promise<number> {
  if (count <= 0) {
    console.log(`${TAG} seedEmployerJobs employer=${employerId} count=${count} (skip)`);
    return 0;
  }

  console.log(
    `${TAG} seedEmployerJobs employer=${employerId} count=${count} status=${opts?.status ?? 'active'}`
  );

  // Add any non-nullable columns your schema requires here (e.g., jobCategoryId if NOT NULL)
  await db.insert(jobsTable).values(
    Array.from({ length: count }).map((_, i) => ({
      employerId,
      title: `E2E Job ${i + 1}`,
      description: 'E2E seeded job',
      status: (opts?.status as any) ?? 'active',
    }))
  );

  console.log(`${TAG} seedEmployerJobs employer=${employerId} -> inserted=${count}`);
  return count;
}

/** ─────────────────────────────────────────────────────────────
 * Resets
 * ───────────────────────────────────────────────────────────── */

/**
 * Delete ONLY job applications that belong to this employer (via employer's jobIds).
 * Timesheets will cascade (your schema references jobApplications with onDelete: 'cascade').
 */
export async function resetEmployerApplicationsToZero(
  employerId: number
): Promise<{ beforeAppCount: number; deletedApps: number; remainingApps: number }> {
  return db.transaction(async tx => {
    // Find this employer's jobs
    const jobIds = (
      await tx
        .select({ id: jobsTable.id })
        .from(jobsTable)
        .where(eq(jobsTable.employerId, employerId))
    ).map(r => r.id);

    console.log(
      `${TAG} resetEmployerApplicationsToZero employer=${employerId} jobIds(before)=`,
      jobIds
    );

    if (jobIds.length === 0) {
      console.log(`${TAG} resetEmployerApplicationsToZero employer=${employerId} -> no jobs`);
      return { beforeAppCount: 0, deletedApps: 0, remainingApps: 0 };
    }

    const [{ c: before }] = await tx
      .select({ c: sql<number>`cast(count(*) as int)` })
      .from(jobApplicationsTable)
      .where(inArray(jobApplicationsTable.jobId, jobIds));

    console.log(
      `${TAG} resetEmployerApplicationsToZero employer=${employerId} beforeApps=`,
      Number(before ?? 0)
    );

    const deleted = await tx
      .delete(jobApplicationsTable)
      .where(inArray(jobApplicationsTable.jobId, jobIds))
      .returning({ id: jobApplicationsTable.id });

    console.log(
      `${TAG} resetEmployerApplicationsToZero employer=${employerId} deletedApps=`,
      deleted.length
    );

    const [{ c: after }] = await tx
      .select({ c: sql<number>`cast(count(*) as int)` })
      .from(jobApplicationsTable)
      .where(inArray(jobApplicationsTable.jobId, jobIds));

    const result = {
      beforeAppCount: Number(before ?? 0),
      deletedApps: deleted.length,
      remainingApps: Number(after ?? 0),
    };

    console.log(`${TAG} resetEmployerApplicationsToZero employer=${employerId} result=`, result);
    return result;
  });
}

/**
 * Delete ALL employer-owned data under jobs:
 * 1) job applications (and cascading timesheets)
 * 2) job skills
 * 3) jobs
 * Returns rich debug info.
 */
export async function resetEmployerJobsToZeroWithDebug(employerId: number): Promise<{
  beforeJobIds: number[];
  beforeApps: number;
  beforeJobs: number;
  deletedApps: number;
  deletedJobSkills: number;
  deletedJobs: number;
  remainingApps: number;
  remainingJobs: number;
}> {
  return db.transaction(async tx => {
    const beforeJobs = await tx
      .select({ id: jobsTable.id })
      .from(jobsTable)
      .where(eq(jobsTable.employerId, employerId));
    const jobIds = beforeJobs.map(r => r.id);

    console.log(
      `${TAG} resetEmployerJobsToZeroWithDebug employer=${employerId} jobIds(before)=`,
      jobIds
    );

    // counts before
    const [{ c: beforeJobsCount }] = await tx
      .select({ c: sql<number>`cast(count(*) as int)` })
      .from(jobsTable)
      .where(eq(jobsTable.employerId, employerId));

    let beforeAppsCount = 0;
    if (jobIds.length) {
      const [{ c }] = await tx
        .select({ c: sql<number>`cast(count(*) as int)` })
        .from(jobApplicationsTable)
        .where(inArray(jobApplicationsTable.jobId, jobIds));
      beforeAppsCount = Number(c ?? 0);
    }

    console.log(
      `${TAG} resetEmployerJobsToZeroWithDebug employer=${employerId} beforeJobs=${Number(
        beforeJobsCount ?? 0
      )} beforeApps=${beforeAppsCount}`
    );

    // delete children first
    let deletedAppsCount = 0;
    if (jobIds.length) {
      const deletedApps = await tx
        .delete(jobApplicationsTable)
        .where(inArray(jobApplicationsTable.jobId, jobIds))
        .returning({ id: jobApplicationsTable.id });
      deletedAppsCount = deletedApps.length;
    }

    let deletedJobSkillsCount = 0;
    if (jobIds.length) {
      const deletedSkills = await tx
        .delete(jobSkillsTable)
        .where(inArray(jobSkillsTable.jobId, jobIds))
        .returning({ id: jobSkillsTable.id });
      deletedJobSkillsCount = deletedSkills.length;
    }

    // delete parents
    let deletedJobsCount = 0;
    if (jobIds.length) {
      const deletedJobs = await tx
        .delete(jobsTable)
        .where(inArray(jobsTable.id, jobIds))
        .returning({ id: jobsTable.id });
      deletedJobsCount = deletedJobs.length;
    }

    // counts after
    const [{ c: remainingJobs }] = await tx
      .select({ c: sql<number>`cast(count(*) as int)` })
      .from(jobsTable)
      .where(eq(jobsTable.employerId, employerId));

    let remainingApps = 0;
    if (jobIds.length) {
      const [{ c }] = await tx
        .select({ c: sql<number>`cast(count(*) as int)` })
        .from(jobApplicationsTable)
        .where(inArray(jobApplicationsTable.jobId, jobIds));
      remainingApps = Number(c ?? 0);
    }

    const result = {
      beforeJobIds: jobIds,
      beforeApps: beforeAppsCount,
      beforeJobs: Number(beforeJobsCount ?? 0),
      deletedApps: deletedAppsCount,
      deletedJobSkills: deletedJobSkillsCount,
      deletedJobs: deletedJobsCount,
      remainingApps,
      remainingJobs: Number(remainingJobs ?? 0),
    };

    console.log(`${TAG} resetEmployerJobsToZeroWithDebug employer=${employerId} result=`, result);
    return result;
  });
}

/** Backward-compatible simple reset that only returns remaining job count */
export async function resetEmployerJobsToZero(employerId: number): Promise<number> {
  const res = await resetEmployerJobsToZeroWithDebug(employerId);
  console.log(
    `${TAG} resetEmployerJobsToZero employer=${employerId} -> remainingJobs=${res.remainingJobs} remainingApps=${res.remainingApps}`
  );
  return res.remainingJobs;
}
