import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link, Outlet } from "@remix-run/react";
import { aliasedTable, count, eq } from "drizzle-orm";
import { db } from "~/db/drizzle/connector";
import {
  jobsTable,
  employersTable,
  accountsTable,
  UsersTable,
  jobApplicationsTable,
} from "~/db/drizzle/schemas/schema";
import { JobStatus } from "~/types/enums";

interface LoaderData {
  employer: {
    employer: typeof employersTable.$inferSelect;
    account: typeof accountsTable.$inferSelect;
    user: typeof UsersTable.$inferSelect;
  };
  jobs: {
    job: typeof jobsTable.$inferSelect;
    applicationCount: number;
  }[];
}

export async function loader({ params }: LoaderFunctionArgs) {
  const employerId = params.employerId;

  if (!employerId) {
    throw new Response("Employer ID is required", { status: 400 });
  }

  // Get employer details with explicit field selection
  const employerAccountAlias = aliasedTable(accountsTable, "employerAccount");
  const employerUserAlias = aliasedTable(UsersTable, "employerUser");
  const outerJobs = aliasedTable(jobsTable, "outerJobs");

  const employerDetails = await db
    .select({
      employer: {
        id: employersTable.id,
        companyName: employersTable.companyName,
        accountId: employersTable.accountId,
      },
      account: {
        id: employerAccountAlias.id,
        accountType: employerAccountAlias.accountType,
        accountStatus: employerAccountAlias.accountStatus,
        userId: employerAccountAlias.userId,
      },
      user: {
        id: employerUserAlias.id,
        firstName: employerUserAlias.firstName,
        lastName: employerUserAlias.lastName,
        email: employerUserAlias.email,
      },
    })
    .from(employersTable)
    .where(eq(employersTable.id, parseInt(params.employerId)))
    .leftJoin(
      employerAccountAlias,
      eq(employersTable.accountId, employerAccountAlias.id)
    )
    .leftJoin(
      employerUserAlias,
      eq(employerAccountAlias.userId, employerUserAlias.id)
    );

  if (employerDetails.length === 0) {
    throw new Response("Employer not found", { status: 404 });
  }

  // Get all jobs with application counts
  const jobs = await db
    .select({
      job: {
        id: outerJobs.id,
        title: outerJobs.title,
        status: outerJobs.status,
        createdAt: outerJobs.createdAt,
        employerId: outerJobs.employerId,
      },
      // applicationCount: db
      //   .select({ count: count().as("applicationCount") })
      //   .from(jobApplicationsTable)
      //   .where(eq(jobApplicationsTable.jobId, outerJobs.id))
      //   .as("applicationCount"),
    })
    .from(outerJobs)
    .where(eq(outerJobs.employerId, parseInt(employerId)));
  console.log(jobs);
  return {
    employer: employerDetails[0],
    jobs,
  } as LoaderData;
}

export default function EmployerJobs() {
  const { employer, jobs } = useLoaderData<typeof loader>();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Jobs by {employer.employer.companyName || employer.user.firstName}
          </h1>
          <p className="text-gray-500">{employer.user.email}</p>
        </div>
        <Link
          to={`/admin-dashboard/employer/${employer.employer.id}`}
          className="text-primaryColor hover:text-primaryColor/80"
        >
          View Employer Profile
        </Link>
      </div>

      {jobs.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-500">
            This employer hasn&apos;t posted any jobs yet.
          </p>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Job Title
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Applications
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Posted Date
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {jobs.map((job) => (
                <tr key={job.job.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {job.job.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${getStatusColor(job.job.status)}`}
                    >
                      {job.job.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {job.applicationCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(job.job.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <Link
                      to={`/admin-dashboard/employer/${employer.employer.id}/jobs/${job.job.id}/applications`}
                      className="text-primaryColor hover:text-primaryColor/80"
                    >
                      View Applications
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Outlet />
    </div>
  );
}

function getStatusColor(status: JobStatus) {
  switch (status) {
    case JobStatus.Draft:
      return "bg-gray-100 text-gray-800";
    case JobStatus.Active:
      return "bg-green-100 text-green-800";
    case JobStatus.Closed:
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}
