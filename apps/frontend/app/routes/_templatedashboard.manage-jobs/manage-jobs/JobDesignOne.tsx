import { Link } from "@remix-run/react";
import { parseDate } from "~/lib/utils";
import { JobCardData } from "../../../types/Job";
import Calendar from "~/common/calender/Calender";
import SkillBadgeList from "~/common/skill/SkillBadge";
import JobStateButton from "../../../common/job-state-button/JobStateButton";
import ProfilePhotosSection from "~/common/profile-photos-list/ProfilePhotosSection";
import { JobStatus } from "~/types/enums";
import { formatTimeAgo } from "~/utils/formatTimeAgo";
import { IoPencilSharp } from "react-icons/io5";

export default function JobDesignOne({
  data,
  status,
  onStatusChange,
}: {
  data: JobCardData;
  status?: JobStatus;
  onStatusChange?: (newStatus: JobStatus) => void;
}) {
  const { job } = data;

  const formattedDate = parseDate(job.createdAt);

  const applicantsPhotos = [
    "https://www.fivebranches.edu/wp-content/uploads/2021/08/default-image.jpg",
    "https://www.fivebranches.edu/wp-content/uploads/2021/08/default-image.jpg",
  ];

  const interviewDates = ["2024-11-5", "2024-11-17", "2024-11-28"];

  return !data ? (
    <p>Job details are not available.</p>
  ) : (
    <div
      className={`grid lg:p-8 p-4 bg-white border rounded-xl shadow-xl xl:gap-10 lg:gap-6 gap-3 mb-10 ${status === JobStatus.Draft || status === JobStatus.Closed || status === JobStatus.Deleted ? "grid-cols-[3fr_1fr_1fr]" : "md:grid-cols-[4fr_1fr_2fr_1fr] grid-cols-[3fr_1fr]"}`}
    >
      {/* Left Section */}
      <div className="mr-2">
        <h3 className="xl:text-2xl md:text-xl text-lg mb-2 cursor-pointer hover:underline inline-block transition-transform duration-300">
          <Link to={`/jobs/${job.id}`}>{job.title}</Link>
        </h3>

        <p className="xl:text-sm text-xs text-gray-400 lg:mb-8 mb-2">
          Fixed price - {job.createdAt ? formatTimeAgo(job.createdAt) : "N/A"}
        </p>
        <div className="flex xl:gap-10 lg:gap-8 gap-6">
          <div>
            <p className="xl:text-xl lg:text-lg text-base mt-4">
              ${job.budget}
            </p>
            <p className="text-gray-400 xl:text-sm text-xs">Fixed price</p>
          </div>
          <div>
            <p className="xl:text-xl lg:text-lg text-base mt-4">
              {job.experienceLevel}
            </p>
            <p className="text-gray-400 xl:text-sm text-xs">Experience level</p>
          </div>
        </div>
        {/* in that way, i remove the HTML tags */}
        <div
          className="lg:mt-10 mt-6 xl:text-lg lg:text-base text-sm"
          dangerouslySetInnerHTML={{ __html: job.description }}
        ></div>

        {/* SKILLS */}
        <div className="lg:mt-8 mt-4 xl:text-base text-sm">
          {job.requiredSkills &&
          Array.isArray(job.requiredSkills) &&
          job.requiredSkills.length > 0 ? (
            <SkillBadgeList skills={job.requiredSkills} />
          ) : (
            <p>No skills provided.</p>
          )}
        </div>
      </div>

      {/* Middle Section */}
      <div className="flex flex-col gap-8 text-left">
        {/* Applicants Section */}
        <ProfilePhotosSection
          label="Applicants"
          images={applicantsPhotos}
          profiles={data.applications}
        />

        {/* Interviewed Section */}
        <ProfilePhotosSection
          label="Interviewed"
          images={applicantsPhotos}
          profiles={data.applications}
        />

        {/* Hired Section */}
        <ProfilePhotosSection
          label="Hired"
          images={applicantsPhotos}
          profiles={data.applications}
          className={`${status === JobStatus.Active || status === JobStatus.Paused ? "hidden" : ""}`}
        />
      </div>

      {/* Right Section */}
      <div
        className={`${
          status === JobStatus.Draft ||
          status === JobStatus.Closed ||
          status === JobStatus.Deleted
            ? "hidden"
            : "lg:-mr-10"
        }`}
      >
        <p className="font-semibold mb-4 xl:text-base text-sm">
          Pending Interviews: 3
        </p>
        <Calendar highlightedDates={interviewDates} />
      </div>

      {/* Action Section */}
      <div className="flex space-x-2 justify-end">
        {/* Edit Button - Matches the Same Size */}
        {status === JobStatus.Draft && (
          <Link
            to={`/edit-job/${job.id}`}
            className="w-[106px] h-[36px] bg-white text-primaryColor border border-gray-300 text-sm rounded-xl flex items-center justify-center not-active-gradient hover:text-white group"
          >
            <IoPencilSharp className="h-4 w-4 mr-2 text-primaryColor group-hover:text-white" />
            Edit
          </Link>
        )}

        {/* JobStateButton - Force Same Width & Height */}
        {status && (
          <JobStateButton
            status={status}
            onStatusChange={onStatusChange}
            jobId={job.id}
            className="w-[106px] h-[36px]" // 👈 Now it matches the Edit button
          />
        )}
      </div>
    </div>
  );
}
