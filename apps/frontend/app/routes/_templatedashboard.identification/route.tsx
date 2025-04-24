import { redirect, useLoaderData } from '@remix-run/react';
import { AccountType, AccountStatus, EmployerAccountType } from '~/types/delete-me-enums';
import { getCurrentProfileInfo, getCurrentUserAccountType } from '~/servers/user.server';
import { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { Employer, Freelancer } from '@mawaheb/db/types/User';
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
  getFreelancerIdentification,
  updateFreelancerIdentification,
  updateFreelancerAccountStatusToPending,
} from '~/servers/freelancer.server';
import { setOnboardedStatus } from '~/servers/user.server';
import { getAttachmentMetadataById } from '~/servers/cloudStorage.server';
import { deleteAttachmentById } from '~/servers/attachment.server';

// Add this interface after the imports
interface AttachmentMetadata {
  id: number;
  key: string;
  name?: string;
  metadata?: {
    name?: string;
    size?: number;
    type?: string;
    contentType?: string;
    lastModified?: number;
    storage?: {
      key?: string;
      name?: string;
    };
  };
  storage?: {
    key: string;
    bucket: string;
    url: string;
    metadata?: {
      name?: string;
    };
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
    const filesToDeleteString = formData.get('filesToDelete') as string;
    let filesToDelete: number[] = [];
    try {
      if (filesToDeleteString) {
        filesToDelete = JSON.parse(filesToDeleteString);
      }
    } catch (error) {
      console.error('Error parsing filesToDelete:', error);
      filesToDelete = [];
    }

    // Process file deletions if any
    if (filesToDelete.length > 0) {
      for (const fileId of filesToDelete) {
        try {
          // Delete the file from the attachments table
          await deleteAttachmentById(fileId);
        } catch (error) {
          console.error(`Error deleting file with ID ${fileId}:`, error);
        }
      }
    }

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

      // First update the account status
      const statusResult = await updateEmployerAccountStatusToPending(accountId);

      if (!statusResult.success) {
        return Response.json({
          success: false,
          error: 'Failed to update employer account status',
        });
      }

      // Then save the identification data
      const result = await createEmployerIdentification(userId, attachmentsData);

      if (!result.success) {
        return Response.json({
          success: false,
          error: 'Failed to save employer identification',
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

  // Check if user is forcing to view the identification screen
  const url = new URL(request.url);
  const forceView = url.searchParams.get('force') === 'true';

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

  // If account status is pending, show pending message (unless force=true is set)
  const isPending = profile.account?.accountStatus === AccountStatus.Pending && !forceView;

  // Fetch identification data based on account type
  let identificationData = null;
  const userId = profile.account?.user?.id;

  if (userId) {
    if (accountType === AccountType.Employer) {
      const result = await getEmployerIdentification(userId);

      if (result.success && result.data) {
        // Get the raw identification data
        const rawData = result.data;

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

              // Fetch the attachment metadata from the attachments table
              const attachmentMetadata = await Promise.all(
                attachmentIds.map(async (id: number) => {
                  const result = await getAttachmentMetadataById(id);
                  if (result.success && result.data) {
                    const metadata = result.data as AttachmentMetadata;

                    // Get the original filename from metadata.name or extract from the key
                    let fileName = 'unknown-file';

                    // First check if metadata has a name property directly
                    if (metadata.name) {
                      fileName = metadata.name;
                    }
                    // Check if name is in the metadata.metadata property
                    else if (metadata.metadata?.name) {
                      fileName = metadata.metadata.name;
                    }
                    // Check if name is in the metadata.storage.metadata property
                    else if (metadata.storage?.metadata?.name) {
                      fileName = metadata.storage.metadata.name;
                    }
                    // Look in the metadata from the storage
                    else if (metadata.metadata?.storage?.name) {
                      fileName = metadata.metadata.storage.name;
                    }
                    // Then check if it's in the storage object key
                    else if (metadata.storage?.key) {
                      // Extract the filename from the storage key
                      const key = metadata.storage.key;

                      // Check for the file name format in the key
                      // Try to find the original filename after prefix-timestamp-
                      const matches = key.match(/^([^-]+)-(?:\d+-)?(.+)$/);
                      if (matches && matches.length >= 3) {
                        fileName = matches[2]; // This should be the filename part
                      } else {
                        // Fallback: just take everything after the first dash
                        const dashIndex = key.indexOf('-');
                        if (dashIndex !== -1) {
                          fileName = key.substring(dashIndex + 1);
                        }
                      }
                    }
                    // Finally, check the key directly
                    else if (metadata.key) {
                      // Extract the filename from the key
                      const key = metadata.key;

                      // Use the same pattern matching logic
                      const matches = key.match(/^([^-]+)-(?:\d+-)?(.+)$/);
                      if (matches && matches.length >= 3) {
                        fileName = matches[2]; // This should be the filename part
                      } else {
                        // Fallback: just take everything after the first dash
                        const dashIndex = key.indexOf('-');
                        if (dashIndex !== -1) {
                          fileName = key.substring(dashIndex + 1);
                        }
                      }
                    }

                    // Check if the original filename is stored directly in metadata.storage
                    else if (metadata.storage && typeof metadata.storage === 'object') {
                      // Sometimes the file name might be stored in a format like:
                      // metadata.storage = { key: '...', bucket: '...', url: '...', originalName: '...' }
                      // So check all keys of the storage object
                      for (const [key, value] of Object.entries(metadata.storage)) {
                        // Look for keys that might contain filename information
                        if (
                          typeof value === 'string' &&
                          (key.toLowerCase().includes('name') || key.toLowerCase().includes('file'))
                        ) {
                          fileName = value;
                          break;
                        }
                      }
                    }

                    // Attempt to extract the original file name from the raw response
                    // Look for the name in various locations in the raw data
                    if (fileName === 'unknown-file' && result.data) {
                      // Use a safer approach with type assertions and checks
                      const rawData = result.data as Record<string, any>;

                      // Check common locations for the filename
                      if (rawData.name && typeof rawData.name === 'string') {
                        fileName = rawData.name;
                      }
                      // Check metadata structure based on saveAttachment format
                      else if (rawData.metadata && typeof rawData.metadata === 'object') {
                        // Check direct name property in metadata
                        if (rawData.metadata.name && typeof rawData.metadata.name === 'string') {
                          fileName = rawData.metadata.name;
                        }
                        // The saveAttachment function creates this metadata structure
                        else if (
                          rawData.metadata.metadata &&
                          typeof rawData.metadata.metadata === 'object'
                        ) {
                          if (
                            rawData.metadata.metadata.name &&
                            typeof rawData.metadata.metadata.name === 'string'
                          ) {
                            fileName = rawData.metadata.metadata.name;
                          }
                        }
                      }
                      // Check for originalName
                      else if (rawData.originalName && typeof rawData.originalName === 'string') {
                        fileName = rawData.originalName;
                      }

                      // If we still don't have a valid filename, look deeper
                      if (fileName === 'unknown-file') {
                        // Try to find any property that looks like a filename
                        const findNameInObject = (
                          obj: Record<string, any>,
                          depth = 0
                        ): string | null => {
                          if (depth > 3) return null; // Prevent too deep recursion

                          for (const [key, value] of Object.entries(obj)) {
                            // Check if the key itself contains 'name' or 'file'
                            if (
                              (key.toLowerCase().includes('name') ||
                                key.toLowerCase().includes('file')) &&
                              typeof value === 'string' &&
                              value.length > 0
                            ) {
                              return value;
                            }

                            // Check for storage key patterns
                            if (
                              key === 'storage' &&
                              typeof value === 'object' &&
                              value.key &&
                              typeof value.key === 'string'
                            ) {
                              const storageKey = value.key;
                              // Look for patterns like prefix-filename.ext or prefix-timestamp-filename.ext
                              const keyMatches = storageKey.match(/^([^-]+)-(?:\d+-)?(.+\.\w+)$/);
                              if (keyMatches && keyMatches.length >= 3) {
                                return keyMatches[2]; // This would be the filename.ext part
                              }
                            }

                            // Check nested objects
                            if (value && typeof value === 'object' && !Array.isArray(value)) {
                              const nestedResult = findNameInObject(
                                value as Record<string, any>,
                                depth + 1
                              );
                              if (nestedResult) return nestedResult;
                            }
                          }

                          return null;
                        };

                        const foundName = findNameInObject(rawData);
                        if (foundName) {
                          fileName = foundName;
                        }
                      }
                    }

                    return {
                      ...metadata,
                      name: fileName,
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
            }
          }

          identificationData = enhancedData;
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

      if (result.success && result.data) {
        // Get the raw identification data
        const rawData = result.data;

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

                    // Get the original filename from metadata.name or extract from the key
                    let fileName = 'unknown-file';

                    // First check if metadata has a name property directly
                    if (metadata.name) {
                      fileName = metadata.name;
                    }
                    // Check if name is in the metadata.metadata property
                    else if (metadata.metadata?.name) {
                      fileName = metadata.metadata.name;
                    }
                    // Check if name is in the metadata.storage.metadata property
                    else if (metadata.storage?.metadata?.name) {
                      fileName = metadata.storage.metadata.name;
                    }
                    // Look in the metadata from the storage
                    else if (metadata.metadata?.storage?.name) {
                      fileName = metadata.metadata.storage.name;
                    }
                    // Then check if it's in the storage object key
                    else if (metadata.storage?.key) {
                      // Extract the filename from the storage key
                      const key = metadata.storage.key;

                      // Check for the file name format in the key
                      // Try to find the original filename after prefix-timestamp-
                      const matches = key.match(/^([^-]+)-(?:\d+-)?(.+)$/);
                      if (matches && matches.length >= 3) {
                        fileName = matches[2]; // This should be the filename part
                      } else {
                        // Fallback: just take everything after the first dash
                        const dashIndex = key.indexOf('-');
                        if (dashIndex !== -1) {
                          fileName = key.substring(dashIndex + 1);
                        }
                      }
                    }
                    // Finally, check the key directly
                    else if (metadata.key) {
                      // Extract the filename from the key
                      const key = metadata.key;

                      // Use the same pattern matching logic
                      const matches = key.match(/^([^-]+)-(?:\d+-)?(.+)$/);
                      if (matches && matches.length >= 3) {
                        fileName = matches[2]; // This should be the filename part
                      } else {
                        // Fallback: just take everything after the first dash
                        const dashIndex = key.indexOf('-');
                        if (dashIndex !== -1) {
                          fileName = key.substring(dashIndex + 1);
                        }
                      }
                    }

                    // Check if the original filename is stored directly in metadata.storage
                    else if (metadata.storage && typeof metadata.storage === 'object') {
                      // Sometimes the file name might be stored in a format like:
                      // metadata.storage = { key: '...', bucket: '...', url: '...', originalName: '...' }
                      // So check all keys of the storage object
                      for (const [key, value] of Object.entries(metadata.storage)) {
                        // Look for keys that might contain filename information
                        if (
                          typeof value === 'string' &&
                          (key.toLowerCase().includes('name') || key.toLowerCase().includes('file'))
                        ) {
                          fileName = value;
                          break;
                        }
                      }
                    }

                    // Attempt to extract the original file name from the raw response
                    // Look for the name in various locations in the raw data
                    if (fileName === 'unknown-file' && result.data) {
                      // Use a safer approach with type assertions and checks
                      const rawData = result.data as Record<string, any>;

                      // Check common locations for the filename
                      if (rawData.name && typeof rawData.name === 'string') {
                        fileName = rawData.name;
                      }
                      // Check metadata structure based on saveAttachment format
                      else if (rawData.metadata && typeof rawData.metadata === 'object') {
                        // Check direct name property in metadata
                        if (rawData.metadata.name && typeof rawData.metadata.name === 'string') {
                          fileName = rawData.metadata.name;
                        }
                        // The saveAttachment function creates this metadata structure
                        else if (
                          rawData.metadata.metadata &&
                          typeof rawData.metadata.metadata === 'object'
                        ) {
                          if (
                            rawData.metadata.metadata.name &&
                            typeof rawData.metadata.metadata.name === 'string'
                          ) {
                            fileName = rawData.metadata.metadata.name;
                          }
                        }
                      }
                      // Check for originalName
                      else if (rawData.originalName && typeof rawData.originalName === 'string') {
                        fileName = rawData.originalName;
                      }

                      // If we still don't have a valid filename, look deeper
                      if (fileName === 'unknown-file') {
                        // Try to find any property that looks like a filename
                        const findNameInObject = (
                          obj: Record<string, any>,
                          depth = 0
                        ): string | null => {
                          if (depth > 3) return null; // Prevent too deep recursion

                          for (const [key, value] of Object.entries(obj)) {
                            // Check if the key itself contains 'name' or 'file'
                            if (
                              (key.toLowerCase().includes('name') ||
                                key.toLowerCase().includes('file')) &&
                              typeof value === 'string' &&
                              value.length > 0
                            ) {
                              return value;
                            }

                            // Check for storage key patterns
                            if (
                              key === 'storage' &&
                              typeof value === 'object' &&
                              value.key &&
                              typeof value.key === 'string'
                            ) {
                              const storageKey = value.key;
                              // Look for patterns like prefix-filename.ext or prefix-timestamp-filename.ext
                              const keyMatches = storageKey.match(/^([^-]+)-(?:\d+-)?(.+\.\w+)$/);
                              if (keyMatches && keyMatches.length >= 3) {
                                return keyMatches[2]; // This would be the filename.ext part
                              }
                            }

                            // Check nested objects
                            if (value && typeof value === 'object' && !Array.isArray(value)) {
                              const nestedResult = findNameInObject(
                                value as Record<string, any>,
                                depth + 1
                              );
                              if (nestedResult) return nestedResult;
                            }
                          }

                          return null;
                        };

                        const foundName = findNameInObject(rawData);
                        if (foundName) {
                          fileName = foundName;
                        }
                      }
                    }

                    return {
                      ...metadata,
                      name: fileName,
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
            }
          }

          identificationData = enhancedData;
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
        <EmployerIdentifyingScreen />
      ) : (
        <FreelancerIdentifyingScreen />
      )}
    </div>
  );
}
