import { useFetcher } from "@remix-run/react";
import { useEffect, useState } from "react";
import { Job } from "~/types/Job";
import JobCard from "./jobCard";
import FilteringSearchSection from "./filters/filtering-search-section";
import { JobApplicationStatus } from "~/types/enums";

interface MyJobsProps {
  onJobSelect: (job: Job) => void;
}

export default function MyJobs({ onJobSelect }: MyJobsProps) {
  const fetcher = useFetcher<{
    jobs: (Job & { applicationStatus: string })[];
  }>();
  const myJobs = fetcher.data?.jobs || [];

  // ✅ Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    workingHours: null,
    jobType: null,
    experienceLevel: null,
    budget: null,
  });

  useEffect(() => {
    fetcher.submit(null, {
      method: "get",
      action: "/api/jobs-myJobs",
    });
  }, []);

  // ✅ Apply frontend filtering
  const filteredJobs = myJobs.filter((job) => {
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

  // ✅ Group jobs based on Job Application Status
  const groupedJobs = filteredJobs.reduce(
    (acc, job) => {
      let category = "Applied"; // Default

      if (job.applicationStatus) {
        if (job.applicationStatus.toLowerCase() === "accepted") {
          category = job.status === "closed" ? "Completed Jobs" : "Active Jobs";
        } else if (job.applicationStatus.toLowerCase() === "rejected") {
          category = "Opportunity Closed";
        } else if (
          job.applicationStatus.toLowerCase() === "shortlisted" ||
          job.applicationStatus.toLowerCase() === "pending"
        ) {
          category = "Applied";
        }
      }

      if (!acc[category]) acc[category] = [];
      acc[category].push(job);
      return acc;
    },
    {} as Record<string, Job[]>
  );

  // ✅ Ensure "Active Jobs" is always first
  const categoryOrder = [
    "Completed Jobs",
    "Active Jobs",
    "Applied",
    "Opportunity Closed",
  ];
  const sortedCategories = Object.keys(groupedJobs).sort((a, b) => {
    return categoryOrder.indexOf(a) - categoryOrder.indexOf(b);
  });

  return (
    <div>
      {/* <h1>
        hadol bs li 3melet 3alehon job application w hiye active job akid for
        now
      </h1> */}

      <FilteringSearchSection
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filters={filters}
        setFilters={setFilters}
      />

      <p className="text-black text-sm mt-2 ml-4 mb-10">
        {filteredJobs.length} Job{filteredJobs.length === 1 ? "" : "s"} Found
      </p>

      <section className="">
        {sortedCategories.map((status) => (
          <div key={status} className="mb-4">
            <h2 className="font-semibold xl:text-3xl lg:text-2xl text-2xl ml-1 mb-6">
              {status}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-6xl">
              {groupedJobs[status].map((job) => (
                <JobCard key={job.id} onSelect={onJobSelect} job={job} />
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
