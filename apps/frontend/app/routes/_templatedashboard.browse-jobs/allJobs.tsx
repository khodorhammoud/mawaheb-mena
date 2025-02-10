import { useFetcher } from "@remix-run/react";
import { useEffect, useState } from "react";
import { Job } from "~/types/Job";
import JobCard from "./jobCard";
import FilteringSearchSection from "./filters/filtering-search-section";

interface AllJobsProps {
  onJobSelect: (job: Job) => void;
}

export default function AllJobs({ onJobSelect }: AllJobsProps) {
  const fetcher = useFetcher<{ jobs: Job[] }>();
  const allJobs = fetcher.data?.jobs || [];

  // ✅ Filters (same as RecommendedJobs)
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    workingHours: null,
    jobType: null,
    experienceLevel: null,
    budget: null,
  });

  // ✅ Fetch jobs from the backend (No backend filtering)
  useEffect(() => {
    fetcher.submit(null, {
      method: "get",
      action: "/api/jobs-filtered",
    });
  }, []);

  // ✅ Apply same frontend filtering logic
  const filteredJobs = allJobs.filter((job) => {
    // ✅ Search Filter
    const matchesSearch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase());

    // ✅ Working Hours Filter
    const matchesWorkingHours =
      !filters.workingHours ||
      (!filters.workingHours.from && !filters.workingHours.to) ||
      (filters.workingHours.from &&
        job.workingHoursPerWeek >= filters.workingHours.from &&
        filters.workingHours.to &&
        job.workingHoursPerWeek <= filters.workingHours.to);

    // ✅ Job Type Filter
    const matchesJobType =
      !filters.jobType || job.projectType === filters.jobType;

    // ✅ Experience Level Filter
    const matchesExperienceLevel =
      !filters.experienceLevel ||
      job.experienceLevel === filters.experienceLevel;

    // ✅ Budget Filter (Job budget must be >= selected budget)
    const matchesBudget = !filters.budget || job.budget >= filters.budget;

    return (
      matchesSearch &&
      matchesWorkingHours &&
      matchesJobType &&
      matchesExperienceLevel &&
      matchesBudget
    );
  });

  return (
    <div>
      {/* ✅ Search and Filtering Section */}
      <FilteringSearchSection
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filters={filters}
        setFilters={setFilters}
      />

      {/* ✅ Jobs List */}
      <div className="grid md:grid-cols-2 gap-x-10 max-w-6xl">
        {filteredJobs.length > 0 ? (
          filteredJobs.map((job) => (
            <JobCard key={job.id} onSelect={onJobSelect} job={job} />
          ))
        ) : (
          <p className="text-center text-gray-500">No jobs found.</p>
        )}
      </div>
    </div>
  );
}
