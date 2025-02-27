import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { eq, and } from "drizzle-orm";
import { db } from "~/db/drizzle/connector";
import {
  jobApplicationsTable,
  jobsTable,
  freelancersTable,
  UsersTable,
  accountsTable,
} from "~/db/drizzle/schemas/schema";
import { JobApplicationStatus } from "~/types/enums";

export async function loader({ params }: LoaderFunctionArgs) {
  const freelancerId = params.freelancerId;

  if (!freelancerId) {
    throw new Response("Freelancer ID is required", { status: 400 });
  }

  // Get freelancer details
  const freelancerDetails = await db
    .select({
      freelancer: freelancersTable,
      account: accountsTable,
      user: UsersTable,
    })
    .from(freelancersTable)
    .where(eq(freelancersTable.id, parseInt(freelancerId)))
    .leftJoin(accountsTable, eq(freelancersTable.accountId, accountsTable.id))
    .leftJoin(UsersTable, eq(accountsTable.userId, UsersTable.id));

  if (freelancerDetails.length === 0) {
    throw new Response("Freelancer not found", { status: 404 });
  }

  // Get all job applications for this freelancer
  const applications = await db
    .select({
      application: jobApplicationsTable,
      job: jobsTable,
      employer: {
        account: accountsTable.id,
        user: UsersTable.id,
      },
    })
    .from(jobApplicationsTable)
    .where(eq(jobApplicationsTable.freelancerId, parseInt(freelancerId)))
    .leftJoin(jobsTable, eq(jobApplicationsTable.jobId, jobsTable.id))
    .leftJoin(accountsTable, eq(jobsTable.employerId, accountsTable.id))
    .leftJoin(UsersTable, eq(accountsTable.userId, UsersTable.id));

  return {
    freelancer: freelancerDetails[0],
    applications,
  };
}

export default function FreelancerApplications() {
  const { freelancer, applications } = useLoaderData<typeof loader>();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Applications for {freelancer.user.firstName}{" "}
            {freelancer.user.lastName}
          </h1>
          <p className="text-gray-500">{freelancer.user.email}</p>
        </div>
        <Link
          to={`/admin-dashboard/freelancer/${freelancer.freelancer.id}`}
          className="text-primaryColor hover:text-primaryColor/80"
        >
          View Freelancer Profile
        </Link>
      </div>

      {applications.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-500">
            This freelancer has not applied to any jobs yet.
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
                  Employer
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
                  Applied Date
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
              {applications.map((app) => (
                <tr key={app.application.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <Link
                      to={`/admin-dashboard/job/${app.job.id}`}
                      className="hover:text-primaryColor"
                    >
                      {app.job.title}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <Link
                      to={`/admin-dashboard/employer/${app.job.employerId}`}
                      className="hover:text-primaryColor"
                    >
                      {app.employer.user.firstName} {app.employer.user.lastName}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${getStatusColor(app.application.status as JobApplicationStatus)}`}
                    >
                      {app.application.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(app.application.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <Link
                      to={`/admin-dashboard/application/${app.application.id}`}
                      className="text-primaryColor hover:text-primaryColor/80"
                    >
                      Manage
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
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
