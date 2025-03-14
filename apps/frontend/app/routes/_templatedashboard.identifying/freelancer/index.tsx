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
  const { currentProfile } = useLoaderData<{ currentProfile: Freelancer }>();
  const actionData = useActionData<{ success: boolean }>();
  const submit = useSubmit();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasIdentification, setHasIdentification] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate that identification document is uploaded
    if (!hasIdentification) {
      alert("Please upload identification documents before submitting.");
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    formData.append("target-updated", "freelancer-identification");

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
  };

  // Check file inputs when component mounts and after any dialog closes
  useEffect(() => {
    const checkFiles = () => {
      setHasIdentification(checkFileInput("identification"));
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
    formName: "identification-form", // used in your action/loader logic
    fieldName: "identification", // must match the `name` for the file input
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
        {actionData?.success && (
          <div className="mt-4 p-3 bg-green-100 text-green-800 rounded-md">
            Your documents have been submitted successfully.
          </div>
        )}

        {/* GeneralizableFormCard for identification */}
        <GeneralizableFormCard {...identificationFormProps} />

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || !hasIdentification}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 
                       focus:outline-none focus:ring-2 focus:ring-blue-500 
                       focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Submitting..." : "Submit Documents"}
          </button>
        </div>
      </Form>
    </div>
  );
}
