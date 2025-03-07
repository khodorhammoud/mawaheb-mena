import { Button } from "~/components/ui/button";
import { DialogFooter } from "~/components/ui/dialog";
import { FormFields } from "./FormFields";
import RepeatableFields from "./RepeatableFields";
import type { FormContentProps } from "../types";

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
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 mt-2">
          <span className="block sm:inline">{fetcher.data.error.message}</span>
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

    // console.log(
    //   "repeatableInputValues before form submission:",
    //   repeatableInputValues
    // );
    // console.log(
    //   "repeatableInputFiles before form submission:",
    //   repeatableInputFiles
    // );

    // Handle repeatable fields
    if (formType === "repeatable") {
      formData.append(
        repeatableFieldName,
        JSON.stringify(repeatableInputValues)
      );

      // Append files
      repeatableInputFiles.forEach((file, index) => {
        if (file) {
          // console.log(`Appending file at index ${index}:`, file);
          formData.append(`${repeatableFieldName}-attachment[${index}]`, file);
        } else {
          console.warn(`No file found at index ${index}`);
        }
      });
    }

    // console.log("Final FormData entries:", Array.from(formData.entries()));

    // Pass the formData to the onSubmit callback
    onSubmit(e, formData);
  };

  const handleIncrement = (step: number) => {
    const currentValue = inputValue;

    if (typeof currentValue === "number") {
      // ✅ Increment the number
      const newValue = currentValue + step;
      fetcher.submit(
        {
          "target-updated": formName,
          [fieldName]: newValue.toString(),
        },
        { method: "post" }
      );
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

  // console.log("repeatableInputFiles in current state:", repeatableInputFiles);

  return (
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

        {/* ✅ Conditionally render the Save button */}
        {formType !== "increment" && (
          <DialogFooter>
            <Button
              type="submit"
              className="text-white py-4 px-10 rounded-xl bg-primaryColor font-medium not-active-gradient"
            >
              Save
            </Button>
          </DialogFooter>
        )}
      </fetcher.Form>
    </div>
  );
};

export default FormContent;
