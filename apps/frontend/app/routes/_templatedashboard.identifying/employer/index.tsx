import { useState, useRef, useEffect } from "react";
import {
  Form,
  useActionData,
  useLoaderData,
  useSubmit,
} from "@remix-run/react";
import { Employer } from "~/types/User";
import { EmployerAccountType } from "~/types/enums";
import { GeneralizableFormCardProps } from "~/common/profileView/onboarding-form-component/types";
import GeneralizableFormCard from "~/common/profileView/onboarding-form-component";

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

  const employerAccountType = currentProfile.employerAccountType;
  const isCompany = employerAccountType === EmployerAccountType.Company;

  // Check if all required documents are uploaded
  const hasRequiredDocuments =
    hasIdentification &&
    hasTradeLicense &&
    (isCompany ? hasBoardResolution : true);

  // Check if we already have identification data
  useEffect(() => {
    if (identificationData && identificationData.attachments) {
      const attachments = identificationData.attachments;

      if (attachments.identification && attachments.identification.length > 0) {
        setHasIdentification(true);
      }

      if (attachments.trade_license && attachments.trade_license.length > 0) {
        setHasTradeLicense(true);
      }

      if (
        isCompany &&
        attachments.board_resolution &&
        attachments.board_resolution.length > 0
      ) {
        setHasBoardResolution(true);
      }
    }
  }, [identificationData, isCompany]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Get files from the dialog components
    let hasIdentificationFiles = false;
    let hasTradeLicenseFiles = false;
    let hasBoardResolutionFiles = false;

    // Check identification files
    if (
      identificationFormRef.current &&
      identificationFormRef.current.getFormData &&
      formRef.current
    ) {
      const dialogFormData = identificationFormRef.current.getFormData(
        formRef.current
      );
      if (dialogFormData) {
        const files = dialogFormData.getAll("identification");
        hasIdentificationFiles = files.length > 0;
      }
    }

    // Check trade license files
    if (
      tradeLicenseFormRef.current &&
      tradeLicenseFormRef.current.getFormData &&
      formRef.current
    ) {
      const dialogFormData = tradeLicenseFormRef.current.getFormData(
        formRef.current
      );
      if (dialogFormData) {
        const files = dialogFormData.getAll("trade_license");
        hasTradeLicenseFiles = files.length > 0;
      }
    }

    // Check board resolution files if company
    if (
      isCompany &&
      boardResolutionFormRef.current &&
      boardResolutionFormRef.current.getFormData &&
      formRef.current
    ) {
      const dialogFormData = boardResolutionFormRef.current.getFormData(
        formRef.current
      );
      if (dialogFormData) {
        const files = dialogFormData.getAll("board_resolution");
        hasBoardResolutionFiles = files.length > 0;
      }
    }

    // Validate that at least one document is uploaded
    const hasAllRequiredFiles =
      (hasIdentification || hasIdentificationFiles) &&
      (hasTradeLicense || hasTradeLicenseFiles) &&
      (isCompany ? hasBoardResolution || hasBoardResolutionFiles : true);

    if (!hasAllRequiredFiles) {
      alert("Please upload all required documents before submitting.");
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    formData.append("target-updated", "employer-identification");
    formData.append("employerAccountType", employerAccountType);

    // Add identification files from the dialog if available
    if (
      identificationFormRef.current &&
      identificationFormRef.current.getFormData
    ) {
      const dialogFormData = identificationFormRef.current.getFormData(
        formRef.current
      );
      if (dialogFormData) {
        const files = dialogFormData.getAll("identification");

        // Remove existing files with the same name
        formData.delete("identification");

        // Add all files from the dialog
        files.forEach((file) => {
          formData.append("identification", file);
        });
      }
    }

    // Add trade license files from the dialog if available
    if (
      tradeLicenseFormRef.current &&
      tradeLicenseFormRef.current.getFormData
    ) {
      const dialogFormData = tradeLicenseFormRef.current.getFormData(
        formRef.current
      );
      if (dialogFormData) {
        const files = dialogFormData.getAll("trade_license");

        // Remove existing files with the same name
        formData.delete("trade_license");

        // Add all files from the dialog
        files.forEach((file) => {
          formData.append("trade_license", file);
        });
      }
    }

    // Add board resolution files from the dialog if available (for company accounts)
    if (
      isCompany &&
      boardResolutionFormRef.current &&
      boardResolutionFormRef.current.getFormData
    ) {
      const dialogFormData = boardResolutionFormRef.current.getFormData(
        formRef.current
      );
      if (dialogFormData) {
        const files = dialogFormData.getAll("board_resolution");

        // Remove existing files with the same name
        formData.delete("board_resolution");

        // Add all files from the dialog
        files.forEach((file) => {
          formData.append("board_resolution", file);
        });
      }
    }

    submit(formData, { method: "post", encType: "multipart/form-data" });
  };

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
    setHasIdentification(
      checkFileInput("identification") ||
        identificationFormRef.current?.filesSelected?.length > 0
    );

    setHasTradeLicense(
      checkFileInput("trade_license") ||
        tradeLicenseFormRef.current?.filesSelected?.length > 0
    );

    if (isCompany) {
      setHasBoardResolution(
        checkFileInput("board_resolution") ||
          boardResolutionFormRef.current?.filesSelected?.length > 0
      );
    }
  };

  // Check file inputs when component mounts and after any dialog closes
  useEffect(() => {
    const checkFiles = () => {
      setHasIdentification(
        checkFileInput("identification") ||
          identificationFormRef.current?.filesSelected?.length > 0
      );

      setHasTradeLicense(
        checkFileInput("trade_license") ||
          tradeLicenseFormRef.current?.filesSelected?.length > 0
      );

      if (isCompany) {
        setHasBoardResolution(
          checkFileInput("board_resolution") ||
            boardResolutionFormRef.current?.filesSelected?.length > 0
        );
      }
    };

    // Check initially
    checkFiles();

    // Set up a mutation observer to detect when the dialog closes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "childList" || mutation.type === "attributes") {
          // Check if any dialog was closed
          checkFiles();
        }
      });
    });

    // Start observing the document body for changes
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["aria-hidden", "class"],
    });

    return () => {
      observer.disconnect();
    };
  }, [isCompany]);

  // Define the form card props for identification upload
  const identificationFormProps: GeneralizableFormCardProps = {
    formType: "file",
    cardTitle: "Identification Documents",
    cardSubtitle:
      "Upload your identification documents (ID card, passport, etc.)",
    popupTitle: "Upload Identification",
    triggerLabel: "Upload Documents",
    formName: "employer-identification",
    fieldName: "identification",
    acceptedFileTypes: ".pdf,.jpg,.jpeg,.png",
    editable: true,
    showLoadingOnSubmit: true,
    multiple: true,
    formRef: identificationFormRef,
  };

  // Define the form card props for trade license upload
  const tradeLicenseFormProps: GeneralizableFormCardProps = {
    formType: "file",
    cardTitle: "Trade License",
    cardSubtitle: "Upload your trade license documents",
    popupTitle: "Upload Trade License",
    triggerLabel: "Upload Documents",
    formName: "employer-identification",
    fieldName: "trade_license",
    acceptedFileTypes: ".pdf,.jpg,.jpeg,.png",
    editable: true,
    showLoadingOnSubmit: true,
    multiple: true,
    formRef: tradeLicenseFormRef,
  };

  // Define the form card props for board resolution upload (only for company accounts)
  const boardResolutionFormProps: GeneralizableFormCardProps = {
    formType: "file",
    cardTitle: "Board Resolution",
    cardSubtitle: "Upload your board resolution documents",
    popupTitle: "Upload Board Resolution",
    triggerLabel: "Upload Documents",
    formName: "employer-identification",
    fieldName: "board_resolution",
    acceptedFileTypes: ".pdf,.jpg,.jpeg,.png",
    editable: true,
    showLoadingOnSubmit: true,
    multiple: true,
    formRef: boardResolutionFormRef,
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Identity Verification</h1>
        <p className="text-gray-600">
          Please upload your identification documents to verify your identity.
          This is a required step before you can access the platform.
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
        <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
          {/* Display existing identification files if any */}
          {identificationData && identificationData.attachments && (
            <div className="mb-4 p-4 bg-gray-50 rounded-md">
              <h3 className="text-md font-medium mb-2">Uploaded Documents:</h3>

              {identificationData.attachments.identification &&
                identificationData.attachments.identification.length > 0 && (
                  <div className="mb-3">
                    <h4 className="text-sm font-medium">Identification:</h4>
                    <ul className="list-disc pl-5">
                      {identificationData.attachments.identification.map(
                        (file: any, index: number) => (
                          <li key={index} className="text-sm text-gray-600">
                            {file.name}
                            {file.size && (
                              <span className="text-xs text-gray-500 ml-2">
                                ({Math.round(file.size / 1024)} KB)
                              </span>
                            )}
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                )}

              {identificationData.attachments.trade_license &&
                identificationData.attachments.trade_license.length > 0 && (
                  <div className="mb-3">
                    <h4 className="text-sm font-medium">Trade License:</h4>
                    <ul className="list-disc pl-5">
                      {identificationData.attachments.trade_license.map(
                        (file: any, index: number) => (
                          <li key={index} className="text-sm text-gray-600">
                            {file.name}
                            {file.size && (
                              <span className="text-xs text-gray-500 ml-2">
                                ({Math.round(file.size / 1024)} KB)
                              </span>
                            )}
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                )}

              {isCompany &&
                identificationData.attachments.board_resolution &&
                identificationData.attachments.board_resolution.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium">Board Resolution:</h4>
                    <ul className="list-disc pl-5">
                      {identificationData.attachments.board_resolution.map(
                        (file: any, index: number) => (
                          <li key={index} className="text-sm text-gray-600">
                            {file.name}
                            {file.size && (
                              <span className="text-xs text-gray-500 ml-2">
                                ({Math.round(file.size / 1024)} KB)
                              </span>
                            )}
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                )}
            </div>
          )}

          <GeneralizableFormCard
            {...identificationFormProps}
            value={
              identificationData?.attachments
                ? (identificationData as any)
                : null
            }
          />

          <GeneralizableFormCard
            {...tradeLicenseFormProps}
            value={
              identificationData?.attachments
                ? (identificationData as any)
                : null
            }
          />

          {employerAccountType === EmployerAccountType.Company && (
            <GeneralizableFormCard
              {...boardResolutionFormProps}
              value={
                identificationData?.attachments
                  ? (identificationData as any)
                  : null
              }
            />
          )}
        </div>

        {actionData?.success && (
          <div className="mt-4 p-3 bg-green-100 text-green-800 rounded-md">
            Your documents have been submitted successfully. We will review them
            shortly.
          </div>
        )}
      </Form>
    </div>
  );
}
