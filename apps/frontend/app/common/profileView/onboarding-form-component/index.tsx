import { forwardRef, useState, useRef, useImperativeHandle, useEffect } from 'react';
import { useFetcher } from '@remix-run/react';

import { Card } from '~/common/header/card';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogClose,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from '~/components/ui/dialog';
import { Button } from '~/components/ui/button';
import { IoPencilSharp } from 'react-icons/io5';
import { FaFileAlt } from 'react-icons/fa';

// Hooks used by the second snippet
import { useFormState } from './hooks/useFormState';
import { useFormSubmission } from './hooks/useFormSubmission';

// The shared FormContent + FieldTemplates that both snippets rely on
import FormContent, { getFormData } from './formFields/FormContent';
import { FieldTemplates } from './formFields/fieldTemplates';

// Types
import type {
  FormStateType,
  RepeatableInputType,
  GeneralizableFormCardProps,
  FormType,
} from './types';

/* =====================================================================
 *  1) The forwardRef-based component for "file" formType ONLY
 * =====================================================================
 */
const FileFormCard = forwardRef<any, GeneralizableFormCardProps>((props, ref) => {
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
  } = props;

  const [inputValue, setInputValue] = useState<any>(value || null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [filesToDelete, setFilesToDelete] = useState<number[]>([]);
  const [showParseButton, setShowParseButton] = useState(false);
  const [parsing, setParsing] = useState(false);

  const formContentRef = useRef<any>(null);
  const fetcher = useFetcher<{ success?: boolean; error?: { message: string } }>();

  // Check if the file is a CV (based on fieldName)
  const isCVField = fieldName === 'cvFile';

  // Load existing files from the server
  useEffect(() => {
    if (value && typeof value === 'object' && 'attachments' in value) {
      const attachments = (value as any).attachments;
      if (
        attachments &&
        typeof attachments === 'object' &&
        fieldName in attachments &&
        Array.isArray(attachments[fieldName]) &&
        attachments[fieldName].length > 0
      ) {
        const fileObjects = attachments[fieldName]
          .map((fileInfo: any) => {
            try {
              const file = new File(
                [
                  new Blob([new Uint8Array(new ArrayBuffer(fileInfo.size || 143 * 1024)).fill(1)], {
                    type: fileInfo.type || 'application/octet-stream',
                  }),
                ],
                fileInfo.name || 'unknown-file.pdf',
                {
                  type: fileInfo.type || 'application/octet-stream',
                  lastModified: fileInfo.lastModified || Date.now(),
                }
              );

              // Add serverId for tracking
              if (fileInfo.serverId) {
                Object.defineProperty(file, 'serverId', {
                  value: fileInfo.serverId,
                  writable: true,
                  enumerable: true,
                });
              }

              // Mark as server file
              Object.defineProperty(file, 'isServerFile', {
                value: true,
                writable: true,
                enumerable: true,
              });

              return file;
            } catch (e) {
              console.error('Error creating File object:', e, fileInfo);
              return null;
            }
          })
          .filter(Boolean);

        if (fileObjects.length > 0) {
          setSelectedFiles(fileObjects);
          if (formContentRef.current) {
            formContentRef.current.setFilesSelected(fileObjects);
          }

          // Show parse button if this is a CV file and is likely a PDF or Word doc
          if (isCVField) {
            const hasValidCVFile = fileObjects.some(
              file =>
                file.type === 'application/pdf' ||
                file.type ===
                  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            );
            setShowParseButton(hasValidCVFile);
          }
        }
      }
    }
  }, [value, fieldName, isCVField]);

  // Show Parse button when CV file is uploaded
  useEffect(() => {
    if (isCVField && selectedFiles.length > 0) {
      const hasValidCVFile = selectedFiles.some(
        file =>
          file.type === 'application/pdf' ||
          file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      );
      setShowParseButton(hasValidCVFile);
    } else {
      setShowParseButton(false);
    }
  }, [selectedFiles, isCVField]);

  // Load filesToDelete from localStorage on mount
  useEffect(() => {
    const storedFilesToDelete = localStorage.getItem(`${fieldName}-files-to-delete`);
    if (storedFilesToDelete) {
      try {
        const parsedFilesToDelete = JSON.parse(storedFilesToDelete);
        if (Array.isArray(parsedFilesToDelete) && parsedFilesToDelete.length > 0) {
          setFilesToDelete(parsedFilesToDelete);
        }
      } catch (error) {
        console.error('Error loading filesToDelete from localStorage:', error);
      }
    }
  }, [fieldName]);

  // Update the parent ref whenever selectedFiles or filesToDelete changes
  useEffect(() => {
    if (formRef && formRef.current) {
      formRef.current.filesSelected = selectedFiles;
      formRef.current.filesToDelete = filesToDelete;
      if (typeof formRef.current.forceUpdate === 'function') {
        formRef.current.forceUpdate();
      }
    }
  }, [selectedFiles, filesToDelete, formRef]);

  // Handle dialog close
  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => {
    return {
      getFormData: (form: HTMLFormElement) => getFormData(formContentRef.current, form),
      filesSelected: selectedFiles,
      filesToDelete: filesToDelete,
      setFilesSelected: (files: File[]) => {
        setSelectedFiles(files);
        if (formContentRef.current) {
          formContentRef.current.setFilesSelected(files);
        }
      },
      clearFiles: () => {
        setSelectedFiles([]);
        setFilesToDelete([]);
        try {
          localStorage.removeItem(`${fieldName}-files-to-delete`);
        } catch (error) {
          console.error('Error clearing filesToDelete from localStorage:', error);
        }
        if (formContentRef.current) {
          formContentRef.current.setFilesSelected([]);
        }
      },
    };
  });

  // Handle file selection
  const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setSelectedFiles(prevFiles => {
        const updatedFiles = [...prevFiles];
        newFiles.forEach(file => {
          const existingIndex = updatedFiles.findIndex(f => f.name === file.name);
          if (existingIndex >= 0) {
            updatedFiles[existingIndex] = file;
          } else {
            updatedFiles.push(file);
          }
        });

        // Show parse button if this is a CV field and there's a valid file
        if (isCVField) {
          const hasValidCVFile = newFiles.some(
            file =>
              file.type === 'application/pdf' ||
              file.type ===
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
          );
          setShowParseButton(hasValidCVFile);
        }

        return updatedFiles;
      });
    }
  };

  // Handle file removal
  const handleFileRemove = (index: number) => {
    const fileToRemove = selectedFiles[index];

    // If it's a server file, add its ID to filesToDelete
    if ((fileToRemove as any).isServerFile && (fileToRemove as any).serverId) {
      const serverId = (fileToRemove as any).serverId;
      setFilesToDelete(prev => {
        const newFilesToDelete = [...prev, serverId];
        try {
          localStorage.setItem(`${fieldName}-files-to-delete`, JSON.stringify(newFilesToDelete));
        } catch (error) {
          console.error('Error saving filesToDelete to localStorage:', error);
        }
        return newFilesToDelete;
      });
    }

    setSelectedFiles(prevFiles => {
      const newFiles = prevFiles.filter((_, i) => i !== index);
      return newFiles;
    });
  };

  // Handle CV parsing
  const handleParseCV = () => {
    if (selectedFiles.length === 0 || !isCVField) return;

    setParsing(true);

    const formData = new FormData();
    formData.append('target-updated', 'cvParser');
    formData.append('cvFile', selectedFiles[0]);

    fetcher.submit(formData, {
      method: 'post',
      encType: 'multipart/form-data',
    });

    // Close dialog after submission
    setDialogOpen(false);
  };

  // Reset parsing state when fetcher completes
  useEffect(() => {
    if (fetcher.state === 'idle' && parsing) {
      setParsing(false);
    }
  }, [fetcher.state, parsing]);

  // Show success message after CV parsing
  const renderParseStatusMessage = () => {
    if (!parsing && fetcher.state === 'idle' && fetcher.data) {
      const data = fetcher.data as { success?: boolean; error?: { message: string } };

      if (data.success) {
        return (
          <div className="mt-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
            <span className="block sm:inline">
              CV parsed successfully! Your profile has been updated.
            </span>
          </div>
        );
      } else if (data.error) {
        return (
          <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            <span className="block sm:inline">
              {data.error.message || 'An error occurred while parsing your CV.'}
            </span>
          </div>
        );
      }
    }
    return null;
  };

  // Render selected files
  const renderSelectedFiles = () => {
    if (selectedFiles.length === 0) return null;

    return (
      <div className="mt-4">
        <h3 className="text-sm font-medium text-gray-700">Selected files:</h3>
        <ul className="mt-2 divide-y divide-gray-200">
          {selectedFiles.map((file, index) => (
            <li key={index} className="py-2 flex justify-between items-center">
              <span className="text-sm text-gray-600">
                {file.name} ({Math.round(file.size / 1024)} KB)
                {(file as any).isServerFile && (
                  <span className="ml-2 text-xs text-blue-500">(from database)</span>
                )}
              </span>
              <button
                type="button"
                onClick={() => handleFileRemove(index)}
                className="text-red-500 hover:text-red-700"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>

        {/* Parse CV Button */}
        {showParseButton && (
          <div className="mt-4">
            <Button
              type="button"
              onClick={handleParseCV}
              disabled={parsing}
              className="w-full flex items-center justify-center gap-2"
            >
              <FaFileAlt className="h-4 w-4" />
              {parsing ? 'Parsing CV...' : 'Parse CV to fill profile'}
            </Button>
            <p className="text-xs text-gray-500 mt-1 text-center">
              This will extract information from your CV to fill your profile automatically.
            </p>
          </div>
        )}

        {/* Status Message */}
        {renderParseStatusMessage()}
      </div>
    );
  };

  return (
    <Card className="w-full">
      <div className="px-7 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium text-gray-900">{cardTitle}</h3>
            {cardSubtitle && <p className="text-sm text-gray-500">{cardSubtitle}</p>}
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                {triggerLabel}
              </Button>
            </DialogTrigger>
            <DialogContent>
              {/* this is where i leave space betweeen the title and the content in the dialogs */}
              <DialogHeader className="mb-6">
                <DialogTitle>{popupTitle}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <input
                  type="file"
                  accept={acceptedFileTypes}
                  multiple={multiple}
                  onChange={handleFileSelection}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
                />
                {renderSelectedFiles()}
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="secondary" onClick={handleDialogClose}>
                    Close
                  </Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="text-gray-700 px-7 pb-4">
        <p className="text-sm text-gray-500">
          {selectedFiles.length > 0 ? selectedFiles.length + ' ' : 'no '}
          {selectedFiles.length > 1 ? 'files ' : 'file '}
          selected
        </p>
      </div>
    </Card>
  );
});

FileFormCard.displayName = 'FileFormCard';

/* =====================================================================
 *  2) The default component for ALL other form types (non-file)
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
      if (fetcher.state !== 'submitting') {
        setDialogOpen(false);
      }
    }, 500);
  };

  const showStatusMessage = localShowStatusMessage;

  // Extract from formState
  const { inputValue, repeatableInputValues } = formState;

  // Make sure we don't overwrite props.value incorrectly
  const value =
    props.formType === 'repeatable'
      ? Array.isArray(repeatableInputValues) && repeatableInputValues.length > 0
        ? repeatableInputValues
        : Array.isArray(props.value)
          ? props.value
          : []
      : inputValue && inputValue !== 'this is the about me section...'
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
    props.formType === 'repeatable' ? `repeatable_${props.repeatableFieldName}` : props.formType;

  const Template = FieldTemplates[templateKey];
  if (!Template) return null;

  const TemplateComponent = isFilled ? Template.FilledState : Template.EmptyState;

  // Prepare for rendering
  const prepareValueForRendering = () => {
    if (value === null || value === undefined) {
      return '' as FormStateType;
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
        isFilled ? 'bg-[#F1F0F3]' : 'bg-gray-100 border-gray-300 border-dashed'
      }`}
    >
      <div
        className={`flex flex-col relative ${
          props.formType === 'video' && value ? '' : 'pt-8 pb-6 pl-7 pr-10'
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
              <button type="button" className="absolute top-3 right-3" onClick={handleButtonClick}>
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
              {/* this is where i leave space betweeen the title and the content in the dialogs */}
              <DialogHeader className="mb-6">
                <DialogTitle>{props.popupTitle}</DialogTitle>
              </DialogHeader>
              <FormContent
                {...props}
                formState={formState}
                onSubmit={handleSubmit}
                fetcher={fetcher}
                showStatusMessage={showStatusMessage}
              />
              {/* {formSubmitted && (
                <DialogFooter className="mt-2">
                  <DialogClose asChild>
                    <Button variant="outline">Close</Button>
                  </DialogClose>
                </DialogFooter>
              )} */}
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
  if (props.formType === 'file') {
    return <FileFormCard {...props} />;
  }

  // Otherwise, use the default version from snippet #2:
  return <DefaultFormCard {...props} />;
}

export default GeneralizableFormCard;
