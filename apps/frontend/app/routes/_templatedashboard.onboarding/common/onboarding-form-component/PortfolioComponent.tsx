import { useState } from "react";
import { Input } from "~/components/ui/input";
import { PortfolioFormFieldType } from "~/types/User";
// import { GrFormCheckmark } from "react-icons/gr";
import { LiaTimesSolid } from "react-icons/lia";
import { FaLink } from "react-icons/fa";
import AppFormField from "~/common/form-fields";
import Upload from "~/common/upload/Upload";

interface PortfolioComponentProps {
  data: PortfolioFormFieldType;
  onTextChange: (data: PortfolioFormFieldType) => void;
  onFileChange: (file: File | null) => void;
}

function PortfolioComponent({
  data,
  onTextChange,
  onFileChange,
}: PortfolioComponentProps) {
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
    <div className="">
      {/* FORM */}
      <div className="flex space-x-4 mt-2 mb-6">
        {/* PROJECT NAME FORM */}
        <div className="relative">
          <AppFormField
            type="text"
            id="projectName[]"
            name="projectName[]"
            label="Project Name"
            placeholder="Project Name"
            onChange={(e) =>
              onTextChange({ ...data, projectName: e.target.value })
            }
          />
        </div>

        {/* PROJECT LINK FORM */}
        <div className="relative">
          <AppFormField
            type="url" // Use "url" for the input type
            id="projectLink[]"
            name="projectLink[]"
            label="Project Link"
            placeholder="Project Link"
            defaultValue={data.projectLink}
            onChange={(e) =>
              onTextChange({ ...data, projectLink: e.target.value })
            }
            className="w-1/2 border-gray-300 rounded-md"
          />
          <FaLink className="absolute top-1/2 right-2 transform -translate-y-1/2 h-9 w-9 text-primaryColor hover:bg-slate-100 transition-all hover:rounded-xl p-2" />
        </div>
      </div>

      {/* UPLOAD */}
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
        <div className="">
          <p className="text-gray-500 text-sm mb-2 ml-1">Project Thumbnail</p>
          <Upload />
        </div>
      )}

      <AppFormField
        type="textarea"
        id="projectDescription"
        name="projectDescription"
        label="Project Description"
        placeholder="Project Description"
        className="border-gray-300 rounded-md resize-none mt-6 mb-1"
        col={6} // Determines the height of the textarea dynamically
        defaultValue={data.projectDescription} // Populates the textarea with the current state
        onChange={(e) =>
          onTextChange({ ...data, projectDescription: e.target.value })
        }
      />

      <div className="ml-6 text-xs text-gray-500">
        {data.projectDescription.length}/2000 words
      </div>
    </div>
  );
}

export default PortfolioComponent;
