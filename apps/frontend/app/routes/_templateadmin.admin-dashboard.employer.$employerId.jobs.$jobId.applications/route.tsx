import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { eq, aliasedTable } from "drizzle-orm";
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
  const { employerId, jobId } = params;

  if (!employerId || !jobId) {
    throw new Response("Employer ID and Job ID are required", { status: 400 });
  }

  // Create table aliases for joins
  const freelancerAccount = aliasedTable(accountsTable, "freelancer_account");
  const freelancerUser = aliasedTable(UsersTable, "freelancer_user");

  // Get job details with applications
  const applications = await db
    .select({
      application: {
        id: jobApplicationsTable.id,
        status: jobApplicationsTable.status,
        createdAt: jobApplicationsTable.createdAt,
      },
      freelancer: {
        id: freelancersTable.id,
        user: {
          firstName: freelancerUser.firstName,
          lastName: freelancerUser.lastName,
          email: freelancerUser.email,
        },
        account: {
          id: freelancerAccount.id,
          accountStatus: freelancerAccount.accountStatus,
        },
      },
    })
    .from(jobApplicationsTable)
    .where(eq(jobApplicationsTable.jobId, parseInt(jobId)))
    .leftJoin(
      freelancersTable,
      eq(jobApplicationsTable.freelancerId, freelancersTable.id)
    )
    .leftJoin(
      freelancerAccount,
      eq(freelancersTable.accountId, freelancerAccount.id)
    )
    .leftJoin(freelancerUser, eq(freelancerAccount.userId, freelancerUser.id));

  // Get job details
  const jobDetails = await db
    .select()
    .from(jobsTable)
    .where(eq(jobsTable.id, parseInt(jobId)))
    .where(eq(jobsTable.employerId, parseInt(employerId)));

  if (jobDetails.length === 0) {
    throw new Response("Job not found", { status: 404 });
  }

  return {
    job: jobDetails[0],
    applications,
  };
}

export default function JobApplications() {
  const { job, applications } = useLoaderData<typeof loader>();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Applications for {job.title}</h2>
        <Link
          to={`/admin-dashboard/employer/${job.employerId}/jobs`}
          className="text-primaryColor hover:text-primaryColor/80"
        >
          ← Back to Jobs
        </Link>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {applications.map((application) => (
            <li key={application.application.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        {application.freelancer.user.firstName}{" "}
                        {application.freelancer.user.lastName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {application.freelancer.user.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        application.application.status ===
                        JobApplicationStatus.Pending
                          ? "bg-yellow-100 text-yellow-800"
                          : application.application.status ===
                              JobApplicationStatus.Accepted
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                      }`}
                    >
                      {application.application.status}
                    </span>
                    <Link
                      to={`/admin-dashboard/application/${application.application.id}`}
                      className="text-primaryColor hover:text-primaryColor/80 text-sm"
                    >
                      View Details →
                    </Link>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
