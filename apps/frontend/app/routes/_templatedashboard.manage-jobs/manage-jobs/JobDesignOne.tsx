import { Link } from "@remix-run/react";
import { parseDate } from "~/lib/utils";
import { JobCardData } from "../../../types/Job";
import Calendar from "~/common/calender/Calender";
import SkillBadge from "~/common/skill/SkillBadge";
import JobStateButton from "../../../common/job-state-button/JobStateButton";
import ProfilePhotosSection from "~/common/profile-photos-list/ProfilePhotosSection";
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
    <div className="md:flex lg:p-8 p-4 bg-white border rounded-xl shadow-xl xl:gap-10 lg:gap-6 gap-3 mb-10">
      {/* Left Section */}
      <div className="xl:w-[42%] w-[30%] mr-2">
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
            <p className="text-gray-400 xl:text-sm text-xs">Experience level</p>
          </div>
        </div>
        {/* in that way, i remove the HTML tags */}
        <div
          className="lg:mt-10 mt-6 xl:text-lg lg:text-base text-sm"
          dangerouslySetInnerHTML={{ __html: job.description }}
        ></div>

        <div className="lg:mt-8 mt-4 flex flex-wrap gap-2 xl:text-base text-sm">
          {Array.isArray(job?.requiredSkills) &&
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

      {/* Middle Section */}
      {/* Middle Section */}
      <div className="flex flex-col gap-8 w-[18%] text-left">
        {/* Applicants Section */}
        {data.applications && data.applications.length > 0 ? (
          <ProfilePhotosSection
            label="Applicants"
            images={applicantsPhotos}
            profiles={data.applications}
          />
        ) : (
          <p>No applicants available for this job.</p>
        )}

        {/* Interviewed Section */}
        {data.applications && data.applications.length > 0 ? (
          <ProfilePhotosSection
            label="Interviewed"
            images={applicantsPhotos}
            profiles={data.applications}
          />
        ) : (
          <p>No interviewed freelancers available.</p>
        )}

        {/* Hired Section */}
        {status === JobStatus.Paused &&
          (data.applications && data.applications.length > 0 ? (
            <ProfilePhotosSection
              label="Hired"
              images={applicantsPhotos}
              profiles={data.applications}
            />
          ) : (
            <p>No hired freelancers available.</p>
          ))}
      </div>

      {/* Right Section */}
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

      {/* Action Section */}
      <div className="w-[16%] lg:flex justify-end h-min xl:ml-4 lg:ml-12 space-x-2">
        {status && (
          <JobStateButton
            status={status}
            onStatusChange={onStatusChange}
            jobId={job.id}
          />
        )}

        {status === JobStatus.Draft && (
          <Link
            to={`/edit-job/${job.id}`}
            className="bg-blue-500 text-white px-3 py-1 lg:text-base text-sm rounded lg:mt-0 mt-2 hover:bg-blue-600 flex items-center justify-center"
          >
            Edit
          </Link>
        )}
      </div>
    </div>
  );
}
