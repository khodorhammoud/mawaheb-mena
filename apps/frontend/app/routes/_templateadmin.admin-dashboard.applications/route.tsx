import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useSearchParams, Link } from "@remix-run/react";
import { eq, aliasedTable, and, desc } from "drizzle-orm";
import { db } from "~/db/drizzle/connector";
import {
  jobApplicationsTable,
  jobsTable,
  freelancersTable,
  UsersTable,
  accountsTable,
  employersTable,
} from "~/db/drizzle/schemas/schema";
import { JobApplicationStatus } from "~/types/enums";
import { Job } from "~/types/Job";
import { User, Account } from "~/types/User";
import { ApplicationsTable } from "~/common/admin-pages/tables/ApplicationsTable";

interface JobApplication {
  application: typeof jobApplicationsTable.$inferSelect;
  job: typeof jobsTable.$inferSelect;
  freelancer: {
    user: typeof UsersTable.$inferSelect;
    account: typeof accountsTable.$inferSelect;
  };
  employer: {
    user: typeof UsersTable.$inferSelect;
    account: typeof accountsTable.$inferSelect;
  };
}

type LoaderData = {
  applications: JobApplication[];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const status = url.searchParams.get("status");
  const employerId = url.searchParams.get("employer");
  const freelancerId = url.searchParams.get("freelancer");

  // fetch all job applications with their respective freelancers and employers

  const freelancerUser = aliasedTable(UsersTable, "freelancerUser");
  const freelancerAccount = aliasedTable(accountsTable, "freelancerAccount");
  const employerUser = aliasedTable(UsersTable, "employerUser");
  const employerAccount = aliasedTable(accountsTable, "employerAccount");

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
        employerId: jobsTable.employerId,
      },
      freelancer: {
        user: {
          id: freelancerUser.id,
          firstName: freelancerUser.firstName,
          lastName: freelancerUser.lastName,
          email: freelancerUser.email,
        },
        account: {
          id: freelancerAccount.id,
          accountType: freelancerAccount.accountType,
          accountStatus: freelancerAccount.accountStatus,
        },
      },
      employer: {
        user: {
          id: employerUser.id,
          firstName: employerUser.firstName,
          lastName: employerUser.lastName,
          email: employerUser.email,
        },
        account: {
          id: employerAccount.id,
          accountType: employerAccount.accountType,
          accountStatus: employerAccount.accountStatus,
        },
      },
    })
    .from(jobApplicationsTable)
    .leftJoin(jobsTable, eq(jobApplicationsTable.jobId, jobsTable.id))
    .leftJoin(
      freelancersTable,
      eq(jobApplicationsTable.freelancerId, freelancersTable.id)
    )
    .leftJoin(
      freelancerAccount,
      eq(freelancersTable.accountId, freelancerAccount.id)
    )
    .leftJoin(freelancerUser, eq(freelancerAccount.userId, freelancerUser.id))
    .leftJoin(employersTable, eq(jobsTable.employerId, employersTable.id))
    .leftJoin(employerAccount, eq(employersTable.accountId, employerAccount.id))
    .leftJoin(employerUser, eq(employerAccount.userId, employerUser.id))
    .orderBy(desc(jobApplicationsTable.createdAt));

  const conditions = [];

  if (status) {
    conditions.push(
      eq(jobApplicationsTable.status, status as JobApplicationStatus)
    );
  }

  if (employerId) {
    conditions.push(eq(jobsTable.employerId, parseInt(employerId)));
  }

  if (freelancerId) {
    conditions.push(
      eq(jobApplicationsTable.freelancerId, parseInt(freelancerId))
    );
  }

  const finalQuery =
    conditions.length > 0 ? query.where(and(...conditions)) : query;

  const applications = await finalQuery;

  return { applications } as LoaderData;
}

export default function AdminApplications() {
  const { applications } = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Job Applications</h1>
        <div className="flex gap-4">
          <select
            value={searchParams.get("status") || ""}
            onChange={(e) => {
              const newParams = new URLSearchParams(searchParams);
              if (e.target.value) {
                newParams.set("status", e.target.value);
              } else {
                newParams.delete("status");
              }
              setSearchParams(newParams);
            }}
            className="rounded-md border-gray-300 shadow-sm focus:border-primaryColor focus:ring-primaryColor"
          >
            <option value="">All Statuses</option>
            {Object.values(JobApplicationStatus).map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Job Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Freelancer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Employer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Applied Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {applications.map((app) => (
              <tr key={app?.application?.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <Link
                    to={`/admin-dashboard/job/${app?.job?.id}`}
                    className="text-primaryColor hover:text-primaryColor/80"
                  >
                    {app?.job?.title}
                  </Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <Link
                    to={`/admin-dashboard/freelancer/${app?.application?.freelancerId}`}
                    className="text-primaryColor hover:text-primaryColor/80"
                  >
                    {app?.freelancer?.user?.firstName}{" "}
                    {app?.freelancer?.user?.lastName}
                  </Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <Link
                    to={`/admin-dashboard/employer/${app?.job?.employerId}`}
                    className="text-primaryColor hover:text-primaryColor/80"
                  >
                    {app?.employer?.user?.firstName}{" "}
                    {app?.employer?.user?.lastName}
                  </Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(app?.application?.status as JobApplicationStatus)}`}
                  >
                    {app?.application?.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(app?.application?.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <Link
                    to={`/admin-dashboard/application/${app?.application?.id}`}
                    className="text-primaryColor hover:text-primaryColor/80"
                  >
                    Manage
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div> */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <ApplicationsTable
          applications={applications}
          emptyMessage="No applications found. Try adjusting your filters."
        />
      </div>
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
