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

  const formContentRef = useRef<any>(null);
  const fetcher = useFetcher();

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
        }
      }
    }
  }, [value, fieldName]);

  // Load filesToDelete from localStorage on mount
  useEffect(() => {
    const storedFilesToDelete = localStorage.getItem(`${fieldName}-files-to-delete`);
    if (storedFilesToDelete) {
      try {
        const parsedFilesToDelete = JSON.parse(storedFilesToDelete);
        if (Array.isArray(parsedFilesToDelete) && parsedFilesToDelete.length > 0) {
          console.log('DEBUG - Loading filesToDelete from localStorage:', parsedFilesToDelete);
          setFilesToDelete(parsedFilesToDelete);
        }
      } catch (error) {
        console.error('DEBUG - Error loading filesToDelete from localStorage:', error);
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
        return updatedFiles;
      });
    }
  };

  // Handle file removal
  const handleFileRemove = (index: number) => {
    console.log('DEBUG - handleFileRemove called with index:', index);
    const fileToRemove = selectedFiles[index];
    console.log('DEBUG - File to remove:', {
      file: fileToRemove,
      name: fileToRemove.name,
      isServerFile: (fileToRemove as any).isServerFile,
      serverId: (fileToRemove as any).serverId,
      properties: Object.keys(fileToRemove),
    });

    // If it's a server file, add its ID to filesToDelete
    if ((fileToRemove as any).isServerFile && (fileToRemove as any).serverId) {
      const serverId = (fileToRemove as any).serverId;
      console.log('DEBUG - Adding server ID to filesToDelete:', serverId);
      setFilesToDelete(prev => {
        const newFilesToDelete = [...prev, serverId];
        console.log('DEBUG - Updated filesToDelete:', newFilesToDelete);

        // Store in localStorage
        try {
          localStorage.setItem(`${fieldName}-files-to-delete`, JSON.stringify(newFilesToDelete));
          console.log('DEBUG - Saved filesToDelete to localStorage');
        } catch (error) {
          console.error('DEBUG - Error saving filesToDelete to localStorage:', error);
        }

        return newFilesToDelete;
      });
    }

    setSelectedFiles(prevFiles => {
      const newFiles = prevFiles.filter((_, i) => i !== index);
      console.log('DEBUG - Updated selectedFiles:', newFiles);
      return newFiles;
    });
  };

  // Handle dialog close
  const handleDialogClose = () => {
    console.log('DEBUG - handleDialogClose called');
    setDialogOpen(false);

    // Clean up filesToDelete in localStorage
    try {
      localStorage.removeItem(`${fieldName}-files-to-delete`);
      console.log('DEBUG - Cleaned up filesToDelete from localStorage');
    } catch (error) {
      console.error('DEBUG - Error cleaning up filesToDelete from localStorage:', error);
    }

    // Reset state
    setFilesToDelete([]);
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
              <DialogHeader>
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
  if (props.formType === 'file') {
    return <FileFormCard {...props} />;
  }

  // Otherwise, use the default version from snippet #2:
  return <DefaultFormCard {...props} />;
}

export default GeneralizableFormCard;
