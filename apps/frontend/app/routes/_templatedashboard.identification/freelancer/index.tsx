import { useState, useRef, useEffect } from 'react';
import { Form, useActionData, useLoaderData, useSubmit, useFetcher } from '@remix-run/react';
import { Freelancer } from '@mawaheb/db/types';
import { GeneralizableFormCardProps } from '~/common/profileView/onboarding-form-component/types';
import GeneralizableFormCard from '~/common/profileView/onboarding-form-component';
import { useToast } from '~/components/hooks/use-toast';
import { Button } from '~/components/ui/button';
import { FaPaperPlane, FaSpinner, FaCheckCircle } from 'react-icons/fa';

interface FileDisplayProps {
  files: Array<{ name: string; size?: number }>;
  title: string;
}

const FileList = ({ files, title }: FileDisplayProps) => {
  if (!files || files.length === 0) {
    return null;
  }

  return (
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

interface FetcherData {
  success: boolean;
  error?: string;
  data?: any;
}

export default function FreelancerIdentifyingScreen() {
  const { toast } = useToast();
  const { currentProfile, identificationData } = useLoaderData<{
    currentProfile: Freelancer;
    identificationData: any;
  }>();

  // Debug log to check what identificationData contains
  //   console.log('DEBUG - Received identificationData:', JSON.stringify(identificationData, null, 2));

  const actionData = useActionData<{ success: boolean }>();
  const submit = useSubmit();
  const fetcher = useFetcher<FetcherData>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasIdentification, setHasIdentification] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  // Add form refs
  const identificationFormRef = useRef<any>({});

  // Add a state to track if documents have been submitted successfully
  const [documentsSubmitted, setDocumentsSubmitted] = useState(false);

  // Add this below the refs
  const [existingIdentificationFiles, setExistingIdentificationFiles] = useState([]);

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

        // Set existing files state for our direct display
        setExistingIdentificationFiles(identificationData.attachments.identification);
      }

      // Update the UI state
      if (
        identificationData.attachments.identification &&
        Array.isArray(identificationData.attachments.identification) &&
        identificationData.attachments.identification.length > 0
      ) {
        setHasIdentification(true);
      }
    }
  }, [identificationData]);

  // Watch fetcher state to update our submission state
  useEffect(() => {
    if (fetcher.state === 'submitting') {
      setIsSubmitting(true);
    } else if (fetcher.state === 'idle') {
      setIsSubmitting(false);
      if (fetcher.data?.success) {
        setDocumentsSubmitted(true);
      }
    }
  }, [fetcher.state, fetcher.data]);

  // Function to check if a file input has files
  const checkFileInput = (inputName: string): boolean => {
    if (!formRef.current) return false;
    const fileInput = formRef.current.querySelector(
      `input[name="${inputName}"]`
    ) as HTMLInputElement;
    return fileInput && fileInput.files && fileInput.files.length > 0;
  };

  // Update document state when form changes
  const handleFormChange = () => {
    // Directly check the filesSelected property in the refs
    const hasIdentificationFiles = identificationFormRef.current?.filesSelected?.length > 0;
    setHasIdentification(hasIdentificationFiles);
  };

  // Handle form submission
  const handleSubmitDocuments = () => {
    // Check if we have the required documents (either newly selected or existing)
    const hasIdentificationFiles =
      identificationFormRef.current?.filesSelected?.length > 0 ||
      (identificationData?.attachments?.identification &&
        identificationData.attachments.identification.length > 0);

    if (!hasIdentificationFiles) {
      toast({
        variant: 'destructive',
        title: 'Required Documents Missing',
        description: 'Please upload your identification documents.',
      });
      return;
    }

    const formData = new FormData();
    formData.append('target-updated', 'freelancer-identification');

    // Add identification files if any
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

    // Get files to delete from localStorage
    try {
      const filesToDeleteIdentification = localStorage.getItem('identification-files-to-delete');

      let filesToDelete: number[] = [];

      if (filesToDeleteIdentification) {
        const parsed = JSON.parse(filesToDeleteIdentification);
        if (Array.isArray(parsed)) {
          filesToDelete = [...filesToDelete, ...parsed];
        }
      }

      if (filesToDelete.length > 0) {
        // console.log(
        //   'DEBUG - handleSubmitDocuments - Adding filesToDelete to formData:',
        //   filesToDelete
        // );
        formData.append('filesToDelete', JSON.stringify(filesToDelete));

        // Clear localStorage after adding to formData
        localStorage.removeItem('identification-files-to-delete');
      }
    } catch (error) {
      console.error('DEBUG - Error handling filesToDelete from localStorage:', error);
    }

    formData.append('_action', 'freelancer-identification');

    // Submit the form
    fetcher.submit(formData, {
      method: 'post',
      encType: 'multipart/form-data',
    });

    // Clear the form refs after successful submission
    if (identificationFormRef.current && identificationFormRef.current.clearFiles) {
      identificationFormRef.current.clearFiles();
    }
  };

  // Check file inputs when component mounts and after any dialog closes
  useEffect(() => {
    const checkFiles = () => {
      setHasIdentification(checkFileInput('identification'));

      // Also check if there are files in the dialog
      if (identificationFormRef.current && identificationFormRef.current.filesSelected) {
        const dialogFiles = identificationFormRef.current.filesSelected;
        if (dialogFiles && dialogFiles.length > 0) {
          setHasIdentification(true);
        }
      }
    };

    // Check initially
    checkFiles();

    // Set up a mutation observer to detect when the dialog closes
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.type === 'childList' || mutation.type === 'attributes') {
          checkFiles();
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['aria-hidden', 'class'],
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  // Form props for identification documents
  const identificationFormProps: GeneralizableFormCardProps = {
    formType: 'file',
    cardTitle: 'Identification Documents',
    cardSubtitle: 'Please upload your ID or passport',
    popupTitle: 'Upload Identification Documents',
    triggerLabel: 'Upload Documents',
    formName: 'freelancer-identification',
    fieldName: 'identification',
    acceptedFileTypes: '.pdf,.jpg,.jpeg,.png',
    multiple: true,
    editable: true,
    showLoadingOnSubmit: true,
    formRef: identificationFormRef,
    maxFileSizeMB: 10,
  };

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
          {existingIdentificationFiles.length > 0 && (
            <div className="border rounded-lg p-4 bg-gray-50 -mt-3">
              <p className="font-medium text-gray-700">Files in database:</p>
              <FileList files={existingIdentificationFiles} title="Identification Documents" />
            </div>
          )}
        </div>

        {/* Back to account info button */}
        <div className="mt-6 flex justify-between">
          <Button
            type="button"
            className="flex items-center text-lg bg-primaryColor hover:bg-primaryColor hover:underline text-white group"
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
            className={`flex items-center justify-center text-lg bg-primaryColor py-3 px-5 hover:bg-primaryColor hover:underline text-white group gap-2 ${
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
            {JSON.stringify({ identificationData }, null, 2)}
          </pre>
        </div>
      )} */}
    </div>
  );
}
