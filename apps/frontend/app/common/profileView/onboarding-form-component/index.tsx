import { Card } from "~/common/header/card";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogClose,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { useFormState } from "./hooks/useFormState";
import { useFormSubmission } from "./hooks/useFormSubmission";
import FormContent, { getFormData } from "./formFields/FormContent";
import { FieldTemplates } from "./formFields/fieldTemplates";
import { IoPencilSharp } from "react-icons/io5";
import type {
  FormStateType,
  RepeatableInputType,
  GeneralizableFormCardProps,
  FormType,
} from "./types";
import {
  useState,
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import { useFetcher } from "@remix-run/react";

const GeneralizableFormCard = forwardRef<any, GeneralizableFormCardProps>(
  (
    {
      cardTitle,
      cardSubtitle,
      popupTitle,
      triggerLabel,
      formType,
      formName,
      fieldName,
      repeatableFieldName,
      value,
      acceptedFileTypes,
      multiple,
      editable = true,
      showStatusMessage = true,
      showLoadingOnSubmit = false,
      formRef,
      ...props
    },
    ref
  ) => {
    const [inputValue, setInputValue] = useState<any>(value || null);
    const [repeatableInputValues, setRepeatableInputValues] = useState<any[]>(
      Array.isArray(value) ? value : []
    );
    const [repeatableInputFiles, setRepeatableInputFiles] = useState<File[]>(
      []
    );
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const formContentRef = useRef<any>(null);
    const fetcher = useFetcher();

    // Expose methods to parent component
    useImperativeHandle(ref, () => ({
      getFormData: (form: HTMLFormElement) =>
        getFormData(formContentRef.current, form),
      filesSelected: formContentRef.current?.filesSelected || [],
    }));

    // Handle adding a new repeatable field
    const handleAddRepeatableField = () => {
      setRepeatableInputValues([...repeatableInputValues, {}]);
      setRepeatableInputFiles([...repeatableInputFiles, null]);
      setExpandedIndex(repeatableInputValues.length);
    };

    // Handle removing a repeatable field
    const handleRemoveRepeatableField = (index: number) => {
      const newValues = [...repeatableInputValues];
      const newFiles = [...repeatableInputFiles];
      newValues.splice(index, 1);
      newFiles.splice(index, 1);
      setRepeatableInputValues(newValues);
      setRepeatableInputFiles(newFiles);

      // Adjust expanded index if needed
      if (expandedIndex === index) {
        setExpandedIndex(null);
      } else if (expandedIndex > index) {
        setExpandedIndex(expandedIndex - 1);
      }
    };

    // Handle data change in repeatable fields
    const handleDataChange = (index: number, data: any, file?: File) => {
      const newValues = [...repeatableInputValues];
      newValues[index] = { ...newValues[index], ...data };
      setRepeatableInputValues(newValues);

      if (file) {
        const newFiles = [...repeatableInputFiles];
        newFiles[index] = file;
        setRepeatableInputFiles(newFiles);
      }
    };

    // Form state to pass to FormContent
    const formState = {
      inputValue,
      setInputValue,
      repeatableInputValues,
      repeatableInputFiles,
      handleAddRepeatableField,
      handleRemoveRepeatableField,
      handleDataChange,
      expandedIndex,
      setExpandedIndex,
    };

    // Handle form submission
    const handleSubmit = (e: React.FormEvent, formData: FormData) => {
      e.preventDefault();
      fetcher.submit(formData, {
        method: "post",
        encType: "multipart/form-data",
      });
    };

    // Preserve file state when dialog is closed and reopened
    useEffect(() => {
      if (dialogOpen && formContentRef.current) {
        // When dialog opens, ensure we have the latest file state
        if (formRef && formRef.current && formRef.current.filesSelected) {
          formContentRef.current.setFilesSelected(
            formRef.current.filesSelected
          );
        }
      }
    }, [dialogOpen, formRef]);

    // Get values from formState
    const {
      inputValue: formStateInputValue,
      repeatableInputValues: formStateRepeatableInputValues,
    } = formState;

    // Fix: Ensure inputValue does not overwrite props.value with incorrect data
    const valueToRender =
      formType === "repeatable"
        ? Array.isArray(formStateRepeatableInputValues) &&
          formStateRepeatableInputValues.length > 0
          ? formStateRepeatableInputValues
          : Array.isArray(value)
            ? value
            : []
        : formStateInputValue &&
            formStateInputValue !== "this is the about me section..."
          ? formStateInputValue
          : value;

    // Safely determine if the value is filled
    const isFilled = (() => {
      if (valueToRender === null || valueToRender === undefined) {
        return false;
      }

      if (Array.isArray(valueToRender)) {
        return valueToRender.length > 0;
      }

      if (valueToRender instanceof File) {
        return true;
      }

      // Handle server-side file data
      if (
        formType === "file" &&
        typeof valueToRender === "object" &&
        valueToRender !== null &&
        "attachments" in (valueToRender as object)
      ) {
        const attachments = (valueToRender as any).attachments;
        if (attachments && typeof attachments === "object") {
          // Check if any attachment type has files
          return Object.values(attachments).some(
            (files: any) => Array.isArray(files) && files.length > 0
          );
        }
      }

      return Boolean(valueToRender);
    })();

    const templateKey =
      formType === "repeatable"
        ? `repeatable_${repeatableFieldName}`
        : formType;

    const Template = FieldTemplates[templateKey];
    if (!Template) return null;

    const TemplateComponent = isFilled
      ? Template.FilledState
      : Template.EmptyState;

    // Safely prepare the value for rendering
    const prepareValueForRendering = () => {
      if (valueToRender === null || valueToRender === undefined) {
        return "" as FormStateType;
      }

      if (Array.isArray(valueToRender)) {
        return valueToRender as RepeatableInputType[];
      }

      if (valueToRender instanceof File) {
        // For File objects, convert to a string representation
        return `File: ${valueToRender.name}` as FormStateType;
      }

      // Handle server-side file data for identification documents
      if (
        formType === "file" &&
        typeof valueToRender === "object" &&
        valueToRender !== null &&
        "attachments" in (valueToRender as object)
      ) {
        const attachments = (valueToRender as any).attachments;
        if (
          attachments &&
          typeof attachments === "object" &&
          fieldName in attachments
        ) {
          // Return the specific attachment files for this field
          return attachments[fieldName];
        }
      }

      return valueToRender as FormStateType;
    };

    return (
      <Card
        className={`border-2 rounded-xl flex flex-col h-full ${
          isFilled
            ? "bg-[#F1F0F3]"
            : "bg-gray-100 border-gray-300 border-dashed"
        }`}
      >
        <div
          className={`flex flex-col relative ${
            formType === "video" && valueToRender ? "" : "pt-8 pb-6 pl-7 pr-10"
          }`}
        >
          <TemplateComponent
            value={prepareValueForRendering()}
            fieldName={fieldName}
            cardTitle={cardTitle}
            cardSubtitle={cardSubtitle}
          />
          {editable && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="text-primaryColor border-primaryColor hover:bg-primaryColor/10"
                >
                  {triggerLabel || "Edit"}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>{popupTitle || cardTitle}</DialogTitle>
                </DialogHeader>
                <FormContent
                  ref={formContentRef}
                  formType={formType}
                  formState={formState}
                  onSubmit={handleSubmit}
                  fetcher={fetcher}
                  showStatusMessage={showStatusMessage}
                  formName={formName}
                  fieldName={fieldName}
                  repeatableFieldName={repeatableFieldName}
                  showLoadingOnSubmit={showLoadingOnSubmit}
                  value={value}
                  acceptedFileTypes={acceptedFileTypes}
                  multiple={multiple}
                  {...props}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Display current value if not editable or as a preview */}
        {formType === "text" && formStateInputValue && (
          <p className="text-gray-700">{formStateInputValue}</p>
        )}
        {formType === "textarea" && formStateInputValue && (
          <p className="text-gray-700 whitespace-pre-line">
            {formStateInputValue}
          </p>
        )}
        {formType === "number" && formStateInputValue !== null && (
          <p className="text-gray-700">{formStateInputValue}</p>
        )}
        {formType === "select" && formStateInputValue && (
          <p className="text-gray-700">{formStateInputValue}</p>
        )}
        {formType === "increment" && formStateInputValue !== null && (
          <p className="text-gray-700">{formStateInputValue}</p>
        )}
        {formType === "file" &&
          formContentRef.current?.filesSelected?.length > 0 && (
            <div className="text-gray-700">
              <p className="text-sm text-gray-500 mb-1">
                {formContentRef.current.filesSelected.length} file(s) selected
              </p>
            </div>
          )}
        {formType === "repeatable" &&
          formStateRepeatableInputValues.length > 0 && (
            <div className="text-gray-700">
              <p className="text-sm text-gray-500 mb-1">
                {formStateRepeatableInputValues.length} item(s) added
              </p>
            </div>
          )}
      </Card>
    );
  }
);

GeneralizableFormCard.displayName = "GeneralizableFormCard";

export default GeneralizableFormCard;
