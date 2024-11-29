// this is the page of PROJECTS

import { useState } from "react";
import { PortfolioFormFieldType } from "~/types/User";
import { FaLink } from "react-icons/fa";
import AppFormField from "~/common/form-fields";
import FileUpload from "~/common/upload/fileUpload";

interface PortfolioComponentProps {
  data: PortfolioFormFieldType;
  onTextChange: (data: PortfolioFormFieldType) => void;
  onFileChange: (file: File | null) => void;
}

const handleFileUpload = (file: File | null) => {
  console.log("File uploaded:", file);
};

function PortfolioComponent({ data, onTextChange }: PortfolioComponentProps) {
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

      {/* <FileUpload
            onFileChange={(file) => console.log("Uploaded file:", file)}
            acceptedFileTypes="image/*,application/pdf"
            maxFileSize={25}
          /> */}

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

      <div className="text-right text-sm text-gray-500">
        {data.projectDescription.length}/2000 words
      </div>
    </div>
  );
}

export default PortfolioComponent;
