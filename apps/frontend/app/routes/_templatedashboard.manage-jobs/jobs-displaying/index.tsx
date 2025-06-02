import { useState, useMemo, useEffect } from 'react';
import { JobCardData } from '@mawaheb/db/types';
import Job from '../manage-jobs/Job';
import Header from '../manage-jobs-heading/Header';
import { JobStatus } from '@mawaheb/db/enums';
import { useSearchParams } from '@remix-run/react';

interface JobManagementProps {
  data: JobCardData[];
  userAccountStatus?: string;
  initialFilter?: string;
  initialViewMode?: string;
}

export default function JobManagement({
  data,
  userAccountStatus,
  initialFilter = 'active',
  initialViewMode = 'three',
}: JobManagementProps) {
  const [viewMode, setViewMode] = useState(initialViewMode);
  const [activeFilter, setActiveFilter] = useState<JobStatus | 'all'>(
    initialFilter as JobStatus | 'all'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    setSearchParams(prev => {
      prev.set('status', activeFilter);
      prev.set('viewMode', viewMode);
      return prev;
    });
  }, [activeFilter, viewMode, setSearchParams]);

  useEffect(() => {
    const statusFromUrl = searchParams.get('status');
    const viewModeFromUrl = searchParams.get('viewMode');
    if (statusFromUrl && statusFromUrl !== activeFilter)
      setActiveFilter(statusFromUrl as JobStatus | 'all');
    if (viewModeFromUrl && viewModeFromUrl !== viewMode) setViewMode(viewModeFromUrl);
  }, [searchParams, activeFilter, viewMode]);

  // Filter and search logic (ALL client-side)
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
        (requiredSkills && requiredSkills.some(skill => skill.name?.toLowerCase().includes(query)))
      );
    });
  }, [data, activeFilter, searchQuery]);
  const filteredTotal = filteredJobs.length;

  // Grouped jobs for "All" view
  const groupedJobs = useMemo(() => {
    return filteredJobs.reduce(
      (acc, jobCardData) => {
        const status = jobCardData.job.status as JobStatus;
        if (!acc[status]) acc[status] = [];
        acc[status].push(jobCardData);
        return acc;
      },
      {} as Record<JobStatus, JobCardData[]>
    );
  }, [filteredJobs]);

  const categoryOrder = [
    JobStatus.Active,
    JobStatus.Closed,
    JobStatus.Draft,
    JobStatus.Paused,
    JobStatus.Deleted,
    JobStatus.Completed,
  ];

  const sortedStatuses = Object.keys(groupedJobs)
    .map(status => status as JobStatus)
    .sort((a, b) => categoryOrder.indexOf(a) - categoryOrder.indexOf(b));

  const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

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

  return (
    <div>
      <Header
        setViewMode={setViewMode}
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
        onSearch={setSearchQuery}
        viewMode={viewMode} // <<< ADD THIS PROP!
      />

      <p className="text-black text-sm mt-2 ml-1 mb-2">
        <span>
          You have <span className="font-bold text-primaryColor text-base">{filteredTotal}</span>{' '}
          job
          {filteredTotal === 1 ? '' : 's'} matching this filter.
        </span>
        <br />
      </p>

      <section className="mb-20">
        {filteredTotal === 0 ? (
          <p className="text-center text-gray-500 py-8 text-xl">No jobs found.</p>
        ) : activeFilter === 'all' ? (
          sortedStatuses.length > 0 ? (
            sortedStatuses.map(status => (
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
            ))
          ) : (
            <p className="text-center text-gray-500 py-8 text-xl">No jobs found.</p>
          )
        ) : (
          <div className="lg:mt-10 md:mt-12 mt-16">
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
        )}
      </section>
    </div>
  );
}
