import { LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData, useNavigate } from '@remix-run/react';
import { JobApplicationStatus } from '@mawaheb/db/enums';
import { ApplicationsTable } from '~/common/admin-pages/tables/ApplicationsTable';
import { getEmployerDetails, getEmployerApplications } from '~/servers/admin.server';

// Define our own Application type to handle both Date and string for createdAt
interface Application {
  application: {
    id: number;
    status: JobApplicationStatus;
    createdAt: Date | string;
    matchScore?: number;
  };
  job: {
    id: number;
    title: string;
  };
  freelancer: {
    id: number;
    user: {
      firstName: string;
      lastName: string;
      email: string;
    };
  };
}

export async function loader({ params }: LoaderFunctionArgs) {
  const { employerId } = params;

  if (!employerId) {
    throw new Response('Employer ID is required', { status: 400 });
  }

  const employerData = await getEmployerDetails(employerId);
  if (!employerData) {
    throw new Response('Employer not found', { status: 404 });
  }

  const applications = await getEmployerApplications(employerId);

  // Format dates to ensure they're properly handled
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

  return {
    employer: employerData.employer,
    applications: formattedApplications,
  };
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

export default function AllJobApplications() {
  const { employer, applications } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  // Group applications by job
  const groupedApplications = applications.reduce(
    (acc, application) => {
      const jobId = application.job.id;
      if (!acc[jobId]) {
        acc[jobId] = {
          jobTitle: application.job.title,
          applications: [],
        };
      }
      acc[jobId].applications.push(application);
      return acc;
    },
    {} as Record<number, { jobTitle: string; applications: Application[] }>
  );

  return (
    <div className="space-y-6">
      <BackButton />
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">
            Applications for {employer.user.firstName} {employer.user.lastName}
          </h1>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <h3 className="text-lg font-medium leading-6 text-gray-900">All Applications</h3>
          </div>

          {Object.keys(groupedApplications).length > 0 ? (
            Object.entries(groupedApplications).map(
              ([jobId, { jobTitle, applications: jobApplications }]) => (
                <div key={jobId} className="border-b border-gray-200 last:border-b-0">
                  <div className="px-6 py-4 bg-gray-50">
                    <h4 className="text-md font-medium text-gray-900">{jobTitle}</h4>
                  </div>
                  <div className="px-6 py-2">
                    <ApplicationsTable
                      applications={jobApplications.map(app => ({
                        application: app.application,
                        job: app.job,
                        freelancer: app.freelancer,
                        employer: {
                          id: employer.employer.id,
                          user: {
                            firstName: employer.employer.companyName || employer.user.firstName,
                            lastName: employer.user.lastName || '',
                            email: employer.user.email,
                          },
                          accountStatus: employer.account.accountStatus,
                        },
                      }))}
                      showJob={false}
                      showEmployer={true}
                      showEmployerStatus={true}
                      showMatchScore={true}
                    />
                  </div>
                </div>
              )
            )
          ) : (
            <div className="px-6 py-5">
              <p className="text-sm text-gray-500">No applications received yet for any job.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
