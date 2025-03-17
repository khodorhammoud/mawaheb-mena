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
  const [documentsSubmitted, setDocumentsSubmitted] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  // References to access the GeneralizableFormCard methods
  const identificationFormRef = useRef<any>({
    filesSelected: [],
    forceUpdate: () => {
      // Force a re-render by updating the state
      setHasIdentification(
        identificationFormRef.current?.filesSelected?.length > 0
      );
    },
  });

  const tradeLicenseFormRef = useRef<any>({
    filesSelected: [],
    forceUpdate: () => {
      // Force a re-render by updating the state
      setHasTradeLicense(
        tradeLicenseFormRef.current?.filesSelected?.length > 0
      );
    },
  });

  const boardResolutionFormRef = useRef<any>({
    filesSelected: [],
    forceUpdate: () => {
      // Force a re-render by updating the state
      if (isCompany) {
        setHasBoardResolution(
          boardResolutionFormRef.current?.filesSelected?.length > 0
        );
      }
    },
  });

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

  const handleSubmitDocuments = () => {
    // Set loading state
    setIsSubmitting(true);
    console.log("DEBUG: Starting document submission process");

    // Get all files from the dialog components
    let hasIdentificationFiles = false;
    let hasTradeLicenseFiles = false;
    let hasBoardResolutionFiles = false;

    // Check identification files - directly access the filesSelected property
    if (
      identificationFormRef.current &&
      identificationFormRef.current.filesSelected
    ) {
      hasIdentificationFiles =
        identificationFormRef.current.filesSelected.length > 0;
      console.log(
        "DEBUG: Identification files count:",
        identificationFormRef.current.filesSelected.length
      );
      console.log(
        "DEBUG: Identification files:",
        identificationFormRef.current.filesSelected.map((f) => f.name)
      );
    }

    // Check trade license files - directly access the filesSelected property
    if (
      tradeLicenseFormRef.current &&
      tradeLicenseFormRef.current.filesSelected
    ) {
      hasTradeLicenseFiles =
        tradeLicenseFormRef.current.filesSelected.length > 0;
      console.log(
        "DEBUG: Trade license files count:",
        tradeLicenseFormRef.current.filesSelected.length
      );
      console.log(
        "DEBUG: Trade license files:",
        tradeLicenseFormRef.current.filesSelected.map((f) => f.name)
      );
    }

    // Check board resolution files if company - directly access the filesSelected property
    if (
      isCompany &&
      boardResolutionFormRef.current &&
      boardResolutionFormRef.current.filesSelected
    ) {
      hasBoardResolutionFiles =
        boardResolutionFormRef.current.filesSelected.length > 0;
      console.log(
        "DEBUG: Board resolution files count:",
        boardResolutionFormRef.current.filesSelected.length
      );
      console.log(
        "DEBUG: Board resolution files:",
        boardResolutionFormRef.current.filesSelected.map((f) => f.name)
      );
    }

    // Check for existing files in the database
    let hasExistingIdentificationFiles = false;
    let hasExistingTradeLicenseFiles = false;
    let hasExistingBoardResolutionFiles = false;

    if (identificationData && identificationData.attachments) {
      const attachments = identificationData.attachments;

      // Check for existing identification files
      if (attachments.identification && attachments.identification.length > 0) {
        hasExistingIdentificationFiles = true;
        console.log("DEBUG: Has existing identification files in database");
      }

      // Check for existing trade license files
      if (attachments.trade_license && attachments.trade_license.length > 0) {
        hasExistingTradeLicenseFiles = true;
        console.log("DEBUG: Has existing trade license files in database");
      }

      // Check for existing board resolution files
      if (
        isCompany &&
        attachments.board_resolution &&
        attachments.board_resolution.length > 0
      ) {
        hasExistingBoardResolutionFiles = true;
        console.log("DEBUG: Has existing board resolution files in database");
      }
    }

    // Update state variables based on file presence (either new or existing)
    setHasIdentification(
      hasIdentificationFiles || hasExistingIdentificationFiles
    );
    setHasTradeLicense(hasTradeLicenseFiles || hasExistingTradeLicenseFiles);
    if (isCompany) {
      setHasBoardResolution(
        hasBoardResolutionFiles || hasExistingBoardResolutionFiles
      );
    }

    // Validate that required documents are uploaded (either new or existing)
    const hasAllRequiredFiles =
      (hasIdentificationFiles || hasExistingIdentificationFiles) &&
      (hasTradeLicenseFiles || hasExistingTradeLicenseFiles) &&
      (isCompany
        ? hasBoardResolutionFiles || hasExistingBoardResolutionFiles
        : true);

    console.log("DEBUG: Has all required files:", hasAllRequiredFiles);
    console.log(
      "DEBUG: Has identification files (new or existing):",
      hasIdentificationFiles || hasExistingIdentificationFiles
    );
    console.log(
      "DEBUG: Has trade license files (new or existing):",
      hasTradeLicenseFiles || hasExistingTradeLicenseFiles
    );
    console.log(
      "DEBUG: Has board resolution files (new or existing):",
      hasBoardResolutionFiles || hasExistingBoardResolutionFiles
    );

    // If no files are selected or exist in the database, show an alert and return
    if (!hasAllRequiredFiles) {
      alert("Please upload all required documents before submitting.");
      setIsSubmitting(false);
      return;
    }

    // Check if there are any new files to submit
    const hasAnyNewFiles =
      hasIdentificationFiles ||
      hasTradeLicenseFiles ||
      (isCompany && hasBoardResolutionFiles);

    // If no new files and we're just submitting existing files, we can skip the form submission
    if (!hasAnyNewFiles) {
      console.log("DEBUG: No new files to submit, showing success message");
      setDocumentsSubmitted(true);
      setIsSubmitting(false);
      return;
    }

    const formData = new FormData();
    formData.append("target-updated", "employer-identification");
    formData.append("employerAccountType", employerAccountType);
    console.log(
      "DEBUG: Form data initialized with target-updated and employerAccountType"
    );

    // Access the files directly from the formContentRef inside each GeneralizableFormCard
    // Add identification files from the dialog if available
    if (
      identificationFormRef.current &&
      identificationFormRef.current.filesSelected
    ) {
      const files = identificationFormRef.current.filesSelected;

      // Remove existing files with the same name
      formData.delete("identification");

      // Add all files from the dialog
      files.forEach((file) => {
        formData.append("identification", file);
        console.log("DEBUG: Added identification file to formData:", file.name);
      });
    }

    // Add trade license files from the dialog if available
    if (
      tradeLicenseFormRef.current &&
      tradeLicenseFormRef.current.filesSelected
    ) {
      const files = tradeLicenseFormRef.current.filesSelected;

      // Remove existing files with the same name
      formData.delete("trade_license");

      // Add all files from the dialog
      files.forEach((file) => {
        formData.append("trade_license", file);
        console.log("DEBUG: Added trade_license file to formData:", file.name);
      });
    }

    // Add board resolution files from the dialog if available (for company accounts)
    if (
      isCompany &&
      boardResolutionFormRef.current &&
      boardResolutionFormRef.current.filesSelected
    ) {
      const files = boardResolutionFormRef.current.filesSelected;

      // Remove existing files with the same name
      formData.delete("board_resolution");

      // Add all files from the dialog
      files.forEach((file) => {
        formData.append("board_resolution", file);
        console.log(
          "DEBUG: Added board_resolution file to formData:",
          file.name
        );
      });
    }

    console.log("DEBUG: Final form data before submission:");
    logFormData(formData);

    console.log(
      "DEBUG: Submitting form data with method post and encType multipart/form-data"
    );
    submit(formData, { method: "post", encType: "multipart/form-data" });

    // Show success message
    setDocumentsSubmitted(true);

    // Clear files from the dialog components after successful submission
    if (
      identificationFormRef.current &&
      identificationFormRef.current.clearFiles
    ) {
      identificationFormRef.current.clearFiles();
    }
    if (tradeLicenseFormRef.current && tradeLicenseFormRef.current.clearFiles) {
      tradeLicenseFormRef.current.clearFiles();
    }
    if (
      isCompany &&
      boardResolutionFormRef.current &&
      boardResolutionFormRef.current.clearFiles
    ) {
      boardResolutionFormRef.current.clearFiles();
    }

    // Reset loading state
    setIsSubmitting(false);
    console.log("DEBUG: Document submission process completed");
  };

  // Function to check if a file input has files
  const checkFileInput = (inputName: string): boolean => {
    if (!formRef.current) return false;
    const fileInput = formRef.current.querySelector(
      `input[name="${inputName}"]`
    ) as HTMLInputElement;
    return fileInput && fileInput.files && fileInput.files.length > 0;
  };

  // Add this function to inspect the form data before submission
  const logFormData = (formData: FormData) => {
    console.log("DEBUG: Form data entries:");
    for (const pair of formData.entries()) {
      if (pair[1] instanceof File) {
        console.log(
          `DEBUG: ${pair[0]}: File - ${(pair[1] as File).name} (${(pair[1] as File).size} bytes, type: ${(pair[1] as File).type})`
        );
      } else {
        console.log(`DEBUG: ${pair[0]}: ${pair[1]}`);
      }
    }

    // Check if we have any files in the form data
    const hasFiles = Array.from(formData.entries()).some(
      (pair) => pair[1] instanceof File
    );
    console.log("DEBUG: Form data contains files:", hasFiles);

    // Check if target-updated is set correctly
    const targetUpdated = formData.get("target-updated");
    console.log("DEBUG: target-updated value:", targetUpdated);
  };

  // Update document state when form changes
  const handleFormChange = () => {
    // Directly check the filesSelected property in the refs
    const hasIdentificationFiles =
      identificationFormRef.current?.filesSelected?.length > 0;
    const hasTradeLicenseFiles =
      tradeLicenseFormRef.current?.filesSelected?.length > 0;
    const hasBoardResolutionFiles = isCompany
      ? boardResolutionFormRef.current?.filesSelected?.length > 0
      : true;

    console.log(
      "DEBUG: Form changed - identification files:",
      hasIdentificationFiles
    );
    console.log(
      "DEBUG: Form changed - trade license files:",
      hasTradeLicenseFiles
    );
    console.log(
      "DEBUG: Form changed - board resolution files:",
      hasBoardResolutionFiles
    );

    setHasIdentification(hasIdentificationFiles);
    setHasTradeLicense(hasTradeLicenseFiles);

    if (isCompany) {
      setHasBoardResolution(hasBoardResolutionFiles);
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
        onSubmit={(e) => e.preventDefault()}
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

        {/* Add success message */}
        {documentsSubmitted && (
          <div className="mt-4 p-3 bg-green-100 text-green-800 rounded-md">
            Your documents have been submitted successfully. We will review them
            shortly.
          </div>
        )}

        {/* Back to account info button */}
        <div className="flex justify-start">
          <button
            type="button"
            className="flex items-center text-red-500 hover:text-red-700 text-lg"
            onClick={() => {
              const formData = new FormData();
              formData.append("target-updated", "back-to-account-info");

              submit(formData, { method: "post" });
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
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={handleSubmitDocuments}
            disabled={isSubmitting}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded text-lg shadow-md"
          >
            {isSubmitting ? "Submitting..." : "Submit Documents"}
          </button>
        </div>
      </Form>
    </div>
  );
}
