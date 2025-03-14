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
              defaultValue={value as string}
              onChange={onChange}
              className=""
            />
            <FaLink className="absolute top-1/2 right-2 transform -translate-y-1/2 h-9 w-9 text-primaryColor hover:bg-slate-100 transition-all hover:rounded-xl p-2" />
          </div>
        </div>
      </div>
    );
  },

  file: ({ value, onChange, name, props }: FormFieldProps) => {
    return (
      <Input
        type="file"
        name={name}
        accept={props.acceptedFileTypes}
        onChange={onChange}
        className="w-full p-3 border border-gray-300 rounded-md"
      />
    );
  },
};
