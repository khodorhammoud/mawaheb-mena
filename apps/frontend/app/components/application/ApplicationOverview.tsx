import { Form } from '@remix-run/react';
import { JobApplicationStatus } from '@mawaheb/db/enums';

interface ApplicationOverviewProps {
  application: {
    application: {
      id: number;
      status: JobApplicationStatus;
      createdAt: string | Date;
    };
    freelancerUser: {
      firstName: string;
      lastName: string | null;
      email: string;
    };
    employerUser: {
      firstName: string;
      lastName: string | null;
      email: string;
    };
    employer?: {
      accountStatus?: string;
    };
    job: {
      title: string;
      budget: number;
      workingHoursPerWeek: number;
      locationPreference: string;
    };
  };
  actionData?: {
    success: boolean;
    error?: string;
  };
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
  switch (status.toLowerCase()) {
    case 'active':
    case 'published':
      return 'bg-green-100 text-green-800';
    case 'inactive':
    case 'closed':
      return 'bg-red-100 text-red-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'deactivated':
      return 'bg-orange-300 text-orange-800';
    case 'suspended':
      return 'bg-purple-100 text-purple-800';
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

export function ApplicationOverview({ application, actionData }: ApplicationOverviewProps) {
  const applicationStatusValues = Object.values(JobApplicationStatus);

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Application Overview</h3>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-500">Status:</span>
            <span
              className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${getStatusColor(
                application.application.status
              )}`}
            >
              {application.application.status}
            </span>
          </div>
        </div>
      </div>

      <div className="px-6 py-5">
        <div className="flex flex-col space-y-6">
          <div className="flex items-center">
            <div className="flex-1">
              <h4 className="text-sm text-gray-500">Freelancer's Name:</h4>
              <p className="mt-1 text-base font-medium text-gray-900">
                {application.freelancerUser.firstName} {application.freelancerUser.lastName || '-'}
              </p>
              <h4 className="text-sm text-gray-500 mt-4">Email:</h4>
              <p className="mt-1 text-base font-medium text-gray-900">
                {application.freelancerUser.email || '-'}
              </p>
            </div>
            <div className="flex-none">
              <div className="inline-flex items-center px-4 py-2 rounded-lg">
                <span className="text-5xl font-bold text-primaryColor">⟶</span>
              </div>
            </div>
            <div className="flex-1 flex justify-end">
              <div className="text-left">
                <h4 className="text-sm text-gray-500">Job Posted By:</h4>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-base font-medium text-gray-900">
                    {application.employerUser.firstName} {application.employerUser.lastName || '-'}
                  </p>
                  {application.employer?.accountStatus && (
                    <span
                      className={`inline-flex rounded-full px-2 text-xs font-semibold ${getEmployerStatusColor(
                        application.employer.accountStatus
                      )}`}
                    >
                      {application.employer.accountStatus.toLowerCase()}
                    </span>
                  )}
                </div>
                <h4 className="text-sm text-gray-500 mt-4">Email:</h4>
                <p className="mt-1 text-base font-medium text-gray-900">
                  {application.employerUser.email || '-'}
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h4 className="text-sm text-gray-500">Applied For:</h4>
            <p className="mt-2 text-xl font-semibold text-primaryColor">
              {application.job.title || '-'}
            </p>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-gray-500">Job Budget:</span>
                <span className="text-sm text-gray-900">
                  {application.job.budget ? `💰 $${application.job.budget}` : '-'}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-gray-500">Job Working Hours:</span>
                <span className="text-sm text-gray-900">
                  {application.job.workingHoursPerWeek
                    ? `⏰ ${application.job.workingHoursPerWeek} hours/week`
                    : '-'}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-gray-500">Job Location:</span>
                <span className="text-sm text-gray-900">
                  {application.job.locationPreference
                    ? `📍 ${application.job.locationPreference}`
                    : '-'}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-gray-500">Applied Date:</span>
                <span className="text-sm text-gray-900">
                  {application.application.createdAt
                    ? `📅 ${formatDate(application.application.createdAt)}`
                    : '-'}
                </span>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <Form method="post">
              <div className="flex items-center space-x-4">
                <div className="flex-grow max-w-xs">
                  <label htmlFor="status" className="block text-sm font-medium text-gray-500 mb-1">
                    Update Application Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    defaultValue={application.application.status}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primaryColor focus:ring-primaryColor sm:text-sm"
                  >
                    {applicationStatusValues.map(status => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primaryColor hover:bg-primaryColor/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primaryColor"
                >
                  Update Status
                </button>
              </div>
            </Form>

            {actionData?.success && (
              <div className="mt-2 rounded-md bg-green-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
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
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-red-800">{actionData.error}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
