import { Job as JobType } from "~/types/Job";
import { Button } from "~/components/ui/button";

interface JobProps {
  job: JobType;
  onSelect: (job: JobType) => void;
}

export default function Job(props: JobProps) {
  const { job, onSelect } = props;
  const formattedDate =
    typeof job.createdAt === "string" ? new Date(job.createdAt) : job.createdAt;

  return (
    <div className="lg:grid xl:p-8 p-6 bg-white border rounded-xl shadow-xl gap-4 mb-10">
      {/* STATUS BUTTON AND CONDITIONAL EDIT BUTTON */}
      <div className="flex items-center mb-6">
        {/* <JobStateButton
          status={jobStatus}
          onStatusChange={handleStatusChange}
        /> */}

        {/* Show Edit button only when the job status is "draft" */}
        {/* {jobStatus === "draft" && ( */}
        <button
          className="ml-4 bg-blue-500 text-white px-4 py-2 rounded"
          // This button has no functionality
        >
          Edit
        </button>
        {/* )} */}
      </div>

      {/* JOB INFORMATION */}
      <div>
        <h3 className="xl:text-2xl lg:text-xl text-base leading-tight mb-4">
          {job.title}
        </h3>
        <p className="xl:text-sm text-xs text-gray-400 mb-4">
          Fixed price - Posted {formattedDate.toDateString()}
        </p>
        <div className="flex xl:gap-10 lg:gap-8 gap-6 mb-6">
          <div>
            <p className="xl:text-xl lg:text-lg mt-4 text-base leading-tight mb-1">
              ${job.budget}
            </p>
            <p className="text-gray-400 xl:text-sm text-xs">Fixed price</p>
          </div>
          <div>
            <p className="xl:text-xl lg:text-lg mt-4 text-base leading-tight mb-1">
              {job.experienceLevel}
            </p>
            <p className="text-gray-400 xl:text-sm text-xs">Experience level</p>
          </div>
        </div>
      </div>

      <Button onClick={() => onSelect(job)}>View Details</Button>
    </div>
  );
}
