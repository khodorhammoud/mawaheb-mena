import { eq, aliasedTable, and, desc, sql, count } from 'drizzle-orm';
import { db } from '@mawaheb/db/server';
import {
  accountsTable,
  UsersTable,
  freelancersTable,
  employersTable,
  jobApplicationsTable,
  jobsTable,
  jobCategoriesTable,
  skillsTable,
  jobSkillsTable,
} from '@mawaheb/db';
import { AccountType, AccountStatus, JobApplicationStatus, JobStatus } from '@mawaheb/db/enums';
import type { Account } from '~/common/admin-pages/tables/AccountsTable';
import {
  Portfolio,
  Certificate,
  Education,
  WorkHistory,
  FreelancerData,
  JobApplication,
} from '~/common/admin-pages/types';
import { getApplicationMatchScore } from '~/servers/job.server';

// Types
type DbJobApplication = typeof jobApplicationsTable.$inferSelect;
type DbJob = typeof jobsTable.$inferSelect;
type DbUser = typeof UsersTable.$inferSelect;
type DbAccount = typeof accountsTable.$inferSelect;

export interface Job {
  id: number;
  title: string;
  status: JobStatus;
  createdAt: Date;
  employerId: number;
  applicationCount: number;
}

export interface QueryResult {
  application: DbJobApplication;
  job: DbJob;
  freelancer: {
    user: DbUser;
    account: DbAccount;
  };
  employer: {
    user: DbUser;
    account: DbAccount;
  };
}

// Get all freelancer accounts
export async function getFreelancerAccounts(): Promise<Account[]> {
  const data = await db
    .select({
      id: freelancersTable.id,
      user: {
        firstName: UsersTable.firstName,
        lastName: UsersTable.lastName,
        email: UsersTable.email,
      },
      account: {
        accountStatus: accountsTable.accountStatus,
      },
    })
    .from(freelancersTable)
    .leftJoin(accountsTable, eq(freelancersTable.accountId, accountsTable.id))
    .leftJoin(UsersTable, eq(accountsTable.userId, UsersTable.id))
    .where(eq(accountsTable.accountType, AccountType.Freelancer));

  return data.map(row => ({
    id: row.id,
    account: {
      user: row.user,
      accountStatus: row.account.accountStatus as AccountStatus,
    },
  }));
}

// Get all employer accounts
export async function getEmployerAccounts(): Promise<Account[]> {
  const data = await db
    .select({
      id: employersTable.id,
      user: {
        firstName: UsersTable.firstName,
        lastName: UsersTable.lastName,
        email: UsersTable.email,
      },
      account: {
        accountStatus: accountsTable.accountStatus,
      },
    })
    .from(employersTable)
    .leftJoin(accountsTable, eq(employersTable.accountId, accountsTable.id))
    .leftJoin(UsersTable, eq(accountsTable.userId, UsersTable.id))
    .where(eq(accountsTable.accountType, AccountType.Employer));

  return data.map(row => ({
    id: row.id,
    account: {
      user: row.user,
      accountStatus: row.account.accountStatus as AccountStatus,
    },
  }));
}

// Get applications with filters
export async function getApplications(params: {
  status?: string;
  employerId?: string;
  freelancerId?: string;
}) {
  // Build a more direct query that doesn't rely on SQL wildcards
  const query = db
    .select({
      application: {
        id: jobApplicationsTable.id,
        status: jobApplicationsTable.status,
        createdAt: jobApplicationsTable.createdAt,
        jobId: jobApplicationsTable.jobId,
        freelancerId: jobApplicationsTable.freelancerId,
      },
      job: {
        id: jobsTable.id,
        title: jobsTable.title,
        description: jobsTable.description,
        budget: jobsTable.budget,
        workingHoursPerWeek: jobsTable.workingHoursPerWeek,
        locationPreference: jobsTable.locationPreference,
        projectType: jobsTable.projectType,
        experienceLevel: jobsTable.experienceLevel,
        createdAt: jobsTable.createdAt,
        employerId: jobsTable.employerId,
      },
      // Freelancer data
      freelancerId: freelancersTable.id,
      freelancerAccountId: freelancersTable.accountId,
      freelancerFirstName: UsersTable.firstName,
      freelancerLastName: UsersTable.lastName,
      freelancerEmail: UsersTable.email,
      freelancerAccountStatus: accountsTable.accountStatus,
      // Don't select employers table fields here - we'll get them in a separate query
    })
    .from(jobApplicationsTable)
    .leftJoin(jobsTable, eq(jobApplicationsTable.jobId, jobsTable.id))
    .leftJoin(freelancersTable, eq(jobApplicationsTable.freelancerId, freelancersTable.id))
    .leftJoin(accountsTable, eq(freelancersTable.accountId, accountsTable.id))
    .leftJoin(UsersTable, eq(accountsTable.userId, UsersTable.id));

  // Add conditions
  const conditions = [];
  if (params.status) {
    conditions.push(eq(jobApplicationsTable.status, params.status as JobApplicationStatus));
  }
  if (params.employerId) {
    conditions.push(eq(jobsTable.employerId, parseInt(params.employerId)));
  }
  if (params.freelancerId) {
    conditions.push(eq(jobApplicationsTable.freelancerId, parseInt(params.freelancerId)));
  }

  // Apply filters if any
  const finalQuery = conditions.length > 0 ? query.where(and(...conditions)) : query;

  try {
    const applications = await finalQuery;

    // Now get employer information in a separate query
    const employerInfoPromises = applications.map(async app => {
      if (!app.job.employerId) return null;

      const employerInfo = await db
        .select({
          employerId: employersTable.id,
          employerFirstName: UsersTable.firstName,
          employerLastName: UsersTable.lastName,
          employerEmail: UsersTable.email,
          employerAccountStatus: accountsTable.accountStatus,
        })
        .from(employersTable)
        .where(eq(employersTable.id, app.job.employerId))
        .leftJoin(accountsTable, eq(employersTable.accountId, accountsTable.id))
        .leftJoin(UsersTable, eq(accountsTable.userId, UsersTable.id))
        .limit(1);

      return employerInfo[0];
    });

    const employerInfos = await Promise.all(employerInfoPromises);

    // Calculate match scores for each application
    const matchScorePromises = applications.map(async app => {
      try {
        return await getApplicationMatchScore(app.job.id, app.freelancerId);
      } catch (error) {
        console.error(`Error calculating match score: ${error}`);
        return 0;
      }
    });

    const matchScores = await Promise.all(matchScorePromises);

    // Combine the data
    const results = applications.map((app, index) => {
      const employerInfo = employerInfos[index];
      const matchScore = matchScores[index];

      return {
        application: {
          ...app.application,
          createdAt:
            app.application.createdAt instanceof Date
              ? app.application.createdAt.toISOString()
              : app.application.createdAt,
          matchScore,
        },
        job: {
          ...app.job,
          createdAt:
            app.job.createdAt instanceof Date ? app.job.createdAt.toISOString() : app.job.createdAt,
        },
        freelancer: {
          user: {
            firstName: app.freelancerFirstName,
            lastName: app.freelancerLastName,
            email: app.freelancerEmail,
          },
          account: {
            accountStatus: app.freelancerAccountStatus,
          },
        },
        employer: {
          user: {
            firstName: employerInfo?.employerFirstName || 'Unknown',
            lastName: employerInfo?.employerLastName || 'Employer',
            email: employerInfo?.employerEmail || '',
          },
          account: {
            accountStatus: employerInfo?.employerAccountStatus || 'unknown',
          },
        },
      };
    });

    return results;
  } catch (error) {
    console.error('DEBUG - Error executing query:', error);
    throw error;
  }
}

// ... existing getApplicationDetails and updateApplicationStatus functions ...

// Get employer details with jobs and application counts
export async function getEmployerDetails(employerId: string) {
  const employerDetails = await db
    .select({
      employer: employersTable,
      account: accountsTable,
      user: UsersTable,
    })
    .from(employersTable)
    .where(eq(employersTable.id, parseInt(employerId)))
    .leftJoin(accountsTable, eq(employersTable.accountId, accountsTable.id))
    .leftJoin(UsersTable, eq(accountsTable.userId, UsersTable.id));

  if (employerDetails.length === 0) {
    return null;
  }

  // Get all jobs
  const jobs = await db
    .select({
      id: jobsTable.id,
      title: jobsTable.title,
      status: jobsTable.status,
      createdAt: jobsTable.createdAt,
      employerId: jobsTable.employerId,
    })
    .from(jobsTable)
    .where(eq(jobsTable.employerId, parseInt(employerId)));

  // Get application counts for each job
  const applicationCounts = await Promise.all(
    jobs.map(async job => {
      const result = await db
        .select({ count: count() })
        .from(jobApplicationsTable)
        .where(eq(jobApplicationsTable.jobId, job.id));
      return {
        ...job,
        status: job.status as JobStatus,
        applicationCount: Number(result[0].count) || 0,
      } as Job;
    })
  );

  return {
    employer: employerDetails[0],
    jobs: applicationCounts,
    jobCount: jobs.length,
  };
}

// Update employer account status
export async function updateEmployerAccountStatus(employerId: string, status: AccountStatus) {
  try {
    // Get the account ID for this employer
    const employer = await db
      .select({ accountId: employersTable.accountId })
      .from(employersTable)
      .where(eq(employersTable.id, parseInt(employerId)));

    if (employer.length === 0) {
      return { success: false, error: 'Employer not found' };
    }

    // Update the account status
    await db
      .update(accountsTable)
      .set({ accountStatus: status })
      .where(eq(accountsTable.id, employer[0].accountId));

    return { success: true };
  } catch (error) {
    console.error('Error updating account status:', error);
    return { success: false, error: 'Failed to update account status' };
  }
}

export interface Application {
  application: {
    id: number;
    status: JobApplicationStatus;
    createdAt: Date | string;
    matchScore?: number;
  };
  job: {
    id: number;
    title: string;
  };
  freelancer: {
    id: number;
    user: {
      firstName: string;
      lastName: string;
      email: string;
    };
    account: {
      id: number;
      accountStatus: AccountStatus;
    };
  };
}

export async function getEmployerApplications(employerId: string) {
  // Get all applications for all jobs of this employer
  const applications = await db
    .select({
      job_applications: jobApplicationsTable,
      jobs: jobsTable,
      freelancers: freelancersTable,
      users: UsersTable,
      accounts: accountsTable,
    })
    .from(jobApplicationsTable)
    .leftJoin(jobsTable, eq(jobApplicationsTable.jobId, jobsTable.id))
    .leftJoin(freelancersTable, eq(jobApplicationsTable.freelancerId, freelancersTable.id))
    .leftJoin(accountsTable, eq(freelancersTable.accountId, accountsTable.id))
    .leftJoin(UsersTable, eq(accountsTable.userId, UsersTable.id))
    .where(eq(jobsTable.employerId, parseInt(employerId)));

  // Map applications and calculate match scores
  const mappedApplications = applications.map(
    (app): Application => ({
      application: {
        id: app.job_applications.id,
        status: app.job_applications.status as JobApplicationStatus,
        createdAt:
          app.job_applications.createdAt && typeof app.job_applications.createdAt === 'object'
            ? (app.job_applications.createdAt as Date).toISOString()
            : app.job_applications.createdAt,
      },
      job: {
        id: app.jobs.id,
        title: app.jobs.title,
      },
      freelancer: {
        id: app.freelancers.id,
        user: {
          firstName: app.users.firstName || '',
          lastName: app.users.lastName || '',
          email: app.users.email || '',
        },
        account: {
          id: app.accounts.id,
          accountStatus: app.accounts.accountStatus as AccountStatus,
        },
      },
    })
  );

  // Calculate match scores for each application
  for (const app of mappedApplications) {
    try {
      const matchScore = await getApplicationMatchScore(app.job.id, app.freelancer.id);
      app.application.matchScore = matchScore;
    } catch (error) {
      console.error(`Error calculating match score: ${error}`);
      app.application.matchScore = 0; // Add a default value instead of undefined
    }
  }

  return mappedApplications;
}

export async function getJobApplications(employerId: string, jobId: string) {
  // Get applications for the specific job
  const applications = await db
    .select({
      job_applications: jobApplicationsTable,
      jobs: jobsTable,
      freelancers: freelancersTable,
      users: UsersTable,
      accounts: accountsTable,
    })
    .from(jobApplicationsTable)
    .where(eq(jobApplicationsTable.jobId, parseInt(jobId)))
    .leftJoin(jobsTable, eq(jobApplicationsTable.jobId, jobsTable.id))
    .leftJoin(freelancersTable, eq(jobApplicationsTable.freelancerId, freelancersTable.id))
    .leftJoin(accountsTable, eq(freelancersTable.accountId, accountsTable.id))
    .leftJoin(UsersTable, eq(accountsTable.userId, UsersTable.id));

  // Get job details
  const jobDetails = await db
    .select()
    .from(jobsTable)
    .where(and(eq(jobsTable.id, parseInt(jobId)), eq(jobsTable.employerId, parseInt(employerId))));

  if (jobDetails.length === 0) {
    return null;
  }

  return {
    selectedJob: jobDetails[0],
    applications: applications.map(
      (app): Application => ({
        application: {
          id: app.job_applications.id,
          status: app.job_applications.status as JobApplicationStatus,
          createdAt: app.job_applications.createdAt,
        },
        job: {
          id: app.jobs.id,
          title: app.jobs.title,
        },
        freelancer: {
          id: app.freelancers.id,
          user: {
            firstName: app.users.firstName || '',
            lastName: app.users.lastName || '',
            email: app.users.email || '',
          },
          account: {
            id: app.accounts.id,
            accountStatus: app.accounts.accountStatus as AccountStatus,
          },
        },
      })
    ),
  };
}

/** Helper to safely parse JSON from DB fields */
export function safeParseJSON<T>(jsonString: string | null | undefined, defaultValue: T): T {
  if (!jsonString) return defaultValue;

  // If it's already an object or array, return it directly
  if (typeof jsonString === 'object') {
    return jsonString as unknown as T;
  }

  try {
    return JSON.parse(jsonString) as T;
  } catch (error) {
    console.error('Error parsing JSON:', error);
    console.error('Failed to parse:', jsonString);
    return defaultValue;
  }
}

/**
 * Fetch a single freelancer row (including account + user)
 */
export async function getFreelancerDetails(freelancerId: number) {
  const details = await db
    .select({
      freelancer: freelancersTable,
      account: accountsTable,
      user: UsersTable,
    })
    .from(freelancersTable)
    .where(eq(freelancersTable.id, freelancerId))
    .leftJoin(accountsTable, eq(freelancersTable.accountId, accountsTable.id))
    .leftJoin(UsersTable, eq(accountsTable.userId, UsersTable.id));

  if (details.length === 0) {
    return null;
  }
  return details[0]; // Return the joined row
}

/**
 * Get all job applications for a freelancer
 */
export async function getFreelancerApplications(freelancerId: number) {
  const apps = await db
    .select({
      id: jobApplicationsTable.id,
      jobId: jobApplicationsTable.jobId,
      status: jobApplicationsTable.status,
      createdAt: jobApplicationsTable.createdAt,
      freelancerId: jobApplicationsTable.freelancerId,
      jobTitle: jobsTable.title,
      // Include employer ID for linking
      employerId: jobsTable.employerId,
    })
    .from(jobApplicationsTable)
    .where(eq(jobApplicationsTable.freelancerId, freelancerId))
    .leftJoin(jobsTable, eq(jobApplicationsTable.jobId, jobsTable.id));

  // Get employer information separately for each application
  const appsWithEmployerInfo = await Promise.all(
    apps.map(async app => {
      if (!app.employerId) return app;

      // Get employer info
      const employerInfo = await db
        .select({
          companyName: employersTable.companyName,
          accountStatus: accountsTable.accountStatus,
        })
        .from(employersTable)
        .where(eq(employersTable.id, app.employerId))
        .leftJoin(accountsTable, eq(employersTable.accountId, accountsTable.id))
        .limit(1);

      if (employerInfo.length > 0) {
        return {
          ...app,
          employerFirstName: employerInfo[0].companyName || '',
          employerLastName: '',
          employerEmail: '',
          employerAccountStatus: employerInfo[0].accountStatus || '',
        };
      }

      return app;
    })
  );

  // Calculate match scores for each application
  const appsWithScores = await Promise.all(
    appsWithEmployerInfo.map(async app => {
      try {
        const matchScore = await getApplicationMatchScore(app.jobId, freelancerId);
        return {
          ...app,
          matchScore,
        };
      } catch (error) {
        console.error(`Error calculating match score: ${error}`);
        return {
          ...app,
          matchScore: 0,
        };
      }
    })
  );

  return appsWithScores;
}

/**
 * Update the account status for a freelancer
 */
export async function updateFreelancerAccountStatus(
  freelancerId: number,
  newStatus: AccountStatus
) {
  // Find the account ID for this freelancer
  const freelancer = await db
    .select({ accountId: freelancersTable.accountId })
    .from(freelancersTable)
    .where(eq(freelancersTable.id, freelancerId));

  if (freelancer.length === 0) {
    return { success: false, error: 'Freelancer not found' };
  }

  // Update the account status
  await db
    .update(accountsTable)
    .set({ accountStatus: newStatus })
    .where(eq(accountsTable.id, freelancer[0].accountId));

  return { success: true };
}

export async function getJobDetails(jobId: number) {
  const jobDetails = await db
    .select({
      job: {
        id: jobsTable.id,
        title: jobsTable.title,
        description: jobsTable.description,
        budget: jobsTable.budget,
        status: jobsTable.status,
        createdAt: jobsTable.createdAt,
        workingHoursPerWeek: jobsTable.workingHoursPerWeek,
        locationPreference: jobsTable.locationPreference,
        projectType: jobsTable.projectType,
        experienceLevel: jobsTable.experienceLevel,
        employerAccountStatus: accountsTable.accountStatus,
      },
      employer: {
        id: employersTable.id,
        companyName: employersTable.companyName,
        // companyEmail: employersTable.companyEmail,
      },
      user: {
        firstName: UsersTable.firstName,
        lastName: UsersTable.lastName,
        email: UsersTable.email,
      },
      category: {
        id: jobCategoriesTable.id,
        label: jobCategoriesTable.label,
      },
    })
    .from(jobsTable)
    .where(eq(jobsTable.id, jobId))
    .leftJoin(employersTable, eq(jobsTable.employerId, employersTable.id))
    .leftJoin(accountsTable, eq(employersTable.accountId, accountsTable.id))
    .leftJoin(UsersTable, eq(accountsTable.userId, UsersTable.id))
    .leftJoin(jobCategoriesTable, eq(jobsTable.jobCategoryId, jobCategoriesTable.id));

  // Return the first row or `null` if none found
  if (jobDetails.length === 0) {
    return null;
  }

  // Format dates before returning
  const result = jobDetails[0];
  if (result.job.createdAt && typeof result.job.createdAt === 'object') {
    // Use type assertion to handle the mixed type
    result.job = {
      ...result.job,
      createdAt: (result.job.createdAt as Date).toISOString() as unknown as Date,
    };
  }

  return result;
}

export async function getSkillsForJob(jobId: number) {
  const skills = await db
    .select({
      id: skillsTable.id,
      label: skillsTable.label,
      isStarred: jobSkillsTable.isStarred,
    })
    .from(jobSkillsTable)
    .leftJoin(skillsTable, eq(jobSkillsTable.skillId, skillsTable.id))
    .where(eq(jobSkillsTable.jobId, jobId));

  return skills;
}

export async function getJobApplicationsBasic(jobId: number) {
  // Create alias for employer account table
  const employerAccountTable = aliasedTable(accountsTable, 'employer_account');

  const applications = await db
    .select({
      application: {
        id: jobApplicationsTable.id,
        status: jobApplicationsTable.status,
        createdAt: jobApplicationsTable.createdAt,
      },
      freelancer: {
        id: freelancersTable.id,
        hourlyRate: freelancersTable.hourlyRate,
        yearsOfExperience: freelancersTable.yearsOfExperience,
      },
      account: {
        id: accountsTable.id,
        country: accountsTable.country,
        accountStatus: accountsTable.accountStatus,
      },
      user: {
        id: UsersTable.id,
        firstName: UsersTable.firstName,
        lastName: UsersTable.lastName,
        email: UsersTable.email,
      },
      employer: {
        id: employersTable.id,
        companyName: employersTable.companyName,
      },
      employerAccount: {
        accountStatus: employerAccountTable.accountStatus,
      },
      job: {
        id: jobsTable.id,
        title: jobsTable.title,
        employerAccountStatus: employerAccountTable.accountStatus,
      },
    })
    .from(jobApplicationsTable)
    .where(eq(jobApplicationsTable.jobId, jobId))
    .leftJoin(freelancersTable, eq(jobApplicationsTable.freelancerId, freelancersTable.id))
    .leftJoin(accountsTable, eq(freelancersTable.accountId, accountsTable.id))
    .leftJoin(UsersTable, eq(accountsTable.userId, UsersTable.id))
    .leftJoin(jobsTable, eq(jobApplicationsTable.jobId, jobsTable.id))
    .leftJoin(employersTable, eq(jobsTable.employerId, employersTable.id))
    .leftJoin(employerAccountTable, eq(employersTable.accountId, employerAccountTable.id));

  // Calculate match scores for each application
  const applicationsWithScores = await Promise.all(
    applications.map(async app => {
      try {
        const matchScore = await getApplicationMatchScore(jobId, app.freelancer.id);
        return {
          ...app,
          application: {
            ...app.application,
            matchScore,
            createdAt:
              app.application.createdAt && typeof app.application.createdAt === 'object'
                ? (app.application.createdAt as Date).toISOString()
                : app.application.createdAt,
          },
        };
      } catch (error) {
        console.error(`Error calculating match score: ${error}`);
        return {
          ...app,
          application: {
            ...app.application,
            matchScore: 0, // Return a default value of 0 instead of undefined
            createdAt:
              app.application.createdAt && typeof app.application.createdAt === 'object'
                ? (app.application.createdAt as Date).toISOString()
                : app.application.createdAt,
          },
        };
      }
    })
  );

  return applicationsWithScores;
}

/**
 *
 * ### The 2 new functions for your "Jobs List"
 *
 * We'll replicate the queries from the route:
 * 1) getBasicJobs() -> "First get jobs with their basic info"
 * 2) getAllApplications() -> "Then get all applications with freelancer info"
 */

// 1) getBasicJobs
export async function getBasicJobs() {
  // First get jobs with their basic info
  const jobs = await db
    .select({
      jobId: jobsTable.id,
      jobTitle: jobsTable.title,
      jobBudget: jobsTable.budget,
      jobStatus: jobsTable.status,
      jobCreatedAt: jobsTable.createdAt,
      jobWorkingHours: jobsTable.workingHoursPerWeek,
      jobLocation: jobsTable.locationPreference,
      employerId: employersTable.id,
      employerFirstName: UsersTable.firstName,
      employerLastName: UsersTable.lastName,
      employerAccountStatus: accountsTable.accountStatus,
      categoryId: jobCategoriesTable.id,
      categoryLabel: jobCategoriesTable.label,
      applicationCount: sql<number>`count(${jobApplicationsTable.id})::int`,
    })
    .from(jobsTable)
    .leftJoin(employersTable, eq(jobsTable.employerId, employersTable.id))
    .leftJoin(accountsTable, eq(employersTable.accountId, accountsTable.id))
    .leftJoin(UsersTable, eq(accountsTable.userId, UsersTable.id))
    .leftJoin(jobCategoriesTable, eq(jobsTable.jobCategoryId, jobCategoriesTable.id))
    .leftJoin(jobApplicationsTable, eq(jobsTable.id, jobApplicationsTable.jobId))
    .groupBy(
      jobsTable.id,
      jobsTable.title,
      jobsTable.budget,
      jobsTable.status,
      jobsTable.createdAt,
      jobsTable.workingHoursPerWeek,
      jobsTable.locationPreference,
      employersTable.id,
      UsersTable.firstName,
      UsersTable.lastName,
      accountsTable.accountStatus,
      jobCategoriesTable.id,
      jobCategoriesTable.label
    )
    .orderBy(jobsTable.createdAt);

  return jobs;
}

// 2) getAllApplications
export async function getAllApplications() {
  // First get all applications with freelancer info
  const applications = await db
    .select({
      id: jobApplicationsTable.id,
      status: jobApplicationsTable.status,
      createdAt: jobApplicationsTable.createdAt,
      jobId: jobApplicationsTable.jobId,
      freelancerId: freelancersTable.id,
      freelancerFirstName: UsersTable.firstName,
      freelancerLastName: UsersTable.lastName,
      // Adding job employer info for direct access
      jobEmployerId: jobsTable.employerId,
    })
    .from(jobApplicationsTable)
    .leftJoin(jobsTable, eq(jobApplicationsTable.jobId, jobsTable.id))
    .leftJoin(freelancersTable, eq(jobApplicationsTable.freelancerId, freelancersTable.id))
    .leftJoin(accountsTable, eq(freelancersTable.accountId, accountsTable.id))
    .leftJoin(UsersTable, eq(accountsTable.userId, UsersTable.id));

  // Calculate match scores for each application
  const applicationsWithScores = await Promise.all(
    applications.map(async app => {
      let matchScore = 0;

      try {
        if (!app.jobId || !app.freelancerId) {
          console.warn(
            `Missing jobId (${app.jobId}) or freelancerId (${app.freelancerId}) for application ${app.id}`
          );
        } else {
          matchScore = await getApplicationMatchScore(app.jobId, app.freelancerId);
        }
      } catch (error) {
        console.error(`Error calculating match score for application ${app.id}:`, error);
      }

      return {
        ...app,
        matchScore, // Include matchScore as a top-level property
      };
    })
  );

  return applicationsWithScores;
}
