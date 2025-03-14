import { Button } from "~/components/ui/button";
import { DialogFooter, DialogClose } from "~/components/ui/dialog";
import { FormFields } from "./FormFields";
import RepeatableFields from "./RepeatableFields";
import type { FormContentProps } from "../types";
import { useState } from "react";

const FormContent = ({
  formType,
  formState,
  onSubmit,
  fetcher,
  showStatusMessage,
  formName,
  fieldName,
  repeatableFieldName,
  showLoadingOnSubmit,
  ...props
}: FormContentProps) => {
  const {
    inputValue,
    setInputValue,
    repeatableInputValues,
    repeatableInputFiles,
    handleAddRepeatableField,
    handleRemoveRepeatableField,
    handleDataChange,
    expandedIndex,
    setExpandedIndex,
  } = formState;

  // Track if a file has been selected
  const [fileSelected, setFileSelected] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Render status messages (error/success)
  const renderStatusMessages = () => {
    if (!showStatusMessage) return null;

    if (fetcher.data?.error) {
      return (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 mt-2">
          <span className="block sm:inline">{fetcher.data.error.message}</span>
        </div>
      );
    }

    if (fetcher.data?.success) {
      return (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4 mt-2">
          <span className="block sm:inline">Successfully saved!</span>
        </div>
      );
    }
  };

  // Handle form submission
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // For file uploads, validate that a file is selected
    if (formType === "file" && !fileSelected && !inputValue) {
      alert("Please select a file before saving.");
      return;
    }

    const formData = new FormData(e.target as HTMLFormElement);

    // Add target-updated field
    formData.append("target-updated", formName);

    // Handle repeatable fields
    if (formType === "repeatable") {
      formData.append(
        repeatableFieldName,
        JSON.stringify(repeatableInputValues)
      );

      // Append files
      repeatableInputFiles.forEach((file, index) => {
        if (file) {
          formData.append(`${repeatableFieldName}-attachment[${index}]`, file);
        } else {
          console.warn(`No file found at index ${index}`);
        }
      });
    }

    // For file type, append the file to formData
    if (formType === "file" && inputValue instanceof File) {
      formData.append(fieldName, inputValue);
    }

    // Mark form as submitted
    setFormSubmitted(true);

    // Pass the formData to the onSubmit callback
    onSubmit(e, formData);
  };

  const handleIncrement = (step: number) => {
    const currentValue = inputValue;

    if (typeof currentValue === "number") {
      // ✅ Increment the number
      const newValue = currentValue + step;
      // Only submit for increment type, not for file uploads
      if (formType === "increment") {
        fetcher.submit(
          {
            "target-updated": formName,
            [fieldName]: newValue.toString(),
          },
          { method: "post" }
        );
      }
      setInputValue(newValue);
    } else if (currentValue === null) {
      // ✅ If the current value is null, start from the step value
      setInputValue(step);
    } else if (currentValue instanceof File) {
      // ✅ If it's a File, log a warning and return it unchanged
      console.warn("Cannot increment a File type");
      setInputValue(currentValue);
    } else {
      // ✅ Handle unexpected types (like strings)
      console.warn("Expected a number or null, but got:", typeof currentValue);
      setInputValue(currentValue);
    }
  };

  // Numeric validation handler
  const handleNumberInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numericValue = value.replace(/[^0-9.]/g, ""); // Remove non-numeric characters
    setInputValue(numericValue);
  };

  // Handle file input change without auto-submission
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setInputValue(file);
      setFileSelected(true);

      // Prevent form submission
      e.stopPropagation();
    } else {
      setFileSelected(false);
    }
  };

  // Determine if the Save button should be disabled
  const isSaveButtonDisabled = () => {
    if (showLoadingOnSubmit && fetcher.state === "submitting") {
      return true;
    }

    // For file inputs, disable the Save button if no file is selected
    if (formType === "file" && !fileSelected && !inputValue) {
      return true;
    }

    return false;
  };

  // Safely render form field based on type
  const renderFormField = () => {
    if (formType === "repeatable") {
      return (
        <RepeatableFields
          fieldName={repeatableFieldName}
          values={repeatableInputValues}
          files={repeatableInputFiles}
          expandedIndex={expandedIndex}
          onAdd={handleAddRepeatableField}
          onRemove={handleRemoveRepeatableField}
          onDataChange={handleDataChange}
          onToggleExpand={setExpandedIndex}
          {...props}
        />
      );
    }

    const FormField = FormFields[formType];
    if (!FormField) return null;

    return FormField({
      value: inputValue,
      onChange:
        formType === "file"
          ? handleFileChange
          : (e) =>
              setInputValue(
                formType === "number" ? Number(e.target.value) : e.target.value
              ),
      handleIncrement: handleIncrement,
      name: fieldName,
      props,
    });
  };

  return (
    <div className="">
      <form
        method="post"
        className="space-y-6"
        onSubmit={handleFormSubmit}
        encType={
          formType === "repeatable" || formType === "file"
            ? "multipart/form-data"
            : undefined
        }
      >
        {renderStatusMessages()}

        {renderFormField()}

        {/* ✅ Conditionally render the Save button */}
        {formType !== "increment" && (
          <DialogFooter>
            <div className="flex justify-end gap-2">
              <Button
                type="submit"
                className="text-white py-4 px-10 rounded-xl bg-primaryColor font-medium not-active-gradient"
                disabled={isSaveButtonDisabled()}
              >
                {showLoadingOnSubmit && fetcher.state === "submitting"
                  ? "Saving..."
                  : "Save"}
              </Button>
              {formSubmitted && fetcher.state !== "submitting" && (
                <DialogClose asChild>
                  <Button variant="outline">Close</Button>
                </DialogClose>
              )}
            </div>
          </DialogFooter>
        )}
      </form>
    </div>
  );
};

export default FormContent;
