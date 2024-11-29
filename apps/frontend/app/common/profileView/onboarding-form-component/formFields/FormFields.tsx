import { Input } from "~/components/ui/input";
import RangeComponent from "./RangeComponent";
import AppFormField from "~/common/form-fields";
import { FaLink } from "react-icons/fa";
import type { FormFieldProps } from "../types";
import VideoUpload from "~/common/upload/videoUpload";

const handleVideoUpload = (file: File | null) => {
  console.log("Video uploaded:", file);
};
import Or from "~/common/or/Or";

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
    <Input
      type="number"
      placeholder="Enter a number"
      value={value as number}
      onChange={onChange}
      name={name}
      className="w-full p-3 border border-gray-300 rounded-md"
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
      <AppFormField
        type="textarea"
        id="description"
        name={name}
        label="Add content to describe yourself"
        placeholder="Add content to describe yourself"
        col={6} // Represents rows as height (in rem units)
        onChange={onChange}
      />

      <div className="ml-6 text-xs text-gray-500">
        {(value as string).length} / 2000 characters
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
  video: ({ value, onChange, name, props }: FormFieldProps) => (
    <div className="">
      {/* UPLOAD */}
      <VideoUpload onFileChange={handleVideoUpload} />

      {/* OR */}
      <Or />

      {/* FORM */}
      <div className="">
        <div className="relative">
          <AppFormField
            type="text"
            id="youtube-url"
            name={name}
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
  ),

  file: ({ value, onChange, name, props }: FormFieldProps) => (
    <Input
      type="file"
      name={props.fieldName}
      onChange={onChange}
      className="w-full p-3 border border-gray-300 rounded-md"
    />
  ),
};
