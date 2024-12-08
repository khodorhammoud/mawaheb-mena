import { JobCardData } from "~/types/Job";
import JobDesignOne from "./JobDesignOne";
import JobDesignTwo from "./JobDesignTwo";
import JobDesignThree from "./JobDesignThree";
import { useState } from "react";
import { JobStatus } from "~/types/enums";

interface JobProps {
  data: JobCardData;
  viewMode: string;
}

export default function Job({ data, viewMode }: JobProps) {
  const { job } = data;

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
    case "one":
      return (
        <>
          {/* Show JobDesignOne on md and larger screens */}
          <div className="hidden md:block">
            <JobDesignOne
              data={data}
              status={jobStatus}
              onStatusChange={handleStatusChange}
            />
          </div>
          {/* Show JobDesignTwo only on sm screens */}
          <div className="hidden sm:block md:hidden">
            <JobDesignTwo
              data={data}
              status={jobStatus}
              onStatusChange={handleStatusChange}
            />
          </div>
          {/* Show JobDesignThree on screens smaller than sm */}
          <div className="block sm:hidden">
            <JobDesignThree
              data={data}
              status={jobStatus}
              onStatusChange={handleStatusChange}
            />
          </div>
        </>
      );

    case "two":
      return (
        <>
          {/* Show JobDesignTwo on sm and larger screens */}
          <div className="hidden sm:block">
            <JobDesignTwo
              data={data}
              status={jobStatus}
              onStatusChange={handleStatusChange}
            />
          </div>
          {/* Show JobDesignThree on screens smaller than sm */}
          <div className="block sm:hidden">
            <JobDesignThree
              data={data}
              status={jobStatus}
              onStatusChange={handleStatusChange}
            />
          </div>
        </>
      );

    case "three":
      return (
        <JobDesignThree
          data={data}
          status={jobStatus}
          onStatusChange={handleStatusChange}
        />
      );

    default:
      return null;
  }
}
