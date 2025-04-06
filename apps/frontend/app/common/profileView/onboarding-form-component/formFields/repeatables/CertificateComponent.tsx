import { CertificateFormFieldType } from '@mawaheb/db/src/types/User';
import AppFormField from '~/common/form-fields';
import FileUpload from '~/common/upload/fileUpload';
import { useRef, useState } from 'react';
import { IoPencilSharp } from 'react-icons/io5';

interface CertificateComponentProps {
  data: CertificateFormFieldType;
  onTextChange: (data: CertificateFormFieldType) => void;
  onFileChange: (files: File[] | null) => void;
}

const CertificateComponent: React.FC<CertificateComponentProps> = ({
  data,
  onTextChange,
  onFileChange,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null); // Ref for hidden file input
  const [filePreview, setFilePreview] = useState<string | null>(data.attachmentUrl || null); // Track file preview

  // Determine file type dynamically based on the attachmentName
  const determineFileType = (fileName: string): string => {
    const extension = fileName.split('.').pop()?.toLowerCase() || '';
    if (['png', 'jpg', 'jpeg', 'gif', 'bmp'].includes(extension)) {
      return 'image';
    } else if (['pdf'].includes(extension)) {
      return 'pdf';
    }
    return 'unknown'; // Fallback for unsupported file types
  };

  const handleFileUpload = (files: File[] | null) => {
    if (files && files.length > 0) {
      const uploadedFile = files[0];
      const fileUrl = URL.createObjectURL(uploadedFile);

      setFilePreview(fileUrl); // Update file preview

      // Update the parent data
      onFileChange(files);
      onTextChange({
        ...data,
        attachmentName: uploadedFile.name,
        attachmentUrl: fileUrl,
      });
    } else {
      // Reset preview and data if no file is selected
      setFilePreview(null);
      onTextChange({ ...data, attachmentName: '', attachmentUrl: '' });
    }
  };

  const handleEditFile = () => {
    // Trigger file input click
    fileInputRef.current?.click();
  };

  const renderFilePreview = () => {
    const fileType = determineFileType(data.attachmentName || '');
    if (fileType === 'image' && data.attachmentUrl) {
      return (
        <img
          src={data.attachmentUrl}
          alt={data.certificateName || 'Certificate Image'}
          className="h-28 rounded-xl object-cover"
        />
      );
    } else if (fileType === 'pdf' && data.attachmentUrl) {
      return (
        <embed
          src={data.attachmentUrl}
          type="application/pdf"
          className="h-28 w-full rounded-xl"
          title="Certificate PDF"
        />
      );
    }

    return <span className="text-gray-500">No preview available</span>;
  };

  return (
    <div className="space-y-6 p-1">
      <div className="mt-4">
        <div className="relative group">
          {filePreview ? (
            <div className="relative">
              {renderFilePreview()}
              {/* Edit Icon */}
              <button
                type="button"
                onClick={handleEditFile}
                className="absolute top-2 right-2 p-2 text-white rounded-full focus:outline-none"
              >
                <IoPencilSharp className="h-7 w-7 absolute top-4 right-4 text-primaryColor hover:bg-[#E4E3E6] transition-all rounded-full p-1" />
              </button>
            </div>
          ) : (
            <FileUpload
              onFileChange={handleFileUpload}
              acceptedFileTypes="image/*,application/pdf"
              maxFileSize={10}
            />
          )}

          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*,application/pdf"
            onChange={e => handleFileUpload(e.target.files ? Array.from(e.target.files) : null)}
          />
        </div>
      </div>

      {/* Form Fields */}
      <div className="grid gap-6">
        <AppFormField
          type="text"
          id="certificateName[]"
          name="certificateName[]"
          placeholder="Certificate Name"
          label="Certificate Name"
          defaultValue={data.certificateName}
          onChange={e => onTextChange({ ...data, certificateName: e.target.value })}
        />

        <AppFormField
          type="text"
          placeholder="Certificate Issued by"
          label="Certificate Issued by"
          id="issuedBy[]"
          name="issuedBy[]"
          defaultValue={data.issuedBy}
          onChange={e => onTextChange({ ...data, issuedBy: e.target.value })}
        />

        <AppFormField
          type="number"
          id="yearIssued[]"
          name="yearIssued[]"
          placeholder="Year Issued"
          label="Year Issued"
          defaultValue={data.yearIssued ? data.yearIssued.toString() : ''}
          onChange={e => onTextChange({ ...data, yearIssued: parseInt(e.target.value) || 0 })}
          className="md:w-[50%]"
        />
      </div>
    </div>
  );
};

export default CertificateComponent;
