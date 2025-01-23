import { PortfolioFormFieldType } from "~/types/User";
import { FaLink } from "react-icons/fa";
import AppFormField from "~/common/form-fields";
import FileUpload from "~/common/upload/fileUpload";
import DOMPurify from "dompurify";
import RichTextEditor from "~/components/ui/richTextEditor";
import { useRef, useState } from "react";
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
  const fileInputRef = useRef<HTMLInputElement>(null); // Ref for hidden file input
  const [filePreview, setFilePreview] = useState<string | null>(
    data.projectImageUrl || null
  ); // Track file preview

  // Determine file type dynamically based on the projectImageName
  const determineFileType = (fileName: string): string => {
    const extension = fileName.split(".").pop()?.toLowerCase() || "";
    if (["png", "jpg", "jpeg", "gif", "bmp"].includes(extension)) {
      return "image";
    } else if (["pdf"].includes(extension)) {
      return "pdf";
    } else if (["mp4", "mov", "avi", "mkv"].includes(extension)) {
      return "video";
    }
    return "unknown"; // Fallback for unsupported file types
  };

  const handleFileUpload = (files: File[] | null) => {
    if (files && files.length > 0) {
      const uploadedFile = files[0];
      const fileType = determineFileType(uploadedFile.name);

      // Update preview dynamically based on file type
      setFilePreview(URL.createObjectURL(uploadedFile));

      // Update the parent data
      onFileChange(files);
      onTextChange({
        ...data,
        projectImageName: uploadedFile.name,
        projectImageUrl: URL.createObjectURL(uploadedFile),
      });
    } else {
      // Reset the preview and data if no file is selected
      setFilePreview(null);
      onTextChange({ ...data, projectImageUrl: "", projectImageName: "" });
    }
  };

  const handleEditFile = () => {
    // Trigger file input click when the pen icon is clicked
    fileInputRef.current?.click();
  };

  const renderFilePreview = () => {
    const fileType = determineFileType(data.projectImageName || "");
    if (fileType === "image" && data.projectImageUrl) {
      return (
        <img
          src={data.projectImageUrl}
          alt={data.projectName || "Portfolio Image"}
          className="h-28 rounded-xl object-cover"
        />
      );
    } else if (fileType === "pdf" && data.projectImageUrl) {
      return (
        <embed
          src={data.projectImageUrl}
          type="application/pdf"
          className="h-28 w-full rounded-xl"
          title="Portfolio PDF"
        />
      );
    } else if (fileType === "video" && data.projectImageUrl) {
      return (
        <video
          src={data.projectImageUrl}
          className="h-28 w-full rounded-xl"
          controls
          title="Portfolio Video"
        />
      );
    }

    return <span className="text-gray-500">No preview available</span>;
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
            type="url"
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
        <div className="relative group">
          {filePreview ? (
            renderFilePreview()
          ) : (
            <FileUpload
              onFileChange={handleFileUpload}
              acceptedFileTypes="image/*,application/pdf,video/*"
              maxFileSize={25}
            />
          )}

          {/* Edit Icon */}
          <button
            type="button"
            onClick={handleEditFile}
            className="absolute top-0 right-0 p-2 text-white rounded-full focus:outline-none"
          >
            <IoPencilSharp className="h-7 w-7 absolute top-4 right-4 text-primaryColor hover:bg-[#E4E3E6] transition-all rounded-full p-1" />
          </button>
        </div>

        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*,application/pdf,video/*"
          onChange={(e) =>
            handleFileUpload(e.target.files ? Array.from(e.target.files) : null)
          }
        />
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
