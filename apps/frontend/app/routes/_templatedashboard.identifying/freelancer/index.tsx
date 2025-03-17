import { useState, useRef, useEffect } from "react";
import {
  Form,
  useActionData,
  useLoaderData,
  useSubmit,
} from "@remix-run/react";
import { Freelancer } from "~/types/User";
import { GeneralizableFormCardProps } from "~/common/profileView/onboarding-form-component/types";
import GeneralizableFormCard from "~/common/profileView/onboarding-form-component";

export default function FreelancerIdentifyingScreen() {
  const { currentProfile, identificationData } = useLoaderData<{
    currentProfile: Freelancer;
    identificationData: any;
  }>();
  const actionData = useActionData<{ success: boolean }>();
  const submit = useSubmit();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasIdentification, setHasIdentification] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  // Reference to access the GeneralizableFormCard methods
  const identificationFormRef = useRef<any>({
    filesSelected: [],
    forceUpdate: () => {
      // Force a re-render by updating the state
      setHasIdentification(
        identificationFormRef.current?.filesSelected?.length > 0
      );
    },
  });

  // Add a state to track if documents have been submitted successfully
  const [documentsSubmitted, setDocumentsSubmitted] = useState(false);

  // Check if we already have identification data
  useEffect(() => {
    if (
      identificationData &&
      identificationData.attachments &&
      identificationData.attachments.identification &&
      identificationData.attachments.identification.length > 0
    ) {
      setHasIdentification(true);
    }
  }, [identificationData]);

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
    // Directly check the filesSelected property in the ref
    const hasIdentificationFiles =
      identificationFormRef.current?.filesSelected?.length > 0;

    console.log(
      "DEBUG: Form changed - identification files:",
      hasIdentificationFiles
    );
    setHasIdentification(hasIdentificationFiles);
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

  // Handle form submission
  const handleSubmitDocuments = () => {
    // Set loading state
    setIsSubmitting(true);
    console.log("DEBUG: Starting freelancer document submission process");

    // Get all files from the dialog component - directly access the filesSelected property
    let hasFiles = false;

    if (
      identificationFormRef.current &&
      identificationFormRef.current.filesSelected
    ) {
      hasFiles = identificationFormRef.current.filesSelected.length > 0;
      console.log(
        "DEBUG: Freelancer identification files count:",
        identificationFormRef.current.filesSelected.length
      );
      console.log(
        "DEBUG: Freelancer identification files:",
        identificationFormRef.current.filesSelected.map((f) => f.name)
      );
    }

    // Check for existing files in the database
    let hasExistingFiles = false;
    if (
      identificationData &&
      identificationData.attachments &&
      identificationData.attachments.identification &&
      identificationData.attachments.identification.length > 0
    ) {
      hasExistingFiles = true;
      console.log("DEBUG: Has existing identification files in database");
    }

    // Update state variable based on file presence (either new or existing)
    setHasIdentification(hasFiles || hasExistingFiles);

    // Validate that at least one document is uploaded (either new or existing)
    if (!hasFiles && !hasExistingFiles) {
      alert(
        "Please upload at least one identification document before submitting."
      );
      setIsSubmitting(false);
      console.log(
        "DEBUG: No files selected or in database, submission aborted"
      );
      return;
    }

    console.log(
      "DEBUG: Has identification files (new or existing):",
      hasFiles || hasExistingFiles
    );

    // If no new files and we're just submitting existing files, we can skip the form submission
    if (!hasFiles && hasExistingFiles) {
      console.log("DEBUG: No new files to submit, showing success message");
      setDocumentsSubmitted(true);
      setIsSubmitting(false);
      return;
    }

    const formData = new FormData();
    formData.append("target-updated", "freelancer-identification");
    console.log("DEBUG: Form data initialized with target-updated");

    // Access the files directly from the formContentRef inside the GeneralizableFormCard
    // Add files from the dialog if available
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
        console.log(
          "DEBUG: Added freelancer identification file to formData:",
          file.name
        );
      });
    }

    console.log("DEBUG: Final form data before submission:");
    logFormData(formData);

    console.log(
      "DEBUG: Submitting freelancer form data with method post and encType multipart/form-data"
    );
    submit(formData, { method: "post", encType: "multipart/form-data" });

    // Show success message
    setDocumentsSubmitted(true);

    // Clear files from the dialog component after successful submission
    if (
      identificationFormRef.current &&
      identificationFormRef.current.clearFiles
    ) {
      identificationFormRef.current.clearFiles();
    }

    // Reset loading state
    setIsSubmitting(false);
    console.log("DEBUG: Freelancer document submission process completed");
  };

  // Check file inputs when component mounts and after any dialog closes
  useEffect(() => {
    const checkFiles = () => {
      setHasIdentification(checkFileInput("identification"));

      // Also check if there are files in the dialog
      if (
        identificationFormRef.current &&
        identificationFormRef.current.filesSelected
      ) {
        const dialogFiles = identificationFormRef.current.filesSelected;
        if (dialogFiles && dialogFiles.length > 0) {
          setHasIdentification(true);
        }
      }
    };

    // Check initially
    checkFiles();

    // Set up a mutation observer to detect when the dialog closes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "childList" || mutation.type === "attributes") {
          checkFiles();
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["aria-hidden", "class"],
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  // Define the form card props for identification upload
  const identificationFormProps: GeneralizableFormCardProps = {
    formType: "file",
    cardTitle: "Identification Documents",
    cardSubtitle:
      "Upload your identification documents (ID card, passport, etc.)",
    popupTitle: "Upload Identification",
    triggerLabel: "Upload Documents",
    formName: "freelancer-identification",
    fieldName: "identification",
    acceptedFileTypes: ".pdf,.jpg,.jpeg,.png",
    editable: true,
    showLoadingOnSubmit: true,
    multiple: true,
    formRef: identificationFormRef,
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
              <h3 className="text-md font-medium mb-2">
                Uploaded Identification Documents:
              </h3>
              <ul className="list-disc pl-5">
                {identificationData.attachments.identification.map(
                  (file: any, index: number) => (
                    <li key={index} className="text-sm text-gray-600">
                      {file.name}
                      <span className="text-xs text-gray-500 ml-2">
                        ({Math.round((file.size || 143 * 1024) / 1024)} KB)
                      </span>
                    </li>
                  )
                )}
              </ul>
            </div>
          )}

        {/* GeneralizableFormCard for identification */}
        <GeneralizableFormCard
          {...identificationFormProps}
          value={
            identificationData?.attachments ? (identificationData as any) : null
          }
        />

        {/* Back to account info button */}
        <div className="mt-6 flex justify-start">
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
        </div>
      </Form>
    </div>
  );
}
