import { LoaderFunctionArgs, json } from "@remix-run/node";
import { Link, useLoaderData, Outlet } from "@remix-run/react";
// import { eq, sql } from "drizzle-orm";
// import { db } from "~/db/drizzle/connector";
// import {
//   jobsTable,
//   employersTable,
//   jobCategoriesTable,
//   jobApplicationsTable,
//   accountsTable,
//   UsersTable,
//   freelancersTable,
// } from "~/db/drizzle/schemas/schema";
// import { ChevronRightIcon } from "@heroicons/react/24/solid";
import { JobsTable } from "~/common/admin-pages/tables/JobsTable";
import { ApplicationsTable } from "~/common/admin-pages/tables/ApplicationsTable";
import { JobStatus, JobApplicationStatus } from "~/types/enums";
import { getBasicJobs, getAllApplications } from "~/servers/admin.server";

/* function ApplicationsTable({ applications }: { applications: any[] }) {
  if (applications.length === 0) return null;

  return (
    <div className="pt-6 pb-10 px-4 bg-gray-50">
      <div className="mb-2 text-sm font-medium text-gray-700">Applications</div>
      <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-sm border">
        <thead className="bg-gray-100">
          <tr>
            <th className="w-1/4 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Freelancer
            </th>
            <th className="w-1/4 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="w-1/4 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Applied Date
            </th>
            <th className="w-1/4 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="">
          {applications.map((app) => (
            <tr key={app.id}>
              <td className="w-1/4 px-6 py-3 whitespace-nowrap text-sm">
                <Link
                  to={`/admin-dashboard/freelancer/${app.freelancer.id}`}
                  className="text-primaryColor hover:text-primaryColor/80 font-medium"
                >
                  {app.freelancer.firstName} {app.freelancer.lastName}
                </Link>
              </td>
              <td className="w-1/4 px-6 py-3 whitespace-nowrap">
                <span
                  className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getApplicationStatusColor(
                    app.status
                  )}`}
                >
                  {app.status.toLowerCase()}
                </span>
              </td>
              <td className="w-1/4 px-6 py-3 whitespace-nowrap text-sm text-gray-500">
                {new Date(app.createdAt).toLocaleDateString()}
              </td>
              <td className="w-1/4 px-6 py-3 whitespace-nowrap text-sm">
                <Link
                  to={`/admin-dashboard/application/${app.id}`}
                  className="text-primaryColor hover:text-primaryColor/80 font-medium"
                >
                  Manage
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
 */

export async function loader({ request }: LoaderFunctionArgs) {
  // First get jobs with their basic info (moved to admin.server.ts)
  const jobs = await getBasicJobs();

  // Then get all applications with freelancer info (also in admin.server.ts)
  const applications = await getAllApplications();

  // Format jobs and include their applications
  const formattedJobs = jobs.map((job) => ({
    job: {
      id: job.jobId,
      title: job.jobTitle,
      budget: job.jobBudget,
      status: job.jobStatus,
      createdAt: job.jobCreatedAt,
      workingHoursPerWeek: job.jobWorkingHours,
      locationPreference: job.jobLocation,
    },
    employer: job.employerId
      ? {
          id: job.employerId,
          user: {
            firstName: job.employerFirstName,
            lastName: job.employerLastName,
          },
        }
      : null,
    category: job.categoryId
      ? {
          id: job.categoryId,
          label: job.categoryLabel,
        }
      : null,
    applicationCount: Number(job.applicationCount),
    applications: applications
      .filter((app) => app.jobId === job.jobId)
      .map((app) => ({
        id: app.id,
        status: app.status,
        createdAt: app.createdAt,
        freelancer: {
          id: app.freelancerId,
          firstName: app.freelancerFirstName,
          lastName: app.freelancerLastName,
        },
      })),
  }));

  return json({ jobs: formattedJobs });
}

export default function JobsList() {
  const { jobs } = useLoaderData<typeof loader>();

  return (
    <div className="space-y-12 mb-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Jobs</h1>
      </div>

      <Outlet />

      {jobs.map((job) => (
        <div
          key={job.job.id}
          className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200"
        >
          <JobsTable
            jobs={[
              {
                id: job.job.id,
                title: job.job.title,
                status: job.job.status as JobStatus,
                budget: job.job.budget,
                workingHoursPerWeek: job.job.workingHoursPerWeek,
                applicationCount: job.applicationCount,
                employer: job.employer
                  ? {
                      id: job.employer.id,
                      firstName: job.employer.user.firstName,
                      lastName: job.employer.user.lastName,
                    }
                  : undefined,
                category: job.category
                  ? {
                      id: job.category.id,
                      label: job.category.label,
                    }
                  : undefined,
              },
            ]}
          />

          {job.applications.length > 0 && (
            <div className="bg-gray-50 pt-2">
              <div className="px-6 py-2 text-sm font-medium text-gray-700">
                Applications
              </div>
              <ApplicationsTable
                applications={job.applications.map((app) => ({
                  application: {
                    id: app.id,
                    status: app.status as JobApplicationStatus,
                    createdAt: app.createdAt,
                  },
                  freelancer: {
                    id: app.freelancer.id,
                    user: {
                      firstName: app.freelancer.firstName,
                      lastName: app.freelancer.lastName,
                      email: "",
                    },
                  },
                }))}
                showJob={false}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* 
function getStatusColor(status: string) {
  switch (status) {
    case "OPEN":
      return "bg-green-100 text-green-800";
    case "CLOSED":
      return "bg-red-100 text-red-800";
    case "DRAFT":
      return "bg-yellow-100 text-yellow-800";
    case "FULFILLED":
      return "bg-blue-100 text-blue-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

function getApplicationStatusColor(status: string) {
  switch (status) {
    case "PENDING":
      return "bg-yellow-100 text-yellow-800";
    case "SHORTLISTED":
      return "bg-blue-100 text-blue-800";
    case "APPROVED":
      return "bg-green-100 text-green-800";
    case "REJECTED":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}
*/
