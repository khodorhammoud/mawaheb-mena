import { useState, useEffect } from "react";
import { useLoaderData } from "@remix-run/react";
import { DEFAULT_FORM_FIELDS } from "../formFields/constants";
import type { FormStateType, RepeatableInputType } from "../types";

export const useFormState = (formType: string, fieldName: string) => {
  const initialData = useLoaderData();
  const [inputValue, setInputValue] = useState<FormStateType>(
    formType !== "repeatable"
      ? (initialData?.[fieldName] ?? (formType === "increment" ? 0 : ""))
      : null
  );

  const [repeatableInputValues, setRepeatableInputValues] = useState<
    RepeatableInputType[]
  >([]);
  const [repeatableInputFiles, setRepeatableInputFiles] = useState<File[]>([]);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const initializeRepeatableFields = (data: any, field: string) => {
    if (data?.[field]) {
      // if data[field] is a string, JSON Parse it
      const parsedData =
        typeof data[field] === "string" ? JSON.parse(data[field]) : data[field];
      setRepeatableInputValues(parsedData);
      setRepeatableInputFiles(new Array(parsedData.length).fill(null));
    }
  };

  useEffect(() => {
    // check if current field is a repeatable one
    if (formType === "repeatable") {
      initializeRepeatableFields(initialData, fieldName);
    }
  }, []);

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
