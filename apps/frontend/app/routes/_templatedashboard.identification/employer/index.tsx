import React, { useRef, useState, useEffect } from "react";
import { useLoaderData, useFetcher, Form, useSubmit } from "@remix-run/react";
import { EmployerAccountType } from "~/types/enums";
import { GeneralizableFormCardProps } from "~/common/profileView/onboarding-form-component/types";
import GeneralizableFormCard from "~/common/profileView/onboarding-form-component";

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

  // Monitor the fetcher state
  useEffect(() => {
    if (fetcher.state === "submitting") {
      setIsSubmitting(true);
      setDocumentsSubmitted(false);
    } else if (fetcher.state === "idle" && fetcher.data) {
      setIsSubmitting(false);

      if (fetcher.data.success) {
        setDocumentsSubmitted(true);
      }
    }
  }, [fetcher.state, fetcher.data]);

  // Determine if we have valid files to submit
  const hasValidFilesToSubmit = () => {
    const isCompany = employerAccountType === EmployerAccountType.Company;

    console.log("DEBUG - checking files:", {
      newIdentificationFiles: identificationFiles.length,
      existingIdentificationFiles:
        identificationData?.attachments?.identification?.length || 0,
      newTradeLicenseFiles: tradeLicenseFiles.length,
      existingTradeLicenseFiles:
        identificationData?.attachments?.trade_license?.length || 0,
      newBoardResolutionFiles: boardResolutionFiles.length,
      existingBoardResolutionFiles:
        identificationData?.attachments?.board_resolution?.length || 0,
    });

    // Check if we have the required identification files (either newly selected or existing)
    const hasIdentificationFiles =
      identificationFiles.length > 0 ||
      (identificationData?.attachments?.identification &&
        identificationData.attachments.identification.length > 0);

    if (!hasIdentificationFiles) {
      console.log("DEBUG - Missing identification files");
      return false;
    }

    // Check if we have trade license files (either newly selected or existing)
    const hasTradeLicenseFiles =
      tradeLicenseFiles.length > 0 ||
      (identificationData?.attachments?.trade_license &&
        identificationData.attachments.trade_license.length > 0);

    if (!hasTradeLicenseFiles) {
      console.log("DEBUG - Missing trade license files");
      return false;
    }

    // For companies, check if we have board resolution files (either newly selected or existing)
    if (isCompany) {
      const hasBoardResolutionFiles =
        boardResolutionFiles.length > 0 ||
        (identificationData?.attachments?.board_resolution &&
          identificationData.attachments.board_resolution.length > 0);

      if (!hasBoardResolutionFiles) {
        console.log("DEBUG - Missing board resolution files (for company)");
        return false;
      }
    }

    return true;
  };

  // Handle form changes
  const handleFormChange = () => {
    setFormChanged(true);
  };

  // Handle submit action
  const handleSubmitDocuments = () => {
    // Create a FormData object from the form
    if (!formRef.current) return;

    // Get identification files directly from the formRef
    const identificationFiles =
      identificationFormRef.current?.filesSelected || [];
    const tradeLicenseFiles = tradeLicenseFormRef.current?.filesSelected || [];
    const isCompany = employerAccountType === EmployerAccountType.Company;
    const boardResolutionFiles = isCompany
      ? boardResolutionFormRef.current?.filesSelected || []
      : [];

    // Check if we have all required files
    const hasIdentificationFiles =
      identificationFiles.length > 0 ||
      (identificationData?.attachments?.identification &&
        identificationData.attachments.identification.length > 0);

    const hasTradeLicenseFiles =
      tradeLicenseFiles.length > 0 ||
      (identificationData?.attachments?.trade_license &&
        identificationData.attachments.trade_license.length > 0);

    const hasBoardResolutionFiles =
      !isCompany ||
      boardResolutionFiles.length > 0 ||
      (identificationData?.attachments?.board_resolution &&
        identificationData.attachments.board_resolution.length > 0);

    // Log what we're checking
    console.log("File check:", {
      identificationFiles: identificationFiles.length,
      tradeLicenseFiles: tradeLicenseFiles.length,
      boardResolutionFiles: boardResolutionFiles.length,
      existingIdentification:
        identificationData?.attachments?.identification?.length || 0,
      existingTradeLicense:
        identificationData?.attachments?.trade_license?.length || 0,
      existingBoardResolution:
        identificationData?.attachments?.board_resolution?.length || 0,
      hasIdentificationFiles,
      hasTradeLicenseFiles,
      hasBoardResolutionFiles,
    });

    if (
      !hasIdentificationFiles ||
      !hasTradeLicenseFiles ||
      !hasBoardResolutionFiles
    ) {
      alert("Please upload all required documents.");
      return;
    }

    // Create FormData and append files
    const formData = new FormData();
    formData.append("target-updated", "employer-identification");

    // Append identification files
    identificationFiles.forEach((file) => {
      if (file instanceof File && file.size > 0) {
        formData.append("identification", file);
      }
    });

    // Append trade license files
    tradeLicenseFiles.forEach((file) => {
      if (file instanceof File && file.size > 0) {
        formData.append("trade_license", file);
      }
    });

    // Append board resolution files for company
    if (employerAccountType === EmployerAccountType.Company) {
      boardResolutionFiles.forEach((file) => {
        if (file instanceof File && file.size > 0) {
          formData.append("board_resolution", file);
        }
      });
    }

    // Submit the form
    fetcher.submit(formData, {
      method: "post",
      encType: "multipart/form-data",
    });
  };

  // Form props for identification documents
  const identificationFormProps: GeneralizableFormCardProps = {
    formType: "file",
    cardTitle: "Identification Documents",
    cardSubtitle: "Please upload your ID or passport",
    popupTitle: "Upload Identification Documents",
    triggerLabel: "Upload Documents",
    formName: "employer-identification",
    fieldName: "identification",
    acceptedFileTypes: ".pdf,.jpg,.jpeg,.png",
    multiple: true,
    editable: true,
    showLoadingOnSubmit: true,
    formRef: identificationFormRef,
  };

  // Form props for trade license
  const tradeLicenseFormProps: GeneralizableFormCardProps = {
    formType: "file",
    cardTitle: "Trade License",
    cardSubtitle: "Please upload your trade license",
    popupTitle: "Upload Trade License",
    triggerLabel: "Upload Documents",
    formName: "employer-identification",
    fieldName: "trade_license",
    acceptedFileTypes: ".pdf,.jpg,.jpeg,.png",
    multiple: true,
    editable: true,
    showLoadingOnSubmit: true,
    formRef: tradeLicenseFormRef,
  };

  // Form props for board resolution (only for companies)
  const boardResolutionFormProps: GeneralizableFormCardProps = {
    formType: "file",
    cardTitle: "Board Resolution",
    cardSubtitle:
      "Please upload the board resolution authorizing you to act on behalf of the company",
    popupTitle: "Upload Board Resolution",
    triggerLabel: "Upload Documents",
    formName: "employer-identification",
    fieldName: "board_resolution",
    acceptedFileTypes: ".pdf,.jpg,.jpeg,.png",
    multiple: true,
    editable: true,
    showLoadingOnSubmit: true,
    formRef: boardResolutionFormRef,
  };

  const isCompany = employerAccountType === EmployerAccountType.Company;

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
        {/* File upload sections */}
        <div className="space-y-6">
          {/* GeneralizableFormCard for identification */}
          <GeneralizableFormCard
            {...identificationFormProps}
            value={identificationData?.attachments ? identificationData : null}
          />

          {/* Display existing identification files directly */}
          {/* {identificationData?.attachments?.identification &&
            identificationData.attachments.identification.length > 0 && (
              <div className="border rounded-lg p-4 bg-gray-50 -mt-3">
                <p className="font-medium text-gray-700">Files in database:</p>
                <FileList
                  files={identificationData.attachments.identification}
                  title="Identification Documents"
                />
              </div>
            )} */}

          {/* GeneralizableFormCard for trade license */}
          <GeneralizableFormCard
            {...tradeLicenseFormProps}
            value={identificationData?.attachments ? identificationData : null}
          />

          {/* Display existing trade license files directly */}
          {/* {identificationData?.attachments?.trade_license &&
            identificationData.attachments.trade_license.length > 0 && (
              <div className="border rounded-lg p-4 bg-gray-50 -mt-3">
                <p className="font-medium text-gray-700">Files in database:</p>
                <FileList
                  files={identificationData.attachments.trade_license}
                  title="Trade License"
                />
              </div>
            )} */}

          {/* Show board resolution upload only for companies */}
          {isCompany && (
            <>
              <GeneralizableFormCard
                {...boardResolutionFormProps}
                value={
                  identificationData?.attachments ? identificationData : null
                }
              />

              {/* Display existing board resolution files directly */}
              {/* {identificationData?.attachments?.board_resolution &&
                identificationData.attachments.board_resolution.length > 0 && (
                  <div className="border rounded-lg p-4 bg-gray-50 -mt-3">
                    <p className="font-medium text-gray-700">
                      Files in database:
                    </p>
                    <FileList
                      files={identificationData.attachments.board_resolution}
                      title="Board Resolution"
                    />
                  </div>
                )} */}
            </>
          )}
        </div>

        {/* Back to account info button */}
        <div className="mt-6 flex justify-between">
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

          <button
            type="button"
            onClick={handleSubmitDocuments}
            disabled={isSubmitting || documentsSubmitted}
            className={`py-2 px-6 rounded-lg text-base shadow-xl bg-primaryColor not-active-gradient text-white ${
              isSubmitting || documentsSubmitted
                ? "bg-gray-400 cursor-not-allowed"
                : ""
            }`}
          >
            {isSubmitting
              ? "Submitting..."
              : documentsSubmitted
                ? "Documents Submitted"
                : "Submit Documents"}
          </button>
        </div>
      </Form>

      {/* Display debug info in development environment */}
      {/* {process.env.NODE_ENV === "development" && (
        <div className="mt-8 p-4 border border-gray-300 rounded bg-gray-50">
          <h3 className="text-sm font-bold mb-2">Debug Information:</h3>
          <pre className="text-xs overflow-auto max-h-64">
            {JSON.stringify(
              { identificationData, employerAccountType },
              null,
              2
            )}
          </pre>
        </div>
      )} */}
    </div>
  );
}
