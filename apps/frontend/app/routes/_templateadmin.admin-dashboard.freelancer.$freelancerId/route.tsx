import { ActionFunctionArgs, LoaderFunctionArgs, json } from "@remix-run/node";
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
  jobsTable,
} from "~/db/drizzle/schemas/schema";
import {
  AccountStatus,
  CompensationType,
  JobApplicationStatus,
} from "~/types/enums";

type ActionResponse = {
  success: boolean;
  error?: string;
};

// Add type definitions for the arrays
type Portfolio = {
  projectName: string;
  projectLink: string;
  projectDescription: string;
  projectImageName: string;
  projectImageUrl: string;
  attachmentName: string;
  attachmentId: number;
};

type Certificate = {
  certificateName: string;
  issuedBy: string;
  yearIssued: number;
  attachmentName: string | null;
  attachmentUrl: string;
  attachmentId: number | null;
};

type Education = {
  degree: string;
  institution: string;
  graduationYear: number;
};

type WorkHistory = {
  title: string;
  company: string;
  currentlyWorkingThere: boolean;
  startDate: string;
  endDate: string;
  jobDescription: string;
};

type FreelancerData = {
  freelancer: {
    id: number;
    accountId: number;
    about: string;
    fieldsOfExpertise: string[];
    yearsOfExperience: number;
    hourlyRate: number;
    compensationType: CompensationType;
    availableForWork: boolean;
    dateAvailableFrom: string;
    hoursAvailableFrom: string;
    hoursAvailableTo: string;
    jobsOpenTo: string[];
    preferredProjectTypes: string[];
    portfolio: Portfolio[];
    cvLink: string;
    videoLink: string;
    certificates: Certificate[];
    educations: Education[];
    workHistory: WorkHistory[];
  };
  account: {
    id: number;
    accountStatus: AccountStatus;
    country: string;
    address: string;
    region: string;
    phone: string;
    websiteURL: string;
    socialMediaLinks: Record<string, string>;
  };
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
};

type LoaderData = {
  freelancer: FreelancerData;
  applications: JobApplication[];
  applicationCount: number;
};

interface JobApplication {
  id: number;
  jobId: number;
  jobTitle: string;
  status: JobApplicationStatus;
  createdAt: string;
  freelancerId: number;
}

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

  // Get all job applications
  const applications = await db
    .select({
      id: jobApplicationsTable.id,
      jobId: jobApplicationsTable.jobId,
      status: jobApplicationsTable.status,
      createdAt: jobApplicationsTable.createdAt,
      freelancerId: jobApplicationsTable.freelancerId,
      jobTitle: jobsTable.title,
    })
    .from(jobApplicationsTable)
    .where(eq(jobApplicationsTable.freelancerId, parseInt(freelancerId)))
    .leftJoin(jobsTable, eq(jobApplicationsTable.jobId, jobsTable.id));

  // Parse JSON fields with proper error handling
  const freelancer = freelancerDetails[0].freelancer;
  const parsedFreelancer = {
    ...freelancer,
    fieldsOfExpertise: Array.isArray(freelancer.fieldsOfExpertise)
      ? freelancer.fieldsOfExpertise
      : safeParseJSON<string[]>(
          freelancer.fieldsOfExpertise as unknown as string,
          []
        ),
    jobsOpenTo: Array.isArray(freelancer.jobsOpenTo)
      ? freelancer.jobsOpenTo
      : safeParseJSON<string[]>(freelancer.jobsOpenTo as unknown as string, []),
    preferredProjectTypes: Array.isArray(freelancer.preferredProjectTypes)
      ? freelancer.preferredProjectTypes
      : safeParseJSON<string[]>(
          freelancer.preferredProjectTypes as unknown as string,
          []
        ),
    portfolio: safeParseJSON<Portfolio[]>(freelancer.portfolio as string, []),
    certificates: safeParseJSON<Certificate[]>(
      freelancer.certificates as string,
      []
    ),
    educations: safeParseJSON<Education[]>(freelancer.educations as string, []),
    workHistory: safeParseJSON<WorkHistory[]>(
      freelancer.workHistory as string,
      []
    ),
  };

  const jobApplications = applications.map((app) => ({
    id: app.id,
    jobId: app.jobId,
    jobTitle: app.jobTitle,
    status: app.status as JobApplicationStatus,
    createdAt: app.createdAt.toISOString(),
    freelancerId: app.freelancerId,
  }));

  return {
    freelancer: {
      ...freelancerDetails[0],
      freelancer: parsedFreelancer,
    } as unknown as FreelancerData,
    applications: jobApplications,
    applicationCount: jobApplications.length,
  };
}

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

export async function action({ request, params }: ActionFunctionArgs) {
  const formData = await request.formData();
  const status = formData.get("accountStatus") as AccountStatus;
  const freelancerId = params.freelancerId;

  if (!freelancerId || !status) {
    return json<ActionResponse>({
      success: false,
      error: "Missing required fields",
    });
  }

  try {
    // Get the account ID for this freelancer
    const freelancer = await db
      .select({ accountId: freelancersTable.accountId })
      .from(freelancersTable)
      .where(eq(freelancersTable.id, parseInt(freelancerId)));

    if (freelancer.length === 0) {
      return json<ActionResponse>({
        success: false,
        error: "Freelancer not found",
      });
    }

    // Update the account status
    await db
      .update(accountsTable)
      .set({ accountStatus: status })
      .where(eq(accountsTable.id, freelancer[0].accountId));

    return json<ActionResponse>({ success: true });
  } catch (error) {
    console.error("Error updating account status:", error);
    return json<ActionResponse>({
      success: false,
      error: "Failed to update account status",
    });
  }
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

export default function FreelancerDetails() {
  const { freelancer, applications, applicationCount } =
    useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const accountStatusValues = Object.values(AccountStatus) as AccountStatus[];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Freelancer Details</h1>
        <span className="text-sm text-gray-500">
          Total Applications: {applicationCount}
        </span>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            User Information
          </h3>
        </div>

        <div className="px-6 py-5 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <h4 className="text-sm font-medium text-gray-500">Full Name</h4>
            <p className="mt-1 text-sm text-gray-900">
              {freelancer.user.firstName} {freelancer.user.lastName}
            </p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-500">Email</h4>
            <p className="mt-1 text-sm text-gray-900">
              {freelancer.user.email}
            </p>
          </div>

          {/* Account Information */}
          <div className="col-span-2">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Account Information
            </h3>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-500">Country</h4>
            <p className="mt-1 text-sm text-gray-900">
              {freelancer.account.country || "Not provided"}
            </p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-500">Address</h4>
            <p className="mt-1 text-sm text-gray-900">
              {freelancer.account.address || "Not provided"}
            </p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-500">Region</h4>
            <p className="mt-1 text-sm text-gray-900">
              {freelancer.account.region || "Not provided"}
            </p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-500">Phone</h4>
            <p className="mt-1 text-sm text-gray-900">
              {freelancer.account.phone || "Not provided"}
            </p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-500">
              Online Presence
            </h4>
            <div className="mt-1 text-sm text-gray-900 flex flex-wrap gap-2 items-center">
              {freelancer.account.websiteURL && (
                <>
                  <a
                    href={freelancer.account.websiteURL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primaryColor hover:text-primaryColor/80"
                  >
                    Website
                  </a>
                </>
              )}
              {freelancer.account.socialMediaLinks &&
                Object.entries(freelancer.account.socialMediaLinks).map(
                  ([platform, url], index) => (
                    <>
                      {(index > 0 || freelancer.account.websiteURL) && (
                        <span className="text-gray-400">-</span>
                      )}
                      <a
                        key={platform}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primaryColor hover:text-primaryColor/80"
                      >
                        {platform.charAt(0).toUpperCase() + platform.slice(1)}
                      </a>
                    </>
                  )
                )}
              {!freelancer.account.websiteURL &&
                (!freelancer.account.socialMediaLinks ||
                  Object.keys(freelancer.account.socialMediaLinks).length ===
                    0) && <p>No online presence provided</p>}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-500">
              Account Status
            </h4>
            <p className="mt-1">
              <span
                className={`inline-flex rounded-full px-2 text-xs font-semibold ${
                  freelancer.account.accountStatus === AccountStatus.Published
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {freelancer.account.accountStatus}
              </span>
            </p>
          </div>

          {/* Professional Information */}
          <div className="col-span-2">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Professional Information
            </h3>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-500">
              Fields of Expertise
            </h4>
            <div className="mt-1 flex flex-wrap gap-2">
              {freelancer.freelancer.fieldsOfExpertise.map((field) => (
                <span
                  key={field}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {field}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-500">
              Years of Experience
            </h4>
            <p className="mt-1 text-sm text-gray-900">
              {freelancer.freelancer.yearsOfExperience}
            </p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-500">Rate</h4>
            <p className="mt-1 text-sm text-gray-900">
              ${freelancer.freelancer.hourlyRate}/
              {freelancer.freelancer.compensationType} (
              {freelancer.freelancer.compensationType ===
              CompensationType.HourlyRate
                ? "Hourly"
                : "Fixed"}
              )
            </p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-500">
              Availability Status
            </h4>
            <p className="mt-1">
              <span
                className={`inline-flex rounded-full px-2 text-xs font-semibold ${
                  freelancer.freelancer.availableForWork
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {freelancer.freelancer.availableForWork
                  ? "Available"
                  : "Not Available"}
              </span>
            </p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-500">
              Available From
            </h4>
            <p className="mt-1 text-sm text-gray-900">
              {freelancer.freelancer.dateAvailableFrom || "Not specified"}
            </p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-500">Working Hours</h4>
            <p className="mt-1 text-sm text-gray-900">
              {freelancer.freelancer.hoursAvailableFrom} -{" "}
              {freelancer.freelancer.hoursAvailableTo}
            </p>
          </div>

          <div className="col-span-2">
            <h4 className="text-sm font-medium text-gray-500">About</h4>
            <p className="mt-1 text-sm text-gray-900">
              {/* Method 1: Using dangerouslySetInnerHTML */}
              <span
                dangerouslySetInnerHTML={{
                  __html:
                    freelancer.freelancer.about || "No description provided",
                }}
              />

              {/* Method 2: Using regex to strip HTML tags */}
              {(
                freelancer.freelancer.about || "No description provided"
              ).replace(/<[^>]*>/g, "")}
            </p>
          </div>

          <div className="col-span-2">
            <h4 className="text-sm font-medium text-gray-500">Jobs Open To</h4>
            <div className="mt-1 flex flex-wrap gap-2">
              {freelancer.freelancer.jobsOpenTo.map((job) => (
                <span
                  key={job}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {job}
                </span>
              ))}
            </div>
          </div>

          <div className="col-span-2">
            <h4 className="text-sm font-medium text-gray-500">
              Preferred Project Types
            </h4>
            <div className="mt-1 flex flex-wrap gap-2">
              {freelancer.freelancer.preferredProjectTypes.map((type) => (
                <span
                  key={type}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {type}
                </span>
              ))}
            </div>

            {/* CV and Video Links */}
            <div className="col-span-2 space-y-6 mt-5">
              <div>
                <h4 className="text-sm font-medium text-gray-500">CV</h4>
                <p className="mt-1 text-sm text-gray-900">
                  {freelancer.freelancer.cvLink ? (
                    <a
                      href={freelancer.freelancer.cvLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primaryColor hover:text-primaryColor/80"
                    >
                      View CV
                    </a>
                  ) : (
                    "Not provided"
                  )}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500">
                  Introduction Video
                </h4>
                <p className="mt-1 text-sm text-gray-900">
                  {freelancer.freelancer.videoLink ? (
                    <a
                      href={freelancer.freelancer.videoLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primaryColor hover:text-primaryColor/80"
                    >
                      Watch Video
                    </a>
                  ) : (
                    "Not provided"
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Portfolio */}
          <div className="col-span-2">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Portfolio
            </h3>
          </div>

          <div className="col-span-2 space-y-4">
            {freelancer.freelancer.portfolio.map((project, index) => (
              <div key={index} className="border rounded-lg p-4 bg-gray-50">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">
                      Project Name
                    </h4>
                    <p className="mt-1 text-sm text-gray-900">
                      {project.projectName}
                    </p>
                  </div>
                  {project.projectLink && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">
                        Project Link
                      </h4>
                      <p className="mt-1 text-sm text-gray-900">
                        <a
                          href={project.projectLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primaryColor hover:text-primaryColor/80"
                        >
                          View Project
                        </a>
                      </p>
                    </div>
                  )}
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">
                      Description
                    </h4>
                    <div
                      className="mt-1 text-sm text-gray-900"
                      dangerouslySetInnerHTML={{
                        __html: project.projectDescription,
                      }}
                    />
                  </div>
                  {project.projectImageUrl && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">
                        Project Image
                      </h4>
                      <img
                        src={project.projectImageUrl}
                        alt={project.projectName}
                        className="mt-2 rounded-lg max-w-full h-auto"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
            {freelancer.freelancer.portfolio.length === 0 && (
              <p className="text-sm text-gray-500">
                No portfolio projects provided
              </p>
            )}
          </div>

          {/* Work History */}
          <div className="col-span-2">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Work History
            </h3>
          </div>

          <div className="col-span-2 space-y-4">
            {freelancer.freelancer.workHistory.map((work, index) => (
              <div key={index} className="border rounded-lg p-4 bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">
                      Position
                    </h4>
                    <p className="mt-1 text-sm text-gray-900">{work.title}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">
                      Company
                    </h4>
                    <p className="mt-1 text-sm text-gray-900">{work.company}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">
                      Duration
                    </h4>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date(work.startDate).toLocaleDateString()} -{" "}
                      {work.currentlyWorkingThere
                        ? "Present"
                        : new Date(work.endDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <h4 className="text-sm font-medium text-gray-500">
                      Description
                    </h4>
                    <div
                      className="mt-1 text-sm text-gray-900"
                      dangerouslySetInnerHTML={{ __html: work.jobDescription }}
                    />
                  </div>
                </div>
              </div>
            ))}
            {freelancer.freelancer.workHistory.length === 0 && (
              <p className="text-sm text-gray-500">No work history provided</p>
            )}
          </div>

          {/* Education */}
          <div className="col-span-2">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Education
            </h3>
          </div>

          <div className="col-span-2 space-y-4">
            {freelancer.freelancer.educations.map((education, index) => (
              <div key={index} className="border rounded-lg p-4 bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">
                      Degree
                    </h4>
                    <p className="mt-1 text-sm text-gray-900">
                      {education.degree}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">
                      Institution
                    </h4>
                    <p className="mt-1 text-sm text-gray-900">
                      {education.institution}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">
                      Graduation Year
                    </h4>
                    <p className="mt-1 text-sm text-gray-900">
                      {education.graduationYear}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {freelancer.freelancer.educations.length === 0 && (
              <p className="text-sm text-gray-500">
                No education history provided
              </p>
            )}
          </div>

          {/* Certificates */}
          <div className="col-span-2">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Certificates
            </h3>
          </div>

          <div className="col-span-2 space-y-4">
            {freelancer.freelancer.certificates.map((cert, index) => (
              <div key={index} className="border rounded-lg p-4 bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">
                      Certificate Name
                    </h4>
                    <p className="mt-1 text-sm text-gray-900">
                      {cert.certificateName}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">
                      Issued By
                    </h4>
                    <p className="mt-1 text-sm text-gray-900">
                      {cert.issuedBy}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">
                      Year Issued
                    </h4>
                    <p className="mt-1 text-sm text-gray-900">
                      {cert.yearIssued}
                    </p>
                  </div>
                  {cert.attachmentUrl && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">
                        Certificate
                      </h4>
                      <p className="mt-1 text-sm text-gray-900">
                        <a
                          href={cert.attachmentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primaryColor hover:text-primaryColor/80"
                        >
                          View Certificate
                        </a>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {freelancer.freelancer.certificates.length === 0 && (
              <p className="text-sm text-gray-500">No certificates provided</p>
            )}
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
                defaultValue={freelancer.account.accountStatus}
                className="block w-full max-w-lg rounded-md border-gray-300 shadow-sm focus:border-primaryColor focus:ring-primaryColor sm:max-w-xs sm:text-sm"
              >
                {accountStatusValues.map((status) => (
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

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Job Applications</h1>
      </div>

      {/* Applications Section */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-5">
          {applications.length === 0 ? (
            <p className="text-sm text-gray-500">
              No applications submitted yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Job Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Applied Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {applications.map((application) => (
                    <tr key={application.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {application.jobTitle}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                            application.status
                          )}`}
                        >
                          {application.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(application.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Link
                          to={`/admin-dashboard/application/${application.id}`}
                          className="text-primaryColor hover:text-primaryColor/80"
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <Outlet />
    </div>
  );
}
