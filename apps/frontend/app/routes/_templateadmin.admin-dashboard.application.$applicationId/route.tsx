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
} from "~/db/drizzle/schemas/schema";
import { JobApplicationStatus } from "~/types/enums";

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
      employerAccount: employerAccount,
      employerUser: employerUser,
    })
    .from(jobApplicationsTable)
    .where(eq(jobApplicationsTable.id, parseInt(applicationId)))
    .leftJoin(jobsTable, eq(jobApplicationsTable.jobId, jobsTable.id))
    .leftJoin(
      freelancersTable,
      eq(jobApplicationsTable.freelancerId, freelancersTable.id)
    )
    // Join for freelancer data
    .leftJoin(
      freelancerAccount,
      eq(freelancersTable.accountId, freelancerAccount.id)
    )
    .leftJoin(freelancerUser, eq(freelancerAccount.userId, freelancerUser.id))
    // Join for employer data
    .leftJoin(employerAccount, eq(jobsTable.employerId, employerAccount.id))
    .leftJoin(employerUser, eq(employerAccount.userId, employerUser.id));

  if (applicationDetails.length === 0) {
    throw new Response("Application not found", { status: 404 });
  }

  return { application: applicationDetails[0] };
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
  const actionData = useActionData<typeof action>();

  return (
    <div className="space-y-8">
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Application Details
          </h3>
        </div>

        <div className="px-6 py-5 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <h4 className="text-sm font-medium text-gray-500">
              Job Information
            </h4>
            <div className="mt-2 border-t border-gray-200 pt-2">
              <p className="text-sm font-medium text-gray-900">
                {application.job.title}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                {application.job.description}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Budget: ${application.job.minBudget} - $
                {application.job.maxBudget}
              </p>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-500">
              Freelancer Information
            </h4>
            <div className="mt-2 border-t border-gray-200 pt-2">
              <p className="text-sm font-medium text-gray-900">
                {application.freelancerUser.firstName}{" "}
                {application.freelancerUser.lastName}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                {application.freelancerUser.email}
              </p>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-500">
              Employer Information
            </h4>
            <div className="mt-2 border-t border-gray-200 pt-2">
              <p className="text-sm font-medium text-gray-900">
                {application.employerUser.firstName}{" "}
                {application.employerUser.lastName}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                {application.employerUser.email}
              </p>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-500">
              Application Status
            </h4>
            <div className="mt-2 border-t border-gray-200 pt-2">
              <span
                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                ${getStatusColor(application.application.status as JobApplicationStatus)}`}
              >
                {application.application.status}
              </span>
              <p className="mt-1 text-sm text-gray-500">
                Applied on:{" "}
                {new Date(
                  application.application.createdAt
                ).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 py-5 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-500">Cover Letter</h4>
          <div className="mt-2">
            <p className="text-sm text-gray-500">
              {application.application.coverLetter}
            </p>
          </div>
        </div>

        <div className="px-6 py-5 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-500">
            Update Application Status
          </h4>

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

          <Form method="post" className="mt-4">
            <div className="flex items-center space-x-4">
              <select
                name="status"
                defaultValue={application.application.status}
                className="block w-full max-w-lg rounded-md border-gray-300 shadow-sm focus:border-primaryColor focus:ring-primaryColor sm:max-w-xs sm:text-sm"
              >
                {Object.values(JobApplicationStatus).map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primaryColor hover:bg-primaryColor/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primaryColor"
              >
                Update Status
              </button>
            </div>
          </Form>
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
