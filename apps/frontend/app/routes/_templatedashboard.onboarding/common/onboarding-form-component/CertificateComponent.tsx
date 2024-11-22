import { useState } from "react";
import { Input } from "~/components/ui/input";
import { CertificateFormFieldType } from "~/types/User";
import Upload from "~/common/upload/Upload";
import Or from "~/common/or/Or";
import AppFormField from "~/common/form-fields";

interface CertificateComponentProps {
  data: CertificateFormFieldType;
  onTextChange: (data: CertificateFormFieldType) => void;
  onFileChange: (file: File | null) => void;
}

function CertificateComponent({
  data,
  onTextChange,
  onFileChange,
}: CertificateComponentProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      onFileChange(droppedFile);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files ? e.target.files[0] : null;
    setFile(selectedFile);
    onFileChange(selectedFile);
  };

  const clearFile = () => {
    setFile(null);
    onFileChange(null);
  };

  return (
    <div className="space-y-6">
      <div className="mt-4">
        <Upload />
      </div>
      <Or />

      <div className="grid gap-6">
        <AppFormField
          type="text"
          id="certificateName[]"
          name="certificateName[]"
          placeholder="Certificate Name"
          label="Certificate Name"
          onChange={(e) =>
            onTextChange({ ...data, certificateName: e.target.value })
          }
        />

        <AppFormField
          type="text"
          placeholder="Certificate Issued by"
          label="Certificate Issued by"
          id="issuedBy[]"
          name="issuedBy[]"
          onChange={(e) => onTextChange({ ...data, issuedBy: e.target.value })}
        />

        <AppFormField
          type="number"
          id="yearIssued[]"
          name="yearIssued[]"
          placeholder="Year Issued"
          label="Year Issued"
          onChange={(e) =>
            onTextChange({ ...data, yearIssued: parseInt(e.target.value) })
          }
          className="md:w-[50%]"
        />
      </div>
    </div>
  );
}

export default CertificateComponent;
