import { Button } from '~/components/ui/button';
import { DialogFooter, DialogClose } from '~/components/ui/dialog';
import { FormFields } from './FormFields';
import RepeatableFields from './RepeatableFields';
import type { FormContentProps } from '../types';
import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { X } from 'lucide-react';

const FormContent = forwardRef<any, FormContentProps>(
  (
    {
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

    // Debug logging for filesToDelete
    useEffect(() => {
      console.log('DEBUG - filesToDelete state updated:', filesToDelete);
    }, [filesToDelete]);

    // Local storage key for saving files
    const getLocalStorageKey = () => `${formName}_${fieldName}_files`;

    // Function to save files to local storage
    const saveFilesToLocalStorage = (files: File[]) => {
      if (!files) return;

      const metadata = files.map(file => {
        // Try multiple ways to get serverId
        let serverId = (file as any).directServerId || (file as any).serverId;

        // If still undefined, check property descriptors
        if (serverId === undefined) {
          const descriptors = Object.getOwnPropertyDescriptors(file);
          if (descriptors.serverId) {
            serverId = descriptors.serverId.value;
          }
        }

        console.log(
          `DEBUG - saveFilesToLocalStorage - File ${file.name} serverId:`,
          serverId,
          'typeof:',
          typeof serverId
        );

        return {
          name: file.name,
          type: file.type,
          size: file.size,
          lastModified: file.lastModified,
          storageKey: (file as any).storageKey,
          serverId: serverId,
          isServerFile: (file as any).isServerFile || false,
        };
      });

      console.log('DEBUG - saveFilesToLocalStorage - Saving metadata:', metadata);
      console.log('DEBUG - saveFilesToLocalStorage - JSON string:', JSON.stringify(metadata));
      localStorage.setItem(`${fieldName}-files`, JSON.stringify(metadata));

      // Immediately read back to verify
      const readBack = localStorage.getItem(`${fieldName}-files`);
      console.log('DEBUG - saveFilesToLocalStorage - Read back raw:', readBack);
      try {
        const parsed = JSON.parse(readBack || '[]');
        console.log('DEBUG - saveFilesToLocalStorage - Read back parsed:', parsed);
      } catch (e) {
        console.error('DEBUG - saveFilesToLocalStorage - Parse error:', e);
      }
    };

    // Function to load file metadata from local storage
    const loadFilesFromLocalStorage = () => {
      try {
        const storedData = localStorage.getItem(`${fieldName}-files`);
        console.log('DEBUG - loadFilesFromLocalStorage - Raw data from localStorage:', storedData);
        if (!storedData) return null;

        const metadata = JSON.parse(storedData);
        console.log('DEBUG - loadFilesFromLocalStorage - Parsed metadata:', metadata);

        // Check each item's serverId
        if (Array.isArray(metadata)) {
          metadata.forEach((item, index) => {
            console.log(
              `DEBUG - loadFilesFromLocalStorage - Item ${index} serverId:`,
              item.serverId,
              'typeof:',
              typeof item.serverId
            );
          });
        }

        return metadata;
      } catch (error) {
        console.error('Error loading files from localStorage:', error);
        return null;
      }
    };

    // Clear a specific file
    const handleRemoveFile = (file: File) => {
      console.log('DEBUG - handleRemoveFile - Full file object:', file);
      console.log('DEBUG - handleRemoveFile - Raw direct access:', {
        directServerId: (file as any).directServerId,
        serverId: (file as any).serverId,
        enumerable: Object.keys(file),
      });

      // First, try to get the serverId from various possible locations
      let fileId = (file as any).directServerId || (file as any).serverId;

      // If that fails, check the property descriptors (in case it's non-enumerable)
      if (fileId === undefined) {
        const descriptors = Object.getOwnPropertyDescriptors(file);
        if (descriptors.serverId) {
          fileId = descriptors.serverId.value;
          console.log('DEBUG - handleRemoveFile - Found serverId in property descriptors:', fileId);
        }
      }

      // Last resort: find the file by name in props.value attachments
      if (
        fileId === undefined &&
        props.value &&
        typeof props.value === 'object' &&
        'attachments' in props.value
      ) {
        const attachments = (props.value as any).attachments;
        if (attachments && typeof attachments === 'object' && fieldName in attachments) {
          const existingFiles = attachments[fieldName];
          if (Array.isArray(existingFiles)) {
            // Try to find a matching file by name
            const matchingServerFile = existingFiles.find(f => f.name === file.name);
            if (matchingServerFile) {
              fileId = matchingServerFile.serverId || matchingServerFile.id;
              console.log('DEBUG - handleRemoveFile - Found matching server file with ID:', fileId);
            }
          }
        }
      }

      console.log('DEBUG - handleRemoveFile - FINAL File ID for deletion:', fileId);

      if (fileId) {
        setFilesToDelete(prev => {
          const newFilesToDelete = [...prev, fileId];
          console.log('DEBUG - handleRemoveFile - Updated filesToDelete:', newFilesToDelete);

          // Store the updated filesToDelete in localStorage
          try {
            localStorage.setItem(`${fieldName}-files-to-delete`, JSON.stringify(newFilesToDelete));
            console.log('DEBUG - handleRemoveFile - Saved filesToDelete to localStorage');
          } catch (error) {
            console.error('DEBUG - Error saving filesToDelete to localStorage:', error);
          }

          return newFilesToDelete;
        });
      } else {
        console.log('DEBUG - handleRemoveFile - No serverId found, not adding to filesToDelete');
      }

      // Remove file from UI and local state
      setFilesSelected(prev => {
        const updatedFiles = prev.filter(f => f.name !== file.name);
        // Update localStorage with remaining files
        saveFilesToLocalStorage(updatedFiles);
        return updatedFiles;
      });
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
          console.log('DEBUG - prepareFormData - Adding filesToDelete to formData:', filesToDelete);
          console.log('DEBUG - prepareFormData - filesToDelete type:', typeof filesToDelete);
          console.log(
            'DEBUG - prepareFormData - filesToDelete JSON:',
            JSON.stringify(filesToDelete)
          );
          formData.append('filesToDelete', JSON.stringify(filesToDelete));

          // Log all form data entries for verification
          console.log('DEBUG - prepareFormData - All form data entries:');
          for (const [key, value] of formData.entries()) {
            console.log(`  ${key}:`, value);
          }
        } else {
          console.log('DEBUG - prepareFormData - No files to delete');
        }
      }

      return formData;
    };

    // Expose methods to parent component
    useImperativeHandle(ref, () => ({
      prepareFormData,
      filesSelected,
      setFilesSelected: (files: File[]) => {
        setFilesSelected(files);
        // Save files to localStorage when they're set
        saveFilesToLocalStorage(files);
      },
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

    // Handle file selection from the file input
    const handleFileSelection = (newFiles: FileList | null) => {
      if (!newFiles || newFiles.length === 0) return;

      const fileArray = Array.from(newFiles);

      // Combine with existing files, avoiding duplicates by name
      const updatedFiles = [...filesSelected];

      fileArray.forEach(file => {
        // Check if file with same name already exists
        const existingIndex = updatedFiles.findIndex(f => f.name === file.name);
        if (existingIndex >= 0) {
          // Replace existing file
          updatedFiles[existingIndex] = file;
        } else {
          // Add new file
          updatedFiles.push(file);
        }
      });

      setFilesSelected(updatedFiles);
      saveFilesToLocalStorage(updatedFiles);
    };

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
          console.log(
            'DEBUG - useEffect - Found attachments in props.value:',
            JSON.stringify(attachments, null, 2)
          );
          if (attachments && typeof attachments === 'object' && fieldName in attachments) {
            const existingFiles = attachments[fieldName];
            console.log(
              'DEBUG - useEffect - Found existing files:',
              JSON.stringify(existingFiles, null, 2)
            );
            if (Array.isArray(existingFiles) && existingFiles.length > 0) {
              // Create File objects from the server data if possible
              const fileObjects = existingFiles
                .filter(file => !filesSelected.some(f => f.name === file.name))
                .map(file => {
                  try {
                    console.log(
                      'DEBUG - Processing server file (full):',
                      JSON.stringify(file, null, 2)
                    );
                    console.log('DEBUG - File storage object:', file.storage);

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

                    // Find server ID from multiple possible sources
                    const serverId = file.serverId || file.attachmentId || file.id;
                    console.log('DEBUG - Extracted server ID:', serverId);

                    // Add server properties directly to the file object
                    Object.defineProperties(fileObj, {
                      serverId: {
                        value: serverId,
                        writable: true,
                        enumerable: true,
                      },
                      isServerFile: {
                        value: true,
                        writable: true,
                        enumerable: true,
                      },
                      storageKey: {
                        value: file.storage?.key,
                        writable: true,
                        enumerable: true,
                      },
                    });

                    console.log('DEBUG - Created file object with properties:', {
                      name: fileObj.name,
                      serverId: (fileObj as any).serverId,
                      isServerFile: (fileObj as any).isServerFile,
                      storageKey: (fileObj as any).storageKey,
                    });

                    return fileObj;
                  } catch (e) {
                    console.error('Error creating File object:', e);
                    return null;
                  }
                })
                .filter(Boolean);

              if (fileObjects.length > 0) {
                console.log(
                  'DEBUG - useEffect - Setting file objects with server IDs:',
                  fileObjects.map(f => ({
                    name: f.name,
                    storageKey: (f as any).storageKey,
                    serverId: (f as any).serverId,
                    isServerFile: (f as any).isServerFile,
                  }))
                );
                setFilesSelected(fileObjects);
              }
            }
          }
        }

        // Then check if we have files in localStorage
        const storedFileMetadata = loadFilesFromLocalStorage();
        if (storedFileMetadata && storedFileMetadata.length > 0) {
          console.log('DEBUG - useEffect - Found stored file metadata:', storedFileMetadata);
          // Create File objects from metadata
          const fileObjects = storedFileMetadata
            .map(meta => {
              try {
                console.log('DEBUG - Creating file from localStorage metadata:', meta);
                console.log(
                  'DEBUG - Meta serverId:',
                  meta.serverId,
                  'typeof:',
                  typeof meta.serverId
                );

                // Try to convert string serverId to number if needed
                let serverId = meta.serverId;
                if (typeof serverId === 'string' && !isNaN(Number(serverId))) {
                  serverId = Number(serverId);
                  console.log('DEBUG - Converted string serverId to number:', serverId);
                }

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

                // Use direct property assignment first (for debugging)
                (file as any).directServerId = serverId;
                (file as any).directIsServerFile = meta.isServerFile || false;
                (file as any).directStorageKey = meta.storageKey;

                // Then use Object.defineProperties as the proper way
                Object.defineProperties(file, {
                  serverId: {
                    value: serverId,
                    writable: true,
                    enumerable: true,
                    configurable: true,
                  },
                  isServerFile: {
                    value: meta.isServerFile || false,
                    writable: true,
                    enumerable: true,
                    configurable: true,
                  },
                  storageKey: {
                    value: meta.storageKey,
                    writable: true,
                    enumerable: true,
                    configurable: true,
                  },
                });

                // Verify properties were correctly set
                console.log('DEBUG - Created file from localStorage with properties:', {
                  name: file.name,
                  directServerId: (file as any).directServerId,
                  serverId: (file as any).serverId,
                  directIsServerFile: (file as any).directIsServerFile,
                  isServerFile: (file as any).isServerFile,
                  directStorageKey: (file as any).directStorageKey,
                  storageKey: (file as any).storageKey,
                  descriptors: Object.getOwnPropertyDescriptors(file),
                });

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
        localStorage.removeItem(`${fieldName}-files-to-delete`);
        console.log('DEBUG - Form submitted, cleared localStorage');
      }
    }, [formSubmitted, fieldName, getLocalStorageKey]);

    // Load filesToDelete from localStorage on component mount
    useEffect(() => {
      try {
        const storedFilesToDelete = localStorage.getItem(`${fieldName}-files-to-delete`);
        if (storedFilesToDelete) {
          const parsedFilesToDelete = JSON.parse(storedFilesToDelete);
          if (Array.isArray(parsedFilesToDelete) && parsedFilesToDelete.length > 0) {
            console.log('DEBUG - Loading filesToDelete from localStorage:', parsedFilesToDelete);
            setFilesToDelete(parsedFilesToDelete);
          }
        }
      } catch (error) {
        console.error('DEBUG - Error loading filesToDelete from localStorage:', error);
      }
    }, [fieldName]);

    // Handle file input change
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFileSelection(e.target.files);
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
        return (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4 mt-2">
            <span className="block sm:inline">Successfully saved!</span>
          </div>
        );
      }
    };

    // Render selected files
    const renderSelectedFiles = () => {
      if (formType !== 'file' || filesSelected.length === 0) return null;

      return (
        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Selected Files:</h3>
          <div className="space-y-2">
            {filesSelected.map((file, index) => {
              // Get all property descriptors to debug
              const descriptors = Object.getOwnPropertyDescriptors(file);
              const serverId = descriptors.serverId?.value;

              console.log(`DEBUG - File ${index} properties:`, {
                name: file.name,
                descriptors: Object.entries(descriptors).map(([key, desc]) => ({
                  key,
                  value: desc.value,
                  enumerable: desc.enumerable,
                })),
              });

              return (
                <div
                  key={index}
                  className={`flex items-center justify-between p-2 rounded-md ${serverId ? 'bg-blue-50' : 'bg-gray-50'}`}
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-700">{file.name}</span>
                    <span className="text-xs text-gray-500">
                      {serverId ? `Server File (ID: ${serverId})` : 'New file (will be uploaded)'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(file)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-100 p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-red-300"
                    aria-label={`Remove ${file.name}`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      );
    };

    return (
      <div className="">
        <form
          method="post"
          className="space-y-6"
          onSubmit={e => {
            e.preventDefault();
            onSubmit(e, prepareFormData(e.target as HTMLFormElement));
          }}
          encType={
            formType === 'repeatable' || formType === 'file' ? 'multipart/form-data' : undefined
          }
          onChange={e => {
            const target = e.target as HTMLInputElement;
            if (target.type === 'file') {
              handleFileChange(e as unknown as React.ChangeEvent<HTMLInputElement>);
            }
          }}
        >
          {renderStatusMessages()}

          {formType === 'repeatable' ? (
            <RepeatableFields
              fieldName={repeatableFieldName || ''}
              values={repeatableInputValues}
              onAdd={handleAddRepeatableField}
              onRemove={handleRemoveRepeatableField}
              onDataChange={handleDataChange}
              expandedIndex={expandedIndex}
              onToggleExpand={setExpandedIndex}
              {...props}
            />
          ) : (
            <div className="form-field-container">
              {formType === 'file' ? (
                <input
                  type="file"
                  name={fieldName}
                  onChange={handleFileChange}
                  multiple={props.multiple}
                  accept={props.acceptedFileTypes}
                />
              ) : formType === 'textArea' ? (
                <textarea
                  name={fieldName}
                  value={inputValue as string}
                  onChange={e => setInputValue(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md"
                />
              ) : (
                <input
                  type={formType === 'number' ? 'number' : 'text'}
                  name={fieldName}
                  value={inputValue as string}
                  onChange={e => setInputValue(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md"
                />
              )}
            </div>
          )}

          {renderSelectedFiles()}

          {/* Only show buttons for non-file types or non-identification forms */}
          {formType !== 'increment' && formType !== 'file' && (
            <DialogFooter>
              <div className="flex justify-end gap-2">
                <Button
                  type="submit"
                  className="text-white py-4 px-10 rounded-xl bg-primaryColor font-medium not-active-gradient"
                  disabled={fetcher.state === 'submitting' && showLoadingOnSubmit}
                >
                  {fetcher.state === 'submitting' && showLoadingOnSubmit ? 'Saving...' : 'Save'}
                </Button>
                {formSubmitted && fetcher.state !== 'submitting' && (
                  <DialogClose asChild>
                    <Button variant="outline">Close</Button>
                  </DialogClose>
                )}
              </div>
            </DialogFooter>
          )}

          {/* For file types, just show a close button */}
          {formType === 'file' && (
            <DialogFooter>
              <div className="flex justify-end gap-2">
                <Button
                  type="submit"
                  className="text-white py-4 px-10 rounded-xl bg-primaryColor font-medium not-active-gradient"
                  disabled={fetcher.state === 'submitting' && showLoadingOnSubmit}
                >
                  {fetcher.state === 'submitting' && showLoadingOnSubmit ? 'Saving...' : 'Save'}
                </Button>
                <DialogClose asChild>
                  <Button variant="outline">Close</Button>
                </DialogClose>
              </div>
            </DialogFooter>
          )}
        </form>
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
