import { Input } from '~/components/ui/input';
import type { FormFieldProps } from '../types';
import { useEffect } from 'react';
import { toast } from '~/components/hooks/use-toast';

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

export const FileField = ({ value, onChange, name, props }: FormFieldProps) => {
  const fileInfo = getFileInfo(value);

  // ⚠️ Validate file value on change
  useEffect(() => {
    if (value && !(value instanceof File)) {
      toast({
        variant: 'destructive',
        title: 'Invalid file',
        description: 'Only valid file types are allowed.',
      });
    }
  }, [value]); // ✅ dependency array

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
          <span className="font-semibold">Click to upload</span> or drag and drop
        </p>
        <p className="text-xs text-gray-500">
          {props?.acceptedFileTypes
            ? `Supported formats: ${props.acceptedFileTypes}`
            : 'PDF, JPG, PNG, etc.'}
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
          {fileInfo.size && <p className="text-xs text-gray-500">{fileInfo.size} KB</p>}
        </div>
      )}
    </div>
  );
};
