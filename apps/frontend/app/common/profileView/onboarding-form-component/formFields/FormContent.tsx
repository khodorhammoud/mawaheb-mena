import { Button } from "~/components/ui/button";
import { DialogFooter, DialogClose } from "~/components/ui/dialog";
import { FormFields } from "./FormFields";
import RepeatableFields from "./RepeatableFields";
import type { FormContentProps } from "../types";
import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { X } from "lucide-react";

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

    // Local storage key for saving files
    const getLocalStorageKey = () => `${formName}_${fieldName}_files`;

    // Function to save files to local storage
    const saveFilesToLocalStorage = (files: File[]) => {
      if (!files) return;

      const metadata = files.map((file) => ({
        name: file.name,
        type: file.type,
        size: file.size,
        lastModified: file.lastModified,
        storageKey: (file as any).storageKey,
        serverId: (file as any).serverId,
        isServerFile: (file as any).isServerFile || false,
      }));

      console.log(
        "DEBUG - saveFilesToLocalStorage - Saving metadata:",
        metadata
      );
      localStorage.setItem(`${fieldName}-files`, JSON.stringify(metadata));
    };

    // Function to load file metadata from local storage
    const loadFilesFromLocalStorage = () => {
      try {
        const storedData = localStorage.getItem(`${fieldName}-files`);
        if (!storedData) return null;

        const metadata = JSON.parse(storedData);
        console.log(
          "DEBUG - loadFilesFromLocalStorage - Loaded metadata:",
          metadata
        );
        return metadata;
      } catch (error) {
        console.error("Error loading files from localStorage:", error);
        return null;
      }
    };

    // Clear a specific file
    const handleRemoveFile = (file: File) => {
      console.log("DEBUG - handleRemoveFile - File to remove:", {
        name: file.name,
        storageKey: (file as any).storageKey,
        serverId: (file as any).serverId,
        isServerFile: (file as any).isServerFile,
      });

      const fileId = (file as any).serverId;
      console.log("DEBUG - handleRemoveFile - File ID:", fileId);

      if (fileId) {
        setFilesToDelete((prev) => {
          const newFilesToDelete = [...prev, fileId];
          console.log(
            "DEBUG - handleRemoveFile - Updated filesToDelete:",
            newFilesToDelete
          );
          return newFilesToDelete;
        });
      }

      setFilesSelected((prev) => {
        const updatedFiles = prev.filter((f) => f.name !== file.name);
        // Update localStorage with remaining files
        saveFilesToLocalStorage(updatedFiles);
        return updatedFiles;
      });
    };

    // Prepare form data for submission
    const prepareFormData = (form: HTMLFormElement) => {
      const formData = new FormData(form);

      // Add target-updated field
      formData.append("target-updated", formName);

      // Handle repeatable fields
      if (formType === "repeatable") {
        formData.append(
          repeatableFieldName,
          JSON.stringify(repeatableInputValues)
        );

        // Append files
        repeatableInputFiles.forEach((file, index) => {
          if (file) {
            formData.append(
              `${repeatableFieldName}-attachment[${index}]`,
              file
            );
          }
        });
      }

      // For file type, append all selected files to formData
      if (formType === "file") {
        // Clear any existing files with the same name
        formData.delete(fieldName);

        // Add all selected files
        filesSelected.forEach((file) => {
          formData.append(fieldName, file);
        });

        // Add files to delete if any
        if (filesToDelete.length > 0) {
          console.log(
            "DEBUG - prepareFormData - Adding filesToDelete to formData:",
            filesToDelete
          );
          formData.append("filesToDelete", JSON.stringify(filesToDelete));
        } else {
          console.log("DEBUG - prepareFormData - No files to delete");
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

      fileArray.forEach((file) => {
        // Check if file with same name already exists
        const existingIndex = updatedFiles.findIndex(
          (f) => f.name === file.name
        );
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
      if (formType === "file") {
        // If we have existing files from the server in props.value
        if (
          props.value &&
          typeof props.value === "object" &&
          "attachments" in props.value &&
          filesSelected.length === 0 // Only process if we don't already have files
        ) {
          const attachments = (props.value as any).attachments;
          console.log(
            "DEBUG - useEffect - Found attachments in props.value:",
            JSON.stringify(attachments, null, 2)
          );
          if (
            attachments &&
            typeof attachments === "object" &&
            fieldName in attachments
          ) {
            const existingFiles = attachments[fieldName];
            console.log(
              "DEBUG - useEffect - Found existing files:",
              JSON.stringify(existingFiles, null, 2)
            );
            if (Array.isArray(existingFiles) && existingFiles.length > 0) {
              // Create File objects from the server data if possible
              const fileObjects = existingFiles
                .filter(
                  (file) => !filesSelected.some((f) => f.name === file.name)
                )
                .map((file) => {
                  try {
                    console.log(
                      "DEBUG - Processing server file (full):",
                      JSON.stringify(file, null, 2)
                    );
                    console.log("DEBUG - File storage object:", file.storage);

                    // Create a File object with the actual size from the server
                    const fileObj = new File(
                      [
                        new Blob(
                          [
                            new Uint8Array(
                              new ArrayBuffer(file.size || 143 * 1024)
                            ).fill(1),
                          ],
                          { type: file.type || "application/octet-stream" }
                        ),
                      ],
                      file.name,
                      {
                        type: file.type || "application/octet-stream",
                        lastModified: file.lastModified || Date.now(),
                      }
                    );

                    // Store both the storage key and attachment ID
                    if (file.storage) {
                      (fileObj as any).storageKey = file.storage.key;
                      (fileObj as any).serverId = file.attachmentId; // Try to get the actual attachment ID
                      (fileObj as any).isServerFile = true;
                      console.log("DEBUG - useEffect - File details:", {
                        name: file.name,
                        storageKey: file.storage.key,
                        attachmentId: file.attachmentId,
                        fullFile: file,
                      });
                    }

                    return fileObj;
                  } catch (e) {
                    console.error("Error creating File object:", e);
                    return null;
                  }
                })
                .filter(Boolean);

              if (fileObjects.length > 0) {
                console.log(
                  "DEBUG - useEffect - Setting file objects with server IDs:",
                  fileObjects.map((f) => ({
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
          console.log(
            "DEBUG - useEffect - Found stored file metadata:",
            storedFileMetadata
          );
          // Create File objects from metadata
          const fileObjects = storedFileMetadata
            .map((meta) => {
              try {
                const file = new File(
                  [
                    new Blob([new ArrayBuffer(meta.size || 143 * 1024)], {
                      type: meta.type || "application/octet-stream",
                    }),
                  ],
                  meta.name,
                  {
                    type: meta.type || "application/octet-stream",
                    lastModified: meta.lastModified || Date.now(),
                  }
                );
                // Preserve the ID and server status if they exist
                if (meta.id) {
                  (file as any).serverId = meta.id;
                  (file as any).isServerFile = true;
                  console.log(
                    "DEBUG - useEffect - Preserved server ID from localStorage:",
                    meta.id
                  );
                }
                return file;
              } catch (e) {
                console.error(
                  "Error creating File object from localStorage:",
                  e
                );
                return null;
              }
            })
            .filter(Boolean);

          if (fileObjects.length > 0) {
            setFilesSelected((prev) => {
              // Combine with existing files, avoiding duplicates
              const combined = [...prev];
              fileObjects.forEach((file) => {
                if (!combined.some((f) => f.name === file.name)) {
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
            <span className="block sm:inline">
              {fetcher.data.error.message}
            </span>
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
      if (formType !== "file" || filesSelected.length === 0) return null;

      return (
        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            Selected Files:
          </h3>
          <div className="space-y-2">
            {filesSelected.map((file, index) => (
              <div key={index} className="flex items-center mt-2">
                <span className="text-sm text-gray-600">{file.name}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveFile(file)}
                  className="ml-2 text-red-500 hover:text-red-700 focus:outline-none"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      );
    };

    return (
      <div className="">
        <form
          method="post"
          className="space-y-6"
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit(e, prepareFormData(e.target as HTMLFormElement));
          }}
          encType={
            formType === "repeatable" || formType === "file"
              ? "multipart/form-data"
              : undefined
          }
          onChange={(e) => {
            const target = e.target as HTMLInputElement;
            if (target.type === "file") {
              handleFileChange(
                e as unknown as React.ChangeEvent<HTMLInputElement>
              );
            }
          }}
        >
          {renderStatusMessages()}

          {formType === "repeatable" ? (
            <RepeatableFields
              fieldName={repeatableFieldName || ""}
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
              {formType === "file" ? (
                <input
                  type="file"
                  name={fieldName}
                  onChange={handleFileChange}
                  multiple={props.multiple}
                  accept={props.acceptedFileTypes}
                />
              ) : formType === "textArea" ? (
                <textarea
                  name={fieldName}
                  value={inputValue as string}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md"
                />
              ) : (
                <input
                  type={formType === "number" ? "number" : "text"}
                  name={fieldName}
                  value={inputValue as string}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md"
                />
              )}
            </div>
          )}

          {renderSelectedFiles()}

          {/* Only show buttons for non-file types or non-identification forms */}
          {formType !== "increment" && formType !== "file" && (
            <DialogFooter>
              <div className="flex justify-end gap-2">
                <Button
                  type="submit"
                  className="text-white py-4 px-10 rounded-xl bg-primaryColor font-medium not-active-gradient"
                  disabled={
                    fetcher.state === "submitting" && showLoadingOnSubmit
                  }
                >
                  {fetcher.state === "submitting" && showLoadingOnSubmit
                    ? "Saving..."
                    : "Save"}
                </Button>
                {formSubmitted && fetcher.state !== "submitting" && (
                  <DialogClose asChild>
                    <Button variant="outline">Close</Button>
                  </DialogClose>
                )}
              </div>
            </DialogFooter>
          )}

          {/* For file types, just show a close button */}
          {formType === "file" && (
            <DialogFooter>
              <div className="flex justify-end gap-2">
                <Button
                  type="submit"
                  className="text-white py-4 px-10 rounded-xl bg-primaryColor font-medium not-active-gradient"
                  disabled={
                    fetcher.state === "submitting" && showLoadingOnSubmit
                  }
                >
                  {fetcher.state === "submitting" && showLoadingOnSubmit
                    ? "Saving..."
                    : "Save"}
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

FormContent.displayName = "FormContent";

// Export a function to get form data from the component
export const getFormData = (formContent: any, form: HTMLFormElement) => {
  if (!formContent) return null;
  return formContent.prepareFormData(form);
};

export default FormContent;
