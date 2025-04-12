import { useState, useRef, useEffect } from 'react';
import { Form, useActionData, useLoaderData, useSubmit } from '@remix-run/react';
import { Employer } from '@mawaheb/db';
import { EmployerAccountType } from '@mawaheb/db';
import { GeneralizableFormCardProps } from '~/common/profileView/onboarding-form-component/types';
import GeneralizableFormCard from '~/common/profileView/onboarding-form-component';

export default function EmployerIdentifyingScreen() {
  const { currentProfile, identificationData } = useLoaderData<{
    currentProfile: Employer;
    identificationData: any;
  }>();
  const actionData = useActionData<{ success: boolean }>();
  const submit = useSubmit();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasIdentification, setHasIdentification] = useState(false);
  const [hasTradeLicense, setHasTradeLicense] = useState(false);
  const [hasBoardResolution, setHasBoardResolution] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  // References to access the GeneralizableFormCard methods
  const identificationFormRef = useRef<any>(null);
  const tradeLicenseFormRef = useRef<any>(null);
  const boardResolutionFormRef = useRef<any>(null);

  // Check if we're dealing with a company account (which needs board resolution)
  const isCompanyAccount = currentProfile.employerAccountType === EmployerAccountType.Company;

  // Check if we already have identification data
  useEffect(() => {
    if (identificationData && identificationData.attachments) {
      if (
        identificationData.attachments.identification &&
        identificationData.attachments.identification.length > 0
      ) {
        setHasIdentification(true);
      }

      if (
        identificationData.attachments.trade_license &&
        identificationData.attachments.trade_license.length > 0
      ) {
        setHasTradeLicense(true);
      }

      if (
        isCompanyAccount &&
        identificationData.attachments.board_resolution &&
        identificationData.attachments.board_resolution.length > 0
      ) {
        setHasBoardResolution(true);
      }
    }
  }, [identificationData, isCompanyAccount]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Get files from the dialog component
    let hasFiles = false;

    if (
      identificationFormRef.current ||
      tradeLicenseFormRef.current ||
      (isCompanyAccount && boardResolutionFormRef.current)
    ) {
      // Check for identification files
      if (
        identificationFormRef.current &&
        identificationFormRef.current.getFormData &&
        formRef.current
      ) {
        const dialogFormData = identificationFormRef.current.getFormData(formRef.current);
        if (dialogFormData) {
          const identificationFiles = dialogFormData.getAll('identification');
          hasFiles = hasFiles || identificationFiles.length > 0;
        }
      }

      // Check for trade license files
      if (
        tradeLicenseFormRef.current &&
        tradeLicenseFormRef.current.getFormData &&
        formRef.current
      ) {
        const dialogFormData = tradeLicenseFormRef.current.getFormData(formRef.current);
        if (dialogFormData) {
          const tradeLicenseFiles = dialogFormData.getAll('trade_license');
          hasFiles = hasFiles || tradeLicenseFiles.length > 0;
        }
      }

      // Check for board resolution files if company account
      if (
        isCompanyAccount &&
        boardResolutionFormRef.current &&
        boardResolutionFormRef.current.getFormData &&
        formRef.current
      ) {
        const dialogFormData = boardResolutionFormRef.current.getFormData(formRef.current);
        if (dialogFormData) {
          const boardResolutionFiles = dialogFormData.getAll('board_resolution');
          hasFiles = hasFiles || boardResolutionFiles.length > 0;
        }
      }
    }

    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    formData.append('target-updated', 'employer-identification');
    formData.append('employerAccountType', currentProfile.employerAccountType);

    // Add files from identification dialog if available
    if (identificationFormRef.current && identificationFormRef.current.getFormData) {
      const dialogFormData = identificationFormRef.current.getFormData(formRef.current);
      if (dialogFormData) {
        const identificationFiles = dialogFormData.getAll('identification');

        // Remove existing files with the same name
        formData.delete('identification');

        // Add all files from the dialog
        identificationFiles.forEach(file => {
          formData.append('identification', file);
        });
      }
    }

    // Add files from trade license dialog if available
    if (tradeLicenseFormRef.current && tradeLicenseFormRef.current.getFormData) {
      const dialogFormData = tradeLicenseFormRef.current.getFormData(formRef.current);
      if (dialogFormData) {
        const tradeLicenseFiles = dialogFormData.getAll('trade_license');

        // Remove existing files with the same name
        formData.delete('trade_license');

        // Add all files from the dialog
        tradeLicenseFiles.forEach(file => {
          formData.append('trade_license', file);
        });
      }
    }

    // Add files from board resolution dialog if company account
    if (
      isCompanyAccount &&
      boardResolutionFormRef.current &&
      boardResolutionFormRef.current.getFormData
    ) {
      const dialogFormData = boardResolutionFormRef.current.getFormData(formRef.current);
      if (dialogFormData) {
        const boardResolutionFiles = dialogFormData.getAll('board_resolution');

        // Remove existing files with the same name
        formData.delete('board_resolution');

        // Add all files from the dialog
        boardResolutionFiles.forEach(file => {
          formData.append('board_resolution', file);
        });
      }
    }

    submit(formData, { method: 'post', encType: 'multipart/form-data' });
  };

  // Function to check if a file input has files
  const checkFileInput = (inputName: string): boolean => {
    if (!formRef.current) return false;
    const fileInput = formRef.current.querySelector(
      `input[name="${inputName}"]`
    ) as HTMLInputElement;
    return fileInput && fileInput.files && fileInput.files.length > 0;
  };

  // Update document states when form changes
  const handleFormChange = () => {
    setHasIdentification(checkFileInput('identification'));
    setHasTradeLicense(checkFileInput('trade_license'));
    if (isCompanyAccount) {
      setHasBoardResolution(checkFileInput('board_resolution'));
    }

    // Also check if there are files in the dialogs
    if (identificationFormRef.current && identificationFormRef.current.filesSelected) {
      const dialogFiles = identificationFormRef.current.filesSelected;
      if (dialogFiles && dialogFiles.length > 0) {
        setHasIdentification(true);
      }
    }

    if (tradeLicenseFormRef.current && tradeLicenseFormRef.current.filesSelected) {
      const dialogFiles = tradeLicenseFormRef.current.filesSelected;
      if (dialogFiles && dialogFiles.length > 0) {
        setHasTradeLicense(true);
      }
    }

    if (
      isCompanyAccount &&
      boardResolutionFormRef.current &&
      boardResolutionFormRef.current.filesSelected
    ) {
      const dialogFiles = boardResolutionFormRef.current.filesSelected;
      if (dialogFiles && dialogFiles.length > 0) {
        setHasBoardResolution(true);
      }
    }
  };

  // Check file inputs when component mounts and after any dialog closes
  useEffect(() => {
    const checkFiles = () => {
      setHasIdentification(checkFileInput('identification'));
      setHasTradeLicense(checkFileInput('trade_license'));
      if (isCompanyAccount) {
        setHasBoardResolution(checkFileInput('board_resolution'));
      }

      // Also check if there are files in the dialogs
      if (identificationFormRef.current && identificationFormRef.current.filesSelected) {
        const dialogFiles = identificationFormRef.current.filesSelected;
        if (dialogFiles && dialogFiles.length > 0) {
          setHasIdentification(true);
        }
      }

      if (tradeLicenseFormRef.current && tradeLicenseFormRef.current.filesSelected) {
        const dialogFiles = tradeLicenseFormRef.current.filesSelected;
        if (dialogFiles && dialogFiles.length > 0) {
          setHasTradeLicense(true);
        }
      }

      if (
        isCompanyAccount &&
        boardResolutionFormRef.current &&
        boardResolutionFormRef.current.filesSelected
      ) {
        const dialogFiles = boardResolutionFormRef.current.filesSelected;
        if (dialogFiles && dialogFiles.length > 0) {
          setHasBoardResolution(true);
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
  }, [isCompanyAccount]);

  // Define the form card props for identification upload
  const identificationFormProps: GeneralizableFormCardProps = {
    formType: 'file',
    cardTitle: 'Identification Documents',
    cardSubtitle: 'Upload your identification documents (ID card, passport, etc.)',
    popupTitle: 'Upload Identification',
    triggerLabel: 'Upload Documents',
    formName: 'employer-identification',
    fieldName: 'identification',
    acceptedFileTypes: '.pdf,.jpg,.jpeg,.png',
    editable: true,
    showLoadingOnSubmit: true,
    multiple: true,
    formRef: identificationFormRef,
  };

  // Define the form card props for trade license upload
  const tradeLicenseFormProps: GeneralizableFormCardProps = {
    formType: 'file',
    cardTitle: 'Trade License',
    cardSubtitle: 'Upload your business trade license document',
    popupTitle: 'Upload Trade License',
    triggerLabel: 'Upload Documents',
    formName: 'employer-identification',
    fieldName: 'trade_license',
    acceptedFileTypes: '.pdf,.jpg,.jpeg,.png',
    editable: true,
    showLoadingOnSubmit: true,
    multiple: true,
    formRef: tradeLicenseFormRef,
  };

  // Define the form card props for board resolution upload (only for companies)
  const boardResolutionFormProps: GeneralizableFormCardProps = {
    formType: 'file',
    cardTitle: 'Board Resolution',
    cardSubtitle: "Upload your company's board resolution document",
    popupTitle: 'Upload Board Resolution',
    triggerLabel: 'Upload Documents',
    formName: 'employer-identification',
    fieldName: 'board_resolution',
    acceptedFileTypes: '.pdf,.jpg,.jpeg,.png',
    editable: true,
    showLoadingOnSubmit: true,
    multiple: true,
    formRef: boardResolutionFormRef,
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Business Verification</h1>
        <p className="text-gray-600">
          Please upload your business verification documents. This is a required step before you can
          access the platform.
        </p>
      </div>

      <Form
        ref={formRef}
        method="post"
        encType="multipart/form-data"
        onSubmit={handleSubmit}
        onChange={handleFormChange}
        className="space-y-6"
      >
        {actionData?.success && (
          <div className="mt-4 p-3 bg-green-100 text-green-800 rounded-md">
            Your documents have been submitted successfully.
          </div>
        )}

        {/* Display existing identification files if any */}
        {identificationData &&
          identificationData.attachments &&
          identificationData.attachments.identification &&
          identificationData.attachments.identification.length > 0 && (
            <div className="mb-4 p-4 bg-gray-50 rounded-md">
              <h3 className="text-md font-medium mb-2">Uploaded Identification Documents:</h3>
              <ul className="list-disc pl-5">
                {identificationData.attachments.identification.map((file: any, index: number) => (
                  <li key={index} className="text-sm text-gray-600">
                    {file.name}
                    <span className="text-xs text-gray-500 ml-2">
                      ({Math.round((file.size || 143 * 1024) / 1024)} KB)
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

        {/* Display existing trade license files if any */}
        {identificationData &&
          identificationData.attachments &&
          identificationData.attachments.trade_license &&
          identificationData.attachments.trade_license.length > 0 && (
            <div className="mb-4 p-4 bg-gray-50 rounded-md">
              <h3 className="text-md font-medium mb-2">Uploaded Trade License Documents:</h3>
              <ul className="list-disc pl-5">
                {identificationData.attachments.trade_license.map((file: any, index: number) => (
                  <li key={index} className="text-sm text-gray-600">
                    {file.name}
                    <span className="text-xs text-gray-500 ml-2">
                      ({Math.round((file.size || 143 * 1024) / 1024)} KB)
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

        {/* Display existing board resolution files if company account */}
        {isCompanyAccount &&
          identificationData &&
          identificationData.attachments &&
          identificationData.attachments.board_resolution &&
          identificationData.attachments.board_resolution.length > 0 && (
            <div className="mb-4 p-4 bg-gray-50 rounded-md">
              <h3 className="text-md font-medium mb-2">Uploaded Board Resolution Documents:</h3>
              <ul className="list-disc pl-5">
                {identificationData.attachments.board_resolution.map((file: any, index: number) => (
                  <li key={index} className="text-sm text-gray-600">
                    {file.name}
                    <span className="text-xs text-gray-500 ml-2">
                      ({Math.round((file.size || 143 * 1024) / 1024)} KB)
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

        {/* GeneralizableFormCard for identification */}
        <GeneralizableFormCard
          {...identificationFormProps}
          value={identificationData?.attachments ? (identificationData as any) : null}
        />

        {/* GeneralizableFormCard for trade license */}
        <GeneralizableFormCard
          {...tradeLicenseFormProps}
          value={identificationData?.attachments ? (identificationData as any) : null}
        />

        {/* GeneralizableFormCard for board resolution (only for companies) */}
        {isCompanyAccount && (
          <GeneralizableFormCard
            {...boardResolutionFormProps}
            value={identificationData?.attachments ? (identificationData as any) : null}
          />
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Documents'}
          </button>
        </div>
      </Form>
    </div>
  );
}
