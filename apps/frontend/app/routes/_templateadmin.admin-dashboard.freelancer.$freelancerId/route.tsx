// ~/routes/freelancer/$freelancerId.tsx
import { ActionFunctionArgs, LoaderFunctionArgs, json } from '@remix-run/node';
import { useLoaderData, useActionData, Link, Form, Outlet, useNavigate } from '@remix-run/react';
import { AccountStatus, CompensationType } from '@mawaheb/db/enums';
import {
  getFreelancerDetails,
  getFreelancerApplications,
  updateFreelancerAccountStatus,
  safeParseJSON,
} from '~/servers/admin.server';
import { eq } from 'drizzle-orm';
import { db } from '@mawaheb/db/server';
import { schema } from '@mawaheb/db';

import type {
  ActionResponse,
  LoaderData,
  FreelancerData,
  JobApplication,
  Portfolio,
  Certificate,
  Education,
  WorkHistory,
} from '~/common/admin-pages/types';

import { ApplicationsTable } from '~/common/admin-pages/tables/ApplicationsTable';
import { KycDocument } from '@mawaheb/db/types/User';

const { accountsTable, UsersTable, employersTable, jobsTable } = schema;
/* function getStatusColor(status: JobApplicationStatus) {
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
} */

const readableDocName: Record<string, string> = {
  identification: 'Identification Document',
  // Add more if needed // here there is no need, but in the page of the freelancer, we shall remove the trade_license, and in the case of the compny, i need to add board_resolution
};

// Add type definitions for the arrays (now in ~/types.ts, but you can keep the comment)

export async function loader({ params }: LoaderFunctionArgs) {
  const freelancerId = params.freelancerId;
  if (!freelancerId) {
    throw new Response('Freelancer ID is required', { status: 400 });
  }

  // 1) Fetch the main freelancer row
  const detailRow = await getFreelancerDetails(+freelancerId);
  if (!detailRow) {
    throw new Response('Freelancer not found', { status: 404 });
  }

  // 2) Fetch all job applications
  const apps = await getFreelancerApplications(+freelancerId);

  // 3) Parse JSON fields with proper error handling
  const freelancer = detailRow.freelancer;

  // console.log("Raw portfolio data:", freelancer.portfolio);
  // console.log("Raw workHistory data:", freelancer.workHistory);
  // console.log("Raw educations data:", freelancer.educations);
  // console.log("Raw certificates data:", freelancer.certificates);

  const parsedFreelancer = {
    ...freelancer,
    fieldsOfExpertise: Array.isArray(freelancer.fieldsOfExpertise)
      ? freelancer.fieldsOfExpertise
      : safeParseJSON<string[]>(freelancer.fieldsOfExpertise as unknown as string, []),
    jobsOpenTo: Array.isArray(freelancer.jobsOpenTo)
      ? freelancer.jobsOpenTo
      : safeParseJSON<string[]>(freelancer.jobsOpenTo as unknown as string, []),
    preferredProjectTypes: Array.isArray(freelancer.preferredProjectTypes)
      ? freelancer.preferredProjectTypes
      : safeParseJSON<string[]>(freelancer.preferredProjectTypes as unknown as string, []),
    portfolio: safeParseJSON<Portfolio[]>(freelancer.portfolio as string, []),
    certificates: safeParseJSON<Certificate[]>(freelancer.certificates as string, []),
    educations: safeParseJSON<Education[]>(freelancer.educations as string, []),
    workHistory: safeParseJSON<WorkHistory[]>(freelancer.workHistory as string, []),
  };

  // console.log("Parsed portfolio:", parsedFreelancer.portfolio);
  // console.log("Parsed workHistory:", parsedFreelancer.workHistory);
  // console.log("Parsed educations:", parsedFreelancer.educations);
  // console.log("Parsed certificates:", parsedFreelancer.certificates);

  // 4) Convert application date to ISO and fetch employer info
  const jobApplications = await Promise.all(
    apps.map(async app => {
      // Get employer info for each job application
      let employerInfo = null;
      if (app?.jobId) {
        const jobDetails = await db
          .select({
            employer: employersTable,
            user: UsersTable,
            account: accountsTable,
          })
          .from(jobsTable)
          .where(eq(jobsTable.id, app.jobId))
          .leftJoin(employersTable, eq(jobsTable.employerId, employersTable.id))
          .leftJoin(accountsTable, eq(employersTable.accountId, accountsTable.id))
          .leftJoin(UsersTable, eq(accountsTable.userId, UsersTable.id))
          .limit(1);

        if (jobDetails.length > 0) {
          employerInfo = {
            employerId: jobDetails[0].employer.id,
            employerFirstName: jobDetails[0].user.firstName,
            employerLastName: jobDetails[0].user.lastName,
            employerEmail: jobDetails[0].user.email,
            employerAccountStatus: jobDetails[0].account.accountStatus,
          };
        }
      }

      return {
        id: app?.id,
        jobId: app?.jobId,
        jobTitle: app?.jobTitle,
        status: app?.status,
        createdAt: app?.createdAt.toISOString(),
        freelancerId: app?.freelancerId,
        matchScore: (app as any)?.matchScore,
        // Add employer info if available
        ...employerInfo,
      };
    })
  );

  // console.log('KYC Docs:', detailRow.kycDocuments);

  return json<LoaderData>({
    freelancer: {
      ...detailRow,
      freelancer: parsedFreelancer,
    } as unknown as FreelancerData,
    applications: jobApplications as JobApplication[],
    applicationCount: jobApplications.length,
    kycDocuments: detailRow.kycDocuments, // ✔ only if you don't spread it
  });
}

export async function action({ request, params }: ActionFunctionArgs) {
  const formData = await request.formData();
  const status = formData.get('accountStatus') as AccountStatus;
  const freelancerId = params.freelancerId;

  if (!freelancerId || !status) {
    return json<ActionResponse>({
      success: false,
      error: 'Missing required fields',
    });
  }

  // Attempt to update the freelancer's account status
  const result = await updateFreelancerAccountStatus(+freelancerId, status);
  return json<ActionResponse>(result);
}

export default function FreelancerDetails() {
  const { freelancer, applications, applicationCount, kycDocuments } =
    useLoaderData<typeof loader>();

  const actionData = useActionData<typeof action>();
  const accountStatusValues = Object.values(AccountStatus);

  // The main layout, refactored into local sub-components
  return (
    <div className="space-y-6">
      {/* Back button */}
      <BackButton />

      <HeaderSection applicationCount={applicationCount} />

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <UserAccountSection freelancer={freelancer} kycDocuments={kycDocuments} />

        {/* Update Account Status */}
        <UpdateAccountStatus
          currentStatus={freelancer.account.accountStatus}
          accountStatusValues={accountStatusValues}
          actionData={actionData}
        />
      </div>

      {/* Applications Section */}
      <ApplicationsArea applications={applications} />

      <Outlet />
    </div>
  );
}

/** Subcomponent: Renders the top heading + total application count */
function HeaderSection({ applicationCount }: { applicationCount: number }) {
  return (
    <div className="flex justify-between items-center">
      <h1 className="text-2xl font-bold">Freelancer Details</h1>
      <span className="text-sm text-gray-500">Total Applications: {applicationCount}</span>
    </div>
  );
}

/** Subcomponent: Renders user + account info + professional info + portfolio, etc. */
function UserAccountSection({
  freelancer,
  kycDocuments,
}: {
  freelancer: FreelancerData;
  kycDocuments: Record<string, KycDocument[]>;
}) {
  return (
    <>
      <div className="px-6 py-5 border-b border-gray-200">
        <h3 className="text-lg font-medium leading-6 text-gray-900">User Information</h3>
      </div>

      <div className="px-6 py-5 grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Basic Personal Info */}
        <PersonalInfo freelancer={freelancer} kycDocuments={kycDocuments} />

        {/* Account Info */}
        <AccountInfo freelancer={freelancer} kycDocuments={kycDocuments} />

        {/* Professional Info */}
        <ProfessionalInfo freelancer={freelancer} />

        {/* Portfolio */}
        <PortfolioSection freelancer={freelancer} />

        {/* Work History */}
        <WorkHistorySection freelancer={freelancer} />

        {/* Education */}
        <EducationSection freelancer={freelancer} />

        {/* Certificates */}
        <CertificatesSection freelancer={freelancer} />
      </div>
    </>
  );
}

/** Subcomponent: Basic personal info (Name, Email) */
function PersonalInfo({
  freelancer,
  kycDocuments,
}: {
  freelancer: FreelancerData;
  kycDocuments: Record<string, KycDocument[]>;
}) {
  return (
    <>
      <div>
        <h4 className="text-sm font-medium text-gray-500">Full Name</h4>
        <p className="mt-1 text-sm text-gray-900">
          {freelancer.user.firstName} {freelancer.user.lastName}
        </p>
      </div>
      <div>
        <h4 className="text-sm font-medium text-gray-500">Email</h4>
        <p className="mt-1 text-sm text-gray-900">{freelancer.user.email}</p>
      </div>

      <div className="col-span-2">
        <h3 className="text-lg font-medium text-gray-900">Account Information</h3>
      </div>
    </>
  );
}

/** Subcomponent: Address, region, phone, website, social links */
function AccountInfo({
  freelancer,
  kycDocuments,
}: {
  freelancer: FreelancerData;
  kycDocuments: Record<string, KycDocument[]>;
}) {
  return (
    <>
      <div>
        <h4 className="text-sm font-medium text-gray-500">Country</h4>
        <p className="mt-1 text-sm text-gray-900">{freelancer.account.country || 'Not provided'}</p>
      </div>
      <div>
        <h4 className="text-sm font-medium text-gray-500">Address</h4>
        <p className="mt-1 text-sm text-gray-900">{freelancer.account.address || 'Not provided'}</p>
      </div>
      <div>
        <h4 className="text-sm font-medium text-gray-500">Region</h4>
        <p className="mt-1 text-sm text-gray-900">{freelancer.account.region || 'Not provided'}</p>
      </div>
      <div>
        <h4 className="text-sm font-medium text-gray-500">Phone</h4>
        <p className="mt-1 text-sm text-gray-900">{freelancer.account.phone || 'Not provided'}</p>
      </div>

      <OnlinePresence freelancer={freelancer} />
      <AccountStatusBadge status={freelancer.account.accountStatus} />

      {/* Company Documents */}
      <div className="col-span-2 mt-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Submitted Identification Documents
        </h3>

        {Object.entries(kycDocuments)
          .filter(([docType]) => docType !== 'trade_license')
          .every(([, files]) => files.length === 0) ? (
          <div className="flex items-center text-sm text-red-600 -mt-2 mb-2">
            <svg
              className="h-4 w-4 mr-1.5 text-red-600 flex-shrink-0"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10c0 4.418-3.582 8-8 8s-8-3.582-8-8 3.582-8 8-8 8 3.582 8 8zm-8-4a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 6zm0 6a1 1 0 100 2 1 1 0 000-2z"
                clipRule="evenodd"
              />
            </svg>
            KYC docs aren't submitted yet
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(kycDocuments)
              .filter(([docType]) => docType !== 'trade_license')
              .map(([docType, files]) => (
                <div key={docType}>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">
                    {readableDocName[docType] || docType}
                  </h4>
                  {files.length > 0 ? (
                    <ul className="list-disc list-inside text-sm text-primaryColor space-y-1">
                      {files.map(file => (
                        <li className="text-xs" key={file.id}>
                          <a
                            href={`/view/attachment/${file.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline"
                          >
                            View {file.name || 'Document'}
                          </a>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-700">No documents uploaded</p>
                  )}
                </div>
              ))}
          </div>
        )}
      </div>
    </>
  );
}

/** Subcomponent: Website / social links */
function OnlinePresence({ freelancer }: { freelancer: FreelancerData }) {
  return (
    <div>
      <h4 className="text-sm font-medium text-gray-500">Online Presence</h4>
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
          Object.entries(freelancer.account.socialMediaLinks).map(([platform, url], index) => (
            <div key={platform} className="inline-flex items-center gap-2">
              {index > 0 || freelancer.account.websiteURL ? (
                <span className="text-gray-400">-</span>
              ) : null}
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primaryColor hover:text-primaryColor/80"
              >
                {platform.charAt(0).toUpperCase() + platform.slice(1)}
              </a>
            </div>
          ))}
        {!freelancer.account.websiteURL &&
          (!freelancer.account.socialMediaLinks ||
            Object.keys(freelancer.account.socialMediaLinks).length === 0) && (
            <p>No online presence provided</p>
          )}
      </div>
    </div>
  );
}

/** Subcomponent: Displays a color-coded badge for the freelancer's AccountStatus */
function AccountStatusBadge({ status }: { status: AccountStatus }) {
  return (
    <div>
      <h4 className="text-sm font-medium text-gray-500">Account Status</h4>
      <p className="mt-1">
        <span
          className={`inline-flex rounded-full px-2 text-xs font-semibold ${
            status === AccountStatus.Published
              ? 'bg-green-100 text-green-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}
        >
          {status}
        </span>
      </p>
    </div>
  );
}

/** Subcomponent: Renders the "Professional Info" block */
function ProfessionalInfo({ freelancer }: { freelancer: FreelancerData }) {
  return (
    <>
      <div className="col-span-2">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Professional Information</h3>
      </div>

      <div>
        <h4 className="text-sm font-medium text-gray-500">Fields of Expertise</h4>
        <div className="mt-1 flex flex-wrap gap-2">
          {freelancer.freelancer.fieldsOfExpertise.map(field => (
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
        <h4 className="text-sm font-medium text-gray-500">Years of Experience</h4>
        <p className="mt-1 text-sm text-gray-900">{freelancer.freelancer.yearsOfExperience}</p>
      </div>

      <div>
        <h4 className="text-sm font-medium text-gray-500">Rate</h4>
        <p className="mt-1 text-sm text-gray-900">
          ${freelancer.freelancer.hourlyRate}/{freelancer.freelancer.compensationType} (
          {freelancer.freelancer.compensationType === CompensationType.HourlyRate
            ? 'Hourly'
            : 'Fixed'}
          )
        </p>
      </div>

      <div>
        <h4 className="text-sm font-medium text-gray-500">Availability Status</h4>
        <p className="mt-1">
          <span
            className={`inline-flex rounded-full px-2 text-xs font-semibold ${
              freelancer.freelancer.availableForWork
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {freelancer.freelancer.availableForWork ? 'Available' : 'Not Available'}
          </span>
        </p>
      </div>

      <div>
        <h4 className="text-sm font-medium text-gray-500">Available From</h4>
        <p className="mt-1 text-sm text-gray-900">
          {freelancer.freelancer.dateAvailableFrom || 'Not specified'}
        </p>
      </div>

      <div>
        <h4 className="text-sm font-medium text-gray-500">Working Hours</h4>
        <p className="mt-1 text-sm text-gray-900">
          {freelancer.freelancer.hoursAvailableFrom} - {freelancer.freelancer.hoursAvailableTo}
        </p>
      </div>

      <AboutSection about={freelancer.freelancer.about} />
      <JobsOpenToSection jobsOpenTo={freelancer.freelancer.jobsOpenTo} />
      <PreferredProjectTypesSection
        types={freelancer.freelancer.preferredProjectTypes}
        cvLink={freelancer.freelancer.cvLink}
        videoLink={freelancer.freelancer.videoLink}
      />
    </>
  );
}

/** Subcomponent: About paragraph */
function AboutSection({ about }: { about: string }) {
  return (
    <div className="col-span-2">
      <h4 className="text-sm font-medium text-gray-500">About</h4>
      <p className="mt-1 text-sm text-gray-900">
        {/* Method 1: Using dangerouslySetInnerHTML */}
        <span
          dangerouslySetInnerHTML={{
            __html: about || 'No description provided',
          }}
        />

        {/* Method 2: Using regex to strip HTML tags */}
        {(about || 'No description provided').replace(/<[^>]*>/g, '')}
      </p>
    </div>
  );
}

/** Subcomponent: Jobs open to block */
function JobsOpenToSection({ jobsOpenTo }: { jobsOpenTo: string[] }) {
  return (
    <div className="col-span-2">
      <h4 className="text-sm font-medium text-gray-500">Jobs Open To</h4>
      <div className="mt-1 flex flex-wrap gap-2">
        {jobsOpenTo.map(job => (
          <span
            key={job}
            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
          >
            {job}
          </span>
        ))}
      </div>
    </div>
  );
}

/** Subcomponent: Project types + CV / Video link */
function PreferredProjectTypesSection({
  types,
  cvLink,
  videoLink,
}: {
  types: string[];
  cvLink: string;
  videoLink: string;
}) {
  return (
    <div className="col-span-2">
      <h4 className="text-sm font-medium text-gray-500">Preferred Project Types</h4>
      <div className="mt-1 flex flex-wrap gap-2">
        {types.map(type => (
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
            {cvLink ? (
              <a
                href={cvLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primaryColor hover:text-primaryColor/80"
              >
                View CV
              </a>
            ) : (
              'Not provided'
            )}
          </p>
        </div>
        <div>
          <h4 className="text-sm font-medium text-gray-500">Introduction Video</h4>
          <p className="mt-1 text-sm text-gray-900">
            {videoLink ? (
              <a
                href={videoLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primaryColor hover:text-primaryColor/80"
              >
                Watch Video
              </a>
            ) : (
              'Not provided'
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

/** Subcomponent: Portfolio projects */
function PortfolioSection({ freelancer }: { freelancer: FreelancerData }) {
  return (
    <>
      <div className="col-span-2">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Portfolio</h3>
      </div>
      <div className="col-span-2 space-y-4">
        {freelancer.freelancer.portfolio.map((project, index) => (
          <div key={index} className="border rounded-lg p-4 bg-gray-50">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Project Name</h4>
                <p className="mt-1 text-sm text-gray-900">{project.projectName}</p>
              </div>
              {project.projectLink && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Project Link</h4>
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
                <h4 className="text-sm font-medium text-gray-500">Description</h4>
                <div
                  className="mt-1 text-sm text-gray-900"
                  dangerouslySetInnerHTML={{
                    __html: project.projectDescription,
                  }}
                />
              </div>
              {project.projectImageUrl && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Project Image</h4>
                  <img
                    src={project.projectImageUrl}
                    alt={project.projectName}
                    className="mt-2 rounded-lg w-auto h-48"
                  />
                </div>
              )}
            </div>
          </div>
        ))}
        {freelancer.freelancer.portfolio.length === 0 && (
          <p className="text-sm text-gray-500">No portfolio projects provided</p>
        )}
      </div>
    </>
  );
}

/** Subcomponent: Work history block */
function WorkHistorySection({ freelancer }: { freelancer: FreelancerData }) {
  return (
    <>
      <div className="col-span-2">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Work History</h3>
      </div>
      <div className="col-span-2 space-y-4">
        {freelancer.freelancer.workHistory.map((work, index) => (
          <div key={index} className="border rounded-lg p-4 bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Position</h4>
                <p className="mt-1 text-sm text-gray-900">{work.title}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Company</h4>
                <p className="mt-1 text-sm text-gray-900">{work.company}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Duration</h4>
                <p className="mt-1 text-sm text-gray-900">
                  {new Date(work.startDate).toLocaleDateString()} -{' '}
                  {work.currentlyWorkingThere
                    ? 'Present'
                    : new Date(work.endDate).toLocaleDateString()}
                </p>
              </div>
              <div className="md:col-span-2">
                <h4 className="text-sm font-medium text-gray-500">Description</h4>
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
    </>
  );
}

/** Subcomponent: Education block */
function EducationSection({ freelancer }: { freelancer: FreelancerData }) {
  return (
    <>
      <div className="col-span-2">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Education</h3>
      </div>
      <div className="col-span-2 space-y-4">
        {freelancer.freelancer.educations.map((education, index) => (
          <div key={index} className="border rounded-lg p-4 bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Degree</h4>
                <p className="mt-1 text-sm text-gray-900">{education.degree}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Institution</h4>
                <p className="mt-1 text-sm text-gray-900">{education.institution}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Graduation Year</h4>
                <p className="mt-1 text-sm text-gray-900">{education.graduationYear}</p>
              </div>
            </div>
          </div>
        ))}
        {freelancer.freelancer.educations.length === 0 && (
          <p className="text-sm text-gray-500">No education history provided</p>
        )}
      </div>
    </>
  );
}

/** Subcomponent: Certificates block */
function CertificatesSection({ freelancer }: { freelancer: FreelancerData }) {
  return (
    <>
      <div className="col-span-2">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Certificates</h3>
      </div>
      <div className="col-span-2 space-y-4">
        {freelancer.freelancer.certificates.map((cert, index) => (
          <div key={index} className="border rounded-lg p-4 bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Certificate Name</h4>
                <p className="mt-1 text-sm text-gray-900">{cert.certificateName}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Issued By</h4>
                <p className="mt-1 text-sm text-gray-900">{cert.issuedBy}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Year Issued</h4>
                <p className="mt-1 text-sm text-gray-900">{cert.yearIssued}</p>
              </div>
              {cert.attachmentUrl && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Certificate</h4>
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
    </>
  );
}

/** Subcomponent: "Update Account Status" form */
function UpdateAccountStatus({
  currentStatus,
  accountStatusValues,
  actionData,
}: {
  currentStatus: AccountStatus;
  accountStatusValues: AccountStatus[];
  actionData: ActionResponse | undefined;
}) {
  return (
    <div className="px-6 py-5 border-t border-gray-200">
      <h4 className="text-sm font-medium text-gray-500">Update Account Status</h4>

      {actionData?.success && (
        <div className="mt-2 rounded-md bg-green-50 p-4">
          <p className="text-sm font-medium text-green-800">Account status updated successfully</p>
        </div>
      )}

      {actionData?.error && (
        <div className="mt-2 rounded-md bg-red-50 p-4">
          <p className="text-sm font-medium text-red-800">{actionData.error}</p>
        </div>
      )}

      <Form method="post" className="mt-4">
        <div className="flex items-center space-x-4">
          <select
            name="accountStatus"
            defaultValue={currentStatus}
            className="block w-full max-w-lg rounded-md border-gray-300 shadow-sm focus:border-primaryColor focus:ring-primaryColor sm:max-w-xs sm:text-sm"
          >
            {accountStatusValues.map(status => (
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
  );
}

/** Subcomponent: Renders the "Applications" section */
function ApplicationsArea({ applications }: { applications: JobApplication[] }) {
  return (
    <div>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Job Applications</h1>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden mt-4">
        <div className="px-6 py-5">
          {applications.length > 0 ? (
            <ApplicationsTable
              applications={applications.map(app => ({
                application: {
                  id: app.id,
                  status: app.status,
                  createdAt: app.createdAt,
                  matchScore: app.matchScore,
                },
                job: {
                  id: app.jobId,
                  title: app.jobTitle,
                },
                employer: {
                  id: app.employerId || 0,
                  user: {
                    firstName: app.employerFirstName || '',
                    lastName: app.employerLastName || '',
                    email: app.employerEmail || '',
                  },
                  accountStatus: app.employerAccountStatus || '',
                },
              }))}
              showFreelancer={false}
              showEmployer={true}
              showEmployerStatus={true}
              showMatchScore={true}
            />
          ) : (
            <p className="text-sm text-gray-500">
              This freelancer hasn&apos;t applied to any jobs yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/** Subcomponent: Back button */
function BackButton() {
  const handleGoBack = (e: React.MouseEvent) => {
    e.preventDefault();
    window.history.back();
  };

  return (
    <div className="mb-4">
      <button
        onClick={handleGoBack}
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
      >
        <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
            clipRule="evenodd"
          />
        </svg>
        Back
      </button>
    </div>
  );
}
