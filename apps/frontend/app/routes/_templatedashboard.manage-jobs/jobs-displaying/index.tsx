import { useState, useMemo, useEffect } from 'react';
import { JobCardData } from '@mawaheb/db/types';
import Job from '../manage-jobs/Job';
import Header from '../manage-jobs-heading/Header';
import { JobStatus } from '@mawaheb/db/enums';
import { useSearchParams } from '@remix-run/react';
import Carousel from '~/common/Carousel';

interface JobManagementProps {
  data: JobCardData[];
  userAccountStatus?: string;
  initialFilter?: string;
  initialViewMode?: string;
  totalCount: number;
  startJob: number;
  endJob: number;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const PAGE_SIZE = 10;

export default function JobManagement({
  data,
  userAccountStatus,
  initialFilter = 'all',
  initialViewMode = 'one',
  totalCount,
  currentPage,
  totalPages,
  onPageChange,
}: JobManagementProps) {
  const [viewMode, setViewMode] = useState(initialViewMode);
  const [activeFilter, setActiveFilter] = useState<JobStatus | 'all'>(
    initialFilter as JobStatus | 'all'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const [localPage, setLocalPage] = useState(1);

  const isSearching = searchQuery.trim().length > 0;

  // Reset to first page when filter/search changes
  useEffect(() => {
    setSearchParams(prev => {
      prev.set('status', activeFilter);
      prev.set('viewMode', viewMode);
      return prev;
    });
    setLocalPage(1);
  }, [activeFilter, viewMode, setSearchParams, searchQuery]);

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

  // Filter and search logic (ALWAYS client-side for search)
  const filteredJobs = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return data.filter(job => {
      const matchesFilter = activeFilter === 'all' || job.job.status === activeFilter;
      if (!matchesFilter) return false;
      if (!query) return true;
      const { title, description, requiredSkills } = job.job;
      return (
        title.toLowerCase().includes(query) ||
        description.toLowerCase().includes(query) ||
        requiredSkills.some(skill => skill.name.toLowerCase().includes(query))
      );
    });
  }, [data, activeFilter, searchQuery]);
  const filteredTotal = filteredJobs.length;

  // Pagination logic
  const pagedJobs = useMemo(() => {
    if (isSearching) {
      const start = (localPage - 1) * PAGE_SIZE;
      return filteredJobs.slice(start, start + PAGE_SIZE);
    }
    // Use backend data directly (already paginated)
    return filteredJobs;
  }, [filteredJobs, localPage, isSearching]);

  // Grouped jobs for "All" view (uses pagedJobs so it matches the page!)
  const groupedJobs = useMemo(() => {
    return pagedJobs.reduce(
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
  }, [pagedJobs]);

  const categoryOrder = [
    JobStatus.Active,
    JobStatus.Closed,
    JobStatus.Draft,
    JobStatus.Paused,
    JobStatus.Deleted,
  ];

  const sortedStatuses = useMemo(() => {
    return Object.keys(groupedJobs)
      .map(status => status as JobStatus)
      .sort((a, b) => categoryOrder.indexOf(a) - categoryOrder.indexOf(b));
  }, [groupedJobs]);

  // Carousel logic
  const totalFilteredPages = Math.max(1, Math.ceil(filteredTotal / PAGE_SIZE));
  const showCarousel = isSearching ? totalFilteredPages > 1 : totalPages > 1;

  const handlePageChange = (page: number) => {
    if (isSearching) setLocalPage(page);
    else onPageChange(page);
  };

  const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

  return (
    <div>
      <Header
        setViewMode={setViewMode}
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
        onSearch={setSearchQuery}
      />

      {/* Jobs found + filtered */}
      <p className="text-black text-sm mt-2 ml-1 mb-2">
        <span>
          {isSearching ? (
            <>
              You have{' '}
              <span className="font-bold text-primaryColor text-base">{filteredTotal}</span> job
              {filteredTotal === 1 ? '' : 's'} with this search out of{' '}
              <span className="font-bold text-primaryColor text-base">{totalCount}</span> total.
            </>
          ) : activeFilter === 'all' ? (
            <>
              You have <span className="font-bold text-primaryColor text-base">{totalCount}</span>
              {' job'}
              {totalCount === 1 ? '' : 's'}
              {' in total.'}
            </>
          ) : (
            <>
              You have{' '}
              <span className="font-bold text-primaryColor text-base">{filteredTotal}</span>{' '}
              {capitalize(activeFilter)} job{filteredTotal === 1 ? '' : 's'} in total.
            </>
          )}
        </span>
        <br />
      </p>

      <section className="mb-20">
        {/* Grouped jobs display (for All), flat display (for filtered) */}
        {filteredTotal === 0 ? (
          <p className="text-center text-gray-500 py-8 text-xl">No jobs found.</p>
        ) : activeFilter === 'all' ? (
          sortedStatuses.length > 0 ? (
            sortedStatuses.map(status => {
              if (!groupedJobs[status]?.length) return null;
              return (
                <div key={status} className="lg:mt-10 md:mt-12 mt-16">
                  <h2 className="font-semibold xl:mb-10 mb-8 xl:text-3xl lg:text-2xl text-2xl ml-1">
                    {capitalize(status)} Jobs
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
        ) : (
          <div className="lg:mt-10 md:mt-12 mt-16">
            <h2 className="font-semibold xl:mb-10 mb-8 xl:text-3xl lg:text-2xl text-2xl ml-1">
              {capitalize(activeFilter)} Jobs
            </h2>
            <div className={getGridClass(viewMode)}>
              {pagedJobs.map(jobCardData => (
                <Job
                  key={jobCardData.job.id}
                  data={jobCardData}
                  viewMode={viewMode}
                  userAccountStatus={userAccountStatus}
                />
              ))}
            </div>
          </div>
        )}

        {/* Carousel only when needed */}
        {showCarousel && filteredTotal > 0 && (
          <div className="flex justify-center mt-8 mb-16">
            <Carousel
              currentPage={isSearching ? localPage : currentPage}
              totalPages={isSearching ? totalFilteredPages : totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </section>
    </div>
  );
}

function getGridClass(mode: string) {
  switch (mode) {
    case 'two':
      return 'grid grid-cols-1 md:grid-cols-2 gap-4';
    case 'three':
      return 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4';
    default:
      return 'flex flex-col';
  }
}
