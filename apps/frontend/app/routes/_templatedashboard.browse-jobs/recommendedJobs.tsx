// All jobs that are not applied to yet :)

import { useFetcher } from '@remix-run/react';
import { useEffect, useState } from 'react';
import { Job } from '@mawaheb/db/types';
import JobCard from './jobCard';
import FilteringSearchSection from './filters/filtering-search-section';

// Dummy jobs for demo mode
const DUMMY_JOBS: Job[] = [
  {
    id: 99901,
    title: 'Front-end Developer',
    description: 'Looking for an experienced front-end developer for a React project.',
    budget: 5000,
    workingHoursPerWeek: 30,
    locationPreference: 'Remote',
    projectType: 'one-time',
    experienceLevel: 'mid_level',
    status: 'active',
    createdAt: new Date(),
    employerId: 1,
    jobCategoryId: 1,
    fulfilledAt: null,
    requiredSkills: [],
  },
  {
    id: 99902,
    title: 'Backend Developer',
    description: 'Need a Node.js developer to build RESTful APIs for our application.',
    budget: 4500,
    workingHoursPerWeek: 25,
    locationPreference: 'Remote',
    projectType: 'ongoing',
    experienceLevel: 'senior_level',
    status: 'active',
    createdAt: new Date(),
    employerId: 2,
    jobCategoryId: 2,
    fulfilledAt: null,
    requiredSkills: [],
  },
];

interface RecommendedJobsProps {
  onJobSelect: (job: Job) => void;
  freelancerId: number;
  initialLimit?: number; // Add optional limit prop
}

export default function RecommendedJobs({
  onJobSelect,
  freelancerId,
  initialLimit = 10,
}: RecommendedJobsProps) {
  // State to control whether to show real jobs or dummy ones
  const verified = true; // Change to false to show dummy jobs

  const fetcher = useFetcher<{ jobs: Job[]; totalCount: number }>();
  const [loadedJobs, setLoadedJobs] = useState<Job[]>([]);
  const [totalJobsCount, setTotalJobsCount] = useState(0);
  const [limit, setLimit] = useState(initialLimit);
  const [isLoading, setIsLoading] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  // ✅ Filters (same as AllJobs)
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    workingHours: null,
    jobType: null,
    experienceLevel: null,
    budget: null,
  });

  // ✅ Use useFetcher to load Recommended jobs dynamically - Only if verified is true
  useEffect(() => {
    if (verified) {
      const searchParams = new URLSearchParams();
      searchParams.set('freelancerId', freelancerId.toString());
      searchParams.set('limit', limit.toString());

      setIsLoading(true);
      fetcher.submit(searchParams, {
        method: 'get',
        action: '/api/jobs-recommendationJobs',
      });
    }
  }, [verified, freelancerId, limit]); // Add verified to dependencies

  // Update state when data arrives - Only if verified is true
  useEffect(() => {
    if (verified && fetcher.data) {
      if (isFirstLoad || limit === initialLimit) {
        // Initialize or reset jobs
        setLoadedJobs(
          fetcher.data.jobs.map(job => ({
            ...job,
            createdAt: job.createdAt ? new Date(job.createdAt) : new Date(),
            fulfilledAt: job.fulfilledAt ? new Date(job.fulfilledAt) : null,
          }))
        );
        setIsFirstLoad(false);
      } else {
        // Append new jobs, avoiding duplicates
        const newJobs = fetcher.data.jobs.map(job => ({
          ...job,
          createdAt: job.createdAt ? new Date(job.createdAt) : new Date(),
          fulfilledAt: job.fulfilledAt ? new Date(job.fulfilledAt) : null,
        }));

        setLoadedJobs(prevJobs => {
          const existingIds = new Set(prevJobs.map(job => job.id));
          const uniqueNewJobs = newJobs.filter(job => !existingIds.has(job.id));
          return [...prevJobs, ...uniqueNewJobs];
        });
      }

      // Update total count
      setTotalJobsCount(fetcher.data.totalCount);
      setIsLoading(false);
    }
  }, [verified, fetcher.data, isFirstLoad, initialLimit, limit]);

  // Set dummy data when not showing real jobs
  useEffect(() => {
    if (!verified) {
      // Set dummy jobs and count
      setLoadedJobs(DUMMY_JOBS);
      setTotalJobsCount(6); // Pretend there are 6 total jobs
      setIsLoading(false);
    }
  }, [verified]);

  // ✅ Apply frontend filtering logic
  const filteredJobs = loadedJobs.filter(job => {
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

  // Determine whether to show load more button - only in real jobs mode
  const showLoadMoreButton =
    verified &&
    loadedJobs.length > 0 &&
    loadedJobs.length < totalJobsCount &&
    fetcher.data?.jobs &&
    fetcher.data.jobs.length === initialLimit;

  // For the dummy mode, create 4 additional blurred jobs
  const createBlurredJobs = () => {
    if (!verified) {
      return (
        <div className="grid md:grid-cols-2 gap-x-10 max-w-6xl">
          {/* First row of blurred jobs */}
          <div className="filter blur-sm opacity-75 pointer-events-none">
            <JobCard key="blurred1" onSelect={() => {}} job={DUMMY_JOBS[0]} />
          </div>
          <div className="filter blur-sm opacity-75 pointer-events-none">
            <JobCard key="blurred2" onSelect={() => {}} job={DUMMY_JOBS[1]} />
          </div>

          {/* Second row of blurred jobs */}
          <div className="filter blur-sm opacity-75 pointer-events-none">
            <JobCard key="blurred3" onSelect={() => {}} job={DUMMY_JOBS[0]} />
          </div>
          <div className="filter blur-sm opacity-75 pointer-events-none">
            <JobCard key="blurred4" onSelect={() => {}} job={DUMMY_JOBS[1]} />
          </div>
        </div>
      );
    }
    return null;
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

      {verified && (
        <p className="text-black text-sm mt-2 ml-4 mb-10">
          {totalJobsCount > 0 && (
            <>
              <span className="font-bold text-primaryColor text-base">
                {loadedJobs.length} {loadedJobs.length === 1 ? 'job' : 'jobs'}
              </span>
              {` out of `}
              <span>{totalJobsCount} total</span>
            </>
          )}
        </p>
      )}

      {verified ? (
        // Real Jobs UI
        <>
          {/* ✅ Jobs List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-6xl">
            {filteredJobs.length > 0 ? (
              filteredJobs.map(job => <JobCard key={job.id} onSelect={onJobSelect} job={job} />)
            ) : (
              <p className="text-center text-gray-500 col-span-2 py-8 text-xl">No jobs found.</p>
            )}
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="mt-6 text-center">
              <p>Loading jobs...</p>
            </div>
          )}

          {/* No More Jobs Message */}
          {loadedJobs.length > 0 && loadedJobs.length === totalJobsCount && !isLoading && (
            <div className="mt-6 text-center">
              <p className="text-gray-500">No more jobs available.</p>
            </div>
          )}

          {/* Load More Button - Only show if there are more jobs to load */}
          {showLoadMoreButton && (
            <div className="mt-6 text-center">
              <button
                onClick={handleLoadMore}
                className="px-4 py-2 not-active-gradient rounded-xl text-white bg-primaryColor transition-colors"
                disabled={isLoading}
              >
                {isLoading ? 'Loading...' : 'Load More Jobs'}
              </button>
            </div>
          )}
        </>
      ) : (
        // Dummy Jobs UI with Blurred Additional Jobs
        <>
          {/* Regular Dummy Jobs */}
          <div className="grid md:grid-cols-2 gap-x-10 max-w-6xl mt-10">
            {DUMMY_JOBS.map(job => (
              <JobCard key={job.id} onSelect={() => {}} job={job} />
            ))}
          </div>

          {/* Blurred Dummy Jobs */}
          {createBlurredJobs()}

          {/* Message about account verification */}
          <div className="mt-6 text-center">
            <p className="text-gray-500 mb-2">Wait your account to get verified.</p>
          </div>
        </>
      )}
    </div>
  );
}
