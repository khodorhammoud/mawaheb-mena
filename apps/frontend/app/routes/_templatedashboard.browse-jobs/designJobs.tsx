// All jobs that are not applied to yet :)

import { useFetcher } from "@remix-run/react";
import { useEffect, useState } from "react";
import { Job } from "~/types/Job";
import JobCard from "./jobCard";
import FilteringSearchSection from "./filters/filtering-search-section";

interface DesignJobsProps {
  onJobSelect: (job: Job) => void;
}

export default function DesignJobs({ onJobSelect }: DesignJobsProps) {
  const fetcher = useFetcher<{ jobs: Job[] }>();
  const DesignJobs = fetcher.data?.jobs || [];

  // ✅ Filters (same as AllJobs)
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    workingHours: null,
    jobType: null,
    experienceLevel: null,
    budget: null,
  });

  // ✅ Use useFetcher to load Design jobs dynamically
  useEffect(() => {
    fetcher.submit(null, {
      method: "get",
      action: "/api/jobs-designJobs",
    });
  }, []);

  // ✅ Apply frontend filtering logic
  const filteredJobs = DesignJobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesWorkingHours =
      !filters.workingHours ||
      (!filters.workingHours.from && !filters.workingHours.to) ||
      (filters.workingHours.from &&
        job.workingHoursPerWeek >= filters.workingHours.from &&
        filters.workingHours.to &&
        job.workingHoursPerWeek <= filters.workingHours.to);

    const matchesJobType =
      !filters.jobType || job.projectType === filters.jobType;

    const matchesExperienceLevel =
      !filters.experienceLevel ||
      job.experienceLevel === filters.experienceLevel;

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

      <p className="text-black text-sm mt-2 ml-4 mb-10">
        {filteredJobs.length} Job{filteredJobs.length === 1 ? "" : "s"} Found
      </p>

      {/* ✅ Jobs List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-6xl">
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
