import { Input } from "~/components/ui/input";
import { EducationFormFieldType } from "~/types/User";

interface EducationComponentProps {
  data: EducationFormFieldType;
  onTextChange: (data: EducationFormFieldType) => void;
}

function EducationComponent({ data, onTextChange }: EducationComponentProps) {
  return (
    <div className="space-y-6">
      <div className="flex space-x-4">
        <Input
          type="text"
          placeholder="Degree"
          className="w-full border-gray-300 rounded-md"
          value={data.degree}
          onChange={(e) => onTextChange({ ...data, degree: e.target.value })}
          name="degree[]"
        />
        <Input
          type="text"
          placeholder="Institution"
          className="w-full border-gray-300 rounded-md"
          value={data.institution}
          onChange={(e) =>
            onTextChange({ ...data, institution: e.target.value })
          }
          name="institution[]"
        />
        <Input
          type="number"
          placeholder="Graduation Year"
          className="w-1/2 border-gray-300 rounded-md"
          value={data.graduationYear}
          onChange={(e) =>
            onTextChange({ ...data, graduationYear: parseInt(e.target.value) })
          }
          name="graduationYear[]"
        />
      </div>
    </div>
  );
}

export default EducationComponent;
