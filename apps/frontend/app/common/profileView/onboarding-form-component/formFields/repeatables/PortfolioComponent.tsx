import { PortfolioFormFieldType } from "~/types/User";
import { FaLink } from "react-icons/fa";
import AppFormField from "~/common/form-fields";
import FileUpload from "~/common/upload/fileUpload";
import DOMPurify from "dompurify";
import RichTextEditor from "~/components/ui/richTextEditor";

const getWordCount = (html: string) => {
  const plainText = DOMPurify.sanitize(html, { ALLOWED_TAGS: [] }).trim();
  return plainText.length || 0; // Return 0 for empty or invalid input
};

interface PortfolioComponentProps {
  data: PortfolioFormFieldType;
  onTextChange: (data: PortfolioFormFieldType) => void;
  onFileChange: (file: File | null) => void;
}

const PortfolioComponent: React.FC<PortfolioComponentProps> = ({
  data,
  onTextChange,
  onFileChange,
}) => {
  const handleFileUpload = (file: File | null) => {
    onFileChange(file); // Pass file to the parent
  };

  // const handleDescriptionChange = (content: string) => {
  //   onTextChange({ ...data, projectDescription: content });
  // };

  return (
    <div className="">
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

      <FileUpload onFileChange={handleFileUpload} />

      <div className="flex flex-col gap-2">
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

        <div className="ml-6 text-xs text-gray-500">
          {getWordCount(data.projectDescription)} / 2000 characters
        </div>
      </div>
    </div>
  );
};

export default PortfolioComponent;
