import { Input } from "~/components/ui/input";
import RangeComponent from "./RangeComponent";
import AppFormField from "~/common/form-fields";
import { FaLink } from "react-icons/fa";
import type { FormFieldProps } from "../types";
import VideoUpload from "~/common/upload/videoUpload";
import Or from "~/common/or/Or";
import RichTextEditor from "~/components/ui/richTextEditor";
import DOMPurify from "dompurify";
import FileUpload from "~/common/upload/fileUpload";
import { getWordCount } from "~/lib/utils";

export const FormFields = {
  text: ({ value, onChange, name }: FormFieldProps) => (
    <Input
      type="text"
      placeholder="Enter text"
      value={value as string}
      onChange={onChange}
      name={name}
      className="w-full p-3 border border-gray-300 rounded-md"
    />
  ),

  number: ({ value, onChange, name }: FormFieldProps) => (
    <AppFormField
      type="number"
      id="number-input"
      name={name}
      label="Enter a number"
      placeholder="Enter a number"
      onChange={onChange}
      className="no-spinner"
      defaultValue={value ? value.toString() : ""}
    />
  ),

  range: ({ value, onChange, name, props }: FormFieldProps) => (
    <div className="flex flex-col">
      <div className="w-[50%] mb-6 relative">
        <AppFormField
          type="number"
          id="number-input"
          name={name}
          label={props.cardTitle}
          placeholder={props.popupTitle}
          onChange={onChange}
          className="no-spinner"
          defaultValue={value as string}
        />
        <FaLink className="absolute top-1/2 right-2 transform -translate-y-1/2 h-8 w-8 text-primaryColor hover:bg-slate-100 transition-all hover:rounded-xl p-2" />
      </div>
      <p className="mb-14 text-base">
        The median {props.popupTitle} for a designer is:
      </p>
      <RangeComponent minVal={props.minVal} maxVal={props.maxVal} />
    </div>
  ),

  textArea: ({ value, onChange, name, props }: FormFieldProps) => (
    <div className="flex flex-col gap-2">
      {/* Check if Rich Text is enabled */}
      {props?.useRichText ? (
        <RichTextEditor
          name={name} // Ensure the name attribute is included
          value={(value as string) || ""} // Ensure value is a string
          onChange={(content) => {
            const event = {
              target: {
                value: content,
                name,
              },
            } as unknown as React.ChangeEvent<HTMLInputElement>;
            onChange(event);
          }}
          placeholder="Add content to describe yourself"
          className="border-gray-300 rounded-md resize-none mt-6 mb-1 text-left break-words whitespace-normal overflow-hidden"
          style={{
            wordBreak: "break-word",
            hyphens: "auto",
          }}
        />
      ) : (
        <AppFormField
          type="textarea"
          id="description"
          name={name}
          label="Add content to describe yourself"
          placeholder="Add content to describe yourself"
          col={6} // Represents rows as height (in rem units)
          onChange={onChange}
        />
      )}

      <div className="ml-6 text-xs text-gray-500">
        {getWordCount(value as string)} / 2000 characters
      </div>
    </div>
  ),

  increment: ({ value, handleIncrement, props }: FormFieldProps) => (
    <div className="flex flex-col items-center space-y-4 w-full">
      <div className="flex items-center border border-gray-300 rounded-xl w-full">
        {/* - Button */}
        <button
          type="button"
          className="w-16 h-12 flex justify-center items-center text-primaryColor rounded-l-xl border-r text-2xl"
          style={{ borderRight: "none" }} // Remove the right border of the - button
          onClick={() => handleIncrement(-1)}
        >
          <div className="hover:bg-gray-100 px-2 rounded-full">−</div>
        </button>

        {/* Input Display */}
        <div className="w-full h-12 flex justify-center items-center border-x border-gray-300 text-lg">
          {typeof value === "number" || typeof value === "string" ? value : ""}
        </div>

        {/* + Button */}
        <button
          type="button"
          className="w-16 h-12 flex justify-center items-center text-primaryColor rounded-r-xl text-2xl"
          style={{ borderLeft: "none" }} // Remove the left border of the + button
          onClick={() => handleIncrement(1)}
        >
          <div className="hover:bg-gray-100 px-2 rounded-full">+</div>
        </button>
      </div>
    </div>
  ),

  video: ({ value, onChange, name, props }: FormFieldProps) => {
    const handleVideoUpload = (file: File) => {
      const fileUrl = URL.createObjectURL(file);

      console.log("Generated file URL:", fileUrl);

      const event = {
        target: {
          value: fileUrl,
          name,
        },
      } as unknown as React.ChangeEvent<HTMLInputElement>;

      onChange(event);
    };

    return (
      <div className="">
        {/* UPLOAD */}
        <VideoUpload onFileChange={(fileUrl) => handleVideoUpload(fileUrl)} />

        {/* OR */}
        <Or />

        {/* FORM */}
        <div className="">
          <div className="relative">
            <AppFormField
              type="text"
              id="youtube-url"
              name={name} // Ensure name matches "videoLink"
              label="Paste YouTube URL or upload video"
              placeholder="Paste YouTube URL or upload video"
              defaultValue={typeof value === "string" ? value : ""}
              onChange={onChange}
              className=""
            />
            <FaLink className="absolute top-1/2 right-2 transform -translate-y-1/2 h-9 w-9 text-primaryColor hover:bg-slate-100 transition-all hover:rounded-xl p-2" />
          </div>
        </div>
      </div>
    );
  },

  file: ({ value, onChange, name, props, handleIncrement }: FormFieldProps) => (
    <FileField
      value={value}
      onChange={onChange}
      name={name}
      props={props}
      handleIncrement={handleIncrement}
    />
  ),
};

export const FileField = ({
  value,
  onChange,
  name,
  props,
  handleIncrement,
}: FormFieldProps) => {
  // Get file info for display
  const getFileInfo = (fileValue: any) => {
    if (fileValue instanceof File) {
      return {
        name: fileValue.name,
        size: Math.round(fileValue.size / 1024),
      };
    }
    return null;
  };

  const fileInfo = getFileInfo(value);

  return (
    <div className="w-full">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors">
        <svg
          className="w-10 h-10 text-gray-400 mb-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          ></path>
        </svg>
        <p className="mb-2 text-sm text-gray-500">
          <span className="font-semibold">Click to upload</span> or drag and
          drop
        </p>
        <p className="text-xs text-gray-500">
          {props?.acceptedFileTypes
            ? `Supported formats: ${props.acceptedFileTypes}`
            : "PDF, JPG, PNG, etc."}
        </p>

        <Input
          id={name}
          name={name}
          type="file"
          className="hidden"
          accept={props?.acceptedFileTypes}
          onChange={onChange}
          multiple={props?.multiple}
        />

        <label
          htmlFor={name}
          className="mt-4 px-4 py-2 bg-primaryColor text-white rounded-md cursor-pointer hover:bg-primaryColor/90 transition-colors"
        >
          Select Files
        </label>
      </div>

      {fileInfo && (
        <div className="mt-4 p-3 bg-gray-50 rounded-md">
          <p className="text-sm font-medium">{fileInfo.name}</p>
          {fileInfo.size && (
            <p className="text-xs text-gray-500">{fileInfo.size} KB</p>
          )}
        </div>
      )}
    </div>
  );
};
