import { useState, useEffect } from "react";
import { useLoaderData } from "@remix-run/react";
import { DEFAULT_FORM_FIELDS } from "../formFields/constants";
import type { FormStateType, RepeatableInputType } from "../types";

export const useFormState = (
  formType: string,
  fieldName: string,
  initialValue?: FormStateType
) => {
  const initialData = useLoaderData();

  // State for normal input fields
  const [inputValue, setInputValue] = useState<FormStateType | null>(
    initialValue ?? null
  );

  // State for repeatable fields
  const [repeatableInputValues, setRepeatableInputValues] = useState<
    RepeatableInputType[]
  >([]);
  const [repeatableInputFiles, setRepeatableInputFiles] = useState<File[]>([]);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  // Helper function to initialize repeatable fields
  const initializeRepeatableFields = (data: any, field: string) => {
    if (data?.[field]) {
      // If data[field] is a string, try parsing it
      const parsedData =
        typeof data[field] === "string" ? JSON.parse(data[field]) : data[field];
      setRepeatableInputValues(parsedData);
      setRepeatableInputFiles(new Array(parsedData.length).fill(null));
    }
  };

  // ✅ Fix: Set inputValue correctly on mount and when data changes
  useEffect(() => {
    if (formType !== "repeatable") {
      setInputValue(initialValue ?? initialData?.[fieldName] ?? null);
    }
  }, [initialData, fieldName, formType, initialValue]);

  // ✅ Fix: Ensure `props.value` is always prioritized over incorrect values
  useEffect(() => {
    if (formType !== "repeatable" && initialValue) {
      setInputValue(initialValue);
    }
  }, [initialValue]);

  // ✅ Fix: Initialize repeatable fields properly
  useEffect(() => {
    if (formType === "repeatable") {
      initializeRepeatableFields(initialData, fieldName);
    }
  }, [initialData, fieldName, formType]);

  // Handlers for repeatable fields
  const handleAddRepeatableField = () => {
    setRepeatableInputValues((prev) => [
      ...prev,
      DEFAULT_FORM_FIELDS[fieldName],
    ]);
    setRepeatableInputFiles((prev) => [...prev, null]);
    setExpandedIndex(repeatableInputValues.length);
  };

  const handleRemoveRepeatableField = (index: number) => {
    setRepeatableInputValues((prev) => prev.filter((_, i) => i !== index));
    setRepeatableInputFiles((prev) => prev.filter((_, i) => i !== index));
    setExpandedIndex(null);
  };

  const handleDataChange = (
    index: number,
    updatedData: RepeatableInputType
  ) => {
    setRepeatableInputValues((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], ...updatedData };
      return updated;
    });
  };

  // console.log(
  //   "📌 [useFormState] Initial Data from useLoaderData:",
  //   initialData
  // );
  // console.log("🔍 [useFormState] Field Name:", fieldName);
  // console.log("🛠 [useFormState] Final Computed inputValue:", inputValue);
  // console.log(
  //   "🌀 [useFormState] Repeatable Input Values:",
  //   repeatableInputValues
  // );

  return {
    inputValue,
    setInputValue,
    repeatableInputValues,
    setRepeatableInputValues,
    repeatableInputFiles,
    setRepeatableInputFiles,
    expandedIndex,
    setExpandedIndex,
    handleAddRepeatableField,
    handleRemoveRepeatableField,
    handleDataChange,
  };
};
