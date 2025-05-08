import { useState, useMemo, useEffect } from 'react';
import { JobCardData } from '@mawaheb/db/types';
import Job from '../manage-jobs/Job';
import Header from '../manage-jobs-heading/Header';
import { JobStatus, AccountStatus } from '@mawaheb/db/enums'; // ✅ Import AccountStatus enum
import { useSearchParams } from '@remix-run/react';

interface JobManagementProps {
  data: JobCardData[];
  userAccountStatus?: string;
  initialFilter?: string;
  initialViewMode?: string;
  totalCount: number;
  startJob: number;
  endJob: number;
}

export default function JobManagement({
  data,
  userAccountStatus,
  initialFilter = 'all',
  initialViewMode = 'one',
  totalCount,
  startJob,
  endJob,
}: JobManagementProps) {
  const [viewMode, setViewMode] = useState(initialViewMode);
  const [activeFilter, setActiveFilter] = useState<JobStatus | 'all'>(
    initialFilter as JobStatus | 'all'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();

  // Update URL when filter or view mode changes
  useEffect(() => {
    setSearchParams(prev => {
      prev.set('status', activeFilter);
      prev.set('viewMode', viewMode);
      return prev;
    });
  }, [activeFilter, viewMode, setSearchParams]);

  // Sync with URL params
  useEffect(() => {
    const statusFromUrl = searchParams.get('status');
    const viewModeFromUrl = searchParams.get('viewMode');

    if (statusFromUrl && statusFromUrl !== activeFilter) {
      setActiveFilter(statusFromUrl as JobStatus | 'all');
    }
    if (viewModeFromUrl && viewModeFromUrl !== viewMode) {
      setViewMode(viewModeFromUrl);
    }
  }, [searchParams, activeFilter, viewMode]);

  // console.log('JobManagement: User account status:', userAccountStatus);

  // Handle view mode change
  const handleViewModeChange = (mode: string) => {
    setViewMode(mode);
    // Reset to page 1 and update view mode
    setSearchParams(prev => {
      prev.set('page', '1');
      prev.set('viewMode', mode);
      // Force an immediate reload to get more jobs based on new view mode
      window.location.href = `?${prev.toString()}`;
      return prev;
    });
  };

  // Memoize filtered jobs to prevent unnecessary recalculations
  const filteredJobs = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return data.filter(job => {
      // First check the filter
      const matchesFilter = activeFilter === 'all' || job.job.status === activeFilter;
      if (!matchesFilter) return false;

      // Then check the search query
      if (!query) return true;

      const { title, description, requiredSkills } = job.job;
      return (
        title.toLowerCase().includes(query) ||
        description.toLowerCase().includes(query) ||
        requiredSkills.some(skill => skill.name.toLowerCase().includes(query))
      );
    });
  }, [data, activeFilter, searchQuery]);

  // Memoize grouped jobs to prevent unnecessary recalculations
  const groupedJobs = useMemo(() => {
    return filteredJobs.reduce(
      (acc, jobCardData) => {
        const status = jobCardData.job.status as JobStatus;
        if (!acc[status]) {
          acc[status] = [];
        }
        acc[status].push(jobCardData);
        return acc;
      },
      {} as Record<JobStatus, JobCardData[]>
    );
  }, [filteredJobs]);

  // Category order for display
  const categoryOrder = [
    JobStatus.Active,
    JobStatus.Closed,
    JobStatus.Draft,
    JobStatus.Paused,
    JobStatus.Deleted,
  ];

  // Memoize sorted statuses
  const sortedStatuses = useMemo(() => {
    return Object.keys(groupedJobs)
      .map(status => status as JobStatus)
      .sort((a, b) => categoryOrder.indexOf(a) - categoryOrder.indexOf(b));
  }, [groupedJobs]);

  // Grid class based on view mode
  const getGridClass = (mode: string) => {
    switch (mode) {
      case 'two':
        return 'grid grid-cols-1 md:grid-cols-2 gap-4';
      case 'three':
        return 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4';
      default:
        return 'flex flex-col';
    }
  };

  return (
    <div>
      <Header
        setViewMode={handleViewModeChange}
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
        onSearch={setSearchQuery}
      />

      {/* Jobs Found */}
      <p className="text-black text-sm mt-2 ml-4 mb-10">
        {totalCount > 0 && (
          <>
            <span className="font-bold text-primaryColor text-base">
              {endJob} {endJob === 1 ? 'job' : 'jobs'}
            </span>
            {` out of `}
            <span>{totalCount} total</span>
          </>
        )}
      </p>

      <section className="mb-20">
        {activeFilter === 'all' ? (
          // Show all jobs grouped by status
          sortedStatuses.length > 0 ? (
            sortedStatuses.map(status => {
              if (!groupedJobs[status]?.length) return null;

              return (
                <div key={status} className="lg:mt-10 md:mt-12 mt-16">
                  <h2 className="font-semibold xl:mb-10 mb-8 xl:text-3xl lg:text-2xl text-2xl ml-1">
                    {status} Jobs
                  </h2>
                  <div className={getGridClass(viewMode)}>
                    {groupedJobs[status].map(jobCardData => (
                      <Job
                        key={jobCardData.job.id}
                        data={jobCardData}
                        viewMode={viewMode}
                        userAccountStatus={userAccountStatus}
                      />
                    ))}
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-center text-gray-500 py-8 text-xl">No jobs found.</p>
          )
        ) : // Show only filtered jobs
        filteredJobs.length > 0 ? (
          <div className="lg:mt-10 md:mt-12 mt-16">
            <h2 className="font-semibold xl:mb-10 mb-8 xl:text-3xl lg:text-2xl text-2xl ml-1">
              {activeFilter} Jobs
            </h2>
            <div className={getGridClass(viewMode)}>
              {filteredJobs.map(jobCardData => (
                <Job
                  key={jobCardData.job.id}
                  data={jobCardData}
                  viewMode={viewMode}
                  userAccountStatus={userAccountStatus}
                />
              ))}
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-500 py-8 text-xl">No jobs found.</p>
        )}
      </section>

      {/* No More Jobs Message */}
      {data.length > 0 && endJob === totalCount && (
        <div className="mt-6 text-center mb-10">
          <p className="text-gray-500">No more jobs available.</p>
        </div>
      )}
    </div>
  );
}
