import { LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData, useSearchParams, Link } from '@remix-run/react';
import { JobApplicationStatus, AccountStatus } from '@mawaheb/db/enums';
import { ApplicationsTable } from '~/common/admin-pages/tables/ApplicationsTable';
import { getApplications } from '~/servers/admin.server';

interface Application {
  application: {
    id: number;
    status: JobApplicationStatus;
    createdAt: Date | string;
    matchScore?: number; // Add match score field
  };
  job: {
    id: number;
    title: string;
    employerId: number;
  };
  freelancer: {
    id: number;
    user?: {
      firstName: string;
      lastName: string;
      email: string;
    };
  };
  employer: {
    id: number;
    user?: {
      firstName: string;
      lastName: string;
      email: string;
    };
    accountStatus?: AccountStatus | string;
  };
}

type LoaderData = {
  applications: Application[];
};

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

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const params = {
    status: url.searchParams.get('status') || undefined,
    employerId: url.searchParams.get('employer') || undefined,
    freelancerId: url.searchParams.get('freelancer') || undefined,
  };

  const applications = await getApplications(params);

  // Cast the applications to the expected type
  const typedApplications = applications.map(app => ({
    application: {
      id: app.application.id,
      status: app.application.status as JobApplicationStatus,
      createdAt: app.application.createdAt,
      matchScore: app.application.matchScore || 0,
    },
    job: {
      id: app.job.id,
      title: app.job.title,
      employerId: app.job.employerId,
    },
    freelancer: {
      id: app.freelancer.user ? app.application.freelancerId : 0,
      user: {
        firstName: app.freelancer.user?.firstName || '',
        lastName: app.freelancer.user?.lastName || '',
        email: app.freelancer.user?.email || '',
      },
    },
    employer: {
      id: app.employer.user ? app.job.employerId : 0,
      user: {
        firstName: app.employer.user?.firstName || '',
        lastName: app.employer.user?.lastName || '',
        email: app.employer.user?.email || '',
      },
      accountStatus: (app.employer.account?.accountStatus as AccountStatus) || AccountStatus.Draft,
    },
  }));

  return { applications: typedApplications } as LoaderData;
}

export default function AdminApplications() {
  const { applications } = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <BackButton />

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Job Applications</h1>
        <div className="flex gap-4">
          <select
            value={searchParams.get('status') || ''}
            onChange={e => {
              const newParams = new URLSearchParams(searchParams);
              if (e.target.value) {
                newParams.set('status', e.target.value);
              } else {
                newParams.delete('status');
              }
              setSearchParams(newParams);
            }}
            className="rounded-md border-gray-300 shadow-sm focus:border-primaryColor focus:ring-primaryColor"
          >
            <option value="">All Statuses</option>
            {Object.values(JobApplicationStatus).map(status => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <ApplicationsTable
          applications={applications}
          showJob={true}
          showEmployer={true}
          showEmployerStatus={true}
          showFreelancer={true}
          showMatchScore={true}
          emptyMessage="No applications found. Try adjusting your filters."
        />
      </div>
    </div>
  );
}
