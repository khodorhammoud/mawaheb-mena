import { Button } from "~/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import PortfolioComponent from "../formFields/repeatables/PortfolioComponent";
import WorkHistoryComponent from "../formFields/repeatables/WorkHistory";
import CertificateComponent from "../formFields/repeatables/CertificateComponent";
import EducationComponent from "../formFields/repeatables/EducationComponent";
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
  // log the type of
  const getRepeatableComponent = (type: string, index: number) => {
    const props = {
      data: values[index],
      onTextChange: (data: any) => onDataChange(index, data),
      onFileChange: files
        ? (file: File) => {
            const newFiles = [...files];
            newFiles[index] = file;
            onDataChange(index, {
              ...values[index],
              attachmentName: file.name,
            });
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
    <div className="space-y-4 overflow-hidden">
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
            <div className="p-3">
              <div className="flex justify-between items-center">
                {/* COLLAPSE/EXPAND BUTTONS */}
                <Button
                  variant="secondary"
                  type="button"
                  onClick={() =>
                    onToggleExpand(expandedIndex === index ? null : index)
                  }
                  className={`border rounded-xl not-active-gradient py-1 ${
                    expandedIndex === index
                      ? "bg-primaryColor text-white" // Active state styles
                      : "text-primaryColor border-primaryColor hover:text-white" // Default state styles
                  }`}
                >
                  {expandedIndex === index ? "Collapse" : "Expand"} Form{" "}
                  {index + 1}
                </Button>

                {/* REMOVE BUTTON */}
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => onRemove(index)}
                  className="border-red-500 text-red-500 rounded-xl not-active-gradient-red hover:text-white py-1"
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

      {/* ADD FIELD BUTTON */}
      <Button
        variant="outline"
        type="button"
        onClick={onAdd}
        className="not-active-gradient-black rounded-xl ml-4 hover:text-white"
      >
        + Add Field
      </Button>
    </div>
  );
};

export default RepeatableFields;
