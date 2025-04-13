import { Link } from '@remix-run/react';
import { JobApplicationStatus, AccountStatus } from '@mawaheb/db/enums';
import { DataTable } from './DataTable';

interface Application {
  application: {
    id: number;
    status: JobApplicationStatus;
    createdAt: string | Date;
    matchScore?: number;
  };
  freelancer?: {
    id: number;
    user?: {
      firstName: string;
      lastName: string;
      email: string;
    };
  };
  job?: {
    id: number;
    title: string;
  };
  employer?: {
    id: number;
    user?: {
      firstName: string;
      lastName: string;
      email: string;
    };
    accountStatus?: AccountStatus | string;
  };
}

interface ApplicationsTableProps {
  applications: Application[];
  showJob?: boolean;
  showFreelancer?: boolean;
  showEmployer?: boolean;
  showEmployerStatus?: boolean;
  showMatchScore?: boolean;
  emptyMessage?: string;
}

function getStatusColor(status: JobApplicationStatus) {
  switch (status) {
    case JobApplicationStatus.Pending:
      return 'bg-yellow-100 text-yellow-800';
    case JobApplicationStatus.Shortlisted:
      return 'bg-blue-100 text-blue-800';
    case JobApplicationStatus.Approved:
      return 'bg-green-100 text-green-800';
    case JobApplicationStatus.Rejected:
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

function getEmployerStatusColor(status: string) {
  switch (status?.toLowerCase()) {
    case AccountStatus.Published.toLowerCase():
      return 'bg-green-100 text-green-800';
    case AccountStatus.Pending.toLowerCase():
      return 'bg-yellow-100 text-yellow-800';
    case AccountStatus.Draft.toLowerCase():
      return 'bg-gray-100 text-gray-800';
    case AccountStatus.Closed.toLowerCase():
      return 'bg-red-100 text-red-800';
    case AccountStatus.Suspended.toLowerCase():
      return 'bg-purple-100 text-purple-800';
    case AccountStatus.Deactivated.toLowerCase():
      return 'bg-orange-300 text-orange-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

function getMatchScoreColor(score: number) {
  if (score === undefined) return 'bg-gray-100 text-gray-800';
  if (score === 0) return 'bg-gray-100 text-gray-800';
  if (score >= 90) return 'bg-green-100 text-green-800';
  if (score >= 80) return 'bg-green-50 text-green-700';
  if (score >= 70) return 'bg-blue-100 text-blue-800';
  if (score >= 60) return 'bg-yellow-100 text-yellow-800';
  return 'bg-gray-100 text-gray-800';
}

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

export function ApplicationsTable({
  applications,
  showJob = true,
  showFreelancer = true,
  showEmployer = true,
  showEmployerStatus = true,
  showMatchScore = true,
  emptyMessage = 'No applications found',
}: ApplicationsTableProps) {
  const columns = [
    ...(showJob
      ? [
          {
            header: 'Job Title',
            accessor: (app: Application) => (
              <Link
                to={`/admin-dashboard/job/${app.job?.id}`}
                className="text-primaryColor hover:text-primaryColor/80"
              >
                {app.job?.title}
              </Link>
            ),
            className: 'font-medium text-gray-900',
          },
        ]
      : []),
    ...(showEmployer
      ? [
          {
            header: 'Employer',
            accessor: (app: Application) =>
              app.employer?.user ? (
                <Link
                  to={`/admin-dashboard/employer/${app.employer.id}`}
                  className="text-primaryColor hover:text-primaryColor/80"
                >
                  {app.employer.user.firstName} {app.employer.user.lastName}
                </Link>
              ) : (
                '-'
              ),
          },
        ]
      : []),
    ...(showEmployerStatus
      ? [
          {
            header: 'Employer Status',
            accessor: (app: Application) =>
              app.employer?.accountStatus ? (
                <span
                  className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getEmployerStatusColor(
                    app.employer.accountStatus
                  )}`}
                >
                  {app.employer.accountStatus}
                </span>
              ) : (
                '-'
              ),
          },
        ]
      : []),
    ...(showFreelancer
      ? [
          {
            header: 'Freelancer',
            accessor: (app: Application) =>
              app.freelancer?.user ? (
                <Link
                  to={`/admin-dashboard/freelancer/${app.freelancer.id}`}
                  className="text-primaryColor hover:text-primaryColor/80"
                >
                  {app.freelancer.user.firstName} {app.freelancer.user.lastName}
                </Link>
              ) : (
                '-'
              ),
            className: 'font-medium text-gray-900',
          },
        ]
      : []),
    {
      header: 'Application Status',
      accessor: (app: Application) => (
        <span
          className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getStatusColor(
            app.application.status
          )}`}
        >
          {app.application.status}
        </span>
      ),
    },
    ...(showMatchScore
      ? [
          {
            header: 'Match Score',
            accessor: (app: Application) =>
              app.application.matchScore !== undefined ? (
                <span
                  className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getMatchScoreColor(
                    app.application.matchScore
                  )}`}
                >
                  {app.application.matchScore}%
                </span>
              ) : (
                <span className="text-gray-400 text-xs">Not calculated</span>
              ),
          },
        ]
      : []),
    {
      header: 'Applied Date',
      accessor: (app: Application) => formatDate(app.application.createdAt),
    },
    {
      header: 'Actions',
      accessor: (app: Application) => (
        <Link
          to={`/admin-dashboard/application/${app.application.id}`}
          className="text-primaryColor hover:text-primaryColor/80"
        >
          Manage
        </Link>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={applications}
      keyExtractor={app => app.application.id}
      emptyMessage={emptyMessage}
    />
  );
}
