import { redirect, useLoaderData } from '@remix-run/react';
import { AccountType, AccountStatus, EmployerAccountType } from '@mawaheb/db/src/types/enums';
import { getCurrentProfileInfo, getCurrentUserAccountType } from '~/servers/user.server';
import { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { Employer, Freelancer } from '@mawaheb/db/src/types/User';
import { requireUserVerified } from '~/auth/auth.server';
import FreelancerIdentifyingScreen from './freelancer';
import EmployerIdentifyingScreen from './employer';
import {
  createEmployerIdentification,
  getEmployerIdentification,
  updateEmployerIdentification,
  updateEmployerAccountStatusToPending,
} from '~/servers/employer.server';
import {
  createFreelancerIdentification,
  getFreelancerIdentification,
  updateFreelancerIdentification,
  updateFreelancerAccountStatusToPending,
} from '~/servers/freelancer.server';

export async function action({ request }: ActionFunctionArgs) {
  // User must be verified
  await requireUserVerified(request);

  try {
    const formData = await request.formData();
    const userProfile = await getCurrentProfileInfo(request);
    const currentProfile = await getCurrentProfileInfo(request);
    const accountType = currentProfile.account.accountType;
    const targetUpdated = formData.get('target-updated') as string;

    // Check if this is an identification form submission
    const isIdentificationForm =
      targetUpdated === 'identification-form' ||
      targetUpdated === 'freelancer-identification' ||
      targetUpdated === 'employer-identification';

    if (
      accountType === AccountType.Employer &&
      (targetUpdated === 'employer-identification' ||
        (isIdentificationForm && accountType === AccountType.Employer))
    ) {
      const userId = currentProfile.account.user.id;
      const accountId = currentProfile.account.id;

      // Get employer account type from the profile or form data
      const employerAccountType =
        accountType === AccountType.Employer && 'employerAccountType' in currentProfile
          ? (currentProfile as Employer).employerAccountType
          : (formData.get('employerAccountType') as string);

      // Get file uploads
      const identificationFiles = formData.getAll('identification') as File[];
      const tradeLicenseFiles = formData.getAll('trade_license') as File[];
      const boardResolutionFiles =
        employerAccountType === EmployerAccountType.Company
          ? (formData.getAll('board_resolution') as File[])
          : [];

      // Get existing identification data
      const existingIdentification = await getEmployerIdentification(userId);
      const existingAttachments =
        (existingIdentification.data?.attachments as Record<string, any[]>) || {};

      // Prevent duplicate files by using a Map with filename as key
      const uniqueIdentificationFiles = new Map<string, File>();
      const uniqueTradeLicenseFiles = new Map<string, File>();
      const uniqueBoardResolutionFiles = new Map<string, File>();

      // Add existing files to the maps if they exist
      if (existingAttachments.identification) {
        // If we're not updating identification files, keep the existing ones
        if (identificationFiles.length === 0) {
          existingAttachments.identification.forEach((fileInfo: any) => {
            // Create a placeholder for existing files that preserves the size
            const fileSize = fileInfo.size || 143 * 1024; // Default to 143KB if size not available
            uniqueIdentificationFiles.set(
              fileInfo.name,
              new File(
                [
                  new Blob(
                    // Use a larger buffer for the file content to ensure size is preserved
                    [new Uint8Array(new ArrayBuffer(fileSize)).fill(1)],
                    { type: fileInfo.type || 'application/octet-stream' }
                  ),
                ],
                fileInfo.name,
                {
                  type: fileInfo.type || 'application/octet-stream',
                  lastModified: fileInfo.lastModified || Date.now(),
                }
              )
            );
          });
        }
      }

      if (existingAttachments.trade_license) {
        // If we're not updating trade license files, keep the existing ones
        if (tradeLicenseFiles.length === 0) {
          existingAttachments.trade_license.forEach((fileInfo: any) => {
            // Create a placeholder for existing files that preserves the size
            const fileSize = fileInfo.size || 143 * 1024; // Default to 143KB if size not available
            uniqueTradeLicenseFiles.set(
              fileInfo.name,
              new File(
                [
                  new Blob(
                    // Use a larger buffer for the file content to ensure size is preserved
                    [new Uint8Array(new ArrayBuffer(fileSize)).fill(1)],
                    { type: fileInfo.type || 'application/octet-stream' }
                  ),
                ],
                fileInfo.name,
                {
                  type: fileInfo.type || 'application/octet-stream',
                  lastModified: fileInfo.lastModified || Date.now(),
                }
              )
            );
          });
        }
      }

      // Handle board resolution files for company accounts
      if (
        employerAccountType === EmployerAccountType.Company &&
        existingAttachments.board_resolution
      ) {
        // If we're not updating board resolution files, keep the existing ones
        if (boardResolutionFiles.length === 0) {
          existingAttachments.board_resolution.forEach((fileInfo: any) => {
            // Create a placeholder for existing files that preserves the size
            const fileSize = fileInfo.size || 143 * 1024; // Default to 143KB if size not available
            uniqueBoardResolutionFiles.set(
              fileInfo.name,
              new File(
                [
                  new Blob(
                    // Use a larger buffer for the file content to ensure size is preserved
                    [new Uint8Array(new ArrayBuffer(fileSize)).fill(1)],
                    { type: fileInfo.type || 'application/octet-stream' }
                  ),
                ],
                fileInfo.name,
                {
                  type: fileInfo.type || 'application/octet-stream',
                  lastModified: fileInfo.lastModified || Date.now(),
                }
              )
            );
          });
        }
      }

      // Add new files to the maps
      identificationFiles.forEach(file => {
        uniqueIdentificationFiles.set(file.name, file);
      });

      tradeLicenseFiles.forEach(file => {
        uniqueTradeLicenseFiles.set(file.name, file);
      });

      // Add board resolution files for company accounts
      if (employerAccountType === EmployerAccountType.Company) {
        boardResolutionFiles.forEach(file => {
          uniqueBoardResolutionFiles.set(file.name, file);
        });
      }

      // Prepare attachments data - store file information
      const attachmentsData: Record<string, any[]> = {
        identification: Array.from(uniqueIdentificationFiles.values()).map(file => ({
          name: file.name,
          type: file.type,
          size: file.size,
          lastModified: file.lastModified,
        })),
        trade_license: Array.from(uniqueTradeLicenseFiles.values()).map(file => ({
          name: file.name,
          type: file.type,
          size: file.size,
          lastModified: file.lastModified,
        })),
      };

      if (employerAccountType === EmployerAccountType.Company) {
        attachmentsData.board_resolution = Array.from(uniqueBoardResolutionFiles.values()).map(
          file => ({
            name: file.name,
            type: file.type,
            size: file.size,
            lastModified: file.lastModified,
          })
        );
      }

      let result;
      if (!existingIdentification.data) {
        result = await createEmployerIdentification(userId, attachmentsData);
      } else {
        result = await updateEmployerIdentification(userId, attachmentsData);
      }

      if (!result.success) {
        throw new Error('Failed to save employer identification');
      }

      const statusResult = await updateEmployerAccountStatusToPending(accountId);

      if (!statusResult.success) {
        throw new Error('Failed to update employer account status');
      }

      return Response.json({ success: true });
    } else if (
      accountType === AccountType.Freelancer &&
      (targetUpdated === 'freelancer-identification' ||
        (isIdentificationForm && accountType === AccountType.Freelancer))
    ) {
      const userId = currentProfile.account.user.id;
      const accountId = currentProfile.account.id;

      // Get file uploads
      const identificationFiles = formData.getAll('identification') as File[];

      // Get existing identification data
      const existingIdentification = await getFreelancerIdentification(userId);
      const existingAttachments =
        (existingIdentification.data?.attachments as Record<string, any[]>) || {};

      // Prevent duplicate files by using a Map with filename as key
      const uniqueFiles = new Map<string, File>();

      // Add existing files to the map if they exist
      if (existingAttachments.identification) {
        // If we're not updating identification files, keep the existing ones
        if (identificationFiles.length === 0) {
          existingAttachments.identification.forEach((fileInfo: any) => {
            // Create a placeholder for existing files that preserves the size
            const fileSize = fileInfo.size || 143 * 1024; // Default to 143KB if size not available
            uniqueFiles.set(
              fileInfo.name,
              new File(
                [
                  new Blob(
                    // Use a larger buffer for the file content to ensure size is preserved
                    [new Uint8Array(new ArrayBuffer(fileSize)).fill(1)],
                    { type: fileInfo.type || 'application/octet-stream' }
                  ),
                ],
                fileInfo.name,
                {
                  type: fileInfo.type || 'application/octet-stream',
                  lastModified: fileInfo.lastModified || Date.now(),
                }
              )
            );
          });
        }
      }

      // Add new files to the map
      identificationFiles.forEach(file => {
        uniqueFiles.set(file.name, file);
      });

      // Prepare attachments data - store file information
      const attachmentsData: Record<string, any[]> = {
        identification: Array.from(uniqueFiles.values()).map(file => ({
          name: file.name,
          type: file.type,
          size: file.size,
          lastModified: file.lastModified,
        })),
      };

      let result;
      if (!existingIdentification.data) {
        result = await createFreelancerIdentification(userId, attachmentsData);
      } else {
        result = await updateFreelancerIdentification(userId, attachmentsData);
      }

      if (!result.success) {
        throw new Error('Failed to save freelancer identification');
      }

      const statusResult = await updateFreelancerAccountStatusToPending(accountId);

      if (!statusResult.success) {
        throw new Error('Failed to update freelancer account status');
      }

      return Response.json({ success: true });
    }

    throw new Error('Unknown account type or target update');
  } catch (error) {
    return Response.json(
      { success: false, error: { message: 'An unexpected error occurred.' } },
      { status: 500 }
    );
  }
}

export async function loader({ request }: LoaderFunctionArgs) {
  // Ensure the user is verified
  await requireUserVerified(request);

  // Get the account type and profile info
  const accountType = await getCurrentUserAccountType(request);
  let profile = await getCurrentProfileInfo(request);

  if (!profile) {
    return Response.json({
      success: false,
      error: { message: 'Profile information not found.' },
      status: 404,
    });
  }

  // If user is not onboarded, redirect to onboarding
  if (!profile.account?.user?.isOnboarded) {
    return redirect('/onboarding');
  }

  // If account status is published, redirect to dashboard
  if (profile.account?.accountStatus === AccountStatus.Published) {
    return redirect('/dashboard');
  }

  // If account status is pending, show pending message
  const isPending = profile.account?.accountStatus === AccountStatus.Pending;

  // Fetch identification data based on account type
  let identificationData = null;
  const userId = profile.account?.user?.id;

  if (userId) {
    if (accountType === AccountType.Employer) {
      const result = await getEmployerIdentification(userId);
      if (result.success && result.data) {
        identificationData = result.data;
      }
    } else if (accountType === AccountType.Freelancer) {
      const result = await getFreelancerIdentification(userId);
      if (result.success && result.data) {
        identificationData = result.data;
      }
    }
  }

  if (accountType === AccountType.Employer) {
    profile = profile as Employer;
    return Response.json({
      accountType,
      currentProfile: profile,
      isPending,
      identificationData,
    });
  } else if (accountType === AccountType.Freelancer) {
    profile = profile as Freelancer;
    return Response.json({
      accountType,
      currentProfile: profile,
      isPending,
      identificationData,
    });
  }

  return Response.json({
    success: false,
    error: { message: 'Account type not found.' },
    status: 404,
  });
}

// Layout component
export default function Layout() {
  const { accountType, isPending } = useLoaderData<{
    accountType: AccountType;
    isPending: boolean;
  }>();

  // If account status is pending, show pending message
  if (isPending) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold mb-4">Account Verification</h1>
          <div className="mb-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-yellow-100 rounded-full flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-yellow-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <p className="text-lg font-medium text-gray-800">Your account is being validated</p>
            <p className="text-gray-600 mt-2">
              We're reviewing your submitted documents. This process typically takes 1-2 business
              days.
            </p>
          </div>
          <p className="text-sm text-gray-500">
            You'll receive an email notification once your account is approved.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {accountType === AccountType.Employer ? (
        <EmployerIdentifyingScreen />
      ) : (
        <FreelancerIdentifyingScreen />
      )}
    </div>
  );
}
