import React, { useState } from 'react';
import { FaUpload } from 'react-icons/fa';

interface FileUploadProps {
  onFileChange: (files: File[] | null) => void; // Support multiple files
  acceptedFileTypes?: string; // e.g., "image/*,application/pdf,video/*"
  maxFileSize?: number; // Size in MB
}

export default function FileUpload({
  onFileChange,
  acceptedFileTypes = 'image/*,application/pdf,video/*',
  maxFileSize = 25,
}: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const [previews, setPreviews] = useState<string[]>([]);

  // Handle drag-and-drop events
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => setIsDragOver(false);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  };

  // Validate and process files
  const handleFiles = (selectedFiles: File[]) => {
    const validFiles = selectedFiles.filter(file => {
      const validTypes = acceptedFileTypes.split(',');
      const isValidType = validTypes.some(type => {
        if (type === 'video/*') return file.type.startsWith('video/');
        if (type === 'image/*') return file.type.startsWith('image/');
        return file.type === type;
      });

      if (!isValidType) {
        alert(`Invalid file type: ${file.name}`);
        return false;
      }
      if (file.size > maxFileSize * 1024 * 1024) {
        alert(`File size exceeds ${maxFileSize} MB: ${file.name}`);
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      setFiles(prev => [...prev, ...validFiles]);
      onFileChange([...files, ...validFiles]);

      // Generate previews for image or video files
      const newPreviews = validFiles.map(file =>
        file.type.startsWith('image/') || file.type.startsWith('video/')
          ? URL.createObjectURL(file)
          : ''
      );
      setPreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const selectedFiles = e.target.files ? Array.from(e.target.files) : [];
    if (selectedFiles.length === 0) {
      clearFiles();
    } else {
      handleFiles(selectedFiles);
    }
  };

  // Clear all files
  const clearFiles = () => {
    setFiles([]);
    setPreviews([]);
    setProgress(0);
    onFileChange(null);
  };

  // Simulate upload progress (optional, for UX)
  const simulateUpload = () => {
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 5;
      });
    }, 100);
  };

  return (
    <div>
      <div
        className={`w-full border-dashed border-2 rounded-xl p-4 flex flex-col justify-center items-center cursor-pointer transition ${
          isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-gray-100'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={e => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        {files.length > 0 ? (
          <div className="w-full">
            <ul className="space-y-2">
              {files.map((file, index) => (
                <li key={index} className="flex items-center justify-between">
                  <span className="text-gray-700">
                    {file.name.length > 20 ? `${file.name.substring(0, 20)}...` : file.name}
                  </span>
                  <button
                    type="button"
                    onClick={e => {
                      e.preventDefault();
                      e.stopPropagation();
                      setFiles(files.filter((_, i) => i !== index));
                      setPreviews(previews.filter((_, i) => i !== index));
                      if (files.length === 1) clearFiles();
                      else onFileChange(files.filter((_, i) => i !== index));
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>

            {/* Preview (for first file) */}
            {previews[0] && (
              <>
                {files[0].type.startsWith('image/') ? (
                  <img
                    src={previews[0]}
                    alt="Preview"
                    className="mt-2 h-28 rounded-xl object-cover"
                  />
                ) : files[0].type.startsWith('video/') ? (
                  <video src={previews[0]} controls className="mt-2 h-28 rounded-xl object-cover" />
                ) : null}
              </>
            )}

            {progress > 0 && (
              <div className="w-full bg-gray-200 rounded-full mt-4">
                <div
                  className="bg-blue-500 text-xs font-medium text-blue-100 text-center p-0.5 leading-none rounded-full"
                  style={{ width: `${progress}%` }}
                >
                  {progress}%
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            <label
              className="flex flex-col items-center cursor-pointer"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex flex-col items-center">
                <FaUpload className="text-white bg-primaryColor h-8 w-8 p-[7px] rounded-xl" />
                <div className="inline text-sm mt-2">
                  <span className="text-primaryColor">Click to Upload </span>
                  <span className="text-gray-500">or drag and drop</span>
                </div>
              </div>
              <input
                type="file"
                className="hidden"
                accept={acceptedFileTypes}
                onChange={handleFileChange}
                multiple
                onClick={e => e.stopPropagation()}
              />
            </label>
            <span className="text-gray-500 text-xs">
              (Max. File size: {maxFileSize} MB per file)
            </span>
          </>
        )}
      </div>
    </div>
  );
}
