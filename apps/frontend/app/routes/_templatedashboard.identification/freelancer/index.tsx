import { useState, useRef, useEffect } from 'react';
import { Form, useActionData, useLoaderData, useSubmit, useFetcher } from '@remix-run/react';
import { Freelancer } from '~/types/User';
import { GeneralizableFormCardProps } from '~/common/profileView/onboarding-form-component/types';
import GeneralizableFormCard from '~/common/profileView/onboarding-form-component';
import { useToast } from '~/components/hooks/use-toast';

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
  const [hasTradeLicense, setHasTradeLicense] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  // Add form refs
  const identificationFormRef = useRef<any>({});
  const tradeLicenseFormRef = useRef<any>({});

  // Add a state to track if documents have been submitted successfully
  const [documentsSubmitted, setDocumentsSubmitted] = useState(false);

  // Add this below the refs
  const [existingIdentificationFiles, setExistingIdentificationFiles] = useState([]);
  const [existingTradeLicenseFiles, setExistingTradeLicenseFiles] = useState([]);

  // Update the useEffect that loads identification data
  useEffect(() => {
    // console.log(
    //   'DEBUG - Effect triggered with identificationData:',
    //   identificationData ? JSON.stringify(identificationData, null, 2) : 'null'
    // );

    if (identificationData && identificationData.attachments) {
      const attachments = identificationData.attachments;

      // Set existing files state for our direct display
      if (attachments.identification && Array.isArray(attachments.identification)) {
        setExistingIdentificationFiles(attachments.identification);
      }

      if (attachments.trade_license && Array.isArray(attachments.trade_license)) {
        setExistingTradeLicenseFiles(attachments.trade_license);
      }

      // Update the UI state
      if (
        attachments.identification &&
        Array.isArray(attachments.identification) &&
        attachments.identification.length > 0
      ) {
        setHasIdentification(true);
      }

      if (
        attachments.trade_license &&
        Array.isArray(attachments.trade_license) &&
        attachments.trade_license.length > 0
      ) {
        setHasTradeLicense(true);
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
    const hasTradeLicenseFiles = tradeLicenseFormRef.current?.filesSelected?.length > 0;

    setHasIdentification(hasIdentificationFiles);
    setHasTradeLicense(hasTradeLicenseFiles);
  };

  // Handle form submission
  const handleSubmitDocuments = () => {
    // Check if we have the required documents (either newly selected or existing)
    const hasIdentificationFiles =
      identificationFormRef.current?.filesSelected?.length > 0 ||
      (identificationData?.attachments?.identification &&
        identificationData.attachments.identification.length > 0);

    const hasTradeLicenseFiles =
      tradeLicenseFormRef.current?.filesSelected?.length > 0 ||
      (identificationData?.attachments?.trade_license &&
        identificationData.attachments.trade_license.length > 0);

    const hasRequiredDocuments = hasIdentificationFiles && hasTradeLicenseFiles;

    if (!hasRequiredDocuments) {
      toast({
        variant: 'destructive',
        title: 'Required Documents Missing',
        description: 'Please upload all required documents.',
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

    // Add trade license files if any
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

    // Get files to delete from localStorage
    try {
      const filesToDeleteIdentification = localStorage.getItem('identification-files-to-delete');
      const filesToDeleteTradeLicense = localStorage.getItem('trade_license-files-to-delete');

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

      if (filesToDelete.length > 0) {
        // console.log(
        //   'DEBUG - handleSubmitDocuments - Adding filesToDelete to formData:',
        //   filesToDelete
        // );
        formData.append('filesToDelete', JSON.stringify(filesToDelete));

        // Clear localStorage after adding to formData
        localStorage.removeItem('identification-files-to-delete');
        localStorage.removeItem('trade_license-files-to-delete');
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
    if (tradeLicenseFormRef.current && tradeLicenseFormRef.current.clearFiles) {
      tradeLicenseFormRef.current.clearFiles();
    }
  };

  // Check file inputs when component mounts and after any dialog closes
  useEffect(() => {
    const checkFiles = () => {
      setHasIdentification(checkFileInput('identification'));
      setHasTradeLicense(checkFileInput('trade_license'));

      // Also check if there are files in the dialog
      if (identificationFormRef.current && identificationFormRef.current.filesSelected) {
        const dialogFiles = identificationFormRef.current.filesSelected;
        if (dialogFiles && dialogFiles.length > 0) {
          setHasIdentification(true);
        }
      }

      if (tradeLicenseFormRef.current && tradeLicenseFormRef.current.filesSelected) {
        const tradeLicenseFiles = tradeLicenseFormRef.current.filesSelected;
        if (tradeLicenseFiles && tradeLicenseFiles.length > 0) {
          setHasTradeLicense(true);
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
  };

  // Form props for trade license
  const tradeLicenseFormProps: GeneralizableFormCardProps = {
    formType: 'file',
    cardTitle: 'Trade License',
    cardSubtitle: 'Please upload your trade license',
    popupTitle: 'Upload Trade License',
    triggerLabel: 'Upload Documents',
    formName: 'freelancer-identification',
    fieldName: 'trade_license',
    acceptedFileTypes: '.pdf,.jpg,.jpeg,.png',
    multiple: true,
    editable: true,
    showLoadingOnSubmit: true,
    formRef: tradeLicenseFormRef,
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

          {/* GeneralizableFormCard for trade license */}
          <GeneralizableFormCard
            {...tradeLicenseFormProps}
            value={identificationData?.attachments ? identificationData : null}
          />

          {/* Display existing trade license files directly */}
          {existingTradeLicenseFiles.length > 0 && (
            <div className="border rounded-lg p-4 bg-gray-50 -mt-3">
              <p className="font-medium text-gray-700">Files in database:</p>
              <FileList files={existingTradeLicenseFiles} title="Trade License" />
            </div>
          )}
        </div>

        {/* Back to account info button */}
        <div className="mt-6 flex justify-between">
          <button
            type="button"
            className="flex items-center text-red-500 hover:text-red-700 text-lg"
            onClick={() => {
              const formData = new FormData();
              formData.append('target-updated', 'back-to-account-info');

              submit(formData, { method: 'post' });
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1"
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
          </button>

          <button
            type="button"
            onClick={handleSubmitDocuments}
            disabled={isSubmitting || documentsSubmitted}
            className={`font-bold py-3 px-8 rounded text-lg shadow-md ${
              isSubmitting || documentsSubmitted
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-700 text-white'
            }`}
          >
            {isSubmitting
              ? 'Submitting...'
              : documentsSubmitted
                ? 'Documents Submitted'
                : 'Submit Documents'}
          </button>
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
