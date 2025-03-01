import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { eq } from "drizzle-orm";
import { db } from "~/db/drizzle/connector";
import {
  jobApplicationsTable,
  jobsTable,
  freelancersTable,
  UsersTable,
  accountsTable,
  employersTable,
} from "~/db/drizzle/schemas/schema";
import { JobApplicationStatus, AccountStatus } from "~/types/enums";
import type { InferSelectModel } from "drizzle-orm";

type User = InferSelectModel<typeof UsersTable>;
type Account = InferSelectModel<typeof accountsTable>;
type JobApplication = InferSelectModel<typeof jobApplicationsTable>;
type Freelancer = InferSelectModel<typeof freelancersTable>;
type Job = InferSelectModel<typeof jobsTable>;

interface Application {
  application: {
    id: number;
    status: JobApplicationStatus;
    createdAt: Date;
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

interface EmployerDetails {
  employer: {
    id: number;
  };
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  account: {
    id: number;
    accountStatus: AccountStatus;
  };
}

interface LoaderData {
  employer: EmployerDetails;
  applications: Application[];
}

export async function loader({ params }: LoaderFunctionArgs) {
  const { employerId } = params;

  if (!employerId) {
    throw new Response("Employer ID is required", { status: 400 });
  }

  // Get employer details first
  const employerDetails = await db
    .select()
    .from(employersTable)
    .where(eq(employersTable.id, parseInt(employerId)))
    .leftJoin(accountsTable, eq(employersTable.accountId, accountsTable.id))
    .leftJoin(UsersTable, eq(accountsTable.userId, UsersTable.id));

  if (employerDetails.length === 0) {
    throw new Response("Employer not found", { status: 404 });
  }

  // Get all jobs for this employer first
  const jobs = await db
    .select()
    .from(jobsTable)
    .where(eq(jobsTable.employerId, parseInt(employerId)));

  // Get all applications for all jobs of this employer
  const applications = await db
    .select()
    .from(jobApplicationsTable)
    .leftJoin(jobsTable, eq(jobApplicationsTable.jobId, jobsTable.id))
    .leftJoin(
      freelancersTable,
      eq(jobApplicationsTable.freelancerId, freelancersTable.id)
    )
    .leftJoin(accountsTable, eq(freelancersTable.accountId, accountsTable.id))
    .leftJoin(UsersTable, eq(accountsTable.userId, UsersTable.id))
    .where(eq(jobsTable.employerId, parseInt(employerId)));

  // Transform the data to match our interfaces
  const transformedEmployer: EmployerDetails = {
    employer: {
      id: employerDetails[0].employers.id,
    },
    user: {
      firstName: employerDetails[0].users.firstName || "",
      lastName: employerDetails[0].users.lastName || "",
      email: employerDetails[0].users.email || "",
    },
    account: {
      id: employerDetails[0].accounts.id,
      accountStatus: employerDetails[0].accounts.accountStatus as AccountStatus,
    },
  };

  const transformedApplications: Application[] = applications.map((app) => ({
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
        firstName: app.users.firstName || "",
        lastName: app.users.lastName || "",
        email: app.users.email || "",
      },
      account: {
        id: app.accounts.id,
        accountStatus: app.accounts.accountStatus as AccountStatus,
      },
    },
  }));

  return {
    employer: transformedEmployer,
    applications: transformedApplications,
  };
}

function getStatusColor(status: JobApplicationStatus) {
  switch (status) {
    case JobApplicationStatus.Pending:
      return "bg-yellow-100 text-yellow-800";
    case JobApplicationStatus.Shortlisted:
      return "bg-blue-100 text-blue-800";
    case JobApplicationStatus.Approved:
      return "bg-green-100 text-green-800";
    case JobApplicationStatus.Rejected:
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export default function AllJobApplications() {
  const { employer, applications } = useLoaderData<typeof loader>();

  // Group applications by job
  const groupedApplications = applications.reduce(
    (acc, application) => {
      const jobId = application.job.id;
      if (!acc[jobId]) {
        acc[jobId] = {
          jobTitle: application.job.title,
          applications: [],
        };
      }
      acc[jobId].applications.push(application);
      return acc;
    },
    {} as Record<number, { jobTitle: string; applications: Application[] }>
  );

  return (
    <div className="space-y-8">
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">All Applications</h1>
            <Link
              to={`/admin-dashboard/employer/${employer.employer.id}`}
              className="text-primaryColor hover:text-primaryColor/80"
            >
              ← Back to Employer
            </Link>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {Object.entries(groupedApplications).map(
            ([jobId, { jobTitle, applications: jobApplications }]) => (
              <div key={jobId} className="px-6 py-5">
                <h2 className="text-xl font-semibold mb-4 text-gray-900">
                  {jobTitle}
                </h2>
                {jobApplications.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    No applications received yet.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Applicant
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Email
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Applied Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {jobApplications.map((application) => (
                          <tr key={application.application.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {application.freelancer.user.firstName}{" "}
                              {application.freelancer.user.lastName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {application.freelancer.user.email}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                                  application.application.status
                                )}`}
                              >
                                {application.application.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(
                                application.application.createdAt
                              ).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <Link
                                to={`/admin-dashboard/application/${application.application.id}`}
                                className="text-primaryColor hover:text-primaryColor/80"
                              >
                                View Details
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )
          )}
          {Object.keys(groupedApplications).length === 0 && (
            <div className="px-6 py-5">
              <p className="text-sm text-gray-500">
                No applications received yet for any job.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
