import {
  forwardRef,
  useState,
  useRef,
  useImperativeHandle,
  useEffect,
} from "react";
import { useFetcher } from "@remix-run/react";

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
import { IoPencilSharp } from "react-icons/io5";

// Hooks used by the second snippet
import { useFormState } from "./hooks/useFormState";
import { useFormSubmission } from "./hooks/useFormSubmission";

// The shared FormContent + FieldTemplates that both snippets rely on
import FormContent, { getFormData } from "./formFields/FormContent";
import { FieldTemplates } from "./formFields/fieldTemplates";

// Types
import type {
  FormStateType,
  RepeatableInputType,
  GeneralizableFormCardProps,
  FormType,
} from "./types";

/* =====================================================================
 *  1) The forwardRef-based component for "file" formType ONLY
 * =====================================================================
 */
const FileFormCard = forwardRef<any, GeneralizableFormCardProps>(
  (props, ref) => {
    const {
      cardTitle,
      cardSubtitle,
      popupTitle,
      triggerLabel,
      formType,
      formName,
      fieldName,
      value,
      acceptedFileTypes,
      multiple,
      editable = true,
      showStatusMessage = true,
      showLoadingOnSubmit = false,
      formRef,
      // ... any other props you may want to spread
    } = props;

    // Since we only want to handle "file" here, we ignore "repeatable" logic:
    // We'll keep some local states and references:
    const [inputValue, setInputValue] = useState<any>(value || null);
    const [dialogOpen, setDialogOpen] = useState(false);

    const formContentRef = useRef<any>(null);
    const fetcher = useFetcher();

    // Expose methods to parent via ref (if parent needs them)
    useImperativeHandle(ref, () => ({
      getFormData: (form: HTMLFormElement) =>
        getFormData(formContentRef.current, form),
      filesSelected: formContentRef.current?.filesSelected || [],
    }));

    // Handle the actual submit
    const handleSubmit = (e: React.FormEvent, formData: FormData) => {
      e.preventDefault();

      // Submit the form data
      fetcher.submit(formData, {
        method: "post",
        encType: "multipart/form-data",
      });
    };

    // Keep track of files if the dialog is closed and reopened
    useEffect(() => {
      if (dialogOpen && formContentRef.current) {
        // When dialog opens, ensure we restore file state from parent ref if needed
        if (formRef && formRef.current && formRef.current.filesSelected) {
          formContentRef.current.setFilesSelected(
            formRef.current.filesSelected
          );
          return; // If we have files from the parent ref, don't try to create new ones
        }

        // Initialize from existing files in value
        if (value && typeof value === "object") {
          // Reset files selected to avoid duplicates
          formContentRef.current.setFilesSelected([]);

          // Check for attachments format
          if ("attachments" in value) {
            const attachments = (value as any).attachments;
            if (
              attachments &&
              typeof attachments === "object" &&
              fieldName in attachments &&
              Array.isArray(attachments[fieldName]) &&
              attachments[fieldName].length > 0
            ) {
              // Create File-like objects for display
              const fileObjects = attachments[fieldName]
                .map((fileInfo: any) => {
                  try {
                    // Create a File object with the actual size from the server
                    return new File(
                      [
                        // Create a blob with the actual size if available
                        new Blob(
                          // Use a larger buffer for the file content to ensure size is preserved
                          [
                            new Uint8Array(
                              new ArrayBuffer(fileInfo.size || 143 * 1024)
                            ).fill(1),
                          ],
                          { type: fileInfo.type || "application/octet-stream" }
                        ),
                      ],
                      fileInfo.name,
                      {
                        type: fileInfo.type || "application/octet-stream",
                        lastModified: fileInfo.lastModified || Date.now(),
                      }
                    );
                  } catch (e) {
                    console.error("Error creating File object:", e);
                    return null;
                  }
                })
                .filter(Boolean);

              if (
                fileObjects.length > 0 &&
                formContentRef.current.setFilesSelected
              ) {
                formContentRef.current.setFilesSelected(fileObjects);
              }
            }
          }

          // Check for direct field format
          if (
            fieldName in value &&
            Array.isArray(value[fieldName]) &&
            value[fieldName].length > 0
          ) {
            const fileObjects = value[fieldName]
              .map((fileInfo: any) => {
                try {
                  return new File(
                    [
                      // Create a blob with the actual size if available
                      new Blob([new ArrayBuffer(fileInfo.size || 143 * 1024)], {
                        type: fileInfo.type || "application/octet-stream",
                      }),
                    ],
                    fileInfo.name,
                    {
                      type: fileInfo.type || "application/octet-stream",
                      lastModified: fileInfo.lastModified || Date.now(),
                    }
                  );
                } catch (e) {
                  console.error("Error creating File object:", e);
                  return null;
                }
              })
              .filter(Boolean);

            if (
              fileObjects.length > 0 &&
              formContentRef.current.setFilesSelected
            ) {
              formContentRef.current.setFilesSelected(fileObjects);
            }
          }
        }
      }
    }, [dialogOpen, formRef, value, fieldName]);

    // Decide if the card is "filled" or "empty"
    const isFilled = (() => {
      if (value == null) return false;

      // If it's already a File object
      if (value instanceof File) {
        return true;
      }

      // Handle server-side file data: e.g., attachments
      if (formType === "file" && typeof value === "object" && value !== null) {
        // Check attachments format
        if ("attachments" in (value as object)) {
          const attachments = (value as any).attachments;
          if (attachments && typeof attachments === "object") {
            // Check if any attachment type has files
            if (fieldName in attachments) {
              return (
                Array.isArray(attachments[fieldName]) &&
                attachments[fieldName].length > 0
              );
            }
            return Object.values(attachments).some(
              (files: any) => Array.isArray(files) && files.length > 0
            );
          }
        }

        // Check direct field format
        if (fieldName in value) {
          return Array.isArray(value[fieldName]) && value[fieldName].length > 0;
        }
      }

      return Boolean(value);
    })();

    // We only need a file template:
    const templateKey = "file";
    const Template = FieldTemplates[templateKey];
    if (!Template) return null;

    const TemplateComponent = isFilled
      ? Template.FilledState
      : Template.EmptyState;

    // Prepare value for the template
    const prepareValueForRendering = () => {
      if (value === null || value === undefined) {
        return "" as FormStateType;
      }
      if (value instanceof File) {
        return `File: ${value.name}` as FormStateType;
      }
      // Handle server-side file data
      if (
        formType === "file" &&
        typeof value === "object" &&
        value !== null &&
        "attachments" in (value as object)
      ) {
        const attachments = (value as any).attachments;
        if (
          attachments &&
          typeof attachments === "object" &&
          fieldName in attachments
        ) {
          return attachments[fieldName];
        }
      }

      // Handle identificationData format
      if (typeof value === "object" && value !== null && fieldName in value) {
        return value[fieldName];
      }

      // fallback
      return value as FormStateType;
    };

    // Get file information to display
    const getFileList = () => {
      const files = [];

      // Check if we have attachments in the value
      if (
        typeof value === "object" &&
        value !== null &&
        "attachments" in (value as object)
      ) {
        const attachments = (value as any).attachments;
        if (
          attachments &&
          typeof attachments === "object" &&
          fieldName in attachments &&
          Array.isArray(attachments[fieldName])
        ) {
          return attachments[fieldName];
        }
      }

      // Check if we have direct file array in the value
      if (
        typeof value === "object" &&
        value !== null &&
        fieldName in value &&
        Array.isArray(value[fieldName])
      ) {
        return value[fieldName];
      }

      return files;
    };

    const existingFiles = getFileList();
    const hasExistingFiles = existingFiles && existingFiles.length > 0;

    return (
      <Card
        className={`border-2 rounded-xl flex flex-col h-full ${
          isFilled || hasExistingFiles
            ? "bg-[#F1F0F3]"
            : "bg-gray-100 border-gray-300 border-dashed"
        }`}
      >
        <div className={`flex flex-col relative pt-8 pb-6 pl-7 pr-10`}>
          <TemplateComponent
            value={prepareValueForRendering()}
            fieldName={fieldName}
            cardTitle={cardTitle}
            cardSubtitle={cardSubtitle}
          />

          {/* Display existing files if any */}
          {hasExistingFiles && (
            <div className="mt-2 mb-4">
              <h4 className="text-sm font-medium text-gray-700">
                Uploaded files:
              </h4>
              <ul className="list-disc pl-5 mt-1">
                {existingFiles.map((file: any, index: number) => (
                  <li key={index} className="text-sm text-gray-600">
                    {file.name}
                    <span className="text-xs text-gray-500 ml-2">
                      ({Math.round((file.size || 143 * 1024) / 1024)} KB)
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {editable && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="text-primaryColor border-primaryColor hover:bg-primaryColor/10"
                >
                  {isFilled || hasExistingFiles
                    ? triggerLabel || "Edit"
                    : triggerLabel || "Add"}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>{popupTitle || cardTitle}</DialogTitle>
                </DialogHeader>
                <FormContent
                  ref={formContentRef}
                  formType={formType}
                  onSubmit={handleSubmit}
                  fetcher={fetcher}
                  showStatusMessage={showStatusMessage}
                  formName={formName}
                  fieldName={fieldName}
                  showLoadingOnSubmit={showLoadingOnSubmit}
                  value={value}
                  acceptedFileTypes={acceptedFileTypes}
                  multiple={multiple}
                  // You can pass other props here if needed
                  {...props}
                  formState={{
                    inputValue,
                    setInputValue,
                    repeatableInputValues: [],
                    repeatableInputFiles: [],
                    handleAddRepeatableField: () => {},
                    handleRemoveRepeatableField: () => {},
                    handleDataChange: () => {},
                    expandedIndex: null,
                    setExpandedIndex: () => {},
                  }}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Show how many files were selected if we have them */}
        {formContentRef.current?.filesSelected?.length > 0 && (
          <div className="text-gray-700 px-7 pb-4">
            <p className="text-sm text-gray-500">
              {/* Show the actual number of unique files */}
              {
                new Set(
                  formContentRef.current.filesSelected.map((f: File) => f.name)
                ).size
              }{" "}
              file(s) selected
            </p>
          </div>
        )}
      </Card>
    );
  }
);

FileFormCard.displayName = "FileFormCard";

/* =====================================================================
 *  2) The default component for ALL other form types (non-file)
 *     This is basically the second snippet verbatim, minus the 'file' logic
 * =====================================================================
 */
function DefaultFormCard(props: GeneralizableFormCardProps) {
  const {
    handleSubmit: localHandleSubmit,
    fetcher: localFetcher,
    showStatusMessage: localShowStatusMessage,
  } = useFormSubmission();
  const formState = useFormState(props.formType, props.fieldName);

  // Dialog open state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Reset formSubmitted when dialog opens
  useEffect(() => {
    if (dialogOpen) {
      setFormSubmitted(false);
    }
  }, [dialogOpen]);

  // Use the provided fetcher or the local one
  const fetcher = props.fetcher || localFetcher;

  // Custom submit that closes the dialog after submission
  const handleSubmit = (e: React.FormEvent, formData: FormData) => {
    localHandleSubmit(e, formData);
    setFormSubmitted(true);

    // close dialog after successful submission
    setTimeout(() => {
      if (fetcher.state !== "submitting") {
        setDialogOpen(false);
      }
    }, 500);
  };

  const showStatusMessage = localShowStatusMessage;

  // Extract from formState
  const { inputValue, repeatableInputValues } = formState;

  // Make sure we don't overwrite props.value incorrectly
  const value =
    props.formType === "repeatable"
      ? Array.isArray(repeatableInputValues) && repeatableInputValues.length > 0
        ? repeatableInputValues
        : Array.isArray(props.value)
          ? props.value
          : []
      : inputValue && inputValue !== "this is the about me section..."
        ? inputValue
        : props.value;

  // Decide if the card is "filled" or "empty" (excluding file logic here)
  const isFilled = (() => {
    if (value === null || value === undefined) {
      return false;
    }
    if (Array.isArray(value)) {
      return value.length > 0;
    }
    return Boolean(value);
  })();

  // Choose the correct template
  const templateKey =
    props.formType === "repeatable"
      ? `repeatable_${props.repeatableFieldName}`
      : props.formType;

  const Template = FieldTemplates[templateKey];
  if (!Template) return null;

  const TemplateComponent = isFilled
    ? Template.FilledState
    : Template.EmptyState;

  // Prepare for rendering
  const prepareValueForRendering = () => {
    if (value === null || value === undefined) {
      return "" as FormStateType;
    }
    if (Array.isArray(value)) {
      return value as RepeatableInputType[];
    }
    // fallback
    return value as FormStateType;
  };

  // Handle button click to open the dialog
  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setDialogOpen(true);
  };

  return (
    <Card
      className={`border-2 rounded-xl flex flex-col h-full ${
        isFilled ? "bg-[#F1F0F3]" : "bg-gray-100 border-gray-300 border-dashed"
      }`}
    >
      <div
        className={`flex flex-col relative ${
          props.formType === "video" && value ? "" : "pt-8 pb-6 pl-7 pr-10"
        }`}
      >
        <TemplateComponent
          value={prepareValueForRendering()}
          fieldName={props.fieldName}
          cardTitle={props.cardTitle}
          cardSubtitle={props.cardSubtitle}
        />
        {props.editable && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            {isFilled ? (
              <button
                type="button"
                className="absolute top-3 right-3"
                onClick={handleButtonClick}
              >
                <IoPencilSharp className="h-7 w-7 text-primaryColor hover:bg-[#E4E3E6] transition-all rounded-full p-1" />
              </button>
            ) : (
              <Button
                type="button"
                variant="outline"
                className="text-primaryColor border-gray-300"
                onClick={handleButtonClick}
              >
                {props.triggerIcon} {props.triggerLabel}
              </Button>
            )}
            <DialogContent>
              <DialogTitle>{props.popupTitle}</DialogTitle>
              <FormContent
                {...props}
                formState={formState}
                onSubmit={handleSubmit}
                fetcher={fetcher}
                showStatusMessage={showStatusMessage}
              />
              {formSubmitted && (
                <DialogFooter className="mt-2">
                  <DialogClose asChild>
                    <Button variant="outline">Close</Button>
                  </DialogClose>
                </DialogFooter>
              )}
            </DialogContent>
          </Dialog>
        )}
      </div>
    </Card>
  );
}

/* =====================================================================
 *  3) The SINGLE exported component that decides which one to render
 * =====================================================================
 */
function GeneralizableFormCard(props: GeneralizableFormCardProps) {
  // If the formType is "file", use the forwardRef-based version:
  if (props.formType === "file") {
    return <FileFormCard {...props} />;
  }

  // Otherwise, use the default version from snippet #2:
  return <DefaultFormCard {...props} />;
}

export default GeneralizableFormCard;
