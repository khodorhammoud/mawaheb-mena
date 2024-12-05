import { useState } from "react";
import { Job as JobType } from "../../../types/Job";
import JobStateButton from "../../../common/job-state-button/JobStateButton";
import AvatarList from "~/common/avatar/AvatarList";

export default function JobDesignThree({
  job,
}: {
  job: JobType & { applicants: any[]; interviewedCount: number };
}) {
  const formattedDate =
    typeof job.createdAt === "string" ? new Date(job.createdAt) : job.createdAt;

  // State to manage job status, including "close" as a selectable option
  const [jobStatus, setJobStatus] = useState<
    "active" | "draft" | "paused" | "close"
  >(job.status ? "active" : "draft");

  // Handle status change to toggle the visibility of the Edit button
  const handleStatusChange = (
    newStatus: "active" | "draft" | "paused" | "close"
  ) => {
    setJobStatus(newStatus);
  };

  return (
    <div className="lg:grid xl:p-8 p-6 bg-white border rounded-xl shadow-xl gap-4 mb-10">
      {/* STATUS BUTTON AND CONDITIONAL EDIT BUTTON */}
      <div className="flex items-center mb-6">
        <JobStateButton
          status={jobStatus}
          onStatusChange={handleStatusChange}
        />

        {/* Show Edit button only when the job status is "draft" */}
        {jobStatus === "draft" && (
          <button
            className="ml-4 bg-blue-500 text-white px-4 py-2 rounded"
            // This button has no functionality
          >
            Edit
          </button>
        )}
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

      {/* APPLICANTS SECTION */}
      <div>
        <p className="font-semibold xl:text-base text-sm flex items-center mb-2">
          Applicants: {job.applicants.length}
        </p>
        <AvatarList
          photos={Array(job.applicants.length).fill(
            "https://www.fivebranches.edu/wp-content/uploads/2021/08/default-image.jpg"
          )}
        />
      </div>
    </div>
  );
}
