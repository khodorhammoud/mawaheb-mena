import WorkingHoursFilter from "./WorkingHoursFilter";
import JobTypeFilter from "./JobTypeFilter";
import SkillsFilter from "./SkillsFilter";
import AppFormField from "~/common/form-fields";
import { ProjectType } from "~/types/enums";

interface FilteringSearchSectionProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filters: {
    workingHours: { from: string; to: string } | null;
    jobType: ProjectType | null;
  };
  setFilters: (filters: any) => void;
}

export default function FilteringSearchSection({
  searchQuery,
  setSearchQuery,
  filters,
  setFilters,
}: FilteringSearchSectionProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4 lg:gap-6 xl:gap-8 mt-4 mb-8">
      {/* 🔥 Search Field */}
      <div className="relative md:w-1/3 w-full">
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

      <div className="flex gap-2">
        {/* 🔥 Skills Button (Functionality Coming Later) */}
        <SkillsFilter />

        {/* 🔥 Working Hours Button & Functionality */}
        <WorkingHoursFilter filters={filters} setFilters={setFilters} />

        {/* 🔥 Job Type Button & Functionality */}
        <JobTypeFilter filters={filters} setFilters={setFilters} />
      </div>
    </div>
  );
}
