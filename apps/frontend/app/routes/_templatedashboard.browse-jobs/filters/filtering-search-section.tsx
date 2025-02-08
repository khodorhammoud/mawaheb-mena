import WorkingHoursFilter from "./WorkingHoursFilter";
import JobTypeFilter from "./JobTypeFilter";
import SkillsFilter from "./SkillsFilter";
import YearsOfExperienceFilter from "./YearsOfExperienceFilter";
import HourlyRateFilter from "./HourlyRateFilter";
import AppFormField from "~/common/form-fields";
import { ProjectType } from "~/types/enums";

interface FilteringSearchSectionProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filters: {
    workingHours: { from: string; to: string } | null;
    jobType: ProjectType | null;
    yearsOfExperience: number | null;
    hourlyRate: number | null;
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
    filters.yearsOfExperience ||
    filters.hourlyRate;

  // ✅ Function to clear all filters
  const clearAllFilters = () => {
    setSearchQuery(""); // Reset search query
    setFilters({
      workingHours: null,
      jobType: null,
      yearsOfExperience: null,
      hourlyRate: null,
    });
  };

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mt-4 mb-8 max-w-6xl">
      {/* 🔥 Search Field */}
      <div className="relative w-full lg:w-1/3">
        <AppFormField
          id="search"
          name="search"
          type="text"
          placeholder="Hinted search text"
          defaultValue={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          label={
            <div className="flex items-center">
              <span className="text-gray-500">🔍</span>
              <span className="ml-2">Hinted search text</span>
            </div>
          }
        />
      </div>

      {/* 🔥 Filters Section */}
      <div className="flex flex-wrap gap-3 w-full whitespace-nowrap">
        {/* 🔥 Skills Button (Functionality Coming Later) */}
        <SkillsFilter />

        {/* 🔥 Working Hours Button & Functionality */}
        <WorkingHoursFilter filters={filters} setFilters={setFilters} />

        {/* 🔥 Job Type Button & Functionality */}
        <JobTypeFilter filters={filters} setFilters={setFilters} />

        {/* 🔥 Years of Experience Button & Functionality */}
        <YearsOfExperienceFilter filters={filters} setFilters={setFilters} />

        {/* 🔥 Hourly Rate Button & Functionality */}
        <HourlyRateFilter filters={filters} setFilters={setFilters} />

        {/* 🔥 "Clear All Filters" Button (Appears only when filters are applied) */}
        {isAnyFilterApplied && (
          <button
            className="text-primaryColor underline hover:text-red-500 transition ml-2 whitespace-nowrap"
            onClick={clearAllFilters}
          >
            Clear All Filters
          </button>
        )}
      </div>
    </div>
  );
}
