import { useEffect, useState } from "react";
import { Job } from "~/types/Job";
import JobCard from "./jobCard";
import FilteringSearchSection from "./filters/filtering-search-section";

interface RecommendedJobsProps {
  onJobSelect: (job: Job) => void;
}

export default function RecommendedJobs({ onJobSelect }: RecommendedJobsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    workingHours: null,
    jobType: null,
    experienceLevel: null,
    budget: null,
  });

  // ✅ Load jobs ONCE when the component mounts (No backend filtering)
  const [allJobs, setAllJobs] = useState<Job[]>([]);

  useEffect(() => {
    async function fetchJobs() {
      // ✅ Fetch all jobs once (No filtering on the backend)
      const response = await fetch("/api/jobs-recommended"); // this endpoint returns ALL jobs
      const data = await response.json();
      setAllJobs(data.jobs);
    }
    fetchJobs();
  }, []);

  const filteredJobs = allJobs.filter((job) => {
    // ✅ Search Filter
    const matchesSearch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase());

    // ✅ Working Hours Filter
    const matchesWorkingHours =
      !filters.workingHours || // No filter applied → show all jobs
      (!filters.workingHours.from && !filters.workingHours.to) || // No min/max set → show all
      (filters.workingHours.from &&
        job.workingHoursPerWeek >= filters.workingHours.from && // Check min
        filters.workingHours.to &&
        job.workingHoursPerWeek <= filters.workingHours.to); // Check max

    // ✅ Job Type Filter
    const matchesJobType =
      !filters.jobType || // No filter applied → show all jobs
      job.projectType === filters.jobType; // Match job type

    // ✅ Experience Level Filter
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
