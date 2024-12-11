import { JobCardData } from "../../../types/Job";
import { parseDate } from "~/lib/utils";
import Calendar from "~/common/calender/Calender";
import SkillBadge from "~/common/skill/SkillBadge";
import StatusButton from "../../../common/job-state-button/JobStateButton";
import ProfilePhotosSection from "~/common/profile-photos-list/ProfilePhotosSection";
import { Link } from "@remix-run/react";
import { JobStatus } from "~/types/enums";

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
      className={`${
        status === JobStatus.Draft
          ? "md:flex lg:p-8 p-4 bg-white border rounded-xl shadow-xl xl:gap-10 lg:gap-6 gap-3 mb-10"
          : "md:flex lg:p-8 p-4 bg-white border rounded-xl shadow-xl xl:gap-10 lg:gap-6 gap-3 mb-10"
      }`}
    >
      <div
        className={`${
          status === JobStatus.Draft
            ? "flex justify-between gap-10"
            : "xl:w-[42%] w-[30%] mr-2"
        }`}
      >
        <div className="">
          <h3 className="xl:text-2xl md:text-xl text-lg mb-2 cursor-pointer hover:underline inline-block transition-transform duration-300">
            <Link to={`/jobs/${job.id}`}>{job.title}</Link>
          </h3>

          <p className="xl:text-sm text-xs text-gray-400 lg:mb-8 mb-2">
            Fixed price - Posted {formattedDate?.toDateString() || "N/A"}
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
              <p className="text-gray-400 xl:text-sm text-xs">
                Experience level
              </p>
            </div>
          </div>
        </div>
        <p className="lg:mt-10 mt-6 xl:text-lg lg:text-base text-sm">
          {job.description}
        </p>
        <div className="lg:mt-8 mt-4 flex flex-wrap gap-2 xl:text-base text-sm">
          {job.requiredSkills &&
          Array.isArray(job.requiredSkills) &&
          job.requiredSkills.length > 0 ? (
            job.requiredSkills.map((skill, index) => (
              <SkillBadge
                key={index}
                name={skill.name}
                isStarred={skill.isStarred}
              />
            ))
          ) : (
            <p>No skills provided.</p>
          )}
        </div>
      </div>

      <div
        className={`${
          status === JobStatus.Draft
            ? "hidden"
            : "flex flex-col gap-8 w-[18%] text-left"
        }`}
      >
        {/* Applicants ProfilePhotosSection */}
        <div>
          <ProfilePhotosSection
            label="Applicants"
            images={applicantsPhotos}
            profiles={data.applications}
          />
        </div>

        {/* Interviewed ProfilePhotosSection */}
        <div>
          <ProfilePhotosSection
            label="Interviewed"
            images={applicantsPhotos}
            profiles={data.applications}
          />
        </div>

        <div className={`${status === JobStatus.Paused ? "" : "hidden"}`}>
          <ProfilePhotosSection
            label="Hired"
            images={applicantsPhotos}
            profiles={data.applications}
          />
        </div>
      </div>

      <div
        className={`${
          status === JobStatus.Draft || status === JobStatus.Closed
            ? "hidden"
            : "lg:w-[30%] lg:-mr-10"
        }`}
      >
        <p className="font-semibold mb-4 xl:text-base text-sm">
          Pending Interviews: 3
        </p>
        <Calendar highlightedDates={interviewDates} />
      </div>

      <div className="w-[16%] lg:flex justify-end h-min xl:ml-4 lg:ml-12 space-x-2">
        {status && (
          <StatusButton
            status={status}
            onStatusChange={onStatusChange}
            jobId={job.id}
          />
        )}

        {status === JobStatus.Draft && (
          <button className="bg-blue-500 text-white px-3 py-2 lg:text-base text-sm rounded lg:mt-0 mt-2 hover:bg-blue-600">
            Edit
          </button>
        )}
      </div>
    </div>
  );
}
