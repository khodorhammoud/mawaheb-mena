import { useState, useEffect, useRef } from "react";
import { useFetcher } from "@remix-run/react";

export const useFormSubmission = () => {
    const fetcher = useFetcher<{
        success?: boolean;
        error?: { message: string };
    }>();
    const [showStatusMessage, setShowStatusMessage] = useState(false);
    const formRef = useRef<HTMLFormElement>(null);

    useEffect(() => {
        if (fetcher.data?.success || fetcher.data?.error) {
            setShowStatusMessage(true);
        }
    }, [fetcher.data]);

    const handleSubmit = (e: React.FormEvent, formData: FormData) => {
        e.preventDefault();
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