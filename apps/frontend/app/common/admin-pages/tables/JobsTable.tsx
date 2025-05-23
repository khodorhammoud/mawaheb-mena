import { Link } from '@remix-run/react';
import { JobStatus, AccountStatus } from '@mawaheb/db/enums';
import { DataTable } from './DataTable';
import { ChevronRightIcon } from '@heroicons/react/24/solid';

interface Job {
  id: number;
  title: string;
  status: JobStatus;
  budget?: number | null;
  workingHoursPerWeek?: number | null;
  applicationCount?: number;
  createdAt?: string | Date;
  employer?: {
    id: number;
    firstName?: string;
    lastName?: string;
    accountStatus?: AccountStatus | string;
  };
  category?: {
    id: number;
    label: string;
  };
}

interface JobsTableProps {
  jobs: Job[];
  showEmployer?: boolean;
  showCategory?: boolean;
  showApplicationCount?: boolean;
  showBudget?: boolean;
  showWorkingHours?: boolean;
  showCreatedAt?: boolean;
  showEmployerStatus?: boolean;
  emptyMessage?: string;
}

function getStatusColor(status: JobStatus) {
  switch (status) {
    case JobStatus.Draft:
      return 'bg-gray-100 text-gray-800';
    case JobStatus.Active:
      return 'bg-green-100 text-green-800';
    case JobStatus.Closed:
      return 'bg-red-100 text-red-800';
    case JobStatus.Completed:
      return 'bg-blue-100 text-blue-800';
    case JobStatus.Paused:
      return 'bg-yellow-100 text-yellow-800';
    case JobStatus.Deleted:
      return 'bg-black-100 text-white-800';
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

export function JobsTable({
  jobs,
  showEmployer = true,
  showCategory = true,
  showApplicationCount = true,
  showBudget = true,
  showWorkingHours = true,
  showCreatedAt = true,
  showEmployerStatus = true,
  emptyMessage = 'No jobs found',
}: JobsTableProps) {
  const columns = [
    {
      header: 'Job Title',
      accessor: (job: Job) => (
        <Link
          to={`/admin-dashboard/job/${job.id}`}
          className="text-primaryColor hover:text-primaryColor/80 font-medium flex items-center gap-2"
        >
          <ChevronRightIcon className="h-5 w-5 text-primaryColor/70" />
          {job.title}
        </Link>
      ),
      className: 'font-medium text-gray-900',
    },
    ...(showEmployer
      ? [
          {
            header: 'Employer',
            accessor: (job: Job) =>
              job.employer ? (
                <Link
                  to={`/admin-dashboard/employer/${job.employer.id}`}
                  className="text-primaryColor hover:text-primaryColor/80"
                >
                  {job.employer.firstName} {job.employer.lastName}
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
            accessor: (job: Job) =>
              job.employer?.accountStatus ? (
                <span
                  className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getEmployerStatusColor(
                    job.employer.accountStatus
                  )}`}
                >
                  {job.employer.accountStatus}
                </span>
              ) : (
                '-'
              ),
          },
        ]
      : []),
    {
      header: 'Job Status',
      accessor: (job: Job) => (
        <span
          className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getStatusColor(
            job.status
          )}`}
        >
          {job.status}
        </span>
      ),
    },
    ...(showCategory
      ? [
          {
            header: 'Category',
            accessor: (job: Job) => job.category?.label || '-',
          },
        ]
      : []),
    ...(showBudget
      ? [
          {
            header: 'Budget',
            accessor: (job: Job) => (job.budget ? `$${job.budget}` : '-'),
          },
        ]
      : []),
    ...(showWorkingHours
      ? [
          {
            header: 'Hours/Week',
            accessor: (job: Job) =>
              job.workingHoursPerWeek ? `${job.workingHoursPerWeek} hrs` : '-',
          },
        ]
      : []),
    ...(showApplicationCount
      ? [
          {
            header: 'Applications',
            accessor: (job: Job) => job.applicationCount || 0,
          },
        ]
      : []),
    ...(showCreatedAt && jobs.some(job => job.createdAt)
      ? [
          {
            header: 'Created Date',
            accessor: (job: Job) => formatDate(job.createdAt),
          },
        ]
      : []),
    {
      header: 'Actions',
      accessor: (job: Job) => (
        <Link
          to={`/admin-dashboard/job/${job.id}`}
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
      data={jobs}
      keyExtractor={job => job.id}
      emptyMessage={emptyMessage}
    />
  );
}
