import React, { useState } from "react";
import { FaUpload } from "react-icons/fa";

export default function Upload() {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
    const files = event.dataTransfer.files;
    handleFileChange(files);
  };

  const handleFileChange = (files: FileList | null) => {
    if (files && files.length > 0) {
      // Replace this with your upload logic or API call
      console.log("Files uploaded:", files);
      alert(`You have uploaded ${files.length} file(s).`);
    }
  };

  return (
    <div
      className={`w-full border-dashed border-2 rounded-xl p-4 flex flex-col justify-center items-center cursor-pointer transition ${
        isDragOver
          ? "border-blue-500 bg-blue-50"
          : "border-gray-200 bg-gray-100"
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* PRESS HERE TO UPLOAD */}
      <label className="flex flex-col items-center cursor-pointer">
        <div className="flex flex-col items-center">
          <FaUpload className="text-white bg-primaryColor h-8 w-8 p-[7px] rounded-xl" />
          <div className="inline text-sm mt-2">
            <span className="text-primaryColor mb">Click to Upload </span>
            <span className="text-gray-500">or drag and drop</span>
          </div>
        </div>
        <input
          type="file"
          className="hidden"
          name="projectImage[]"
          accept="image/*"
          onChange={(e) => handleFileChange(e.target.files)}
        />
      </label>
      <span className="text-gray-500 text-xs">(Max. File size: 25 MB)</span>
    </div>
  );
}
