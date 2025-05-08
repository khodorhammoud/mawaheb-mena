import { useState, useEffect, useRef } from "react";
import { useFetcher } from "@remix-run/react";

interface FetcherResponse {
  success?: boolean;
  error?: { message: string };
}

export const useFormSubmission = () => {
  const fetcher = useFetcher<FetcherResponse>();
  const [showStatusMessage, setShowStatusMessage] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (fetcher.data?.success || fetcher.data?.error) {
      setShowStatusMessage(true);
    }
  }, [fetcher.data]);

  const handleSubmit = (e: React.FormEvent, formData: FormData) => {
    e.preventDefault();

    // Ensure the form doesn't submit automatically
    e.stopPropagation();

    fetcher.submit(formData, {
      method: "post",
      encType: "multipart/form-data",
    });
  };

  return {
    fetcher,
    formRef,
    showStatusMessage,
    handleSubmit,
  };
};
