import { useFetcher } from '@remix-run/react';
import { useEffect, useState } from 'react';
import { Job } from '@mawaheb/db/types';
import JobCard from './jobCard';
import FilteringSearchSection from './filters/filtering-search-section';
import { JobApplicationStatus } from '@mawaheb/db/enums';

// Dummy jobs for demo mode
const DUMMY_JOBS: (Job & { applicationStatus: string })[] = [
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

    expectedHourlyRate: 25,
    employerId: 1,
    jobCategoryId: 1,
    fulfilledAt: null,
    requiredSkills: [],
    applicationStatus: 'approved',
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
    expectedHourlyRate: 30,
    employerId: 2,
    jobCategoryId: 2,
    fulfilledAt: null,
    requiredSkills: [],
    applicationStatus: 'pending',
  },
];

interface MyJobsProps {
  onJobSelect: (job: Job) => void;
}

export default function MyJobs({ onJobSelect }: MyJobsProps) {
  // State to control whether to show real jobs or dummy ones
  const verified = true; // Change to false to show dummy jobs

  const fetcher = useFetcher<{
    jobs: (Job & { applicationStatus: string })[];
    totalCount: number;
  }>();
  const [limit, setLimit] = useState(10); // Start with 10 jobs
  const [loadedJobs, setLoadedJobs] = useState<(Job & { applicationStatus: string })[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // ✅ Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    workingHours: null,
    jobType: null,
    experienceLevel: null,
    budget: null,
  });

  // --- NEW: Track if we're filtering/searching ---
  const isFiltering =
    !!searchQuery ||
    !!filters.workingHours ||
    !!filters.jobType ||
    !!filters.experienceLevel ||
    !!filters.budget;

  // --- MAIN CHANGE: Always fetch ALL jobs (limit 1000) if searching/filtering ---
  useEffect(() => {
    if (verified) {
      const searchParams = new URLSearchParams();
      // Always fetch ALL jobs to properly categorize them
      searchParams.set('limit', '1000');

      // Pass search/filters as query params to backend
      if (searchQuery) searchParams.set('search', searchQuery);
      if (filters.workingHours?.from)
        searchParams.set('workingHoursFrom', filters.workingHours.from);
      if (filters.workingHours?.to) searchParams.set('workingHoursTo', filters.workingHours.to);
      if (filters.jobType) searchParams.set('jobType', filters.jobType);
      if (filters.experienceLevel) searchParams.set('experienceLevel', filters.experienceLevel);
      if (filters.budget) searchParams.set('budget', filters.budget);

      setIsLoading(true);

      fetcher.submit(searchParams, {
        method: 'get',
        action: '/api/jobs-myJobs',
      });
    }
    // eslint-disable-next-line
  }, [verified, searchQuery, JSON.stringify(filters)]); // Removed limit dependency

  // Update loaded jobs when new data arrives
  useEffect(() => {
    if (verified && fetcher.data) {
      setLoadedJobs(fetcher.data.jobs || []);
      setTotalCount(fetcher.data.totalCount || 0);
      setIsLoading(false);
    }
  }, [verified, fetcher.data]);

  // Set dummy data when not showing real jobs
  useEffect(() => {
    if (!verified) {
      // Set dummy jobs and count
      setLoadedJobs(DUMMY_JOBS);
      setTotalCount(6); // Pretend there are 6 total jobs
      setIsLoading(false);
    }
  }, [verified]);

  // ✅ Apply frontend filtering (mainly for dummy mode)
  const filteredJobs = loadedJobs.filter(job => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesWorkingHours =
      !filters.workingHours ||
      (!filters.workingHours.from && !filters.workingHours.to) ||
      (filters.workingHours?.from &&
        job.workingHoursPerWeek >= filters.workingHours.from &&
        filters.workingHours?.to &&
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

  // ✅ Group jobs based on Job Application Status and Job Status
  const groupedJobs = filteredJobs.reduce(
    (acc, job) => {
      // Default: "Applied" (in case no specific status is found)
      let category = 'Applied';

      // If the job has an application status, determine the right group
      if (job.applicationStatus) {
        // Case 1: Application was approved (user was hired)
        if (job.applicationStatus.toLowerCase() === 'approved') {
          // Comprehensive categorization based on all job statuses
          switch (job.status) {
            case 'completed':
              category = 'Completed Jobs';
              break;
            case 'closed':
              category = 'Closed Jobs';
              break;
            case 'active':
              category = 'Active Jobs';
              break;
            case 'paused':
              category = 'Paused Jobs';
              break;
            case 'draft':
              category = 'Draft Jobs';
              break;
            case 'deleted':
              category = 'Deleted Jobs';
              break;
            default:
              category = 'Unknown Status Jobs';
              break;
          }
        } else if (job.applicationStatus.toLowerCase() === 'rejected') {
          category = 'Opportunity Closed';
        }
        // Case 3: Still in process (pending, shortlisted, etc.)
        else if (
          job.applicationStatus.toLowerCase() === 'shortlisted' ||
          job.applicationStatus.toLowerCase() === 'pending'
        ) {
          category = 'Applied';
        }
        // Add more conditions here for new statuses if needed
      }

      // Add job to the appropriate category array
      if (!acc[category]) acc[category] = [];
      acc[category].push(job);
      return acc;
    },
    {} as Record<string, Job[]>
  );

  // ✅ Ensure proper category order - prioritizing most important categories
  const categoryOrder = [
    'Completed Jobs', // Most important - finished work
    'Active Jobs', // Currently working on
    'Paused Jobs', // Temporarily paused
    'Applied', // Applications submitted
    'Closed Jobs', // Jobs that were closed
    'Draft Jobs', // Jobs in draft state
    'Opportunity Closed', // Rejected applications
    'Deleted Jobs', // Deleted jobs (should be rare)
    'Unknown Status Jobs', // Fallback for any unexpected statuses
  ];
  const sortedCategories = Object.keys(groupedJobs).sort((a, b) => {
    const aIndex = categoryOrder.indexOf(a);
    const bIndex = categoryOrder.indexOf(b);
    if (aIndex === -1 && bIndex === -1) return 0;
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });

  // ✅ SMART: Paginate jobs by category with flexible logic
  const getPaginatedJobs = () => {
    const result: Record<string, Job[]> = {};
    let jobsShown = 0;
    const jobsPerPage = limit;

    for (const category of sortedCategories) {
      const jobsInCategory = groupedJobs[category] || [];

      if (jobsInCategory.length === 0) continue;

      // Case 1: We can fit ALL jobs from this category
      if (jobsShown + jobsInCategory.length <= jobsPerPage) {
        result[category] = jobsInCategory;
        jobsShown += jobsInCategory.length;
      }
      // Case 2: We can fit SOME jobs from this category (partial category)
      else if (jobsShown < jobsPerPage) {
        const remainingSlots = jobsPerPage - jobsShown;
        result[category] = jobsInCategory.slice(0, remainingSlots);
        jobsShown += remainingSlots;
        break; // Stop here, don't show other categories
      }
      // Case 3: No more slots available
      else {
        break;
      }
    }

    return result;
  };

  const paginatedJobs = getPaginatedJobs();

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

  // Add load more functionality
  const handleLoadMore = () => {
    setLimit(prevLimit => prevLimit + 10); // Increase limit by 10
  };

  // ---- ENHANCED LOAD MORE LOGIC ----
  // Check if there are more jobs to show in any category
  const totalJobsShown = Object.values(paginatedJobs).reduce((sum, jobs) => sum + jobs.length, 0);
  const totalJobsAvailable = Object.values(groupedJobs).reduce((sum, jobs) => sum + jobs.length, 0);

  const showLoadMoreButton =
    totalJobsShown > 0 && totalJobsShown < totalJobsAvailable && !isLoading;

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

      {/* Jobs Found */}
      {verified && (
        <p className="text-black text-sm mt-2 ml-4 mb-10">
          {totalCount > 0 && (
            <>
              <span className="font-bold text-primaryColor text-base">
                {totalJobsShown} {totalJobsShown === 1 ? 'job' : 'jobs'}
              </span>
              {` out of `}
              <span>{totalJobsAvailable} total</span>
            </>
          )}
        </p>
      )}

      {verified ? (
        // Real Jobs UI - Not the Dummy Jobs That Appear if The User Isn't Verified
        <section className="">
          {Object.keys(paginatedJobs).length > 0 ? (
            Object.keys(paginatedJobs).map(status => {
              return (
                <div key={status} className="mb-8">
                  <h2 className="font-semibold xl:text-3xl lg:text-2xl text-2xl mb-4">{status}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-6xl">
                    {paginatedJobs[status].map(job => (
                      <JobCard key={job.id} onSelect={onJobSelect} job={job} />
                    ))}
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-center text-gray-500 py-8 text-xl">No jobs found.</p>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="mt-6 text-center">
              <p>Loading jobs...</p>
            </div>
          )}

          {/* No More Jobs Message - Only show when there are jobs displayed and we've reached the end */}
          {totalJobsShown > 0 && totalJobsShown === totalJobsAvailable && !isLoading && (
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
        </section>
      ) : (
        // Dummy Jobs UI with Blurred Additional Jobs - No status categories shown
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
