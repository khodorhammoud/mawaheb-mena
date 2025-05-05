// All Jobs, but the ones that are active (active till now, and the employer didnt make it draft or pased or closed or deleted ❤️)

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

interface AllJobsProps {
  onJobSelect: (job: Job) => void;
}

export default function AllJobs({ onJobSelect }: AllJobsProps) {
  // State to control whether to show real jobs or dummy ones
  const verified = true; // Change to false to show dummy jobs

  const fetcher = useFetcher<{ jobs: Job[]; totalCount: number }>();
  const [limit, setLimit] = useState(10);
  const [offset, setOffset] = useState(0);
  const [loadedJobs, setLoadedJobs] = useState<Job[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  // ✅ Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    workingHours: null,
    jobType: null,
    experienceLevel: null,
    budget: null,
  });

  // ✅ Fetch jobs from the backend with pagination and filters - Only if verified is true
  useEffect(() => {
    if (verified) {
      const searchParams = new URLSearchParams();
      searchParams.set('limit', limit.toString());
      searchParams.set('offset', offset.toString());
      searchParams.set('searchQuery', searchQuery);

      // Add filter parameters
      if (filters.workingHours?.from)
        searchParams.set('workingHoursFrom', filters.workingHours.from.toString());
      if (filters.workingHours?.to)
        searchParams.set('workingHoursTo', filters.workingHours.to.toString());
      if (filters.jobType) searchParams.set('jobType', filters.jobType);
      if (filters.experienceLevel) searchParams.set('experienceLevel', filters.experienceLevel);
      if (filters.budget) searchParams.set('budget', filters.budget.toString());

      fetcher.submit(searchParams, {
        method: 'get',
        action: '/api/jobs-allJobs',
      });
    }
  }, [verified, limit, offset, searchQuery, filters]);

  // Update loaded jobs when new data arrives - Only if verified is true
  useEffect(() => {
    if (verified && fetcher.data) {
      if (isFirstLoad || offset === 0) {
        // If it's the first load or filters were changed (offset reset to 0),
        // replace all loaded jobs
        setLoadedJobs(
          fetcher.data.jobs.map(job => ({
            ...job,
            createdAt: job.createdAt ? new Date(job.createdAt) : new Date(),
            fulfilledAt: job.fulfilledAt ? new Date(job.fulfilledAt) : null,
          }))
        );
        setIsFirstLoad(false);
      } else {
        // Otherwise, append new jobs to the existing ones, avoiding duplicates
        const newJobs = fetcher.data.jobs.map(job => ({
          ...job,
          createdAt: job.createdAt ? new Date(job.createdAt) : new Date(),
          fulfilledAt: job.fulfilledAt ? new Date(job.fulfilledAt) : null,
        }));

        // Append new jobs, avoiding duplicates by job ID
        setLoadedJobs(prevJobs => {
          const existingIds = new Set(prevJobs.map(job => job.id));
          const uniqueNewJobs = newJobs.filter(job => !existingIds.has(job.id));
          return [...prevJobs, ...uniqueNewJobs];
        });
      }

      // Update total count
      setTotalCount(fetcher.data.totalCount);
    }
  }, [verified, fetcher.data, isFirstLoad, offset]);

  // Set dummy data when not showing real jobs
  useEffect(() => {
    if (!verified) {
      // Set dummy jobs and count
      setLoadedJobs(DUMMY_JOBS);
      setTotalCount(6); // Pretend there are 6 total jobs
    }
  }, [verified]);

  // Reset offset when filters change
  useEffect(() => {
    setOffset(0);
  }, [searchQuery, filters]);

  // Add load more functionality
  const handleLoadMore = () => {
    setOffset(prevOffset => prevOffset + limit);
  };

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
      {/* <h1>
        mix 7elo 3ammi. 3melet 3alehon job application hadol + ma 3melete
        3alehon, mix 3ammi
      </h1> */}

      {/* ✅ Search and Filtering Section */}
      <FilteringSearchSection
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filters={filters}
        setFilters={setFilters}
      />

      {verified && (
        <p className="text-black text-sm mt-2 ml-4 mb-10">
          {totalCount > 0 && (
            <>
              <span className="font-bold text-primaryColor text-base">
                {loadedJobs.length} {loadedJobs.length === 1 ? 'job' : 'jobs'}
              </span>
              {` out of `}
              <span className="">{totalCount} total</span>
            </>
          )}
        </p>
      )}

      {verified ? (
        // Real Jobs UI
        <>
          {/* ✅ Jobs List */}
          <div className="grid md:grid-cols-2 gap-x-10 max-w-6xl">
            {loadedJobs.length > 0 ? (
              loadedJobs.map(job => <JobCard key={job.id} onSelect={onJobSelect} job={job} />)
            ) : (
              <p className="text-center text-gray-500 col-span-2 py-8 text-xl">No jobs found.</p>
            )}
          </div>

          {/* Loading State */}
          {fetcher.state === 'loading' && (
            <div className="mt-6 text-center">
              <p>Loading jobs...</p>
            </div>
          )}

          {/* No More Jobs Message */}
          {loadedJobs.length > 0 &&
            loadedJobs.length === totalCount &&
            fetcher.state !== 'loading' && (
              <div className="mt-6 text-center">
                <p className="text-gray-500">No more jobs available.</p>
              </div>
            )}

          {/* Load More Button - Only show if there are more jobs to load */}
          {loadedJobs.length > 0 &&
            loadedJobs.length < totalCount &&
            fetcher.data &&
            fetcher.data.jobs.length === limit && (
              <div className="mt-6 text-center">
                <button
                  onClick={handleLoadMore}
                  className="px-4 py-2 not-active-gradient rounded-xl text-white bg-primaryColor transition-colors"
                  disabled={fetcher.state === 'loading'}
                >
                  {fetcher.state === 'loading' ? 'Loading...' : 'Load More Jobs'}
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
