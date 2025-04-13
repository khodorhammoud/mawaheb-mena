// All jobs that are not applied to yet :)

import { useFetcher } from '@remix-run/react';
import { useEffect, useState } from 'react';
import { Job } from '@mawaheb/db/types';
import JobCard from './jobCard';
import FilteringSearchSection from './filters/filtering-search-section';

interface RecommendedJobsProps {
  onJobSelect: (job: Job) => void;
  freelancerId: number;
  initialLimit?: number; // Add optional limit prop
}

export default function RecommendedJobs({
  onJobSelect,
  freelancerId,
  initialLimit = 20, // Default to 20 jobs
}: RecommendedJobsProps) {
  const fetcher = useFetcher<{ jobs: Job[] }>();
  const recommendedJobs =
    fetcher.data?.jobs.map(job => ({
      ...job,
      createdAt: job.createdAt ? new Date(job.createdAt) : new Date(),
      fulfilledAt: job.fulfilledAt ? new Date(job.fulfilledAt) : null,
    })) || [];
  const [limit, setLimit] = useState(initialLimit);

  // ✅ Filters (same as AllJobs)
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    workingHours: null,
    jobType: null,
    experienceLevel: null,
    budget: null,
  });

  // ✅ Use useFetcher to load Recommended jobs dynamically
  useEffect(() => {
    // console.log("🚀 Freelancer ID before setting searchParams:", freelancerId);
    // console.log("📊 Current limit:", limit);

    const searchParams = new URLSearchParams();
    searchParams.set('freelancerId', freelancerId.toString());
    searchParams.set('limit', limit.toString());

    // console.log("Submitting fetch request with:", searchParams.toString());

    fetcher.submit(searchParams, {
      method: 'get',
      action: '/api/jobs-recommendationJobs',
    });
  }, [freelancerId, limit]); // Add limit to dependencies

  // console.log("Recommended Jobs Data:", recommendedJobs);

  // ✅ Apply frontend filtering logic
  const filteredJobs = recommendedJobs.filter(job => {
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

    const matchesJobType = !filters.jobType || job.projectType === filters.jobType;

    const matchesExperienceLevel =
      !filters.experienceLevel || job.experienceLevel === filters.experienceLevel;

    const matchesBudget = !filters.budget || job.budget >= filters.budget;

    return (
      matchesSearch &&
      matchesWorkingHours &&
      matchesJobType &&
      matchesExperienceLevel &&
      matchesBudget
    );
  });

  // Add load more functionality
  const handleLoadMore = () => {
    setLimit(prevLimit => prevLimit + 10); // Increase limit by 10
  };

  return (
    <div>
      {/* <h1>Still ma 3melet job application hon 3ammi</h1> */}

      {/* ✅ Search and Filtering Section */}
      <FilteringSearchSection
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filters={filters}
        setFilters={setFilters}
      />

      <p className="text-black text-sm mt-2 ml-4 mb-10">
        {filteredJobs.length} Job{filteredJobs.length === 1 ? '' : 's'} Found
      </p>

      {/* ✅ Jobs List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-6xl">
        {filteredJobs.length > 0 ? (
          filteredJobs.map(job => <JobCard key={job.id} onSelect={onJobSelect} job={job} />)
        ) : (
          <p className="text-center text-gray-500">No jobs found.</p>
        )}
      </div>

      {/* Load More Button */}
      {filteredJobs.length >= limit && (
        <div className="mt-6 text-center">
          <button
            onClick={handleLoadMore}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Load More Jobs
          </button>
        </div>
      )}
    </div>
  );
}
