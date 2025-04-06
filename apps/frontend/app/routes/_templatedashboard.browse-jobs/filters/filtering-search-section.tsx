import WorkingHoursFilter from './WorkingHoursFilter';
import JobTypeFilter from './JobTypeFilter';
import SkillsFilter from './SkillsFilter';
import ExperienceLevelFilter from './ExperienceLevelFilter';
import HourlyRateFilter from './BudgetFilter';
import AppFormField from '~/common/form-fields';
import { ProjectType, ExperienceLevel } from '@mawaheb/db/src/types/enums';
import { BsSearch } from 'react-icons/bs';

interface FilteringSearchSectionProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filters: {
    workingHours: { from: string; to: string } | null;
    jobType: ProjectType | null;
    experienceLevel: ExperienceLevel | null;
    budget: number | null;
  };
  setFilters: (filters: any) => void;
}

export default function FilteringSearchSection({
  searchQuery,
  setSearchQuery,
  filters,
  setFilters,
}: FilteringSearchSectionProps) {
  // ✅ Check if any filter is applied
  const isAnyFilterApplied =
    searchQuery ||
    filters.workingHours ||
    filters.jobType ||
    filters.experienceLevel ||
    filters.budget;

  // ✅ Function to clear all filters
  const clearAllFilters = () => {
    setSearchQuery(''); // Reset search query
    setFilters({
      workingHours: null,
      jobType: null,
      experienceLevel: null, // ✅ Fixed wrong key (was yearsOfExperience)
      hourlyRate: null,
      budget: null,
    });
  };

  return (
    <div className="flex flex-col xl:flex-row gap-2 mt-4 mb-2 max-w-7xl">
      {/* 🔥 Search Field */}
      <div className="relative w-full sm:w-[80%] md:w-[60%] lg:w-[40%] xl:w-1/4 mb-1">
        <AppFormField
          id="search"
          name="search"
          type="text"
          placeholder="Hinted search text"
          defaultValue={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          label={
            <div className="flex items-center justify-center">
              <BsSearch /> <div className="ml-4">Hinted search text</div>
            </div>
          }
        />
      </div>

      {/* 🔥 Filters Section */}
      <div className="hidden md:grid md:grid-cols-3 gap-2 w-fit lg:flex h-fit xl:self-center">
        {/* 🔥 Skills Button (Functionality Coming Later) */}
        <SkillsFilter />

        {/* 🔥 Working Hours Button & Functionality */}
        <WorkingHoursFilter filters={filters} setFilters={setFilters} />

        {/* 🔥 Job Type Button & Functionality */}
        <JobTypeFilter filters={filters} setFilters={setFilters} />

        {/* 🔥 Experience Level Button & Functionality */}
        <ExperienceLevelFilter filters={filters} setFilters={setFilters} />

        {/* 🔥 Hourly Rate Button & Functionality */}
        <HourlyRateFilter filters={filters} setFilters={setFilters} />

        {/* 🔥 "Clear All Filters" Button (Appears only when filters are applied) */}
        {isAnyFilterApplied && (
          <button
            className="text-primaryColor underline hover:text-red-500 transition whitespace-nowrap ml-1 text-sm"
            onClick={clearAllFilters}
          >
            Clear All Filters
          </button>
        )}
      </div>
    </div>
  );
}
