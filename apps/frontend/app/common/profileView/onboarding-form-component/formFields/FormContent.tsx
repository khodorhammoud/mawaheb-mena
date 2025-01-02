// This is the file of the success messages and error ones of all the GeneralizableFormCard, and the save button + its functionality

import { Button } from "~/components/ui/button";
import { DialogFooter } from "~/components/ui/dialog";
import { FormFields } from "./FormFields";
import RepeatableFields from "./RepeatableFields";
import type { FormContentProps } from "../types";

// Main FormContent component
const FormContent = ({
  formType,
  formState,
  onSubmit,
  fetcher,
  showStatusMessage,
  formName,
  fieldName,
  repeatableFieldName,
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

  // Render status messages (error/success)
  const renderStatusMessages = () => {
    if (!showStatusMessage) return null;

    if (fetcher.data?.error) {
      return (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 mt-6">
          <span className="block sm:inline">{fetcher.data.error.message}</span>
        </div>
      );
    }

    if (fetcher.data?.success) {
      return (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4 mt-6">
          <span className="block sm:inline">Updated successfully</span>
        </div>
      );
    }
  };

  // Handle form submission
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);

    // Add target-updated field
    formData.append("target-updated", formName);

    // Handle repeatable fields
    if (formType === "repeatable") {
      formData.append(
        repeatableFieldName,
        JSON.stringify(repeatableInputValues)
      );
      repeatableInputFiles.forEach((file, index) => {
        if (file) {
          formData.append(`${repeatableFieldName}-attachment[${index}]`, file);
        }
      });
    }

    onSubmit(e, formData);
  };

  // Fix: Add Type Guard to handle 'prev' correctly when it's a number
  const handleIncrement = (step: number) => {
    setInputValue((prev) => {
      // Check if prev is a number
      if (typeof prev === "number") {
        fetcher.submit(
          {
            "target-updated": formName,
            [fieldName]: (prev + step).toString(),
          },
          { method: "post" }
        );
        return prev + step;
      } else {
        // Handle cases where prev is not a number
        console.warn("Expected 'prev' to be a number but got:", typeof prev);
        return prev; // Don't modify the state if it's not a number
      }
    });
  };

  return (
    //POPUPS
    <div className="">
      <fetcher.Form
        method="post"
        className="space-y-6"
        onSubmit={handleFormSubmit}
        encType={formType === "repeatable" ? "multipart/form-data" : undefined}
      >
        {renderStatusMessages()}

        {formType === "repeatable" ? (
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
        ) : (
          FormFields[formType]?.({
            value: inputValue,
            onChange: (e) =>
              setInputValue(
                formType === "number" ? Number(e.target.value) : e.target.value
              ),
            handleIncrement: handleIncrement,
            name: fieldName,
            props,
          })
        )}

        <DialogFooter>
          <Button
            type="submit"
            className="text-white py-4 px-10 rounded-xl bg-primaryColor font-medium not-active-gradient mt-6"
          >
            Save
          </Button>
        </DialogFooter>
      </fetcher.Form>
    </div>
  );
};

export default FormContent;
