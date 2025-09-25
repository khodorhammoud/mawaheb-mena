import { JobCardData } from '@mawaheb/db/types';
import JobDesignOne from './JobDesignOne';
import JobDesignTwo from './JobDesignTwo';
import JobDesignThree from './JobDesignThree';
import { useState } from 'react';
import { JobStatus } from '@mawaheb/db/enums';

interface JobProps {
  data: JobCardData;
  viewMode: string;
  userAccountStatus?: string;
}

export default function Job({ data, viewMode, userAccountStatus }: JobProps) {
  const { job } = data;

  // console.log('Job component: User account status:', userAccountStatus);

  // State to manage job status, including "close" as a selectable option
  const [jobStatus, setJobStatus] = useState<JobStatus>(
    (job.status as JobStatus) || JobStatus.Draft
  );

  // Handle status change to toggle the visibility of the Edit button
  const handleStatusChange = (newStatus: JobStatus) => {
    setJobStatus(newStatus);
  };
  if (!data) {
    return <p>Job details are not available.</p>;
  }

  switch (viewMode) {
    case 'one':
      return (
        <>
          {/* Show JobDesignOne on md and larger screens */}
          <div className="hidden xl:block" data-testid="job-design-one-container">
            <JobDesignOne
              data={data}
              status={jobStatus}
              onStatusChange={handleStatusChange}
              userAccountStatus={userAccountStatus}
              className="w-fit"
            />
          </div>
          {/* Show JobDesignTwo only on sm screens */}
          <div className="hidden md:block xl:hidden" data-testid="job-design-two-container">
            <JobDesignTwo
              data={data}
              status={jobStatus}
              onStatusChange={handleStatusChange}
              userAccountStatus={userAccountStatus}
              className="w-fit"
            />
          </div>
          {/* Show JobDesignThree on screens smaller than sm */}
          <div className="block md:hidden" data-testid="job-design-three-container">
            <JobDesignThree
              data={data}
              status={jobStatus}
              onStatusChange={handleStatusChange}
              userAccountStatus={userAccountStatus}
              className="w-fit ml-10"
            />
          </div>
        </>
      );

    case 'two':
      return (
        <>
          {/* Show JobDesignTwo on sm and larger screens */}
          <div className="hidden xl:block" data-testid="job-design-two-container">
            <JobDesignTwo
              data={data}
              status={jobStatus}
              onStatusChange={handleStatusChange}
              userAccountStatus={userAccountStatus}
            />
          </div>
          {/* Show JobDesignThree on screens smaller than sm */}
          <div className="block xl:hidden" data-testid="job-design-three-container">
            <JobDesignThree
              data={data}
              status={jobStatus}
              onStatusChange={handleStatusChange}
              userAccountStatus={userAccountStatus}
            />
          </div>
        </>
      );

    case 'three':
      return (
        <div data-testid="job-design-three-container">
          <JobDesignThree
            data={data}
            status={jobStatus}
            onStatusChange={handleStatusChange}
            userAccountStatus={userAccountStatus}
          />
        </div>
      );

    default:
      return null;
  }
}
