import { JobCardData } from "~/types/Job";
import JobStateButton from "~/common/job-state-button/JobStateButton";
import ProfilePhotosSection from "~/common/profile-photos-list/ProfilePhotosSection";
import { Link } from "@remix-run/react";
import { JobStatus } from "~/types/enums";
import { parseDate } from "~/lib/utils";

export default function JobDesignThree({
  data,
  status,
  onStatusChange,
}: {
  data: JobCardData;
  status?: JobStatus;
  onStatusChange?: (newStatus: JobStatus) => void;
}) {
  const applicantsPhotos = [
    "https://www.fivebranches.edu/wp-content/uploads/2021/08/default-image.jpg",
    "https://www.fivebranches.edu/wp-content/uploads/2021/08/default-image.jpg",
  ];

  const { job } = data;

  const formattedDate = parseDate(job.createdAt);

  return (
    <div className="lg:grid xl:p-8 p-6 bg-white border rounded-xl shadow-xl gap-4 mb-10">
      {/* STATUS BUTTON AND CONDITIONAL EDIT BUTTON */}
      <div className="flex items-center mb-6">
        {status && (
          <JobStateButton status={status} onStatusChange={onStatusChange} />
        )}

        {/* Show Edit button only when the job status is "draft" */}
        {status === JobStatus.Draft && (
          <Link
            to={`/edit-job/${job.id}`}
            className="bg-blue-500 text-white px-3 lg:py-2 py-[10px] ml-1 lg:text-base text-sm rounded lg:mt-0 hover:bg-blue-600 flex items-center justify-center"
          >
            Edit
          </Link>
        )}
      </div>

      {/* JOB INFORMATION */}
      <div>
        <h3 className="xl:text-2xl lg:text-xl text-base leading-tight mb-4  cursor-pointer hover:underline inline-block transition-transform duration-300">
          <Link to={`/jobs/${job.id}`}>{job.title}</Link>
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
      {/* Applicants ProfilePhotosSection */}
      <ProfilePhotosSection
        label="Applicants"
        images={applicantsPhotos}
        profiles={data.applications}
      />
    </div>
  );
}
