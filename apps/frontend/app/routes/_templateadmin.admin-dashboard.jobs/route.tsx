import { LoaderFunctionArgs, json } from "@remix-run/node";
import { Link, useLoaderData, Outlet } from "@remix-run/react";
import { eq, sql } from "drizzle-orm";
import React from "react";
import { db } from "~/db/drizzle/connector";
import {
  jobsTable,
  employersTable,
  jobCategoriesTable,
  jobApplicationsTable,
  accountsTable,
  UsersTable,
  freelancersTable,
} from "~/db/drizzle/schemas/schema";
import { ChevronRightIcon } from "@heroicons/react/24/solid";

function ApplicationsTable({ applications }: { applications: any[] }) {
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

export async function loader({ request }: LoaderFunctionArgs) {
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
      categoryId: jobCategoriesTable.id,
      categoryLabel: jobCategoriesTable.label,
      applicationCount: sql<number>`count(${jobApplicationsTable.id})::int`,
    })
    .from(jobsTable)
    .leftJoin(employersTable, eq(jobsTable.employerId, employersTable.id))
    .leftJoin(accountsTable, eq(employersTable.accountId, accountsTable.id))
    .leftJoin(UsersTable, eq(accountsTable.userId, UsersTable.id))
    .leftJoin(
      jobCategoriesTable,
      eq(jobsTable.jobCategoryId, jobCategoriesTable.id)
    )
    .leftJoin(
      jobApplicationsTable,
      eq(jobsTable.id, jobApplicationsTable.jobId)
    )
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
      jobCategoriesTable.id,
      jobCategoriesTable.label
    )
    .orderBy(jobsTable.createdAt);

  // Then get all applications with freelancer info
  const applications = await db
    .select({
      id: jobApplicationsTable.id,
      status: jobApplicationsTable.status,
      createdAt: jobApplicationsTable.createdAt,
      jobId: jobApplicationsTable.jobId,
      freelancerId: freelancersTable.id,
      freelancerFirstName: UsersTable.firstName,
      freelancerLastName: UsersTable.lastName,
    })
    .from(jobApplicationsTable)
    .leftJoin(
      freelancersTable,
      eq(jobApplicationsTable.freelancerId, freelancersTable.id)
    )
    .leftJoin(accountsTable, eq(freelancersTable.accountId, accountsTable.id))
    .leftJoin(UsersTable, eq(accountsTable.userId, UsersTable.id));

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

      {jobs.map((job, index) => (
        <div
          key={job.job.id}
          className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200"
        >
          <table className="min-w-full divide-y border-b border-gray-200">
            {index === 0 && (
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Budget
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Applications
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Posted Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
            )}
            <tbody className="bg-white">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex items-center space-x-3 animate-[bounce_1s_ease-in-out_infinite] mt-1">
                    <Link
                      to={`/admin-dashboard/job/${job.job.id}`}
                      className="text-primaryColor hover:text-primaryColor/80 font-medium text-base flex items-center justify-center gap-2"
                    >
                      <ChevronRightIcon className="h-6 w-6 text-primaryColor/70" />
                      {job.job.title}
                    </Link>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {job.employer ? (
                    <Link
                      to={`/admin-dashboard/employer/${job.employer.id}`}
                      className="text-primaryColor hover:text-primaryColor/80"
                    >
                      {job.employer.user.firstName} {job.employer.user.lastName}
                    </Link>
                  ) : (
                    "-"
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {job.category?.label || "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {job.job.budget ? `$${job.job.budget}` : "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className="text-primaryColor font-medium">
                    {job.applicationCount} applications
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                      job.job.status
                    )}`}
                  >
                    {job.job.status.toLowerCase()}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {job.job.createdAt
                    ? new Date(job.job.createdAt).toLocaleDateString()
                    : "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <Link
                    to={`/admin-dashboard/job/${job.job.id}`}
                    className="text-primaryColor hover:text-primaryColor/80 font-medium"
                  >
                    Manage
                  </Link>
                </td>
              </tr>
            </tbody>
          </table>
          {job.applications.length > 0 && (
            <div className="">
              <ApplicationsTable applications={job.applications} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

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
