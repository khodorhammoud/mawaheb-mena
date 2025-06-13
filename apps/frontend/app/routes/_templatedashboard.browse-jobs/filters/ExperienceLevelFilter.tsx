import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { ComboBox } from '~/components/ui/combobox';
import { ExperienceLevel } from '@mawaheb/db/enums';

interface ExperienceLevelFilterProps {
  filters: { experienceLevel: ExperienceLevel | null };
  setFilters: (filters: any) => void;
}

export default function ExperienceLevelFilter({ filters, setFilters }: ExperienceLevelFilterProps) {
  const [selectedExperience, setSelectedExperience] = useState<ExperienceLevel | ''>(
    filters.experienceLevel || ''
  );

  // Build options for ComboBox
  const experienceLevels = Object.values(ExperienceLevel).map(level => ({
    value: level,
    label: level.replace('_', ' '),
  }));

  const handleChange = (value: string) => {
    setSelectedExperience(value as ExperienceLevel);
    setFilters((prev: any) => ({
      ...prev,
      experienceLevel: value === '' ? null : value,
    }));
  };

  // Reset selectedExperience when filters.experienceLevel is cleared
  useEffect(() => {
    if (!filters.experienceLevel) {
      setSelectedExperience('');
    }
  }, [filters.experienceLevel]);

  return (
    <div className="relative flex items-center gap-2 w-full">
      <div className="flex-1">
        <ComboBox
          options={experienceLevels}
          value={selectedExperience}
          onChange={handleChange}
          placeholder="Experience Level"
          className="w-full text-primaryColor hover:text-primaryColor"
        />
      </div>
      {selectedExperience && (
        <button
          type="button"
          onClick={() => {
            setSelectedExperience('');
            setFilters((prev: any) => ({ ...prev, experienceLevel: null }));
          }}
          className="ml-1 p-1 rounded-full hover:bg-gray-200"
          aria-label="Clear selection"
        ></button>
      )}
    </div>
  );
}
