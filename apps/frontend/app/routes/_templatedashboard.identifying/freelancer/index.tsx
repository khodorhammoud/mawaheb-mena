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
  const identificationFormRef = useRef<any>(null);

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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Get files from the dialog component
    let hasFiles = false;

    if (identificationFormRef.current) {
      const formCardRef = identificationFormRef.current;

      // Check if there are files in the dialog
      if (formCardRef.getFormData && formRef.current) {
        const dialogFormData = formCardRef.getFormData(formRef.current);
        if (dialogFormData) {
          const identificationFiles = dialogFormData.getAll("identification");
          hasFiles = identificationFiles.length > 0;
        }
      }
    }

    // Validate that identification document is uploaded
    if (!hasIdentification && !hasFiles) {
      alert("Please upload identification documents before submitting.");
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    formData.append("target-updated", "freelancer-identification");

    // Add files from the dialog if available
    if (
      identificationFormRef.current &&
      identificationFormRef.current.getFormData
    ) {
      const dialogFormData = identificationFormRef.current.getFormData(
        formRef.current
      );
      if (dialogFormData) {
        const identificationFiles = dialogFormData.getAll("identification");

        // Remove existing files with the same name
        formData.delete("identification");

        // Add all files from the dialog
        identificationFiles.forEach((file) => {
          formData.append("identification", file);
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
              <h3 className="text-md font-medium mb-2">
                Uploaded Identification Documents:
              </h3>
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

        {/* GeneralizableFormCard for identification */}
        <GeneralizableFormCard {...identificationFormProps} />
      </Form>
    </div>
  );
}
