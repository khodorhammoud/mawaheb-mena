import { LoaderFunctionArgs, ActionFunctionArgs, json } from '@remix-run/node';
import { useLoaderData, useActionData, Link, Form, Outlet } from '@remix-run/react';
import { AccountStatus, JobStatus } from '~/types/enums';
import { JobsTable } from '~/common/admin-pages/tables/JobsTable';
import { useState } from 'react';
import { Building, ChevronDown, ChevronUp, Eye, EyeOff } from 'lucide-react';
import { getEmployerDetails, updateEmployerAccountStatus, type Job } from '~/servers/admin.server';
import { getUserBankAccount } from '~/servers/payments.server';

// Define JsonifiedBankAccount type for the bank account
type JsonifiedBankAccount = {
  id: number;
  userId: number;
  accountHolderName: string;
  accountNumber: string;
  iban?: string | null;
  bankName: string;
  branchCode?: string | null;
  swiftCode?: string | null;
  currency: string;
  gatewayAccountId?: string | null;
  createdAt: string;
  updatedAt: string;
};

type LoaderData = {
  employer: {
    employer: {
      id: number;
      accountId: number;
      yearsInBusiness: number;
      about: string | null;
      budget: string | null;
      companyName: string | null;
      industrySector: string | null;
      companyEmail: string | null;
      employerAccountType: string | null;
      companyRepName: string | null;
      companyRepPosition: string | null;
      companyRepEmail: string | null;
      companyRepPhone: string | null;
      taxIdNumber: string | null;
      taxIdDocumentLink: string | null;
      businessLicenseLink: string | null;
      certificationOfIncorporationLink: string | null;
    };
    account: {
      id: number;
      userId: number;
      accountType: string;
      accountStatus: AccountStatus;
      country: string | null;
      address: string | null;
      region: string | null;
      phone: string | null;
      websiteURL: string | null;
      socialMediaLinks: Record<string, string>;
    };
    user: {
      id: number;
      firstName: string;
      lastName: string;
      email: string;
    };
  };
  jobs: Job[];
  jobCount: number;
  bankAccount: JsonifiedBankAccount | null;
};

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

  // Get the user's bank account
  let bankAccount = null;
  try {
    const userId = data.employer.user.id;
    bankAccount = await getUserBankAccount(userId);
  } catch (error) {
    console.error('Error fetching bank account info:', error);
    // Continue without bank account info
  }

  return {
    ...data,
    bankAccount,
  };
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

// Bank Account Info Component
function BankAccountInfo({ bankAccount }: { bankAccount: JsonifiedBankAccount | null }) {
  const [showDetails, setShowDetails] = useState(false);

  if (!bankAccount) {
    return (
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200">
          <h3 className="text-lg font-medium leading-6 text-gray-900 flex items-center">
            <Building className="w-5 h-5 mr-2 text-gray-500" />
            Banking Information
          </h3>
        </div>
        <div className="px-6 py-5">
          <p className="text-sm text-gray-500">No bank account information available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-medium leading-6 text-gray-900 flex items-center">
          <Building className="w-5 h-5 mr-2 text-gray-500" />
          Banking Information
        </h3>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="inline-flex items-center px-2 py-1 border border-transparent text-sm rounded-md text-gray-500 hover:bg-gray-100"
          aria-label={showDetails ? 'Hide bank details' : 'Show bank details'}
        >
          {showDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>

      <div className="px-6 py-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-500">Account Holder</h4>
            <p className="mt-1 text-sm text-gray-900">{bankAccount.accountHolderName}</p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-500">Bank Name</h4>
            <p className="mt-1 text-sm text-gray-900">{bankAccount.bankName}</p>
          </div>

          {showDetails && (
            <>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Account Number</h4>
                <p className="mt-1 text-sm text-gray-900">{bankAccount.accountNumber}</p>
              </div>

              {bankAccount.iban && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">IBAN</h4>
                  <p className="mt-1 text-sm text-gray-900">{bankAccount.iban}</p>
                </div>
              )}

              {bankAccount.branchCode && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Branch Code</h4>
                  <p className="mt-1 text-sm text-gray-900">{bankAccount.branchCode}</p>
                </div>
              )}

              {bankAccount.swiftCode && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">SWIFT Code</h4>
                  <p className="mt-1 text-sm text-gray-900">{bankAccount.swiftCode}</p>
                </div>
              )}

              <div>
                <h4 className="text-sm font-medium text-gray-500">Currency</h4>
                <p className="mt-1 text-sm text-gray-900">{bankAccount.currency}</p>
              </div>
            </>
          )}
        </div>

        <div className="flex justify-end mt-4">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primaryColor"
          >
            {showDetails ? (
              <>
                <ChevronUp className="w-4 h-4 mr-1" /> Hide details
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4 mr-1" /> Show details
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function EmployerDetails() {
  const { employer, jobs, jobCount, bankAccount } = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionResponse>();

  const accountStatusValues = Object.values(AccountStatus) as AccountStatus[];

  return (
    <div className="space-y-8">
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
      </div>

      {/* Bank account information */}
      <BankAccountInfo bankAccount={bankAccount} />

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
              }))}
              showEmployer={false}
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
