import { PortfolioFormFieldType } from '@mawaheb/db/types';
import { FaLink } from 'react-icons/fa';
import AppFormField from '~/common/form-fields';
import FileUpload from '~/common/upload/fileUpload';
import RichTextEditor from '~/components/ui/richTextEditor';
import { useRef } from 'react';
import { IoPencilSharp } from 'react-icons/io5';
import { getWordCount } from '~/lib/utils';

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to get file type
  const determineFileType = (fileName: string): string => {
    const extension = fileName.split('.').pop()?.toLowerCase() || '';
    if (['png', 'jpg', 'jpeg', 'gif', 'bmp'].includes(extension)) return 'image';
    if (['pdf'].includes(extension)) return 'pdf';
    if (['doc', 'docx'].includes(extension)) return 'word';
    if (['mp4', 'mov', 'avi', 'mkv'].includes(extension)) return 'video';
    return 'unknown';
  };

  const handleFileUpload = (files: File[] | null) => {
    if (files && files.length > 0) {
      const uploadedFile = files[0];
      const objectURL = URL.createObjectURL(uploadedFile);

      onFileChange(files);
      onTextChange({
        ...data,
        projectImageName: uploadedFile.name,
        projectImageUrl: objectURL, // always let the parent handle preview
      });
    } else {
      onTextChange({ ...data, projectImageUrl: '', projectImageName: '' });
    }
  };

  // Edit (pencil) icon handler
  const handleEditFile = () => {
    fileInputRef.current?.click();
  };

  // Renders preview for uploaded file
  const renderFilePreview = () => {
    const fileType = determineFileType(data.projectImageName || '');
    if (fileType === 'image' && data.projectImageUrl) {
      return (
        <img
          src={data.projectImageUrl}
          alt={data.projectName || 'Portfolio Image'}
          className="h-28 rounded-xl object-cover"
        />
      );
    } else if (fileType === 'pdf' && data.projectImageUrl) {
      return (
        <div className="flex items-center gap-4 p-4 border rounded-xl bg-gray-50 shadow-sm mt-2">
          {/* PDF Icon */}
          <div className="flex-shrink-0">
            <svg className="w-10 h-10 text-red-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 2H8a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V6l-5-4zm0 2.5V7h-4V3.5L19 4.5zM8 4h6v5h5v11a1 1 0 0 1-1 1H8V4zm8 13h-2v-1h2v1zm-4 0H8v-1h4v1zm4-3h-2v-1h2v1zm-4 0H8v-1h4v1z" />
            </svg>
          </div>
          {/* PDF Info */}
          <div className="flex-1">
            <div className="text-sm font-semibold text-gray-700 mb-1">PDF Uploaded</div>
            <div className="text-gray-900 font-medium break-all">{data.projectImageName}</div>
            <div className="flex gap-2 mt-2">
              <a
                href={data.projectImageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 bg-primaryColor text-white rounded-lg shadow-sm hover:bg-primaryColor/80 transition"
              >
                View
              </a>
              {/* <a
                href={data.projectImageUrl}
                download={data.projectImageName}
                className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg shadow-sm hover:bg-gray-300 transition"
              >
                Download
              </a> */}
            </div>
          </div>
        </div>
      );
    } else if (fileType === 'word' && data.projectImageUrl) {
      return (
        <div className="flex items-center gap-4 p-4 border rounded-xl bg-blue-50 shadow-sm mt-2">
          {/* Word Icon */}
          <div className="flex-shrink-0">
            <svg className="w-10 h-10 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 2H8a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V6l-5-4zm0 2.5V7h-4V3.5L19 4.5zM8 4h6v5h5v11a1 1 0 0 1-1 1H8V4zm7 13h-1l-1.5-4.5L11 17h-1l2-6h1l2 6z" />
            </svg>
          </div>
          {/* Word Info */}
          <div className="flex-1">
            <div className="text-sm font-semibold text-gray-700 mb-1">Word Document</div>
            <div className="text-gray-900 font-medium break-all">{data.projectImageName}</div>
            <div className="flex gap-2 mt-2">
              <a
                href={data.projectImageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 bg-primaryColor text-white rounded-lg shadow-sm hover:bg-primaryColor/80 transition"
              >
                View
              </a>
            </div>
          </div>
        </div>
      );
    } else if (fileType === 'video' && data.projectImageUrl) {
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
            onChange={e => onTextChange({ ...data, projectName: e.target.value })}
            maxLength={100}
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
            onChange={e => onTextChange({ ...data, projectLink: e.target.value })}
            className="w-1/2 border-gray-300 rounded-md"
          />
          <FaLink className="absolute top-1/2 right-2 transform -translate-y-1/2 h-9 w-9 text-primaryColor hover:bg-slate-100 transition-all hover:rounded-xl p-2" />
        </div>
      </div>

      {/* FILE UPLOAD OR IMAGE */}
      <div className="relative mb-4">
        <div className="relative group">
          {data.projectImageUrl ? (
            <>
              {renderFilePreview()}
              {/* Edit icon (open hidden file input) */}
              <button
                type="button"
                onClick={handleEditFile}
                className="absolute top-0 right-0 p-2 text-white rounded-full focus:outline-none"
              >
                <IoPencilSharp className="h-7 w-7 absolute top-4 right-4 text-primaryColor hover:bg-[#E4E3E6] transition-all rounded-full p-1" />
              </button>
              {/* Hidden input for re-upload (edit) */}
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={e => handleFileUpload(e.target.files ? Array.from(e.target.files) : null)}
              />
            </>
          ) : (
            // If no file, show FileUpload (handles drag/drop/click upload UI)
            <FileUpload
              onFileChange={handleFileUpload}
              acceptedFileTypes="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              maxFileSize={25}
            />
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {/* RICH TEXT EDITOR */}
        <RichTextEditor
          value={data.projectDescription || ''}
          onChange={content =>
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
