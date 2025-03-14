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
  const { currentProfile } = useLoaderData<{
    currentProfile: Employer;
  }>();
  const actionData = useActionData<{ success: boolean }>();
  const submit = useSubmit();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasIdentification, setHasIdentification] = useState(false);
  const [hasTradeLicense, setHasTradeLicense] = useState(false);
  const [hasBoardResolution, setHasBoardResolution] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const employerAccountType = currentProfile.employerAccountType;
  const isCompany = employerAccountType === EmployerAccountType.Company;

  // Check if all required documents are uploaded
  const hasRequiredDocuments =
    hasIdentification &&
    hasTradeLicense &&
    (isCompany ? hasBoardResolution : true);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate that at least one document is uploaded
    if (!hasRequiredDocuments) {
      alert("Please upload all required documents before submitting.");
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    formData.append("target-updated", "employer-identification");
    formData.append("employerAccountType", employerAccountType);

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
    setHasIdentification(checkFileInput("identification"));
    setHasTradeLicense(checkFileInput("trade_license"));
    if (isCompany) {
      setHasBoardResolution(checkFileInput("board_resolution"));
    }
  };

  // Check file inputs when component mounts and after any dialog closes
  useEffect(() => {
    const checkFiles = () => {
      setHasIdentification(checkFileInput("identification"));
      setHasTradeLicense(checkFileInput("trade_license"));
      if (isCompany) {
        setHasBoardResolution(checkFileInput("board_resolution"));
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
    formName: "identification-form",
    fieldName: "identification",
    acceptedFileTypes: ".pdf,.jpg,.jpeg,.png",
    editable: true,
    showLoadingOnSubmit: true,
  };

  // Define the form card props for trade license upload
  const tradeLicenseFormProps: GeneralizableFormCardProps = {
    formType: "file",
    cardTitle: "Trade License",
    cardSubtitle: "Upload your trade license documents",
    popupTitle: "Upload Trade License",
    triggerLabel: "Upload Documents",
    formName: "trade-license-form",
    fieldName: "trade_license",
    acceptedFileTypes: ".pdf,.jpg,.jpeg,.png",
    editable: true,
    showLoadingOnSubmit: true,
  };

  // Define the form card props for board resolution upload (only for company accounts)
  const boardResolutionFormProps: GeneralizableFormCardProps = {
    formType: "file",
    cardTitle: "Board Resolution",
    cardSubtitle: "Upload your board resolution documents",
    popupTitle: "Upload Board Resolution",
    triggerLabel: "Upload Documents",
    formName: "board-resolution-form",
    fieldName: "board_resolution",
    acceptedFileTypes: ".pdf,.jpg,.jpeg,.png",
    editable: true,
    showLoadingOnSubmit: true,
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
          <GeneralizableFormCard {...identificationFormProps} />

          <GeneralizableFormCard {...tradeLicenseFormProps} />

          {employerAccountType === EmployerAccountType.Company && (
            <GeneralizableFormCard {...boardResolutionFormProps} />
          )}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || !hasRequiredDocuments}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Submitting..." : "Submit Documents"}
          </button>
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
