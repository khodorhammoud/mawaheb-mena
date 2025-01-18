import { CertificateFormFieldType } from "~/types/User";
import Or from "~/common/or/Or";
import AppFormField from "~/common/form-fields";
import FileUpload from "~/common/upload/fileUpload";

interface CertificateComponentProps {
  data: CertificateFormFieldType;
  onTextChange: (data: CertificateFormFieldType) => void;
  onFileChange: (file: File | null) => void;
}

const handleFileUpload = (file: File | null) => {
  console.log("File uploaded:", file);
};

function CertificateComponent({
  data,
  onTextChange,
}: CertificateComponentProps) {
  return (
    <div className="space-y-6 p-1">
      <div className="mt-4">
        <FileUpload onFileChange={handleFileUpload} />
      </div>
      <Or />

      <div className="grid gap-6">
        <AppFormField
          type="text"
          id="certificateName[]"
          name="certificateName[]"
          placeholder="Certificate Name"
          label="Certificate Name"
          defaultValue={data.certificateName}
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
          defaultValue={data.issuedBy}
          onChange={(e) => onTextChange({ ...data, issuedBy: e.target.value })}
        />

        <AppFormField
          type="number"
          id="yearIssued[]"
          name="yearIssued[]"
          placeholder="Year Issued"
          label="Year Issued"
          defaultValue={data.yearIssued.toString()}
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
