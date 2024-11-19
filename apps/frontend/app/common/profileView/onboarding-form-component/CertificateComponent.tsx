import { useState } from "react";
import { Input } from "~/components/ui/input";
import { CertificateFormFieldType } from "~/types/User";
// import { GrFormCheckmark } from "react-icons/gr";
import { LiaTimesSolid } from "react-icons/lia";

interface CertificateComponentProps {
  data: CertificateFormFieldType;
  onTextChange: (data: CertificateFormFieldType) => void;
  onFileChange: (file: File | null) => void;
}

function CertificateComponent({
  data,
  onTextChange,
  onFileChange,
}: CertificateComponentProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

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
      setFile(droppedFile);
      onFileChange(droppedFile);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files ? e.target.files[0] : null;
    setFile(selectedFile);
    onFileChange(selectedFile);
  };

  const clearFile = () => {
    setFile(null);
    onFileChange(null);
  };

  return (
    <div className="space-y-6">
      {file ? (
        <div className="flex items-center space-x-4">
          {/* <GrFormCheckmark className="text-green-500 text-xl" /> */}
          <span className="text-gray-700">
            {file.name.length > 20
              ? `${file.name.substring(0, 20)}...${file.name.lastIndexOf(".") > 1 ? file.name.substring(file.name.lastIndexOf(".")) : ""}`
              : file.name}
          </span>
          <button
            type="button"
            onClick={clearFile}
            className="text-red-500 hover:text-red-700"
          >
            <LiaTimesSolid className="text-gray-700 hover:text-red-900 text-xl" />
          </button>
        </div>
      ) : (
        <div
          className={`w-full border-dashed border-2 rounded-md p-8 flex flex-col justify-center items-center cursor-pointer transition ${
            isDragOver ? "border-blue-500 bg-blue-50" : "border-gray-300"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <label className="flex flex-col items-center space-y-2 cursor-pointer">
            <div className="text-blue-500 flex flex-col items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 16l3 3 4-4m0 0l4-4m-4 4V4m10 14h5a2 2 0 002-2v-5a2 2 0 00-2-2h-5a2 2 0 00-2 2v5a2 2 0 002 2z"
                />
              </svg>
              <span className="text-blue-500 underline">Click to Upload</span>
            </div>
            <span className="text-gray-500 text-sm">
              (Max. File size: 25 MB)
            </span>
            <input
              type="file"
              className="hidden"
              name="projectImage[]"
              accept="image/*"
              onChange={handleFileChange}
            />
          </label>
          <p className="text-sm text-gray-500 mt-2">or drag and drop</p>
        </div>
      )}

      <div className="flex space-x-4">
        <Input
          type="text"
          placeholder="Certificate Name"
          className="w-full border-gray-300 rounded-md mb-4"
          value={data.certificateName}
          onChange={(e) =>
            onTextChange({ ...data, certificateName: e.target.value })
          }
          name="certificateName[]"
        />
        <Input
          type="text"
          placeholder="Certificate Issued by"
          className="w-full border-gray-300 rounded-md mb-4"
          value={data.issuedBy}
          onChange={(e) => onTextChange({ ...data, issuedBy: e.target.value })}
          name="issuedBy[]"
        />

        <Input
          type="number"
          placeholder="Year Issued"
          className="w-1/2 border-gray-300 rounded-md mb-4"
          value={data.yearIssued}
          onChange={(e) =>
            onTextChange({ ...data, yearIssued: parseInt(e.target.value) })
          }
          name="yearIssued[]"
        />
      </div>
    </div>
  );
}

export default CertificateComponent;
