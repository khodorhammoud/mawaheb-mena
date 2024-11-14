// Job.tsx
import { Job as JobType } from "../../../types/Job";
import JobDesignOne from "./JobDesignOne";
import JobDesignTwo from "./JobDesignTwo";
import JobDesignThree from "./JobDesignThree";

interface JobProps {
  job: JobType;
  viewMode: string;
}

export default function Job({ job, viewMode }: JobProps) {
  switch (viewMode) {
    case "one":
      return (
        <>
          {/* Show JobDesignOne on md and larger screens */}
          <div className="hidden md:block">
            <JobDesignOne job={job} />
          </div>
          {/* Show JobDesignTwo only on sm screens */}
          <div className="hidden sm:block md:hidden">
            <JobDesignTwo job={job} />
          </div>
          {/* Show JobDesignThree on screens smaller than sm */}
          <div className="block sm:hidden">
            <JobDesignThree job={job} />
          </div>
        </>
      );

    case "two":
      return (
        <>
          {/* Show JobDesignTwo on sm and larger screens */}
          <div className="hidden sm:block">
            <JobDesignTwo job={job} />
          </div>
          {/* Show JobDesignThree on screens smaller than sm */}
          <div className="block sm:hidden">
            <JobDesignThree job={job} />
          </div>
        </>
      );

    case "three":
      return <JobDesignThree job={job} />;

    default:
      return null;
  }
}
