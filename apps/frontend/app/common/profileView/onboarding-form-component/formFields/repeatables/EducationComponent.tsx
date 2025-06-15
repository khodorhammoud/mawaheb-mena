import { EducationFormFieldType } from '@mawaheb/db/types';
import AppFormField from '~/common/form-fields';
import YearDropdownField from '~/common/form-fields/yearPickerField/YearPickerField';

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
        onChange={e => onTextChange({ ...data, degree: e.target.value })}
        maxLength={100}
      />
      <AppFormField
        type="text"
        placeholder="Institution"
        label="Institution"
        id="institution[]"
        name="institution[]"
        defaultValue={data.institution}
        onChange={e => onTextChange({ ...data, institution: e.target.value })}
      />
      <YearDropdownField
        id="graduationYear[]"
        label="Graduation Year"
        year={data.graduationYear}
        onYearChange={year => onTextChange({ ...data, graduationYear: year })}
      />
    </div>
  );
}

export default EducationComponent;
