import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { ComboBox, ComboBoxItem } from '~/components/ui/combobox';
import { ProjectType } from '@mawaheb/db/enums';

interface JobTypeFilterProps {
  filters: { jobType: ProjectType | null };
  setFilters: (filters: any) => void;
}

export default function JobTypeFilter({ filters, setFilters }: JobTypeFilterProps) {
  const [selectedJobType, setSelectedJobType] = useState<ProjectType | ''>(filters.jobType || '');
  const [isOpen, setIsOpen] = useState(false); // ✅ Controls dropdown visibility
  const dropdownRef = useRef<HTMLDivElement>(null); // ✅ Ref for detecting outside clicks

  const handleJobTypeChange = (value: string) => {
    setSelectedJobType(value as ProjectType);
    setFilters((prev: any) => ({ ...prev, jobType: value }));
    setIsOpen(false); // ✅ Close dropdown after selection
  };

  // ✅ Reset selectedJobType when filters.jobType is cleared
  useEffect(() => {
    if (!filters.jobType) {
      setSelectedJobType('');
    }
  }, [filters.jobType]);

  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setIsOpen(false); // ✅ Close dropdown if clicked outside
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const jobTypes = Object.values(ProjectType);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Button to open dropdown */}
      <button
        onClick={() => setIsOpen(true)} // ✅ Always opens dropdown on first click
        className="flex items-center gap-2 px-3 py-2 rounded-[10px] transition border w-full not-active-gradient
            border-gray-300 text-primaryColor bg-white hover:bg-primaryColor hover:text-white group text-sm"
      >
        Job Type
        {selectedJobType && (
          <X
            size={20}
            className="group-hover:text-white text-primaryColor hover:text-white hover:bg-gray-400 rounded-full p-[2px] transition"
            onClick={e => {
              e.stopPropagation();
              setSelectedJobType('');
              setFilters((prev: any) => ({ ...prev, jobType: null }));
              handleJobTypeChange(''); // ✅ Reset selected job type
            }}
          />
        )}
      </button>

      {/* Dropdown Options - Always Opens on First Click */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-[160px] border border-gray-300 bg-white rounded-[10px] shadow-md z-10">
          {jobTypes.map((jobType, index) => (
            <ComboBoxItem
              key={jobType}
              value={jobType}
              onSelect={() => handleJobTypeChange(jobType)}
              className={`px-4 py-2 cursor-pointer transition w-[160px]
                ${index === 0 ? 'rounded-t-md' : ''} 
                ${index === jobTypes.length - 1 ? 'rounded-b-md' : ''} 
                ${selectedJobType === jobType ? 'bg-gray-400 text-white' : 'hover:bg-gray-200'}`}
            >
              {jobType}
            </ComboBoxItem>
          ))}
        </div>
      )}
    </div>
  );
}
