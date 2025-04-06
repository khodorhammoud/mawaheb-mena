import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { ComboBox, ComboBoxItem } from '~/components/ui/combobox';
import { ExperienceLevel } from '@mawaheb/db/src/types/enums';

interface ExperienceLevelFilterProps {
  filters: { experienceLevel: ExperienceLevel | null };
  setFilters: (filters: any) => void;
}

export default function ExperienceLevelFilter({ filters, setFilters }: ExperienceLevelFilterProps) {
  const [selectedExperience, setSelectedExperience] = useState<ExperienceLevel | ''>(
    filters.experienceLevel || ''
  );
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleExperienceChange = (value: ExperienceLevel | '') => {
    setSelectedExperience(value);
    setFilters((prev: any) => {
      const newFilters = {
        ...prev,
        experienceLevel: value === '' ? null : value,
      };
      return newFilters;
    });

    setIsOpen(false); // ✅ Close dropdown after selection
  };

  // ✅ Reset selectedExperience when filters.experienceLevel is cleared
  useEffect(() => {
    if (!filters.experienceLevel) {
      setSelectedExperience('');
    }
  }, [filters.experienceLevel]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const experienceLevels = Object.values(ExperienceLevel);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Button to open dropdown */}
      <button
        onClick={() => setIsOpen(prev => !prev)} // ✅ Toggle dropdown
        className="flex items-center justify-between px-4 py-2 rounded-[10px] transition border w-full not-active-gradient
            border-gray-300 text-primaryColor bg-white hover:bg-primaryColor hover:text-white group text-sm"
      >
        Experience Level
        {selectedExperience && (
          <X
            size={20}
            className="group-hover:text-white text-primaryColor hover:text-white hover:bg-gray-400 rounded-full p-[2px] transition ml-2"
            onClick={e => {
              e.stopPropagation();
              handleExperienceChange(''); // ✅ Clears filter correctly
            }}
          />
        )}
      </button>

      {/* Dropdown Options */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-[120px] border border-gray-300 bg-white rounded-[10px] shadow-md z-10">
          {experienceLevels.map((level, index) => (
            <ComboBoxItem
              key={level}
              value={level}
              onSelect={() => handleExperienceChange(level)}
              className={`px-4 py-2 cursor-pointer transition w-[120px] 
                ${index === 0 ? 'rounded-t-md' : ''} 
                ${index === experienceLevels.length - 1 ? 'rounded-b-md' : ''} 
                ${selectedExperience === level ? 'bg-gray-400 text-white' : 'hover:bg-gray-200'}`}
            >
              {level.replace('_', ' ')}
            </ComboBoxItem>
          ))}
        </div>
      )}
    </div>
  );
}
