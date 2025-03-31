import { redirect, useLoaderData } from '@remix-run/react';
import { AccountType, AccountStatus, EmployerAccountType } from '~/types/enums';
import { getCurrentProfileInfo, getCurrentUserAccountType } from '~/servers/user.server';
import { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { Employer, Freelancer } from '~/types/User';
import { requireUserVerified } from '~/auth/auth.server';
import FreelancerIdentificationScreen from './freelancer';
import EmployerIdentificationScreen from './employer';
import {
  createEmployerIdentification,
  getEmployerIdentification,
  updateEmployerIdentification,
  updateEmployerAccountStatusToPending,
} from '~/servers/employer.server';
import {
  getFreelancerIdentification,
  updateFreelancerIdentification,
  updateFreelancerAccountStatusToPending,
} from '~/servers/freelancer.server';
import { setOnboardedStatus } from '~/servers/user.server';
import { getAttachmentMetadataById } from '~/servers/cloudStorage.server';

// Add this interface after the imports
interface AttachmentMetadata {
  id: number;
  key: string;
  metadata?: {
    size?: number;
    contentType?: string;
    name?: string;
    type?: string;
    lastModified?: number;
    storage?: {
      key?: string;
      bucket?: string;
      url?: string;
    };
    [key: string]: any;
  };
  createdAt?: string;
  [key: string]: any;
}

export async function action({ request }: ActionFunctionArgs) {
  // User must be verified
  await requireUserVerified(request);

  try {
    const formData = await request.formData();
    const userProfile = await getCurrentProfileInfo(request);
    const currentProfile = await getCurrentProfileInfo(request);
    const accountType = currentProfile.account.accountType;
    const targetUpdated = formData.get('target-updated') as string;

    // Check if this is a request to go back to account info
    if (targetUpdated === 'back-to-account-info') {
      const userId = currentProfile.account.user.id;

      // Update the isOnboarded flag to false
      const result = await setOnboardedStatus(userId, false);

      if (!result.success) {
        return Response.json({
          success: false,
          error: 'Failed to update onboarded status',
        });
      }

      return redirect('/onboarding');
    }

    // Check if this is an identification form submission
    const isIdentificationForm =
      targetUpdated === 'identification-form' ||
      targetUpdated === 'freelancer-identification' ||
      targetUpdated === 'employer-identification';

    // Get files to delete from form data
    const filesToDelete = JSON.parse((formData.get('filesToDelete') as string) || '[]');

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

      // Filter out empty files (if any)
      const validIdentificationFiles = identificationFiles.filter(
        file => file instanceof File && file.size > 0
      );
      const validTradeLicenseFiles = tradeLicenseFiles.filter(
        file => file instanceof File && file.size > 0
      );
      const validBoardResolutionFiles = boardResolutionFiles.filter(
        file => file instanceof File && file.size > 0
      );

      // Prepare attachments data with actual File objects
      const attachmentsData = {
        identification: validIdentificationFiles,
        trade_license: validTradeLicenseFiles,
        ...(employerAccountType === EmployerAccountType.Company && {
          board_resolution: validBoardResolutionFiles,
        }),
        filesToDelete,
      };

      // Use createEmployerIdentification which now handles both create and update
      const result = await createEmployerIdentification(userId, attachmentsData);

      if (!result.success) {
        return Response.json({
          success: false,
          error: 'Failed to save employer identification',
        });
      }

      const statusResult = await updateEmployerAccountStatusToPending(accountId);

      if (!statusResult.success) {
        return Response.json({
          success: false,
          error: 'Failed to update employer account status',
        });
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
      const tradeLicenseFiles = formData.getAll('trade_license') as File[];

      // Filter out empty files (if any)
      const validIdentificationFiles = identificationFiles.filter(
        file => file instanceof File && file.size > 0
      );
      const validTradeLicenseFiles = tradeLicenseFiles.filter(
        file => file instanceof File && file.size > 0
      );

      // Prepare attachments data with actual File objects
      const attachmentsData = {
        identification: validIdentificationFiles,
        trade_license: validTradeLicenseFiles,
        filesToDelete,
      };

      // Use updateFreelancerIdentification which now handles both create and update
      const result = await updateFreelancerIdentification(userId, attachmentsData);

      if (!result.success) {
        return Response.json({
          success: false,
          error: 'Failed to save freelancer identification',
        });
      }

      const statusResult = await updateFreelancerAccountStatusToPending(accountId);

      if (!statusResult.success) {
        return Response.json({
          success: false,
          error: 'Failed to update freelancer account status',
        });
      }

      return Response.json({ success: true });
    }

    return Response.json({
      success: false,
      error: 'Invalid request',
    });
  } catch (error) {
    console.error('Error in identification action:', error);
    return Response.json({
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred',
    });
  }
}

export async function loader({ request }: LoaderFunctionArgs) {
  // Redirect from the old URL to the new one if needed
  if (new URL(request.url).pathname === '/identifying') {
    return redirect('/identification');
  }

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
      console.log(
        'DEBUG - Employer identification raw data from getEmployerIdentification:',
        JSON.stringify(result, null, 2)
      );

      if (result.success && result.data) {
        // Get the raw identification data
        const rawData = result.data;
        console.log('DEBUG - rawData structure:', Object.keys(rawData));
        console.log(
          'DEBUG - rawData.attachments:',
          typeof rawData.attachments,
          rawData.attachments ? JSON.stringify(rawData.attachments, null, 2) : 'null'
        );

        // CRITICAL FIX: Handle raw attachments correctly whether it's a string, object, or null
        let parsedAttachments = null;

        if (rawData.attachments) {
          if (typeof rawData.attachments === 'string') {
            try {
              parsedAttachments = JSON.parse(rawData.attachments);
            } catch (e) {
              console.error('DEBUG - Failed to parse attachments string:', e);
              // Default to empty arrays if parsing fails
              parsedAttachments = {
                identification: [],
                trade_license: [],
                board_resolution: [],
              };
            }
          } else {
            // Already an object, use as is
            parsedAttachments = rawData.attachments;
          }

          // Create enhanced data with properly parsed attachments
          const enhancedData = {
            ...rawData,
            attachments: parsedAttachments,
          };

          // Cast attachments to a Record to avoid type errors
          const attachments = enhancedData.attachments as Record<string, any>;
          console.log(
            'DEBUG - Processed attachments object:',
            JSON.stringify(attachments, null, 2)
          );

          // Initialize the structure to ensure all expected arrays exist
          if (!attachments.identification) attachments.identification = [];
          if (!attachments.trade_license) attachments.trade_license = [];
          if (!attachments.board_resolution) attachments.board_resolution = [];

          // For each attachment type (identification, trade_license, board_resolution)
          for (const attachmentType of ['identification', 'trade_license', 'board_resolution']) {
            if (
              attachments[attachmentType] &&
              Array.isArray(attachments[attachmentType]) &&
              attachments[attachmentType].length > 0
            ) {
              // Get the attachment IDs
              const attachmentIds = attachments[attachmentType] as number[];
              console.log(`DEBUG - ${attachmentType} IDs:`, attachmentIds);

              // Fetch the attachment metadata from the attachments table
              const attachmentMetadata = await Promise.all(
                attachmentIds.map(async (id: number) => {
                  const result = await getAttachmentMetadataById(id);
                  if (result.success && result.data) {
                    const metadata = result.data as AttachmentMetadata;

                    // Try to get the file name from multiple possible locations
                    let name = 'unknown-file';

                    // Check if metadata.name exists directly in metadata object
                    if (metadata.name) {
                      name = metadata.name;
                    }
                    // Check if metadata.metadata.name exists (from the saveAttachment metadata)
                    else if (metadata.metadata && metadata.metadata.name) {
                      name = metadata.metadata.name;
                    }
                    // Fallback to using key if metadata.name doesn't exist
                    else if (metadata.key) {
                      // Extract filename from the key (prefix-filename format)
                      const keyParts = metadata.key.split('-');
                      // If key has the prefix-filename format, extract the filename part
                      if (keyParts.length > 1) {
                        name = keyParts.slice(1).join('-');
                      } else {
                        // If no prefix-filename format, just use the last part of the path
                        name = metadata.key.split('/').pop() || 'unknown-file';
                      }
                    }

                    console.log(`DEBUG - Processing attachment ID ${id}:`, {
                      key: metadata.key,
                      name: name,
                      metadata: metadata.metadata,
                    });

                    // Add serverId to make file deletion easier
                    return {
                      ...metadata,
                      name,
                      serverId: id,
                      isServerFile: true,
                      size: metadata.metadata?.size || 143 * 1024,
                      type: metadata.metadata?.contentType || 'application/octet-stream',
                      lastModified: metadata.createdAt
                        ? new Date(metadata.createdAt).getTime()
                        : Date.now(),
                    };
                  }
                  return null;
                })
              );

              // Replace the attachment IDs with the metadata
              attachments[attachmentType] = attachmentMetadata.filter(Boolean);

              // Add debug logging for the processed files
              console.log(
                `DEBUG - Processed ${attachmentType} files:`,
                attachments[attachmentType].map(file => ({
                  name: file.name,
                  size: file.size,
                  isServerFile: file.isServerFile,
                }))
              );
            }
          }

          identificationData = enhancedData;
          console.log(
            'DEBUG - Final enhanced employer identification data:',
            JSON.stringify(
              {
                ...identificationData,
                attachments: {
                  identification:
                    attachments.identification?.map(a => ({
                      name: a.name,
                      size: a.size,
                    })) || [],
                  trade_license:
                    attachments.trade_license?.map(a => ({
                      name: a.name,
                      size: a.size,
                    })) || [],
                  board_resolution:
                    attachments.board_resolution?.map(a => ({
                      name: a.name,
                      size: a.size,
                    })) || [],
                },
              },
              null,
              2
            )
          );
        } else {
          // Initialize with empty attachments if none exist
          identificationData = {
            ...rawData,
            attachments: {
              identification: [],
              trade_license: [],
              board_resolution: [],
            },
          };
        }
      }
    } else if (accountType === AccountType.Freelancer) {
      const result = await getFreelancerIdentification(userId);
      console.log(
        'DEBUG - Freelancer identification raw data from getFreelancerIdentification:',
        JSON.stringify(result, null, 2)
      );

      if (result.success && result.data) {
        // Get the raw identification data
        const rawData = result.data;
        console.log('DEBUG - rawData structure:', Object.keys(rawData));
        console.log(
          'DEBUG - rawData.attachments:',
          typeof rawData.attachments,
          rawData.attachments ? JSON.stringify(rawData.attachments, null, 2) : 'null'
        );

        // CRITICAL FIX: Handle raw attachments correctly whether it's a string, object, or null
        let parsedAttachments = null;

        if (rawData.attachments) {
          if (typeof rawData.attachments === 'string') {
            try {
              parsedAttachments = JSON.parse(rawData.attachments);
            } catch (e) {
              console.error('DEBUG - Failed to parse attachments string:', e);
              // Default to empty arrays if parsing fails
              parsedAttachments = {
                identification: [],
                trade_license: [],
              };
            }
          } else {
            // Already an object, use as is
            parsedAttachments = rawData.attachments;
          }

          // Create enhanced data with properly parsed attachments
          const enhancedData = {
            ...rawData,
            attachments: parsedAttachments,
          };

          // Get the attachment IDs
          const attachments = enhancedData.attachments as Record<string, any>;
          console.log(
            'DEBUG - Processed attachments object:',
            JSON.stringify(attachments, null, 2)
          );

          // Initialize empty arrays if they don't exist
          if (!attachments.identification) attachments.identification = [];
          if (!attachments.trade_license) attachments.trade_license = [];

          // For each attachment type (identification, trade_license)
          for (const attachmentType of ['identification', 'trade_license']) {
            if (
              attachments[attachmentType] &&
              Array.isArray(attachments[attachmentType]) &&
              attachments[attachmentType].length > 0
            ) {
              // Get the attachment IDs
              const attachmentIds = attachments[attachmentType] as number[];
              console.log(`DEBUG - ${attachmentType} IDs:`, attachmentIds);

              // Fetch the attachment metadata from the attachments table
              const attachmentMetadata = await Promise.all(
                attachmentIds.map(async (id: number) => {
                  const result = await getAttachmentMetadataById(id);
                  if (result.success && result.data) {
                    const metadata = result.data as AttachmentMetadata;

                    // Try to get the file name from multiple possible locations
                    let name = 'unknown-file';

                    // Check if metadata.name exists directly in metadata object
                    if (metadata.name) {
                      name = metadata.name;
                    }
                    // Check if metadata.metadata.name exists (from the saveAttachment metadata)
                    else if (metadata.metadata && metadata.metadata.name) {
                      name = metadata.metadata.name;
                    }
                    // Fallback to using key if metadata.name doesn't exist
                    else if (metadata.key) {
                      // Extract filename from the key (prefix-filename format)
                      const keyParts = metadata.key.split('-');
                      // If key has the prefix-filename format, extract the filename part
                      if (keyParts.length > 1) {
                        name = keyParts.slice(1).join('-');
                      } else {
                        // If no prefix-filename format, just use the last part of the path
                        name = metadata.key.split('/').pop() || 'unknown-file';
                      }
                    }

                    console.log(`DEBUG - Processing attachment ID ${id}:`, {
                      key: metadata.key,
                      name: name,
                      metadata: metadata.metadata,
                    });

                    // Add serverId to make file deletion easier
                    return {
                      ...metadata,
                      name,
                      serverId: id,
                      isServerFile: true,
                      size: metadata.metadata?.size || 143 * 1024,
                      type: metadata.metadata?.contentType || 'application/octet-stream',
                      lastModified: metadata.createdAt
                        ? new Date(metadata.createdAt).getTime()
                        : Date.now(),
                    };
                  }
                  return null;
                })
              );

              // Replace the attachment IDs with the metadata
              attachments[attachmentType] = attachmentMetadata.filter(Boolean);

              // Add debug logging for the processed files
              console.log(
                `DEBUG - Processed ${attachmentType} files for freelancer:`,
                attachments[attachmentType].map(file => ({
                  name: file.name,
                  size: file.size,
                  isServerFile: file.isServerFile,
                }))
              );
            }
          }

          identificationData = enhancedData;
          console.log(
            'DEBUG - Final enhanced freelancer identification data:',
            JSON.stringify(
              {
                ...identificationData,
                attachments: {
                  identification:
                    attachments.identification?.map(a => ({
                      name: a.name,
                      size: a.size,
                    })) || [],
                  trade_license:
                    attachments.trade_license?.map(a => ({
                      name: a.name,
                      size: a.size,
                    })) || [],
                },
              },
              null,
              2
            )
          );
        } else {
          // Initialize with empty attachments if none exist
          identificationData = {
            ...rawData,
            attachments: {
              identification: [],
              trade_license: [],
            },
          };
        }
      } else {
        // If no data was found, initialize with empty structure
        identificationData = {
          attachments: {
            identification: [],
            trade_license: [],
          },
        };
      }
    }
  }

  if (accountType === AccountType.Employer) {
    profile = profile as Employer;

    // Ensure identificationData is never null
    if (!identificationData) {
      identificationData = {
        attachments: {
          identification: [],
          trade_license: [],
          board_resolution: [],
        },
      };
    }

    return Response.json({
      accountType,
      currentProfile: profile,
      isPending,
      identificationData,
    });
  } else if (accountType === AccountType.Freelancer) {
    profile = profile as Freelancer;

    // Ensure identificationData is never null
    if (!identificationData) {
      identificationData = {
        attachments: {
          identification: [],
          trade_license: [],
        },
      };
    }

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
        <EmployerIdentificationScreen />
      ) : (
        <FreelancerIdentificationScreen />
      )}
    </div>
  );
}
