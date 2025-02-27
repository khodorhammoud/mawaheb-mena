import { LoaderFunctionArgs, ActionFunctionArgs, json } from "@remix-run/node";
import {
  useLoaderData,
  useActionData,
  Link,
  Form,
  Outlet,
} from "@remix-run/react";
import { eq, count } from "drizzle-orm";
import { db } from "~/db/drizzle/connector";
import {
  employersTable,
  accountsTable,
  UsersTable,
  jobsTable,
} from "~/db/drizzle/schemas/schema";
import { AccountStatus } from "~/types/enums";

export async function loader({ params }: LoaderFunctionArgs) {
  const employerId = params.employerId;

  if (!employerId) {
    throw new Response("Employer ID is required", { status: 400 });
  }

  const employerDetails = await db
    .select({
      employer: employersTable,
      account: accountsTable,
      user: UsersTable,
    })
    .from(employersTable)
    .where(eq(employersTable.id, parseInt(employerId)))
    .leftJoin(accountsTable, eq(employersTable.accountId, accountsTable.id))
    .leftJoin(UsersTable, eq(accountsTable.userId, UsersTable.id));

  if (employerDetails.length === 0) {
    throw new Response("Employer not found", { status: 404 });
  }

  // Count jobs
  const jobCount = await db
    .select({ count: count() })
    .from(jobsTable)
    .where(eq(jobsTable.employerId, parseInt(employerId)));

  return {
    employer: employerDetails[0],
    jobCount: jobCount[0].count || 0,
  };
}

export async function action({ request, params }: ActionFunctionArgs) {
  const formData = await request.formData();
  const status = formData.get("accountStatus") as AccountStatus;
  const employerId = params.employerId;

  if (!employerId || !status) {
    return json({ success: false, error: "Missing required fields" });
  }

  try {
    // Get the account ID for this employer
    const employer = await db
      .select({ accountId: employersTable.accountId })
      .from(employersTable)
      .where(eq(employersTable.id, parseInt(employerId)));

    if (employer.length === 0) {
      return json({ success: false, error: "Employer not found" });
    }

    // Update the account status
    await db
      .update(accountsTable)
      .set({ accountStatus: status })
      .where(eq(accountsTable.id, employer[0].accountId));

    return json({ success: true });
  } catch (error) {
    console.error("Error updating account status:", error);
    return json({ success: false, error: "Failed to update account status" });
  }
}

export default function EmployerDetails() {
  const { employer, jobCount } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Employer Details</h1>
        <Link
          to={`/admin-dashboard/employer/${employer.employer.id}/jobs`}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primaryColor hover:bg-primaryColor/90"
        >
          View Jobs ({jobCount})
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Company Information
          </h3>
        </div>

        <div className="px-6 py-5 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <h4 className="text-sm font-medium text-gray-500">Company Name</h4>
            <p className="mt-1 text-sm text-gray-900">
              {employer.employer.companyName ||
                `${employer.user.firstName} ${employer.user.lastName}'s Company`}
            </p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-500">Contact Email</h4>
            <p className="mt-1 text-sm text-gray-900">{employer.user.email}</p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-500">Phone</h4>
            <p className="mt-1 text-sm text-gray-900">
              {employer.account.phone || "Not provided"}
            </p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-500">Location</h4>
            <p className="mt-1 text-sm text-gray-900">
              {employer.account.address}, {employer.account.region},{" "}
              {employer.account.country}
            </p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-500">Website</h4>
            <p className="mt-1 text-sm text-gray-900">
              {employer.account.websiteURL ? (
                <a
                  href={employer.account.websiteURL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primaryColor hover:text-primaryColor/80"
                >
                  {employer.account.websiteURL}
                </a>
              ) : (
                "Not provided"
              )}
            </p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-500">
              Account Status
            </h4>
            <p className="mt-1">
              <span
                className={`inline-flex rounded-full px-2 text-xs font-semibold ${
                  employer.account.accountStatus === AccountStatus.Published
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {employer.account.accountStatus}
              </span>
            </p>
          </div>
        </div>

        <div className="px-6 py-5 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-500">
            Update Account Status
          </h4>

          {actionData?.success && (
            <div className="mt-2 rounded-md bg-green-50 p-4">
              <p className="text-sm font-medium text-green-800">
                Account status updated successfully
              </p>
            </div>
          )}

          {actionData?.error && (
            <div className="mt-2 rounded-md bg-red-50 p-4">
              <p className="text-sm font-medium text-red-800">
                {actionData.error}
              </p>
            </div>
          )}

          <Form method="post" className="mt-4">
            <div className="flex items-center space-x-4">
              <select
                name="accountStatus"
                defaultValue={employer.account.accountStatus}
                className="block w-full max-w-lg rounded-md border-gray-300 shadow-sm focus:border-primaryColor focus:ring-primaryColor sm:max-w-xs sm:text-sm"
              >
                {Object.values(AccountStatus).map((status) => (
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

      <Outlet />
    </div>
  );
}
