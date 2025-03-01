import { ActionFunctionArgs, LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData, useActionData, Form } from "@remix-run/react";
import { eq, aliasedTable } from "drizzle-orm";
import { db } from "~/db/drizzle/connector";
import {
  jobApplicationsTable,
  jobsTable,
  freelancersTable,
  UsersTable,
  accountsTable,
  employersTable,
  jobCategoriesTable,
  skillsTable,
  jobSkillsTable,
  freelancerSkillsTable,
} from "~/db/drizzle/schemas/schema";
import { JobApplicationStatus, CompensationType } from "~/types/enums";

type ActionResponse = {
  success: boolean;
  error?: string;
};

// Helper function to safely parse JSON
function safeParseJSON<T>(
  jsonString: string | null | undefined,
  defaultValue: T
): T {
  if (!jsonString) return defaultValue;
  try {
    return JSON.parse(jsonString) as T;
  } catch (error) {
    console.error("Error parsing JSON:", error);
    return defaultValue;
  }
}

export async function loader({ params }: LoaderFunctionArgs) {
  const applicationId = params.applicationId;

  if (!applicationId) {
    throw new Response("Application ID is required", { status: 400 });
  }

  // Create table aliases
  const freelancerAccount = aliasedTable(accountsTable, "freelancer_account");
  const employerAccount = aliasedTable(accountsTable, "employer_account");
  const freelancerUser = aliasedTable(UsersTable, "freelancer_user");
  const employerUser = aliasedTable(UsersTable, "employer_user");

  const applicationDetails = await db
    .select({
      application: jobApplicationsTable,
      job: jobsTable,
      freelancer: freelancersTable,
      freelancerAccount: freelancerAccount,
      freelancerUser: freelancerUser,
      employer: employersTable,
      employerAccount: employerAccount,
      employerUser: employerUser,
      jobCategory: jobCategoriesTable,
    })
    .from(jobApplicationsTable)
    .where(eq(jobApplicationsTable.id, parseInt(applicationId)))
    // Join with jobs table
    .leftJoin(jobsTable, eq(jobApplicationsTable.jobId, jobsTable.id))
    // Join for freelancer data
    .leftJoin(
      freelancersTable,
      eq(jobApplicationsTable.freelancerId, freelancersTable.id)
    )
    .leftJoin(
      freelancerAccount,
      eq(freelancersTable.accountId, freelancerAccount.id)
    )
    .leftJoin(freelancerUser, eq(freelancerAccount.userId, freelancerUser.id))
    // Join for employer data
    .leftJoin(employersTable, eq(jobsTable.employerId, employersTable.id))
    .leftJoin(employerAccount, eq(employersTable.accountId, employerAccount.id))
    .leftJoin(employerUser, eq(employerAccount.userId, employerUser.id))
    // Join for job category
    .leftJoin(
      jobCategoriesTable,
      eq(jobsTable.jobCategoryId, jobCategoriesTable.id)
    );

  if (applicationDetails.length === 0) {
    throw new Response("Application not found", { status: 404 });
  }

  // Fetch job skills
  const jobSkills = await db
    .select({
      id: skillsTable.id,
      label: skillsTable.label,
      isStarred: jobSkillsTable.isStarred,
    })
    .from(jobSkillsTable)
    .leftJoin(skillsTable, eq(jobSkillsTable.skillId, skillsTable.id))
    .where(eq(jobSkillsTable.jobId, applicationDetails[0].job.id));

  // Fetch freelancer skills
  const freelancerSkills = await db
    .select({
      id: skillsTable.id,
      label: skillsTable.label,
      yearsOfExperience: freelancerSkillsTable.yearsOfExperience,
    })
    .from(freelancerSkillsTable)
    .leftJoin(skillsTable, eq(freelancerSkillsTable.skillId, skillsTable.id))
    .where(
      eq(
        freelancerSkillsTable.freelancerId,
        applicationDetails[0].freelancer.id
      )
    );

  return {
    application: {
      ...applicationDetails[0],
      job: {
        ...applicationDetails[0].job,
        category: applicationDetails[0].jobCategory,
        skills: jobSkills,
      },
      freelancer: {
        ...applicationDetails[0].freelancer,
        skills: freelancerSkills,
      },
    },
  };
}

export async function action({ request, params }: ActionFunctionArgs) {
  const formData = await request.formData();
  const status = formData.get("status") as JobApplicationStatus;
  const applicationId = params.applicationId;

  if (!applicationId || !status) {
    return json({ success: false, error: "Missing required fields" });
  }

  try {
    await db
      .update(jobApplicationsTable)
      .set({ status })
      .where(eq(jobApplicationsTable.id, parseInt(applicationId)));

    return json({ success: true });
  } catch (error) {
    console.error("Error updating application status:", error);
    return json({
      success: false,
      error: "Failed to update application status",
    });
  }
}

export default function ApplicationDetails() {
  const { application } = useLoaderData<typeof loader>();
  const actionData = useActionData<ActionResponse>();
  const applicationStatusValues = Object.values(JobApplicationStatus);

  // Parse JSON fields for freelancer
  const fieldsOfExpertise = Array.isArray(
    application.freelancer.fieldsOfExpertise
  )
    ? application.freelancer.fieldsOfExpertise
    : safeParseJSON<string[]>(
        application.freelancer.fieldsOfExpertise as unknown as string,
        []
      );

  const jobsOpenTo = Array.isArray(application.freelancer.jobsOpenTo)
    ? application.freelancer.jobsOpenTo
    : safeParseJSON<string[]>(
        application.freelancer.jobsOpenTo as unknown as string,
        []
      );

  const preferredProjectTypes = Array.isArray(
    application.freelancer.preferredProjectTypes
  )
    ? application.freelancer.preferredProjectTypes
    : safeParseJSON<string[]>(
        application.freelancer.preferredProjectTypes as unknown as string,
        []
      );

  return (
    <div className="space-y-8">
      {/* Application Overview Card */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Application Overview
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-500">Status:</span>
              <span
                className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${getStatusColor(
                  application.application.status as JobApplicationStatus
                )}`}
              >
                {application.application.status}
              </span>
            </div>
          </div>
        </div>

        <div className="px-6 py-5">
          <div className="flex flex-col space-y-6">
            <div className="flex items-center">
              <div className="flex-1">
                <h4 className="text-sm text-gray-500">Freelancer's Name:</h4>
                <p className="mt-1 text-base font-medium text-gray-900">
                  {application.freelancerUser.firstName}{" "}
                  {application.freelancerUser.lastName || "-"}
                </p>
                <h4 className="text-sm text-gray-500 mt-4">Email:</h4>
                <p className="mt-1 text-base font-medium text-gray-900">
                  {application.freelancerUser.email || "-"}
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
                  <h4 className="text-sm text-gray-500">Job Posted By:</h4>
                  <p className="mt-1 text-base font-medium text-gray-900">
                    {application.employerUser.firstName}{" "}
                    {application.employerUser.lastName || "-"}
                  </p>
                  <h4 className="text-sm text-gray-500 mt-4">Email:</h4>
                  <p className="mt-1 text-base font-medium text-gray-900">
                    {application.employerUser.email || "-"}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h4 className="text-sm text-gray-500">Applied For:</h4>
              <p className="mt-2 text-xl font-semibold text-primaryColor">
                {application.job.title || "-"}
              </p>
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-gray-500">
                    Job Budget:
                  </span>
                  <span className="text-sm text-gray-900">
                    {application.job.budget
                      ? `💰 $${application.job.budget}`
                      : "-"}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-gray-500">
                    Job Working Hours:
                  </span>
                  <span className="text-sm text-gray-900">
                    {application.job.workingHoursPerWeek
                      ? `⏰ ${application.job.workingHoursPerWeek} hours/week`
                      : "-"}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-gray-500">
                    Job Location:
                  </span>
                  <span className="text-sm text-gray-900">
                    {application.job.locationPreference
                      ? `📍 ${application.job.locationPreference}`
                      : "-"}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-gray-500">
                    Applied Date:
                  </span>
                  <span className="text-sm text-gray-900">
                    {application.application.createdAt
                      ? `📅 ${new Date(application.application.createdAt).toLocaleDateString()}`
                      : "-"}
                  </span>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <Form method="post">
                <div className="flex items-center space-x-4">
                  <div className="flex-grow max-w-xs">
                    <label
                      htmlFor="status"
                      className="block text-sm font-medium text-gray-500 mb-1"
                    >
                      Update Application Status
                    </label>
                    <select
                      id="status"
                      name="status"
                      defaultValue={application.application.status}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primaryColor focus:ring-primaryColor sm:text-sm"
                    >
                      {applicationStatusValues.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="submit"
                    className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primaryColor hover:bg-primaryColor/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primaryColor"
                  >
                    Update Status
                  </button>
                </div>
              </Form>

              {actionData?.success && (
                <div className="mt-2 rounded-md bg-green-50 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-green-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-green-800">
                        Application status updated successfully
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {actionData?.error && (
                <div className="mt-2 rounded-md bg-red-50 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-red-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-red-800">
                        {actionData.error}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Job Details Card */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Job Details
          </h3>
        </div>
        <div className="px-6 py-5 space-y-6">
          <div>
            <h4 className="text-sm font-medium text-gray-500">Description</h4>
            <div
              className="mt-1 text-sm text-gray-900 prose max-w-none"
              dangerouslySetInnerHTML={{
                __html: application.job.description || "-",
              }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-500">Category</h4>
              <p className="mt-1 text-sm text-gray-900">
                {application.job.category?.label || "-"}
              </p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-500">Skills</h4>
              <div className="mt-1 flex flex-wrap gap-2">
                {application.job.skills && application.job.skills.length > 0 ? (
                  application.job.skills.map((skill) => (
                    <span
                      key={skill.id}
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
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
                  <span className="text-sm text-gray-900">-</span>
                )}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-500">Budget</h4>
              <p className="mt-1 text-sm text-gray-900">
                {application.job.budget ? `$${application.job.budget}` : "-"}
              </p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-500">
                Working Hours
              </h4>
              <p className="mt-1 text-sm text-gray-900">
                {application.job.workingHoursPerWeek
                  ? `${application.job.workingHoursPerWeek} hours per week`
                  : "-"}
              </p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-500">
                Experience Level
              </h4>
              <div className="mt-1 flex flex-wrap gap-2">
                {application.job.experienceLevel ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {application.job.experienceLevel}
                  </span>
                ) : (
                  <span className="text-sm text-gray-900">-</span>
                )}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-500">
                Project Type
              </h4>
              <p className="mt-1 text-sm text-gray-900">
                {application.job.projectType || "-"}
              </p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-500">
                Location Preference
              </h4>
              <p className="mt-1 text-sm text-gray-900">
                {application.job.locationPreference || "-"}
              </p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-500">Posted Date</h4>
              <p className="mt-1 text-sm text-gray-900">
                {application.job.createdAt
                  ? new Date(application.job.createdAt).toLocaleDateString()
                  : "-"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Freelancer Profile Card */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Freelancer Profile
          </h3>
        </div>
        <div className="px-6 py-5 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-500">Years of Experience:</p>
              <p className="mt-1 text-sm text-gray-900">
                {application.freelancer.yearsOfExperience
                  ? `${application.freelancer.yearsOfExperience} years`
                  : "-"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Rate:</p>
              <p className="mt-1 text-sm text-gray-900">
                {application.freelancer.hourlyRate
                  ? `$${application.freelancer.hourlyRate}/${application.freelancer.compensationType === CompensationType.HourlyRate ? "hour" : "fixed"}`
                  : "-"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Availability:</p>
              <p className="mt-1 text-sm text-gray-900">
                {application.freelancer.availableForWork !== undefined ? (
                  <span
                    className={`inline-flex rounded-full px-2 text-xs font-semibold ${
                      application.freelancer.availableForWork
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {application.freelancer.availableForWork
                      ? "Available"
                      : "Not Available"}
                  </span>
                ) : (
                  "-"
                )}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Working Hours:</p>
              <p className="mt-1 text-sm text-gray-900">
                {application.freelancer.hoursAvailableFrom &&
                application.freelancer.hoursAvailableTo
                  ? `${application.freelancer.hoursAvailableFrom} - ${application.freelancer.hoursAvailableTo}`
                  : "-"}
              </p>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-500">About</p>
            <div
              className="mt-1 text-sm text-gray-900 prose max-w-none"
              dangerouslySetInnerHTML={{
                __html: application.freelancer.about || "-",
              }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Fields of Expertise */}
            <div>
              <p className="text-sm text-gray-500">Fields of Expertise:</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {fieldsOfExpertise.length > 0 ? (
                  fieldsOfExpertise.map((field: string) => (
                    <span
                      key={field}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {field}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-gray-900">-</span>
                )}
              </div>
            </div>

            {/* Jobs Open To */}
            <div>
              <p className="text-sm text-gray-500">Jobs Open To:</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {jobsOpenTo.length > 0 ? (
                  jobsOpenTo.map((job: string) => (
                    <span
                      key={job}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                    >
                      {job}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-gray-900">-</span>
                )}
              </div>
            </div>
          </div>

          {/* Preferred Project Types */}
          <div>
            <p className="text-sm text-gray-500">Preferred Project Types:</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {preferredProjectTypes.length > 0 ? (
                preferredProjectTypes.map((type: string) => (
                  <span
                    key={type}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
                  >
                    {type}
                  </span>
                ))
              ) : (
                <span className="text-sm text-gray-900">-</span>
              )}
            </div>
          </div>

          {/* Skills Section */}
          <div className="border-t border-gray-200 pt-4">
            <h4 className="text-sm font-medium text-gray-500">Skills</h4>
            <div className="mt-2 mb-4">
              {(() => {
                const hasRequiredSkills =
                  application.job.skills && application.job.skills.length > 0;
                if (!hasRequiredSkills) {
                  return (
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-medium">Skills Match:</div>
                      <div className="px-2 py-1 rounded-md text-sm font-medium bg-green-100 text-green-800">
                        100% fit
                      </div>
                      <span className="text-sm text-gray-500">
                        (No skills required for this job)
                      </span>
                    </div>
                  );
                }

                const totalRequired = application.job.skills.length;
                const matching = application.job.skills.filter((jobSkill) =>
                  application.freelancer.skills.some(
                    (fs) => fs.id === jobSkill.id
                  )
                ).length;
                const matchRate = (matching / totalRequired) * 100;
                return (
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-medium">Skills Match:</div>
                    <div
                      className={`px-2 py-1 rounded-md text-sm font-medium ${
                        matchRate >= 80
                          ? "bg-green-100 text-green-800"
                          : matchRate >= 50
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                      }`}
                    >
                      {matchRate.toFixed(1)}% fit
                    </div>
                    <span className="text-sm text-gray-500">
                      ({matching} of {totalRequired} required skills)
                    </span>
                  </div>
                );
              })()}
            </div>

            <div className="mt-2">
              <div className="text-sm text-gray-500 mb-2">
                Matching with Job Requirements:
              </div>
              <div className="flex flex-wrap gap-2">
                {application.job.skills &&
                application.job.skills.length > 0 &&
                application.job.skills.some((jobSkill) =>
                  application.freelancer.skills.some(
                    (fs) => fs.id === jobSkill.id
                  )
                ) ? (
                  application.job.skills
                    .filter((jobSkill) =>
                      application.freelancer.skills.some(
                        (fs) => fs.id === jobSkill.id
                      )
                    )
                    .map((jobSkill) => {
                      const matchingFreelancerSkill =
                        application.freelancer.skills.find(
                          (fs) => fs.id === jobSkill.id
                        );
                      return (
                        <div
                          key={jobSkill.id}
                          className="flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-300"
                        >
                          <span>{jobSkill.label}</span>
                          {jobSkill.isStarred && (
                            <span className="ml-1 text-yellow-500">★</span>
                          )}
                          {matchingFreelancerSkill && (
                            <span className="ml-1 text-green-600">
                              ({matchingFreelancerSkill.yearsOfExperience}y)
                            </span>
                          )}
                        </div>
                      );
                    })
                ) : (
                  <span className="text-sm text-gray-900">-</span>
                )}
              </div>

              <div className="text-sm text-gray-500 mt-4 mb-2">
                Missing Required Skills:
              </div>
              <div className="flex flex-wrap gap-2">
                {application.job.skills &&
                application.job.skills.length > 0 &&
                application.job.skills.some(
                  (jobSkill) =>
                    !application.freelancer.skills.some(
                      (fs) => fs.id === jobSkill.id
                    )
                ) ? (
                  application.job.skills
                    .filter(
                      (jobSkill) =>
                        !application.freelancer.skills.some(
                          (fs) => fs.id === jobSkill.id
                        )
                    )
                    .map((jobSkill) => (
                      <div
                        key={jobSkill.id}
                        className="flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-300"
                      >
                        <span>{jobSkill.label}</span>
                        {jobSkill.isStarred && (
                          <span className="ml-1 text-yellow-500">★</span>
                        )}
                      </div>
                    ))
                ) : (
                  <span className="text-sm text-gray-900">-</span>
                )}
              </div>

              <div className="text-sm text-gray-500 mt-4 mb-2">
                Additional Skills:
              </div>
              <div className="flex flex-wrap gap-2">
                {application.freelancer.skills &&
                application.freelancer.skills.length > 0 &&
                application.freelancer.skills.some(
                  (fs) => !application.job.skills.some((js) => js.id === fs.id)
                ) ? (
                  application.freelancer.skills
                    .filter(
                      (fs) =>
                        !application.job.skills.some((js) => js.id === fs.id)
                    )
                    .map((skill) => (
                      <span
                        key={skill.id}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {skill.label} ({skill.yearsOfExperience}y)
                      </span>
                    ))
                ) : (
                  <span className="text-sm text-gray-900">-</span>
                )}
              </div>
            </div>
          </div>

          {/* Available Hours Section */}
          <div className="border-t border-gray-200 pt-4">
            <h4 className="text-sm font-medium text-gray-500">
              Available Hours
            </h4>
            <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500">Available From:</p>
                <p className="mt-1 text-sm text-gray-900">
                  {application.freelancer.dateAvailableFrom
                    ? new Date(
                        application.freelancer.dateAvailableFrom
                      ).toLocaleDateString()
                    : "-"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Hours Available From:</p>
                <p className="mt-1 text-sm text-gray-900">
                  {application.freelancer.hoursAvailableFrom || "-"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Hours Available To:</p>
                <p className="mt-1 text-sm text-gray-900">
                  {application.freelancer.hoursAvailableTo || "-"}
                </p>
              </div>
            </div>
          </div>
        </div>
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
