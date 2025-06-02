import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { ComboBox } from '~/components/ui/combobox';
import { ProjectType } from '@mawaheb/db/enums';

interface JobTypeFilterProps {
  filters: { jobType: ProjectType | null };
  setFilters: (filters: any) => void;
}

export default function JobTypeFilter({ filters, setFilters }: JobTypeFilterProps) {
  const [selectedJobType, setSelectedJobType] = useState<ProjectType | ''>(filters.jobType || '');

  // Create options array for ComboBox
  const jobTypes = Object.values(ProjectType).map(jt => ({
    value: jt,
    label: jt,
  }));

  // Handle ComboBox selection
  const handleChange = (value: string) => {
    setSelectedJobType(value as ProjectType);
    setFilters((prev: any) => ({ ...prev, jobType: value }));
  };

  // Reset selectedJobType when filters.jobType is cleared
  useEffect(() => {
    if (!filters.jobType) {
      setSelectedJobType('');
    }
  }, [filters.jobType]);

  return (
    <div className="relative flex items-center w-full">
      <div className="flex-1">
        <ComboBox
          options={jobTypes}
          value={selectedJobType}
          onChange={handleChange}
          placeholder="Job Type"
          className="w-full text-primaryColor hover:text-primaryColor"
        />
      </div>
      {/* Show X button only when selectedJobType is not empty */}
      {selectedJobType && (
        <button
          type="button"
          onClick={() => {
            setSelectedJobType('');
            setFilters((prev: any) => ({ ...prev, jobType: null }));
          }}
          className="rounded-full hover:bg-gray-200"
          aria-label="Clear selection"
        ></button>
      )}
    </div>
  );
}
