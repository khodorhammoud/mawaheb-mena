import React, { useRef, useState, useEffect } from 'react';
import { useLoaderData, useFetcher, Form, useSubmit } from '@remix-run/react';
import { EmployerAccountType } from '@mawaheb/db/enums';
import { GeneralizableFormCardProps } from '~/common/profileView/onboarding-form-component/types';
import GeneralizableFormCard from '~/common/profileView/onboarding-form-component';
import { useToast } from '~/components/hooks/use-toast';
import { Button } from '~/components/ui/button';
import { ToastAction } from '~/components/ui/toast';
import { FaCheckCircle, FaPaperPlane, FaSpinner } from 'react-icons/fa';

// File display component
interface FileDisplayProps {
  files: Array<{ name: string; size?: number }>;
  title: string;
}

const FileList = ({ files, title }: FileDisplayProps) => {
  if (!files || files.length === 0) {
    return null;
  }

  return (
    // Files in the database
    <div className="mt-2">
      <ul className="list-disc pl-5">
        {files.map((file, index) => (
          <li key={index} className="text-sm text-gray-600">
            {file.name}
            {file.size && (
              <span className="text-xs text-gray-500 ml-2">
                ({Math.round(file.size / 1024)} KB)
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

// Type for the fetcher data response
interface FetcherData {
  success: boolean;
  error?: string;
  data?: any;
}

export default function EmployerIdentificationScreen() {
  const { employerAccountType, identificationData } = useLoaderData<{
    employerAccountType: EmployerAccountType;
    identificationData: any;
  }>();

  const { toast } = useToast();

  const formRef = useRef<HTMLFormElement>(null);
  const fetcher = useFetcher<FetcherData>();

  // States for managing uploads
  const [boardResolutionFiles, setBoardResolutionFiles] = useState<File[]>([]);
  const [identificationFiles, setIdentificationFiles] = useState<File[]>([]);
  const [tradeLicenseFiles, setTradeLicenseFiles] = useState<File[]>([]);

  // States for submission status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [documentsSubmitted, setDocumentsSubmitted] = useState(false);

  // Track form state changes
  const [formChanged, setFormChanged] = useState(false);

  // Add refs for form components
  const identificationFormRef = useRef<any>({});
  const tradeLicenseFormRef = useRef<any>({});
  const boardResolutionFormRef = useRef<any>({});

  // In the handleBackToAccountInfo function, replace submit with useSubmit
  const submit = useSubmit();

  // Initialize file refs with existing files when component loads
  useEffect(() => {
    if (identificationData?.attachments) {
      // For identification files
      if (
        identificationFormRef.current &&
        identificationData.attachments.identification &&
        identificationData.attachments.identification.length > 0
      ) {
        const identFiles = identificationData.attachments.identification.map(file => {
          // Properly handle file-like object creation
          try {
            // Use type field if available, otherwise fallback
            const fileType = file.type || 'application/octet-stream';
            // Use size field if available, otherwise use a default size
            const fileSize = file.size || 143 * 1024;
            // Create a Blob with the same type as the original file
            const blob = new Blob([new Uint8Array(1)], { type: fileType });

            // Create a new File object that looks like the original
            const fileObj = new File([blob], file.name || 'unknown-file', {
              type: fileType,
              lastModified: new Date().getTime(),
            });

            // Add custom properties for tracking
            Object.defineProperties(fileObj, {
              isServerFile: { value: true, writable: true, enumerable: true },
              serverId: { value: file.serverId || file.id, writable: true, enumerable: true },
              size: { value: fileSize, writable: true, enumerable: true },
              fileData: { value: file, writable: true, enumerable: true },
            });

            return fileObj;
          } catch (e) {
            return file;
          }
        });

        identificationFormRef.current.filesSelected = identFiles;
      }

      // For trade license files
      if (
        tradeLicenseFormRef.current &&
        identificationData.attachments.trade_license &&
        identificationData.attachments.trade_license.length > 0
      ) {
        const tradeFiles = identificationData.attachments.trade_license.map(file => {
          // Create file-like object with necessary properties
          try {
            const fileType = file.type || 'application/octet-stream';
            const fileSize = file.size || 143 * 1024;
            const blob = new Blob([new Uint8Array(1)], { type: fileType });

            const fileObj = new File([blob], file.name || 'unknown-file', {
              type: fileType,
              lastModified: new Date().getTime(),
            });

            Object.defineProperties(fileObj, {
              isServerFile: { value: true, writable: true, enumerable: true },
              serverId: { value: file.serverId || file.id, writable: true, enumerable: true },
              size: { value: fileSize, writable: true, enumerable: true },
              fileData: { value: file, writable: true, enumerable: true },
            });

            return fileObj;
          } catch (e) {
            return file;
          }
        });

        tradeLicenseFormRef.current.filesSelected = tradeFiles;
      }

      // For board resolution files (company only)
      if (
        boardResolutionFormRef.current &&
        identificationData.attachments.board_resolution &&
        identificationData.attachments.board_resolution.length > 0
      ) {
        const boardFiles = identificationData.attachments.board_resolution.map(file => {
          // Create file-like object with necessary properties
          try {
            const fileType = file.type || 'application/octet-stream';
            const fileSize = file.size || 143 * 1024;
            const blob = new Blob([new Uint8Array(1)], { type: fileType });

            const fileObj = new File([blob], file.name || 'unknown-file', {
              type: fileType,
              lastModified: new Date().getTime(),
            });

            Object.defineProperties(fileObj, {
              isServerFile: { value: true, writable: true, enumerable: true },
              serverId: { value: file.serverId || file.id, writable: true, enumerable: true },
              size: { value: fileSize, writable: true, enumerable: true },
              fileData: { value: file, writable: true, enumerable: true },
            });

            return fileObj;
          } catch (e) {
            return file;
          }
        });

        boardResolutionFormRef.current.filesSelected = boardFiles;
      }
    }
  }, [identificationData]);

  // Monitor the fetcher state
  useEffect(() => {
    if (fetcher.state === 'submitting') {
      setIsSubmitting(true);
      setDocumentsSubmitted(false);
    } else if (fetcher.state === 'idle' && fetcher.data) {
      setIsSubmitting(false);

      if (fetcher.data.success) {
        setDocumentsSubmitted(true);
      }
    }
  }, [fetcher.state, fetcher.data]);

  // Determine if we have valid files to submit
  const hasValidFilesToSubmit = () => {
    const isCompany = employerAccountType === EmployerAccountType.Company;

    // Check if we have the required identification files
    const hasIdentificationFiles =
      identificationFormRef.current?.filesSelected?.length > 0 ||
      (identificationData?.attachments?.identification &&
        identificationData.attachments.identification.length > 0);

    // Check if we have trade license files
    const hasTradeLicenseFiles =
      tradeLicenseFormRef.current?.filesSelected?.length > 0 ||
      (identificationData?.attachments?.trade_license &&
        identificationData.attachments.trade_license.length > 0);

    // For companies, check if we have board resolution files
    const hasBoardResolutionFiles =
      !isCompany ||
      boardResolutionFormRef.current?.filesSelected?.length > 0 ||
      (identificationData?.attachments?.board_resolution &&
        identificationData.attachments.board_resolution.length > 0);

    return hasIdentificationFiles && hasTradeLicenseFiles && hasBoardResolutionFiles;
  };

  // Handle form changes
  const handleFormChange = () => {
    setFormChanged(true);
  };

  // Handle submit action
  const handleSubmitDocuments = () => {
    if (!hasValidFilesToSubmit()) {
      toast({
        variant: 'destructive',
        title: 'Required Documents Missing',
        description: 'Please upload all required documents.',
      });
      return;
    }

    // Create a FormData object to submit
    const formData = new FormData();
    formData.append('target-updated', 'employer-identification');

    // Add identification files from the dialog component
    if (
      identificationFormRef.current &&
      identificationFormRef.current.filesSelected &&
      identificationFormRef.current.filesSelected.length > 0
    ) {
      // Add all files from the dialog
      identificationFormRef.current.filesSelected.forEach(file => {
        if (file instanceof File && file.size > 0) {
          formData.append('identification', file);
        }
      });
    }

    // Add trade license files from the dialog component
    if (
      tradeLicenseFormRef.current &&
      tradeLicenseFormRef.current.filesSelected &&
      tradeLicenseFormRef.current.filesSelected.length > 0
    ) {
      // Add all files from the dialog
      tradeLicenseFormRef.current.filesSelected.forEach(file => {
        if (file instanceof File && file.size > 0) {
          formData.append('trade_license', file);
        }
      });
    }

    // Add board resolution files from the dialog component (for company accounts)
    if (
      isCompany &&
      boardResolutionFormRef.current &&
      boardResolutionFormRef.current.filesSelected &&
      boardResolutionFormRef.current.filesSelected.length > 0
    ) {
      // Add all files from the dialog
      boardResolutionFormRef.current.filesSelected.forEach(file => {
        if (file instanceof File && file.size > 0) {
          formData.append('board_resolution', file);
        }
      });
    }

    // Get files to delete from localStorage
    try {
      const filesToDeleteIdentification = localStorage.getItem('identification-files-to-delete');
      const filesToDeleteTradeLicense = localStorage.getItem('trade_license-files-to-delete');
      const filesToDeleteBoardResolution = localStorage.getItem('board_resolution-files-to-delete');

      let filesToDelete: number[] = [];

      if (filesToDeleteIdentification) {
        const parsed = JSON.parse(filesToDeleteIdentification);
        if (Array.isArray(parsed)) {
          filesToDelete = [...filesToDelete, ...parsed];
        }
      }

      if (filesToDeleteTradeLicense) {
        const parsed = JSON.parse(filesToDeleteTradeLicense);
        if (Array.isArray(parsed)) {
          filesToDelete = [...filesToDelete, ...parsed];
        }
      }

      if (filesToDeleteBoardResolution) {
        const parsed = JSON.parse(filesToDeleteBoardResolution);
        if (Array.isArray(parsed)) {
          filesToDelete = [...filesToDelete, ...parsed];
        }
      }

      if (filesToDelete.length > 0) {
        formData.append('filesToDelete', JSON.stringify(filesToDelete));

        // Clear localStorage after adding to formData
        localStorage.removeItem('identification-files-to-delete');
        localStorage.removeItem('trade_license-files-to-delete');
        localStorage.removeItem('board_resolution-files-to-delete');
      }
    } catch (error) {
      // Error handling filesToDelete from localStorage
    }

    // Submit using fetcher
    fetcher.submit(formData, {
      method: 'post',
      encType: 'multipart/form-data',
    });
  };

  // Form props for identification documents
  const identificationFormProps: GeneralizableFormCardProps = {
    formType: 'file',
    cardTitle: 'Identification Documents',
    cardSubtitle: 'Please upload your ID or passport',
    popupTitle: 'Upload Identification Documents',
    triggerLabel: 'Upload Documents',
    formName: 'employer-identification',
    fieldName: 'identification',
    acceptedFileTypes: '.pdf,.jpg,.jpeg,.png',
    multiple: true,
    editable: true,
    showLoadingOnSubmit: true,
    formRef: identificationFormRef,
    maxFileSizeMB: 10,
  };

  // Form props for trade license
  const tradeLicenseFormProps: GeneralizableFormCardProps = {
    formType: 'file',
    cardTitle: 'Trade License',
    cardSubtitle: 'Please upload your trade license',
    popupTitle: 'Upload Trade License',
    triggerLabel: 'Upload Documents',
    formName: 'employer-identification',
    fieldName: 'trade_license',
    acceptedFileTypes: '.pdf,.jpg,.jpeg,.png',
    multiple: true,
    editable: true,
    showLoadingOnSubmit: true,
    formRef: tradeLicenseFormRef,
    maxFileSizeMB: 10,
  };

  // Form props for board resolution (only for companies)
  const boardResolutionFormProps: GeneralizableFormCardProps = {
    formType: 'file',
    cardTitle: 'Board Resolution',
    cardSubtitle:
      'Please upload the board resolution authorizing you to act on behalf of the company',
    popupTitle: 'Upload Board Resolution',
    triggerLabel: 'Upload Documents',
    formName: 'employer-identification',
    fieldName: 'board_resolution',
    acceptedFileTypes: '.pdf,.jpg,.jpeg,.png',
    multiple: true,
    editable: true,
    showLoadingOnSubmit: true,
    formRef: boardResolutionFormRef,
    maxFileSizeMB: 10,
  };

  const isCompany = employerAccountType === EmployerAccountType.Company;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Identity Verification</h1>
        <p className="text-gray-600">
          Please upload your identification documents to verify your identity. This is a required
          step before you can access the platform.
        </p>
      </div>

      <Form
        ref={formRef}
        method="post"
        encType="multipart/form-data"
        onSubmit={e => e.preventDefault()}
        onChange={handleFormChange}
        className="space-y-6"
      >
        {/* File upload sections */}
        <div className="space-y-6">
          {/* GeneralizableFormCard for identification */}
          <GeneralizableFormCard
            {...identificationFormProps}
            value={identificationData?.attachments ? identificationData : null}
          />

          {/* Display existing identification files directly */}
          {identificationData?.attachments?.identification &&
            identificationData.attachments.identification.length > 0 && (
              <div className="border rounded-lg p-4 bg-gray-50 -mt-3">
                <p className="font-medium text-gray-700">Files in database:</p>
                <FileList
                  files={identificationData.attachments.identification}
                  title="Identification Documents"
                />
              </div>
            )}

          {/* GeneralizableFormCard for trade license */}
          <GeneralizableFormCard
            {...tradeLicenseFormProps}
            value={identificationData?.attachments ? identificationData : null}
          />

          {/* Display existing trade license files directly */}
          {identificationData?.attachments?.trade_license &&
            identificationData.attachments.trade_license.length > 0 && (
              <div className="border rounded-lg p-4 bg-gray-50 -mt-3">
                <p className="font-medium text-gray-700">Files in database:</p>
                <FileList
                  files={identificationData.attachments.trade_license}
                  title="Trade License"
                />
              </div>
            )}

          {/* Show board resolution upload only for companies */}
          {isCompany && (
            <>
              <GeneralizableFormCard
                {...boardResolutionFormProps}
                value={identificationData?.attachments ? identificationData : null}
              />

              {/* Display existing board resolution files directly */}
              {identificationData?.attachments?.board_resolution &&
                identificationData.attachments.board_resolution.length > 0 && (
                  <div className="border rounded-lg p-4 bg-gray-50 -mt-3">
                    <p className="font-medium text-gray-700">Files in database:</p>
                    <FileList
                      files={identificationData.attachments.board_resolution}
                      title="Board Resolution"
                    />
                  </div>
                )}
            </>
          )}
        </div>

        {/* Buttons section */}
        <div className="mt-6 flex justify-between">
          {/* Back to account button */}
          <Button
            type="button"
            className="flex items-center text-lg bg-primaryColor hover:bg-primaryColor hover:underline text-white group focus:outline-none
    focus-visible:ring-0
    focus-visible:outline-none
    focus:ring-0
    focus:border-none
    focus-visible:border-none
    focus-visible:ring-offset-0"
            onClick={() => {
              const formData = new FormData();
              formData.append('target-updated', 'back-to-account-info');
              submit(formData, { method: 'post' });
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1 transform transition-transform duration-300 ease-in-out group-hover:-translate-x-1 "
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            Back to account info
          </Button>

          {/* Submit documents button */}
          <Button
            type="button"
            onClick={handleSubmitDocuments}
            disabled={isSubmitting || documentsSubmitted}
            className={`flex items-center justify-center text-lg bg-primaryColor py-3 px-5 hover:bg-primaryColor hover:underline text-white group gap-2 focus:outline-none
    focus-visible:ring-0
    focus-visible:outline-none
    focus:ring-0
    focus:border-none
    focus-visible:border-none
    focus-visible:ring-offset-0 ${
      isSubmitting || documentsSubmitted
        ? 'bg-primaryColor hover:bg-primaryColor text-white'
        : 'bg-primaryColor hover:bg-primaryColor text-white hover:underline'
    }`}
          >
            {isSubmitting ? (
              <>
                Submitting...
                <FaSpinner className="h-3 w-3 animate-spin" />
              </>
            ) : documentsSubmitted ? (
              <>
                Documents Submitted
                <FaCheckCircle className="h-3 w-3 transition-transform duration-300 group-hover:scale-110" />
              </>
            ) : (
              <>
                Submit Documents
                <FaPaperPlane className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-1" />
              </>
            )}
          </Button>
        </div>
      </Form>

      {/* Display debug info in development environment */}
      {/* {process.env.NODE_ENV === 'development' && (
        <div className="mt-8 p-4 border border-gray-300 rounded bg-gray-50">
          <h3 className="text-sm font-bold mb-2">Debug Information:</h3>
          <pre className="text-xs overflow-auto max-h-64">
            {JSON.stringify({ identificationData, employerAccountType }, null, 2)}
          </pre>
        </div>
      )} */}
    </div>
  );
}
