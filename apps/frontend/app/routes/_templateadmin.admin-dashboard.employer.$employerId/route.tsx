import { LoaderFunctionArgs, ActionFunctionArgs, json } from '@remix-run/node';
import { useLoaderData, useActionData, Link, Form, Outlet } from '@remix-run/react';
import { AccountStatus, JobStatus } from '@mawaheb/db';
import { JobsTable } from '~/common/admin-pages/tables/JobsTable';
import { getEmployerDetails, updateEmployerAccountStatus, type Job } from '~/servers/admin.server';

type ActionResponse = {
  success: boolean;
  error?: string;
};

export async function loader({ params }: LoaderFunctionArgs) {
  const employerId = params.employerId;

  if (!employerId) {
    throw new Response('Employer ID is required', { status: 400 });
  }

  const data = await getEmployerDetails(employerId);

  if (!data) {
    throw new Response('Employer not found', { status: 404 });
  }

  return data;
}

export async function action({ request, params }: ActionFunctionArgs) {
  const formData = await request.formData();
  const status = formData.get('accountStatus') as AccountStatus;
  const employerId = params.employerId;

  if (!employerId || !status) {
    return json<ActionResponse>({
      success: false,
      error: 'Missing required fields',
    });
  }

  const result = await updateEmployerAccountStatus(employerId, status);
  return json<ActionResponse>(result);
}

function getStatusColor(status: JobStatus) {
  switch (status) {
    case JobStatus.Draft:
      return 'bg-gray-100 text-gray-800';
    case JobStatus.Active:
      return 'bg-green-100 text-green-800';
    case JobStatus.Closed:
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
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

export default function EmployerDetails() {
  const { employer, jobs, jobCount } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  return (
    <div className="space-y-8">
      {/* Back button */}
      <BackButton />

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Employer Details</h1>
        <span className="text-sm text-gray-500">Total Jobs: {jobCount}</span>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Company Information</h3>
        </div>

        <div className="px-6 py-5 grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* User Information (from Users table) */}
          <div className="col-span-2">
            <h3 className="text-lg font-medium text-gray-900 mb-4">User Information</h3>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-500">Full Name</h4>
            <p className="mt-1 text-sm text-gray-900">
              {employer.user.firstName} {employer.user.lastName}
            </p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-500">Email</h4>
            <p className="mt-1 text-sm text-gray-900">{employer.user.email}</p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-500">Role</h4>
            <p className="mt-1 text-sm text-gray-900">{employer.user.role}</p>
          </div>

          {/* Account Information (from Accounts table) */}
          <div className="col-span-2">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Account Information</h3>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-500">Country</h4>
            <p className="mt-1 text-sm text-gray-900">
              {employer.account.country || 'Not provided'}
            </p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-500">Address</h4>
            <p className="mt-1 text-sm text-gray-900">
              {employer.account.address || 'Not provided'}
            </p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-500">Region</h4>
            <p className="mt-1 text-sm text-gray-900">
              {employer.account.region || 'Not provided'}
            </p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-500">Phone</h4>
            <p className="mt-1 text-sm text-gray-900">{employer.account.phone || 'Not provided'}</p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-500">Online Presence</h4>
            <div className="mt-1 text-sm text-gray-900 flex flex-wrap gap-2 items-center">
              {employer.account.websiteURL && (
                <>
                  <a
                    href={employer.account.websiteURL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primaryColor hover:text-primaryColor/80"
                  >
                    Website
                  </a>
                </>
              )}
              {employer.account.socialMediaLinks &&
                Object.entries(employer.account.socialMediaLinks).map(([platform, url], index) => (
                  <>
                    {(index > 0 || employer.account.websiteURL) && (
                      <span className="text-gray-400">-</span>
                    )}
                    <a
                      key={platform}
                      href={url as string}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primaryColor hover:text-primaryColor/80"
                    >
                      {platform.charAt(0).toUpperCase() + platform.slice(1)}
                    </a>
                  </>
                ))}
              {!employer.account.websiteURL &&
                (!employer.account.socialMediaLinks ||
                  Object.keys(employer.account.socialMediaLinks).length === 0) && (
                  <p>No online presence provided</p>
                )}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-500">Account Status</h4>
            <p className="mt-1">
              <span
                className={`inline-flex rounded-full px-2 text-xs font-semibold ${
                  employer.account.accountStatus === AccountStatus.Published
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {employer.account.accountStatus}
              </span>
            </p>
          </div>

          {/* Employer Information (from Employers table) */}
          <div className="col-span-2">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Company Information</h3>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-500">Years in Business</h4>
            <p className="mt-1 text-sm text-gray-900">
              {employer.employer.yearsInBusiness || 'Not provided'}
            </p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-500">Budget</h4>
            <p className="mt-1 text-sm text-gray-900">
              {employer.employer.budget ? `$${employer.employer.budget}` : 'Not provided'}
            </p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-500">Company Name</h4>
            <p className="mt-1 text-sm text-gray-900">
              {employer.employer.companyName || 'Not provided'}
            </p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-500">Industry Sector</h4>
            <p className="mt-1 text-sm text-gray-900">
              {employer.employer.industrySector || 'Not provided'}
            </p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-500">Company Email</h4>
            <p className="mt-1 text-sm text-gray-900">
              {employer.employer.companyEmail || 'Not provided'}
            </p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-500">Account Type</h4>
            <p className="mt-1 text-sm text-gray-900">
              {employer.employer.employerAccountType || 'Not provided'}
            </p>
          </div>

          <div className="col-span-2">
            <h4 className="text-sm font-medium text-gray-500">About the Company</h4>
            <p className="mt-1 text-sm text-gray-900">
              {employer.employer.about || 'No description provided'}
            </p>
          </div>

          {/* Company Representative Information */}
          <div className="col-span-2">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Company Representative</h3>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-500">Representative Name</h4>
            <p className="mt-1 text-sm text-gray-900">
              {employer.employer.companyRepName || 'Not provided'}
            </p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-500">Representative Position</h4>
            <p className="mt-1 text-sm text-gray-900">
              {employer.employer.companyRepPosition || 'Not provided'}
            </p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-500">Representative Email</h4>
            <p className="mt-1 text-sm text-gray-900">
              {employer.employer.companyRepEmail || 'Not provided'}
            </p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-500">Representative Phone</h4>
            <p className="mt-1 text-sm text-gray-900">
              {employer.employer.companyRepPhone || 'Not provided'}
            </p>
          </div>

          {/* Company Documents */}
          <div className="col-span-2">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Company Documents</h3>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-500">Tax ID Number</h4>
            <p className="mt-1 text-sm text-gray-900">
              {employer.employer.taxIdNumber || 'Not provided'}
            </p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-500">Tax ID Document</h4>
            <p className="mt-1 text-sm text-gray-900">
              {employer.employer.taxIdDocumentLink ? (
                <a
                  href={employer.employer.taxIdDocumentLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primaryColor hover:text-primaryColor/80"
                >
                  View Document
                </a>
              ) : (
                'Not provided'
              )}
            </p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-500">Business License</h4>
            <p className="mt-1 text-sm text-gray-900">
              {employer.employer.businessLicenseLink ? (
                <a
                  href={employer.employer.businessLicenseLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primaryColor hover:text-primaryColor/80"
                >
                  View License
                </a>
              ) : (
                'Not provided'
              )}
            </p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-500">Certificate of Incorporation</h4>
            <p className="mt-1 text-sm text-gray-900">
              {employer.employer.certificationOfIncorporationLink ? (
                <a
                  href={employer.employer.certificationOfIncorporationLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primaryColor hover:text-primaryColor/80"
                >
                  View Certificate
                </a>
              ) : (
                'Not provided'
              )}
            </p>
          </div>
        </div>

        <div className="px-6 py-5 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-500">Update Account Status</h4>

          {actionData?.success && (
            <div className="mt-2 rounded-md bg-green-50 p-4">
              <p className="text-sm font-medium text-green-800">
                Account status updated successfully
              </p>
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
                defaultValue={employer.account.accountStatus}
                className="block w-full max-w-lg rounded-md border-gray-300 shadow-sm focus:border-primaryColor focus:ring-primaryColor sm:max-w-xs sm:text-sm"
              >
                {Object.values(AccountStatus).map(status => (
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
        <h1 className="text-2xl font-bold">Employer Jobs Posted</h1>
      </div>

      {/* Jobs Section */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Jobs Posted</h3>
        </div>

        <div className="px-6 py-5">
          {jobs.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-gray-500">This employer hasn&apos;t posted any jobs yet.</p>
            </div>
          ) : (
            <JobsTable
              jobs={jobs.map(job => ({
                id: job.id,
                title: job.title,
                status: job.status,
                applicationCount: job.applicationCount,
                employer: {
                  id: employer.employer.id,
                  firstName: employer.user.firstName,
                  lastName: employer.user.lastName,
                  accountStatus: employer.account.accountStatus,
                },
              }))}
              showEmployer={true}
              showBudget={false}
              showWorkingHours={false}
              showCategory={false}
            />
          )}
        </div>
      </div>

      <Outlet />
    </div>
  );
}
