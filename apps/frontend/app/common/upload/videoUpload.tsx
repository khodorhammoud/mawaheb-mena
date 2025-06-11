import { useEffect, useState } from 'react';
import { FaUpload } from 'react-icons/fa';

interface VideoUploadProps {
  onFileChange: (file: File | null) => void;
  file?: File | null;
  acceptedFileTypes?: string; // e.g., "video/*"
  maxFileSize?: number; // Size in MB
  onClear?: () => void; // 👈 add this!
}

export default function VideoUpload({
  onFileChange,
  file: externalFile = null,
  acceptedFileTypes = 'video/*',
  maxFileSize = 50,
  onClear, // ✅ add this here!
}: VideoUploadProps) {
  const [file, setFile] = useState<File | null>(externalFile);
  const [isDragOver, setIsDragOver] = useState(false);

  useEffect(() => {
    setFile(externalFile);
  }, [externalFile]);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      if (droppedFile.size > maxFileSize * 1024 * 1024) {
        alert(`Video size exceeds ${maxFileSize} MB`);
        return;
      }
      setFile(droppedFile);
      onFileChange(droppedFile);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files ? e.target.files[0] : null;
    if (selectedFile) {
      if (selectedFile.size > maxFileSize * 1024 * 1024) {
        alert(`Video size exceeds ${maxFileSize} MB`);
        return;
      }
      setFile(selectedFile);
      onFileChange(selectedFile);
    }
  };

  const clearFile = () => {
    setFile(null);
    onFileChange(null);
  };

  return (
    <div
      className={`w-full border-dashed border-2 rounded-xl p-4 flex flex-col justify-center items-center cursor-pointer transition ${
        isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-gray-100'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {file ? (
        <div className="flex items-center space-x-4">
          <span className="text-gray-700">
            {file.name.length > 40 ? `${file.name.substring(0, 40)}...` : file.name}
          </span>
          <button
            type="button"
            onClick={() => {
              clearFile();
              onClear?.(); // ✅ call it if provided
            }}
            className="text-red-500 hover:text-red-700"
          >
            Clear
          </button>
        </div>
      ) : (
        <>
          <label className="flex flex-col items-center cursor-pointer">
            <div className="flex flex-col items-center">
              <FaUpload className="text-white bg-primaryColor h-8 w-8 p-[7px] rounded-xl" />
              <div className="inline text-sm mt-2 text-center">
                <span className="text-primaryColor">Click to Upload </span>
                <span className="text-gray-500">or drag and drop</span>
              </div>
            </div>
            <input
              type="file"
              className="hidden"
              accept={acceptedFileTypes}
              onChange={handleFileChange}
            />
          </label>
          <span className="text-gray-500 text-xs mt-2">(Max. File size: {maxFileSize} MB)</span>
        </>
      )}
    </div>
  );
}
