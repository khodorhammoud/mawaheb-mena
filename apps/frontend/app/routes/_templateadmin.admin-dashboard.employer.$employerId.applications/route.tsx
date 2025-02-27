import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { aliasedTable, eq } from "drizzle-orm";
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
  const employerId = params.employerId;

  const freelancerAccount = aliasedTable(accountsTable, "freelancer_account");
  const freelancerUser = aliasedTable(UsersTable, "freelancer_user");

  const jobs = await db
    .select({
      job: jobsTable,
      applications: {
        application: jobApplicationsTable.id,
        freelancer: freelancersTable.id,
        freelancerAccount: freelancerAccount.id,
        freelancerUser: freelancerUser.id,
      },
    })
    .from(jobsTable)
    .where(eq(jobsTable.employerId, parseInt(employerId)))
    .leftJoin(
      jobApplicationsTable,
      eq(jobsTable.id, jobApplicationsTable.jobId)
    )
    .leftJoin(
      freelancersTable,
      eq(jobApplicationsTable.freelancerId, freelancersTable.id)
    )
    .leftJoin(
      freelancerAccount,
      eq(freelancersTable.accountId, freelancerAccount.id)
    )
    .leftJoin(freelancerUser, eq(freelancerAccount.userId, freelancerUser.id));

  // Group applications by job
  const jobsWithApplications = jobs.reduce((acc, curr) => {
    const existingJob = acc.find((j) => j.job.id === curr.job.id);
    if (existingJob) {
      if (curr.applications.application) {
        existingJob.applications.push(curr.applications);
      }
    } else {
      acc.push({
        job: curr.job,
        applications: curr.applications.application ? [curr.applications] : [],
      });
    }
    return acc;
  }, []);

  return { jobs: jobsWithApplications };
}

export default function EmployerApplications() {
  const { jobs } = useLoaderData<typeof loader>();

  return (
    <div className="space-y-8">
      {jobs.map((job) => (
        <div key={job.job.id} className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">{job.job.title}</h2>

          {job.applications.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Freelancer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Applied Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {job.applications.map((app) => (
                  <tr key={app.application.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {app.freelancerUser.firstName}{" "}
                      {app.freelancerUser.lastName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${getStatusColor(app.application.status)}`}
                      >
                        {app.application.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(app.application.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-500">No applications for this job yet.</p>
          )}
        </div>
      ))}
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
