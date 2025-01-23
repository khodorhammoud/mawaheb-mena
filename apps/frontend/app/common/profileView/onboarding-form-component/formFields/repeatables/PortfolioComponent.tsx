import { PortfolioFormFieldType } from "~/types/User";
import { FaLink } from "react-icons/fa";
import AppFormField from "~/common/form-fields";
import FileUpload from "~/common/upload/fileUpload";
import DOMPurify from "dompurify";
import RichTextEditor from "~/components/ui/richTextEditor";
import { useState } from "react";
import { IoPencilSharp } from "react-icons/io5";

const getWordCount = (html: string) => {
  const plainText = DOMPurify.sanitize(html, { ALLOWED_TAGS: [] }).trim();
  return plainText.length || 0; // Return 0 for empty or invalid input
};

interface PortfolioComponentProps {
  data: PortfolioFormFieldType;
  onTextChange: (data: PortfolioFormFieldType) => void;
  onFileChange: (files: File[] | null) => void; // Support multiple files
}

const PortfolioComponent: React.FC<PortfolioComponentProps> = ({
  data,
  onTextChange,
  onFileChange,
}) => {
  const [isEditingImage, setIsEditingImage] = useState(false); // Track if the user is editing the image

  const handleFileUpload = (files: File[] | null) => {
    if (!files || files.length === 0) {
      onTextChange({ ...data, projectImageUrl: "" }); // Clear image URL if no file
    }
    onFileChange(files); // Pass files to parent
    setIsEditingImage(false); // Exit editing mode after file selection
  };

  const handleEditImage = () => {
    setIsEditingImage(true);
  };
  return (
    <div className="p-1">
      <div className="flex space-x-4 mt-2 mb-6">
        {/* PROJECT NAME FORM */}
        <div className="relative">
          <AppFormField
            type="text"
            id="projectName[]"
            name="projectName[]"
            label="Project Name"
            placeholder="Project Name"
            defaultValue={data.projectName}
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

      {/* FILE UPLOAD OR IMAGE */}
      <div className="relative mb-4">
        {data.projectImageUrl && !isEditingImage ? (
          // Display the existing image with edit icon
          <div className="relative group">
            <img
              src={data.projectImageUrl}
              alt={data.projectName || "Portfolio Image"}
              className="h-28 rounded-xl object-cover"
            />

            {/* Pen Icon for Editing */}
            <button
              type="button"
              onClick={handleEditImage}
              className="absolute top-0 right-0 p-2 text-white rounded-full focus:outline-none"
            >
              <IoPencilSharp className="h-7 w-7 absolute top-4 right-4 text-primaryColor hover:bg-[#E4E3E6] transition-all rounded-full p-1" />
            </button>
          </div>
        ) : (
          // Display the FileUpload component
          <FileUpload onFileChange={handleFileUpload} />
        )}
      </div>

      <div className="flex flex-col gap-2">
        {/* RICH TEXT EDITOR */}
        <RichTextEditor
          value={data.projectDescription || ""}
          onChange={(content) =>
            onTextChange({
              ...data,
              projectDescription: content,
            })
          }
          placeholder="Project Description"
          className="border-gray-300 rounded-md resize-none mt-6 mb-1 ml-1 text-left break-words whitespace-normal overflow-hidden"
          style={{
            wordBreak: "break-word",
            hyphens: "auto",
          }}
        />

        {/* CHARACTER COUNT */}
        <div className="ml-6 text-xs text-gray-500">
          {getWordCount(data.projectDescription)} / 2000 characters
        </div>
      </div>
    </div>
  );
};

export default PortfolioComponent;
