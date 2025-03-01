import { LoaderFunctionArgs, json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { eq } from "drizzle-orm";
import { db } from "~/db/drizzle/connector";
import {
  jobsTable,
  employersTable,
  jobCategoriesTable,
  skillsTable,
  jobSkillsTable,
  jobApplicationsTable,
  accountsTable,
  UsersTable,
  freelancersTable,
} from "~/db/drizzle/schemas/schema";

type JobApplication = {
  application: {
    id: number;
    status: string;
    createdAt: Date;
  };
  freelancer: {
    id: number;
    hourlyRate: number;
    yearsOfExperience: number;
  };
  account: {
    id: number;
    country: string;
  };
  user: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
};

type LoaderData = {
  job: {
    id: number;
    title: string;
    description: string;
    budget: number;
    status: string;
    createdAt: Date;
    workingHoursPerWeek: number;
    locationPreference: string;
    projectType: string;
    experienceLevel: string;
  };
  employer: {
    id: number;
    companyEmail: string;
  };
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  category: {
    id: number;
    label: string;
  };
  skills: Array<{
    id: number;
    label: string;
    isStarred: boolean;
  }>;
  applications: JobApplication[];
};

export async function loader({ params }: LoaderFunctionArgs) {
  const jobId = params.jobId;

  if (!jobId) {
    throw new Response("Job ID is required", { status: 400 });
  }

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
      },
      employer: {
        id: employersTable.id,
        companyEmail: employersTable.companyEmail,
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
    .where(eq(jobsTable.id, parseInt(jobId)))
    .leftJoin(employersTable, eq(jobsTable.employerId, employersTable.id))
    .leftJoin(accountsTable, eq(employersTable.accountId, accountsTable.id))
    .leftJoin(UsersTable, eq(accountsTable.userId, UsersTable.id))
    .leftJoin(
      jobCategoriesTable,
      eq(jobsTable.jobCategoryId, jobCategoriesTable.id)
    );

  if (jobDetails.length === 0) {
    throw new Response("Job not found", { status: 404 });
  }

  // Fetch job skills
  const skills = await db
    .select({
      id: skillsTable.id,
      label: skillsTable.label,
      isStarred: jobSkillsTable.isStarred,
    })
    .from(jobSkillsTable)
    .leftJoin(skillsTable, eq(jobSkillsTable.skillId, skillsTable.id))
    .where(eq(jobSkillsTable.jobId, parseInt(jobId)));

  // Get applications for this job
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
      },
      user: {
        id: UsersTable.id,
        firstName: UsersTable.firstName,
        lastName: UsersTable.lastName,
        email: UsersTable.email,
      },
    })
    .from(jobApplicationsTable)
    .where(eq(jobApplicationsTable.jobId, parseInt(jobId)))
    .leftJoin(
      freelancersTable,
      eq(jobApplicationsTable.freelancerId, freelancersTable.id)
    )
    .leftJoin(accountsTable, eq(freelancersTable.accountId, accountsTable.id))
    .leftJoin(UsersTable, eq(accountsTable.userId, UsersTable.id))
    .orderBy(jobApplicationsTable.createdAt);

  const data: LoaderData = {
    ...jobDetails[0],
    skills,
    applications,
  };

  return json(data);
}

export default function JobDetails() {
  const { job, employer, user, category, skills, applications } =
    useLoaderData<typeof loader>();

  return (
    <div className="space-y-8">
      {/* Back Button */}
      <div>
        <Link
          to=".."
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          Back to Jobs
        </Link>
      </div>

      {/* Job Overview Card */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Job Overview
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-500">Status:</span>
              <span
                className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${getStatusColor(
                  job.status
                )}`}
              >
                {job.status.toLowerCase()}
              </span>
            </div>
          </div>
        </div>

        <div className="px-6 py-5">
          <div className="flex flex-col space-y-6">
            <div className="flex items-center">
              <div className="flex-1">
                <h4 className="text-sm text-gray-500">Job Title:</h4>
                <p className="mt-2 text-xl font-semibold text-primaryColor">
                  {job.title || "-"}
                </p>
                <h4 className="text-sm text-gray-500 mt-4">Company Email:</h4>
                <p className="mt-1 text-base font-medium text-gray-900">
                  {employer.companyEmail || "-"}
                </p>
              </div>
              <div className="flex-none">
                <div className="inline-flex items-center px-4 py-2 rounded-lg">
                  <span className="text-5xl font-bold text-primaryColor">
                    ⟶
                  </span>
                </div>
              </div>
              <div className="flex-1 flex justify-end">
                <div className="text-left">
                  <h4 className="text-sm text-gray-500">Posted By:</h4>
                  <Link
                    to={`/admin-dashboard/employer/${employer.id}`}
                    className="mt-1 block text-base font-medium text-primaryColor hover:text-primaryColor/90"
                  >
                    {user.firstName} {user.lastName || "-"}
                  </Link>
                  <h4 className="text-sm text-gray-500 mt-4">Email:</h4>
                  <p className="mt-1 text-base font-medium text-gray-900">
                    {user.email || "-"}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <span className="text-sm font-medium text-gray-500">
                Category:
              </span>
              <p className="mt-1 text-base text-gray-900">
                {category?.label || "-"}
              </p>
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-gray-500">
                    Job Budget:
                  </span>
                  <span className="text-sm text-gray-900">
                    {job.budget ? `💰 $${job.budget}` : "-"}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-gray-500">
                    Working Hours:
                  </span>
                  <span className="text-sm text-gray-900">
                    {job.workingHoursPerWeek
                      ? `⏰ ${job.workingHoursPerWeek} hours/week`
                      : "-"}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-gray-500">
                    Location:
                  </span>
                  <span className="text-sm text-gray-900">
                    {job.locationPreference
                      ? `📍 ${job.locationPreference}`
                      : "-"}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-gray-500">
                    Posted Date:
                  </span>
                  <span className="text-sm text-gray-900">
                    {job.createdAt
                      ? `📅 ${new Date(job.createdAt).toLocaleDateString()}`
                      : "-"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Job Description Card */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Job Description
          </h3>
        </div>
        <div className="px-6 py-5">
          <div className="prose max-w-none">
            <div
              className="text-base text-gray-700 whitespace-pre-wrap break-words leading-relaxed"
              dangerouslySetInnerHTML={{
                __html: job.description?.replace(/\n/g, "<br/>") || "-",
              }}
            />
          </div>
        </div>
      </div>

      {/* Required Skills Card */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Required Skills
          </h3>
        </div>
        <div className="px-6 py-5">
          <div className="flex flex-wrap gap-2">
            {skills && skills.length > 0 ? (
              skills.map((skill) => (
                <span
                  key={skill.id}
                  className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${
                    skill.isStarred
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {skill.label}
                  {skill.isStarred && (
                    <span className="ml-1 text-yellow-500">★</span>
                  )}
                </span>
              ))
            ) : (
              <span className="text-sm text-gray-500">No skills specified</span>
            )}
          </div>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-5">
          {applications.length > 0 ? (
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                    >
                      Freelancer
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Location
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Experience
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Rate
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Applied Date
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {applications.map((application) => (
                    <tr key={application.application.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                        <Link
                          to={`/admin-dashboard/freelancer/${application.freelancer.id}`}
                          className="text-primaryColor hover:text-primaryColor/90 font-medium"
                        >
                          {application.user.firstName}{" "}
                          {application.user.lastName}
                        </Link>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {application.account.country || "-"}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {application.freelancer.yearsOfExperience
                          ? `${application.freelancer.yearsOfExperience} years`
                          : "-"}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {application.freelancer.hourlyRate
                          ? `$${application.freelancer.hourlyRate}/hr`
                          : "-"}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <span
                          className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getApplicationStatusColor(
                            application.application.status
                          )}`}
                        >
                          {application.application.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {application.application.createdAt
                          ? new Date(
                              application.application.createdAt
                            ).toLocaleDateString()
                          : "-"}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <Link
                          to={`/admin-dashboard/application/${application.application.id}`}
                          className="text-primaryColor hover:text-primaryColor/90 font-medium"
                        >
                          Manage
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-gray-500">No applications yet</p>
          )}
        </div>
      </div>
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
