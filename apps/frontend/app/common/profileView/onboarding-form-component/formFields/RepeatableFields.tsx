import { Button } from "~/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import PortfolioComponent from "../formFields/repeatables/PortfolioComponent";
import WorkHistoryComponent from "../formFields/repeatables/WorkHistory";
import CertificateComponent from "../formFields/repeatables/CertificateComponent";
import EducationComponent from "../formFields/repeatables/EducationComponent";
import { useFetcher } from "@remix-run/react";
import type { RepeatableFieldsProps } from "../types";
import {
  PortfolioFormFieldType,
  WorkHistoryFormFieldType,
  CertificateFormFieldType,
  EducationFormFieldType,
} from "~/types/User";

const RepeatableFields = ({
  fieldName,
  values,
  files,
  expandedIndex,
  onAdd,
  onRemove,
  onDataChange,
  onToggleExpand,
}: RepeatableFieldsProps) => {
  const fetcher = useFetcher();

  const handleAddField = () => {
    // Create a new empty field
    const newField = {
      fieldId: values.length + 1,
      projectName: "",
      projectLink: "",
      projectDescription: "",
      projectImageUrl: "",
    };
    const updatedValues = [...values, newField];

    // Update state and immediately save to the database
    onAdd();
    fetcher.submit(
      { [fieldName]: JSON.stringify(updatedValues) },
      { method: "post", encType: "application/json" }
    );
  };

  const handleRemoveField = (index: number) => {
    const updatedValues = values.filter((_, i) => i !== index);

    // Update state and immediately save to the database
    onRemove(index);
    fetcher.submit(
      { [fieldName]: JSON.stringify(updatedValues) },
      { method: "post", encType: "application/json" }
    );
  };

  const getRepeatableComponent = (type: string, index: number) => {
    const props = {
      data: values[index],
      onTextChange: (data: any) => onDataChange(index, data),
      onFileChange: files
        ? (newFiles: File[]) => {
            const updatedFiles = [...files]; // Clone the existing files array
            updatedFiles[index] = newFiles[0]; // Take the first file
            onDataChange(index, {
              ...values[index],
              attachmentName: newFiles[0]?.name || "",
            });

            // Update the repeatable input files state
            files[index] = newFiles[0]; // Set the file at the correct index
          }
        : undefined,
    };

    switch (type) {
      case "portfolio":
        return (
          <PortfolioComponent
            {...props}
            data={values[index] as PortfolioFormFieldType}
          />
        );
      case "workHistory":
        return (
          <WorkHistoryComponent
            {...props}
            data={values[index] as WorkHistoryFormFieldType}
          />
        );
      case "certificates":
        return (
          <CertificateComponent
            {...props}
            data={values[index] as CertificateFormFieldType}
          />
        );
      case "educations":
        return (
          <EducationComponent
            {...props}
            data={values[index] as EducationFormFieldType}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {values.map((_, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 1, backgroundColor: "transparent" }}
            animate={{ opacity: 1, backgroundColor: "transparent" }}
            exit={{ opacity: 0, backgroundColor: "#f8d7da" }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="border rounded-xl"
          >
            <div className="p-4">
              <div className="flex justify-between items-center">
                {/* Collapse/Expand */}
                <Button
                  variant="secondary"
                  type="button"
                  onClick={() =>
                    onToggleExpand(expandedIndex === index ? null : index)
                  }
                  className={`border rounded-xl not-active-gradient ${
                    expandedIndex === index
                      ? "bg-primaryColor text-white"
                      : "text-primaryColor border-primaryColor hover:text-white"
                  }`}
                >
                  {expandedIndex === index ? "Collapse" : "Expand"} Form{" "}
                  {index + 1}
                </Button>

                {/* Remove */}
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => handleRemoveField(index)}
                  className="border-red-500 text-red-500 rounded-xl not-active-gradient-red hover:text-white"
                >
                  Remove
                </Button>
              </div>

              <AnimatePresence>
                {expandedIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden mt-4"
                  >
                    {getRepeatableComponent(fieldName, index)}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Add field */}
      <Button
        variant="outline"
        type="button"
        onClick={handleAddField}
        className="not-active-gradient-black rounded-xl ml-4 hover:text-white"
      >
        + Add Field
      </Button>
    </div>
  );
};

export default RepeatableFields;
