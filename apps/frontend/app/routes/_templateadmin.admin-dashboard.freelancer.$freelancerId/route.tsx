import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import {
  useLoaderData,
  Link,
  useActionData,
  Form,
  Outlet,
} from "@remix-run/react";
import { count, eq } from "drizzle-orm";
import { db } from "~/db/drizzle/connector";
import {
  freelancersTable,
  accountsTable,
  UsersTable,
  jobApplicationsTable,
} from "~/db/drizzle/schemas/schema";
import { AccountStatus, CompensationType } from "~/types/enums";

export async function loader({ params }: LoaderFunctionArgs) {
  const freelancerId = params.freelancerId;

  if (!freelancerId) {
    throw new Response("Freelancer ID is required", { status: 400 });
  }

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

  // Count applications
  const applicationCount = await db
    .select({ count: count() })
    .from(jobApplicationsTable)
    .where(eq(jobApplicationsTable.freelancerId, parseInt(freelancerId)));
  freelancerDetails[0].freelancer.certificates = JSON.parse(
    freelancerDetails[0].freelancer.certificates as string
  );
  freelancerDetails[0].freelancer.educations = JSON.parse(
    freelancerDetails[0].freelancer.educations as string
  );
  freelancerDetails[0].freelancer.workHistory = JSON.parse(
    freelancerDetails[0].freelancer.workHistory as string
  );
  return {
    freelancer: freelancerDetails[0],
    applicationCount: applicationCount[0].count || 0,
  };
}

export async function action({ request, params }: ActionFunctionArgs) {
  const formData = await request.formData();
  const status = formData.get("accountStatus") as AccountStatus;
  const freelancerId = params.freelancerId;

  if (!freelancerId || !status) {
    return Response.json({ success: false, error: "Missing required fields" });
  }

  try {
    // Get the account ID for this freelancer
    const freelancer = await db
      .select({ accountId: freelancersTable.accountId })
      .from(freelancersTable)
      .where(eq(freelancersTable.id, parseInt(freelancerId)));

    if (freelancer.length === 0) {
      return Response.json({ success: false, error: "Freelancer not found" });
    }

    // Update the account status
    await db
      .update(accountsTable)
      .set({ accountStatus: status })
      .where(eq(accountsTable.id, freelancer[0].accountId));

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error updating account status:", error);
    return Response.json({
      success: false,
      error: "Failed to update account status",
    });
  }
}

export default function FreelancerDetails() {
  const { freelancer, applicationCount } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  console.log(freelancer);
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Freelancer Profile</h1>
        <div className="flex space-x-4">
          <Link
            to={`/admin-dashboard/freelancer/${freelancer.freelancer.id}/applications`}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primaryColor hover:bg-primaryColor/90"
          >
            View Applications ({applicationCount})
          </Link>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              {freelancer.user.firstName} {freelancer.user.lastName}
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              {freelancer.user.email}
            </p>
          </div>
          <span
            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
              freelancer.account.accountStatus === AccountStatus.Published
                ? "bg-green-100 text-green-800"
                : freelancer.account.accountStatus === AccountStatus.Pending
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-red-100 text-red-800"
            }`}
          >
            {freelancer.account.accountStatus}
          </span>
        </div>

        <div className="border-t border-gray-200">
          <dl>
            {/* Basic Information */}
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">About</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {freelancer.freelancer.about || "Not provided"}
              </dd>
            </div>

            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                Fields of Expertise
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {freelancer.freelancer.fieldsOfExpertise?.join(", ") ||
                  "Not provided"}
              </dd>
            </div>

            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                Years of Experience
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {freelancer.freelancer.yearsOfExperience || "Not provided"}
              </dd>
            </div>

            {/* Compensation */}
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Hourly Rate</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {freelancer.freelancer.hourlyRate
                  ? `$${freelancer.freelancer.hourlyRate}`
                  : "Not provided"}
              </dd>
            </div>

            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                Compensation Type
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {freelancer.freelancer.compensationType || "Not provided"}
              </dd>
            </div>

            {/* Availability */}
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                Available for Work
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {freelancer.freelancer.availableForWork ? "Yes" : "No"}
              </dd>
            </div>

            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                Available From
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {freelancer.freelancer.dateAvailableFrom
                  ? new Date(
                      freelancer.freelancer.dateAvailableFrom
                    ).toLocaleDateString()
                  : "Not provided"}
              </dd>
            </div>

            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                Hours Available
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {freelancer.freelancer.hoursAvailableFrom &&
                freelancer.freelancer.hoursAvailableTo
                  ? `${freelancer.freelancer.hoursAvailableFrom} - ${freelancer.freelancer.hoursAvailableTo}`
                  : "Not provided"}
              </dd>
            </div>

            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                Jobs Open To
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {freelancer.freelancer.jobsOpenTo?.join(", ") || "Not provided"}
              </dd>
            </div>

            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                Preferred Project Types
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {freelancer.freelancer.preferredProjectTypes?.join(", ") ||
                  "Not provided"}
              </dd>
            </div>

            {/* Portfolio & CV */}
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Portfolio</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {freelancer.freelancer.portfolio ? (
                  <a
                    href={freelancer.freelancer.portfolio}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primaryColor hover:underline"
                  >
                    View Portfolio
                  </a>
                ) : (
                  "Not provided"
                )}
              </dd>
            </div>

            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">CV</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {freelancer.freelancer.cvLink ? (
                  <a
                    href={freelancer.freelancer.cvLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primaryColor hover:underline"
                  >
                    View CV
                  </a>
                ) : (
                  "Not provided"
                )}
              </dd>
            </div>

            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                Video Introduction
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {freelancer.freelancer.videoLink ? (
                  <a
                    href={freelancer.freelancer.videoLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primaryColor hover:underline"
                  >
                    View Video
                  </a>
                ) : (
                  "Not provided"
                )}
              </dd>
            </div>

            {/* Education & Certificates */}
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Education</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {freelancer.freelancer.educations &&
                freelancer.freelancer.educations.length > 0 ? (
                  <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
                    {freelancer.freelancer.educations.map(
                      (education, index) => (
                        <li
                          key={index}
                          className="pl-3 pr-4 py-3 flex items-center justify-between text-sm"
                        >
                          <div className="w-0 flex-1 flex flex-col">
                            <span className="font-medium">
                              {education.institution}
                            </span>
                            <span>{education.degree}</span>
                            <span className="text-gray-500">
                              {education.startDate} -{" "}
                              {education.endDate || "Present"}
                            </span>
                          </div>
                        </li>
                      )
                    )}
                  </ul>
                ) : (
                  "Not provided"
                )}
              </dd>
            </div>

            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                Certificates
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {freelancer.freelancer.certificates &&
                freelancer.freelancer.certificates.length > 0 ? (
                  <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
                    {freelancer.freelancer.certificates.map(
                      (certificate, index) => (
                        <li
                          key={index}
                          className="pl-3 pr-4 py-3 flex items-center justify-between text-sm"
                        >
                          <div className="w-0 flex-1 flex flex-col">
                            <span className="font-medium">
                              {certificate.name}
                            </span>
                            <span>{certificate.issuer}</span>
                            <span className="text-gray-500">
                              Issued: {certificate.issueDate}
                            </span>
                          </div>
                        </li>
                      )
                    )}
                  </ul>
                ) : (
                  "Not provided"
                )}
              </dd>
            </div>

            {/* Work History */}
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                Work History
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {freelancer.freelancer.workHistory &&
                freelancer.freelancer.workHistory.length > 0 ? (
                  <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
                    {freelancer.freelancer.workHistory.map((work, index) => (
                      <li
                        key={index}
                        className="pl-3 pr-4 py-3 flex items-center justify-between text-sm"
                      >
                        <div className="w-0 flex-1 flex flex-col">
                          <span className="font-medium">{work.position}</span>
                          <span>{work.company}</span>
                          <span className="text-gray-500">
                            {work.startDate} - {work.endDate || "Present"}
                          </span>
                          <p className="mt-1">{work.description}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  "Not provided"
                )}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Render child routes */}
      <Outlet />
    </div>
  );
}
