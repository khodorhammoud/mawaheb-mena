import { EducationFormFieldType } from "~/types/User";
import AppFormField from "~/common/form-fields";

interface EducationComponentProps {
  data: EducationFormFieldType;
  onTextChange: (data: EducationFormFieldType) => void;
}

function EducationComponent({ data, onTextChange }: EducationComponentProps) {
  return (
    <div className="grid gap-6 mt-2 p-1">
      <AppFormField
        type="text"
        id="degree[]"
        name="degree[]"
        placeholder="Degree"
        defaultValue={data.degree}
        label="Degree"
        onChange={(e) => onTextChange({ ...data, degree: e.target.value })}
      />
      <AppFormField
        type="text"
        placeholder="Institution"
        label="Institution"
        id="institution[]"
        name="institution[]"
        defaultValue={data.institution}
        onChange={(e) => onTextChange({ ...data, institution: e.target.value })}
      />
      <AppFormField
        type="number"
        name="graduationYear[]"
        id="graduationYear[]"
        placeholder="Graduation Year"
        label="Graduation Year"
        defaultValue={data.graduationYear.toString()}
        onChange={(e) =>
          onTextChange({ ...data, graduationYear: parseInt(e.target.value) })
        }
        className="md:w-[50%]"
      />
    </div>
  );
}

export default EducationComponent;
