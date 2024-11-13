import { Input } from "~/components/ui/input";
import { PortfolioFormFieldType } from "~/types/User";

interface PortfolioComponentProps {
  data: PortfolioFormFieldType;
  onTextChange: (data: PortfolioFormFieldType) => void;
  onFileChange: (file: File) => void;
}

function PortfolioComponent({
  data,
  onTextChange,
  onFileChange,
}: PortfolioComponentProps) {
  return (
    <div className="space-y-4">
      <div className="flex space-x-4">
        <Input
          type="text"
          placeholder="Project Name"
          className="w-1/2 border-gray-300 rounded-md"
          value={data.projectName}
          onChange={(e) =>
            onTextChange({ ...data, projectName: e.target.value })
          }
          name="projectName[]"
        />
        <Input
          type="url"
          placeholder="Project Link"
          className="w-1/2 border-gray-300 rounded-md"
          value={data.projectLink}
          onChange={(e) =>
            onTextChange({ ...data, projectLink: e.target.value })
          }
          name="projectLink[]"
        />
      </div>
      <div className="w-full border-dashed border-gray-300 border rounded-md p-6 flex justify-center items-center cursor-pointer">
        <label className="flex items-center space-x-2 cursor-pointer">
          <span className="text-blue-500 underline">Click to Upload</span> or
          drag and drop
          <input
            type="file"
            className="hidden"
            name="projectImage[]"
            accept="image/*"
            onChange={(e) => {
              onFileChange(e.target.files ? e.target.files[0] : null);
            }}
          />
        </label>
        <p className="text-sm text-gray-500 mt-2">(Max. File size: 25 MB)</p>
      </div>
      <textarea
        placeholder="Project Description"
        className="w-full border-gray-300 rounded-md p-3"
        rows={4}
        maxLength={2000}
        name="projectDescription[]"
        value={data.projectDescription}
        onChange={(e) =>
          onTextChange({ ...data, projectDescription: e.target.value })
        }
      />
      <div className="text-right text-sm text-gray-500">
        {data.projectDescription.length}/2000 words
      </div>
    </div>
  );
}

export default PortfolioComponent;
