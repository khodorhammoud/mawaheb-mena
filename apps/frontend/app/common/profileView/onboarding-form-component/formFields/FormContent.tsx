import { Button } from '~/components/ui/button';
import { DialogFooter, DialogClose } from '~/components/ui/dialog';
import { FormFields } from './FormFields';
import RepeatableFields from './RepeatableFields';
import type { FormContentProps } from '../types';
import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { X } from 'lucide-react';
import { toast } from '~/components/hooks/use-toast';

import { useFetcher } from '@remix-run/react';

const FormContent = forwardRef<any, FormContentProps>(
  (
    {
      formType,
      formState,
      onSubmit,
      showStatusMessage,
      formName,
      fieldName,
      repeatableFieldName,
      showLoadingOnSubmit,
      ...props
    },
    ref
  ) => {
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

    // Track if files have been selected
    const [filesSelected, setFilesSelected] = useState<File[]>([]);
    const [formSubmitted, setFormSubmitted] = useState(false);
    const [filesToDelete, setFilesToDelete] = useState<number[]>([]);

    type MyFetcherData = {
      error?: { message: string };
      success?: { message: string };
    };

    const fetcher = useFetcher<MyFetcherData>();

    // Local storage key for saving files
    const getLocalStorageKey = () => `${formName}_${fieldName}_files`;

    // Function to save files to local storage
    const saveFilesToLocalStorage = (files: File[]) => {
      if (!files) return;

      const metadata = files.map(file => ({
        name: file.name,
        type: file.type,
        size: file.size,
        lastModified: file.lastModified,
        storageKey: (file as any).storageKey,
        serverId: (file as any).serverId,
        isServerFile: (file as any).isServerFile || false,
      }));

      localStorage.setItem(`${fieldName}-files`, JSON.stringify(metadata));
    };

    // Function to load file metadata from local storage
    const loadFilesFromLocalStorage = () => {
      try {
        const storedData = localStorage.getItem(`${fieldName}-files`);
        if (!storedData) return null;

        const metadata = JSON.parse(storedData);
        return metadata;
      } catch (error) {
        console.error('Error loading files from localStorage:', error);
        return null;
      }
    };

    // Prepare form data for submission
    const prepareFormData = (form: HTMLFormElement) => {
      const formData = new FormData(form);

      // Add target-updated field
      formData.append('target-updated', formName);

      // Handle repeatable fields
      if (formType === 'repeatable') {
        formData.append(repeatableFieldName, JSON.stringify(repeatableInputValues));

        // Append files
        repeatableInputFiles.forEach((file, index) => {
          if (file) {
            formData.append(`${repeatableFieldName}-attachment[${index}]`, file);
          }
        });
      }

      // For file type, append all selected files to formData
      if (formType === 'file') {
        // Clear any existing files with the same name
        formData.delete(fieldName);

        // Add all selected files
        filesSelected.forEach(file => {
          formData.append(fieldName, file);
        });

        // Add files to delete if any
        if (filesToDelete.length > 0) {
          formData.append('filesToDelete', JSON.stringify(filesToDelete));
        } else {
        }
      }

      return formData;
    };

    // Expose methods to parent component
    useImperativeHandle(ref, () => ({
      prepareFormData,
      filesSelected,
      setFilesSelected,
      formSubmitted,
      setFormSubmitted,
      // Add method to clear localStorage when form is submitted
      clearLocalStorage: () => {
        localStorage.removeItem(getLocalStorageKey());
      },
      // Add method to clear filesToDelete
      clearFilesToDelete: () => {
        setFilesToDelete([]);
      },
    }));

    // Update filesSelected when inputValue changes (for existing files)
    useEffect(() => {
      if (formType === 'file') {
        // If we have existing files from the server in props.value
        if (
          props.value &&
          typeof props.value === 'object' &&
          'attachments' in props.value &&
          filesSelected.length === 0 // Only process if we don't already have files
        ) {
          const attachments = (props.value as any).attachments;
          if (attachments && typeof attachments === 'object' && fieldName in attachments) {
            const existingFiles = attachments[fieldName];
            if (Array.isArray(existingFiles) && existingFiles.length > 0) {
              // Create File objects from the server data if possible
              const fileObjects = existingFiles
                .filter(file => !filesSelected.some(f => f.name === file.name))
                .map(file => {
                  try {
                    // Create a File object with the actual size from the server
                    const fileObj = new File(
                      [
                        new Blob(
                          [new Uint8Array(new ArrayBuffer(file.size || 143 * 1024)).fill(1)],
                          { type: file.type || 'application/octet-stream' }
                        ),
                      ],
                      file.name,
                      {
                        type: file.type || 'application/octet-stream',
                        lastModified: file.lastModified || Date.now(),
                      }
                    );

                    // Store both the storage key and attachment ID
                    if (file.storage) {
                      (fileObj as any).storageKey = file.storage.key;
                      (fileObj as any).serverId = file.attachmentId; // Try to get the actual attachment ID
                      (fileObj as any).isServerFile = true;
                    }

                    return fileObj;
                  } catch (e) {
                    console.error('Error creating File object:', e);
                    return null;
                  }
                })
                .filter(Boolean);

              if (fileObjects.length > 0) {
                setFilesSelected(fileObjects);
              }
            }
          }
        }

        // Then check if we have files in localStorage
        const storedFileMetadata = loadFilesFromLocalStorage();
        if (storedFileMetadata && storedFileMetadata.length > 0) {
          // Create File objects from metadata
          const fileObjects = storedFileMetadata
            .map(meta => {
              try {
                const file = new File(
                  [
                    new Blob([new ArrayBuffer(meta.size || 143 * 1024)], {
                      type: meta.type || 'application/octet-stream',
                    }),
                  ],
                  meta.name,
                  {
                    type: meta.type || 'application/octet-stream',
                    lastModified: meta.lastModified || Date.now(),
                  }
                );
                // Preserve the ID and server status if they exist
                if (meta.id) {
                  (file as any).serverId = meta.id;
                  (file as any).isServerFile = true;
                }
                return file;
              } catch (e) {
                console.error('Error creating File object from localStorage:', e);
                return null;
              }
            })
            .filter(Boolean);

          if (fileObjects.length > 0) {
            setFilesSelected(prev => {
              // Combine with existing files, avoiding duplicates
              const combined = [...prev];
              fileObjects.forEach(file => {
                if (!combined.some(f => f.name === file.name)) {
                  combined.push(file);
                }
              });
              return combined;
            });
          }
        }
      }
    }, [formType, props.value, fieldName]);

    // Add effect to handle form submission
    useEffect(() => {
      if (formSubmitted) {
        // Clear localStorage when form is submitted
        localStorage.removeItem(getLocalStorageKey());
      }
    }, [formSubmitted]);

    // Handle form submission
    const handleFormSubmit = (e: React.FormEvent) => {
      e.preventDefault();

      // For file uploads, validate that at least one file is selected
      if (formType === 'file' && filesSelected.length === 0 && !(inputValue instanceof File)) {
        alert('Please select at least one file before saving.');
        return;
      }

      const formData = prepareFormData(e.target as HTMLFormElement);

      for (let [key, value] of formData.entries()) {
        console.log('formData key:', key, '| value:', value);
      }

      // Mark form as submitted
      setFormSubmitted(true);

      // Pass the formData to the onSubmit callback
      onSubmit(e, formData);
    };

    const handleIncrement = (step: number) => {
      const currentValue = inputValue;

      if (typeof currentValue === 'number') {
        // Increment the number
        const newValue = currentValue + step;
        // Only submit for increment type, not for file uploads
        if (formType === 'increment') {
          fetcher.submit(
            {
              'target-updated': formName,
              [fieldName]: newValue.toString(),
            },
            { method: 'post' }
          );
        }
        setInputValue(newValue);
      } else if (currentValue === null) {
        // If the current value is null, start from the step value
        setInputValue(step);
      } else if (currentValue instanceof File) {
        // If it's a File, keep it unchanged
        setInputValue(currentValue);
      } else {
        // Handle unexpected types (like strings)
        setInputValue(currentValue);
      }
    };

    // Numeric validation handler
    const handleNumberInput = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      const numericValue = value.replace(/[^0-9.]/g, ''); // Remove non-numeric characters
      setInputValue(numericValue);
    };

    // Handle file input change without auto-submission
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        // Convert FileList to array
        const fileArray = Array.from(files);

        // Add new files to existing files, avoiding duplicates by name
        const newFiles = fileArray.filter(
          newFile => !filesSelected.some(existingFile => existingFile.name === newFile.name)
        );

        if (newFiles.length > 0) {
          // Update state with all selected files
          setFilesSelected(prev => {
            const updated = [...prev, ...newFiles];
            // Save to localStorage
            saveFilesToLocalStorage(updated);
            return updated;
          });

          // Set the first new file as inputValue for backward compatibility
          setInputValue(newFiles[0]);
        }

        // Prevent form submission
        e.stopPropagation();
      }
    };

    // Remove a file from the selected files
    const handleRemoveFile = (file: File) => {
      const fileId = (file as any).serverId;

      if (fileId) {
        setFilesToDelete(prev => {
          const newFilesToDelete = [...prev, fileId];
          return newFilesToDelete;
        });
      }

      setFilesSelected(prev => {
        const updatedFiles = prev.filter(f => f.name !== file.name);
        // Update localStorage with remaining files
        saveFilesToLocalStorage(updatedFiles);
        return updatedFiles;
      });

      // Update inputValue if we removed the current inputValue
      if (filesSelected.length > 1) {
        setInputValue(filesSelected[0]);
      } else {
        setInputValue(null);
      }
    };

    // Determine if the Save button should be disabled
    const isSaveButtonDisabled = () => {
      if (showLoadingOnSubmit && fetcher.state === 'submitting') {
        return true;
      }

      // For file inputs, disable the Save button if no file is selected
      if (formType === 'file' && filesSelected.length === 0 && !(inputValue instanceof File)) {
        return true;
      }

      return false;
    };

    // Safely render form field based on type
    const renderFormField = () => {
      if (formType === 'repeatable') {
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
          formType === 'file'
            ? handleFileChange
            : e => setInputValue(formType === 'number' ? Number(e.target.value) : e.target.value),
        handleIncrement: handleIncrement,
        name: fieldName,
        props,
      });
    };

    // Render selected files
    const renderSelectedFiles = () => {
      if (formType !== 'file' || filesSelected.length === 0) return null;

      return (
        <div className="mt-4 ">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Selected Files:</h3>
          <div className="space-y-2">
            {filesSelected.map((file, index) => (
              <div
                key={index}
                className="flex items-center p-2 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex-shrink-0 mr-3">
                  {file.type.includes('image') ? (
                    <svg
                      className="w-6 h-6 text-blue-500"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  ) : file.type.includes('pdf') ? (
                    <svg
                      className="w-6 h-6 text-red-500"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-6 h-6 text-gray-500"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                  <p className="text-xs text-gray-500">{Math.round(file.size / 1024)} KB</p>
                </div>
                <button
                  type="button"
                  className="ml-2 text-red-500 hover:text-red-700"
                  onClick={() => handleRemoveFile(file)}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      );
    };

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
        const successMessage =
          typeof fetcher.data.success === 'object'
            ? fetcher.data.success.message
            : 'Successfully saved!';

        return (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4 mt-2">
            <span className="block sm:inline">{successMessage}</span>
          </div>
        );
      }
    };

    return (
      <div className="">
        {/* this is where i leave space betweeen the title and the content in the dialogs */}
        <fetcher.Form
          method="post"
          className="space-y-6 mt-2"
          onSubmit={handleFormSubmit}
          encType={
            formType === 'repeatable' || formType === 'file' ? 'multipart/form-data' : undefined
          }
        >
          {renderStatusMessages()}

          {renderFormField()}

          {renderSelectedFiles()}

          {/* Only show buttons for non-file types or non-identification forms */}
          {formType !== 'increment' && formType !== 'file' && (
            <DialogFooter>
              <div className="flex justify-end gap-2">
                <Button
                  type="submit"
                  className="text-white py-4 px-10 rounded-xl bg-primaryColor font-medium not-active-gradient focus:outline-none
    focus-visible:ring-0
    focus-visible:outline-none
    focus:ring-0
    focus:border-none
    focus-visible:border-none
    focus-visible:ring-offset-0"
                  disabled={isSaveButtonDisabled()}
                >
                  {showLoadingOnSubmit && fetcher.state === 'submitting' ? 'Saving...' : 'Save'}
                </Button>
                {/* {formSubmitted && fetcher.state !== 'submitting' && (
                  <DialogClose asChild>
                  <Button variant="outline">Close</Button>
                  </DialogClose>
                )} */}
              </div>
            </DialogFooter>
          )}

          {/* For file types, just show a close button */}
          {formType === 'file' && (
            <DialogFooter>
              <div className="flex justify-end gap-2">
                <Button
                  type="submit"
                  className="text-white py-4 px-10 rounded-xl bg-primaryColor font-medium not-active-gradient focus:outline-none
    focus-visible:ring-0
    focus-visible:outline-none
    focus:ring-0
    focus:border-none
    focus-visible:border-none
    focus-visible:ring-offset-0"
                  disabled={isSaveButtonDisabled()}
                >
                  {showLoadingOnSubmit && fetcher.state === 'submitting' ? 'Saving...' : 'Save'}
                </Button>
                <DialogClose asChild>
                  <Button
                    variant="outline"
                    className="focus:outline-none
    focus-visible:ring-0
    focus-visible:outline-none
    focus:ring-0
    focus:border-none
    focus-visible:border-none
    focus-visible:ring-offset-0"
                  >
                    Close
                  </Button>
                </DialogClose>
              </div>
            </DialogFooter>
          )}
        </fetcher.Form>
      </div>
    );
  }
);

FormContent.displayName = 'FormContent';

// Export a function to get form data from the component
export const getFormData = (formContent: any, form: HTMLFormElement) => {
  if (!formContent) return null;
  return formContent.prepareFormData(form);
};

export default FormContent;
