import { JobCardData } from "../../../types/Job";
import Calendar from "~/common/calender/Calender";
import SkillBadgeList from "~/common/skill/SkillBadge";
import JobStateButton from "../../../common/job-state-button/JobStateButton";
import ProfilePhotosSection from "~/common/profile-photos-list/ProfilePhotosSection";
import { Link } from "@remix-run/react/dist/components";
import { parseDate } from "~/lib/utils";
import { JobStatus } from "~/types/enums";
import { formatTimeAgo } from "~/utils/formatTimeAgo";
import { IoPencilSharp } from "react-icons/io5";
import Job from "./Job";

export default function JobDesignTwo({
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

  const interviewDates = ["2024-11-11", "2024-11-17", "2024-11-24"];

  return !data ? (
    <p>Job details are not available.</p>
  ) : (
    <div
      className={`xl:p-8 p-6 bg-white border rounded-xl shadow-xl ${
        status === JobStatus.Draft ? "mb-10 gap-20 grid grid-cols-3" : "mb-10"
      }`}
    >
      <div className="col-span-2">
        {/* STATUS BUTTON AND CONDITIONAL EDIT BUTTON */}
        <div
          className={`${
            status === JobStatus.Draft ? "hidden" : "flex items-center mb-7"
          }`}
        >
          {status && (
            <JobStateButton
              status={status}
              onStatusChange={onStatusChange}
              jobId={job.id}
            />
          )}
          {status === JobStatus.Draft && (
            <button className="ml-4 bg-blue-500 text-white px-4 py-2 rounded">
              Edit
            </button>
          )}
        </div>

        {/* JOB INFO */}
        <div>
          <h3 className="xl:text-2xl md:text-xl text-lg cursor-pointer hover:underline inline-block transition-transform duration-300 mb-3">
            <Link to={`/jobs/${job.id}`}>{job.title}</Link>
          </h3>
          <p className="xl:text-sm text-xs text-gray-400 mb-4">
            Fixed price - {job.createdAt ? formatTimeAgo(job.createdAt) : "N/A"}
          </p>
          <div className="flex xl:gap-10 lg:gap-8 gap-6">
            <div>
              <p className="text-lg mt-4">${job.budget}</p>
              <p className="text-gray-400 xl:text-sm text-xs">Fixed price</p>
            </div>
            <div>
              <p className="text-lg mt-4">{job.experienceLevel}</p>
              <p className="text-gray-400 xl:text-sm text-xs">
                Experience level
              </p>
            </div>
          </div>
          <p
            className={`${
              status === JobStatus.Draft && JobStatus.Active
                ? "hidden"
                : "mt-10 xl:text-lg text-base"
            }`}
          >
            We are looking for candidates with the following skills:
          </p>

          {/* SKILLS */}
          <div className="mt-4 xl:text-base text-sm">
            <p
              className={`${status === JobStatus.Draft ? "text-lg mb-2" : "hidden"}`}
            >
              Skills
            </p>
            {job.requiredSkills &&
            Array.isArray(job.requiredSkills) &&
            job.requiredSkills.length > 0 ? (
              <SkillBadgeList skills={job.requiredSkills} />
            ) : (
              <p>No skills provided.</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-8">
          {/* APPLICANTS */}
          <div
            className={`flex flex-col gap-4 ${
              status === JobStatus.Draft ? "hidden" : ""
            } ${status === JobStatus.Closed || status === JobStatus.Paused ? "grid grid-cols-3 !gap-16" : ""}`}
          >
            {/* Applicants ProfilePhotosSection */}
            <ProfilePhotosSection
              label="Applicants"
              images={applicantsPhotos}
              profiles={data.applications}
            />

            {/* Interviewed ProfilePhotosSection */}
            <ProfilePhotosSection
              label="Interviewed"
              images={applicantsPhotos}
              profiles={data.applications}
            />

            {/* Hired ProfilePhotosSection */}
            <ProfilePhotosSection
              label="Hired"
              images={applicantsPhotos}
              profiles={data.applications}
              className={`${status === JobStatus.Active || status === JobStatus.Paused ? "hidden" : ""}`}
            />
          </div>

          {/* CALENDAR */}
          <div
            className={`${
              status === JobStatus.Draft ||
              status === JobStatus.Closed ||
              status === JobStatus.Paused
                ? "hidden"
                : "col-span-1"
            }`}
          >
            <p className="font-semibold mb-4 xl:text-base text-sm">
              Pending Interviews: {interviewDates.length}
            </p>
            <Calendar highlightedDates={interviewDates} />
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div
        className={`${
          status === JobStatus.Draft
            ? "flex flex-col gap-4 items-center mb-6 mt-5"
            : "hidden"
        }`}
      >
        {status === JobStatus.Draft && (
          <Link
            to={`/edit-job/${job.id}`}
            className="w-[106px] h-[36px] bg-white text-primaryColor border border-gray-300 text-sm rounded-xl flex items-center justify-center not-active-gradient hover:text-white group"
          >
            <IoPencilSharp className="h-4 w-4 mr-2 text-primaryColor group-hover:text-white" />
            Edit
          </Link>
        )}

        {status && (
          <JobStateButton
            status={status}
            onStatusChange={onStatusChange}
            jobId={job.id}
            className="w-[106px] h-[36px]"
          />
        )}
      </div>
    </div>
  );
}
