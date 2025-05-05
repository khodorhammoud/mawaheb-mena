// app/routes/job/$jobId.tsx
import { LoaderFunctionArgs, json } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import { getJobDetails, getSkillsForJob, getJobApplicationsBasic } from '~/servers/admin.server';
import { JobApplicationStatus } from '@mawaheb/db/enums';
import { ApplicationsTable } from '~/common/admin-pages/tables/ApplicationsTable';

// Helper function to safely format dates
function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '-';
  try {
    return new Date(date).toLocaleDateString();
  } catch (error) {
    console.error('Error formatting date:', error);
    return '-';
  }
}

// Our local type definitions
type JobApplication = {
  application: {
    id: number;
    status: string;
    createdAt: Date | string;
    matchScore?: number;
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
  employer?: {
    id: number;
    companyName: string;
  };
  employerAccount?: {
    accountStatus: string;
  };
  job?: {
    id: number;
    title: string;
    employerAccountStatus?: string;
  };
};

type LoaderData = {
  job: {
    id: number;
    title: string;
    description: string;
    budget: number;
    status: string;
    createdAt: Date | string;
    workingHoursPerWeek: number;
    locationPreference: string;
    projectType: string;
    experienceLevel: string;
    employerAccountStatus?: string;
  };
  employer: {
    id: number;
    companyName: string;
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
  const jobIdString = params.jobId;
  if (!jobIdString) {
    throw new Response('Job ID is required', { status: 400 });
  }
  const jobId = parseInt(jobIdString, 10);

  // 1) Fetch job details
  const jobDetails = await getJobDetails(jobId);
  if (!jobDetails) {
    throw new Response('Job not found', { status: 404 });
  }

  // 2) Fetch job skills
  const skills = await getSkillsForJob(jobId);

  // 3) Fetch job applications
  const applications = await getJobApplicationsBasic(jobId);

  // Format dates in job details
  const formattedJobDetails = {
    ...jobDetails,
    job: {
      ...jobDetails.job,
      createdAt:
        jobDetails.job.createdAt && typeof jobDetails.job.createdAt === 'object'
          ? (jobDetails.job.createdAt as Date).toISOString()
          : jobDetails.job.createdAt,
      employerAccountStatus: jobDetails.job.employerAccountStatus || 'Unknown',
    },
  };

  // Format dates in applications
  const formattedApplications = applications.map(app => ({
    ...app,
    application: {
      ...app.application,
      createdAt:
        app.application.createdAt && typeof app.application.createdAt === 'object'
          ? (app.application.createdAt as Date).toISOString()
          : app.application.createdAt,
    },
  }));

  // Combine them into a single object for the loader
  const data: LoaderData = {
    ...formattedJobDetails, // merges { job, employer, user, category } from getJobDetails
    skills,
    applications: formattedApplications,
  };

  return json(data);
}

export default function JobDetails() {
  const { job, employer, user, category, skills, applications } = useLoaderData<LoaderData>();

  return (
    <div className="space-y-8">
      {/* Back Button */}
      <BackButton />

      {/* Job Overview Card */}
      <JobOverview job={job} employer={employer} user={user} category={category} />

      {/* Job Description */}
      <JobDescription description={job.description} />

      {/* Required Skills */}
      <RequiredSkills skills={skills} />

      {/* Applications Section */}
      <ApplicationsSection applications={applications} />
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

/** Subcomponent: Job Overview Card */
function JobOverview({
  job,
  employer,
  user,
  category,
}: {
  job: LoaderData['job'];
  employer: LoaderData['employer'];
  user: LoaderData['user'];
  category: LoaderData['category'];
}) {
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Job Overview</h3>
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
              <p className="mt-2 text-xl font-semibold text-primaryColor">{job.title || '-'}</p>
              <h4 className="text-sm text-gray-500 mt-4">Company Name:</h4>
              <p className="mt-1 text-base font-medium text-gray-900">
                {employer.companyName || '-'}
              </p>
            </div>
            <div className="flex-none">
              <div className="inline-flex items-center px-4 py-2 rounded-lg">
                <span className="text-5xl font-bold text-primaryColor">⟶</span>
              </div>
            </div>
            <div className="flex-1 flex justify-end">
              <div className="text-left">
                <h4 className="text-sm text-gray-500">Posted By:</h4>
                <div className="flex items-center gap-2">
                  <Link
                    to={`/admin-dashboard/employer/${employer.id}`}
                    className="mt-1 block text-base font-medium text-primaryColor hover:text-primaryColor/90"
                  >
                    {user.firstName} {user.lastName || '-'}
                  </Link>
                </div>
                <h4 className="text-sm text-gray-500 mt-4">Employer Status:</h4>
                <div
                  className={`inline-flex rounded-full px-2 text-xs font-semibold ${getEmployerStatusColor(
                    job.employerAccountStatus
                  )}`}
                >
                  {job.employerAccountStatus.toLowerCase()}
                </div>
                <h4 className="text-sm text-gray-500 mt-4">Email:</h4>
                <p className="mt-1 text-base font-medium text-gray-900">{user.email || '-'}</p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <span className="text-sm font-medium text-gray-500">Category:</span>
            <p className="mt-1 text-base text-gray-900">{category?.label || '-'}</p>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-gray-500">Job Budget:</span>
                <span className="text-sm text-gray-900">
                  {job.budget ? `💰 $${job.budget}` : '-'}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-gray-500">Working Hours:</span>
                <span className="text-sm text-gray-900">
                  {job.workingHoursPerWeek ? `⏰ ${job.workingHoursPerWeek} hours/week` : '-'}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-gray-500">Location:</span>
                <span className="text-sm text-gray-900">
                  {job.locationPreference ? `📍 ${job.locationPreference}` : '-'}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-gray-500">Posted Date:</span>
                <span className="text-sm text-gray-900">{formatDate(job.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Subcomponent: Job Description */
function JobDescription({ description }: { description: string }) {
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-200">
        <h3 className="text-lg font-medium leading-6 text-gray-900">Job Description</h3>
      </div>
      <div className="px-6 py-5">
        <div className="prose max-w-none">
          <div
            className="text-base text-gray-700 whitespace-pre-wrap break-words leading-relaxed"
            dangerouslySetInnerHTML={{
              __html: description?.replace(/\n/g, '<br/>') || '-',
            }}
          />
        </div>
      </div>
    </div>
  );
}

/** Subcomponent: Required Skills */
function RequiredSkills({ skills }: { skills: LoaderData['skills'] }) {
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-200">
        <h3 className="text-lg font-medium leading-6 text-gray-900">Required Skills</h3>
      </div>
      <div className="px-6 py-5">
        <div className="flex flex-wrap gap-2">
          {skills && skills.length > 0 ? (
            skills.map(skill => (
              <span
                key={skill.id}
                className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${
                  skill.isStarred ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                }`}
              >
                {skill.label}
                {skill.isStarred && <span className="ml-1 text-yellow-500">★</span>}
              </span>
            ))
          ) : (
            <span className="text-sm text-gray-500">No skills specified</span>
          )}
        </div>
      </div>
    </div>
  );
}

/** Subcomponent: Applications (table) */
function ApplicationsSection({ applications }: { applications: LoaderData['applications'] }) {
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-200">
        <h3 className="text-lg font-medium leading-6 text-gray-900">
          Applications ({applications.length})
        </h3>
      </div>
      <div className="px-6 py-5">
        {applications.length > 0 ? (
          <ApplicationsTable
            applications={applications.map(app => ({
              application: {
                id: app.application.id,
                status: app.application.status as JobApplicationStatus,
                createdAt: app.application.createdAt,
                matchScore: app.application.matchScore,
              },
              freelancer: {
                id: app.freelancer.id,
                user: {
                  firstName: app.user.firstName,
                  lastName: app.user.lastName,
                  email: app.user.email,
                },
              },
              employer: {
                id: app.employer?.id || 0,
                user: {
                  firstName: app.employer?.companyName || '',
                  lastName: '',
                  email: '',
                },
                accountStatus: app.employerAccount?.accountStatus || 'Draft',
              },
            }))}
            showJob={false}
            showEmployer={true}
            showEmployerStatus={true}
            showMatchScore={true}
          />
        ) : (
          <p className="text-sm text-gray-500">No applications yet</p>
        )}
      </div>
    </div>
  );
}

/** Keep your color helpers if you want */
function getStatusColor(status: string) {
  switch (status) {
    case 'OPEN':
      return 'bg-green-100 text-green-800';
    case 'CLOSED':
      return 'bg-red-100 text-red-800';
    case 'DRAFT':
      return 'bg-yellow-100 text-yellow-800';
    case 'FULFILLED':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

function getEmployerStatusColor(status: string) {
  switch (status) {
    case 'ACTIVE':
      return 'bg-green-100 text-green-800';
    case 'INACTIVE':
      return 'bg-red-100 text-red-800';
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800';
    case 'APPROVED':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

/* 
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
