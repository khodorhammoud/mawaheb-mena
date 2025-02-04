import { JobCardData } from "../../../types/Job";
import Calendar from "~/common/calender/Calender";
import SkillBadge from "~/common/skill/SkillBadge";
import JobStateButton from "../../../common/job-state-button/JobStateButton";
import ProfilePhotosSection from "~/common/profile-photos-list/ProfilePhotosSection";
import { Link } from "@remix-run/react/dist/components";
import { parseDate } from "~/lib/utils";
import { JobStatus } from "~/types/enums";

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
      className={`${
        status === JobStatus.Draft
          ? "xl:p-8 p-6 bg-white border rounded-xl shadow-xl mb-10 grid gap-20 grid-cols-3"
          : "xl:p-8 p-6 bg-white border rounded-xl shadow-xl gap-4 mb-10"
      }`}
    >
      <div className="col-span-2">
        {/* STATUS BUTTON AND CONDITIONAL EDIT BUTTON */}
        <div
          className={`${
            status === JobStatus.Draft ? "hidden" : "flex items-center mb-6"
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
          <h3 className="xl:text-2xl md:text-xl text-lg cursor-pointer hover:underline inline-block transition-transform duration-300">
            <Link to={`/jobs/${job.id}`}>{job.title}</Link>
          </h3>
          <p className="xl:text-sm text-xs text-gray-400 mb-4">
            Fixed price - Posted {formattedDate.toDateString()}
          </p>
          <div className="flex xl:gap-10 lg:gap-8 gap-6">
            <div>
              <p className="xl:text-xl text-lg mt-4">${job.budget}</p>
              <p className="text-gray-400 xl:text-sm text-xs">Fixed price</p>
            </div>
            <div>
              <p className="xl:text-xl text-lg mt-4">{job.experienceLevel}</p>
              <p className="text-gray-400 xl:text-sm text-xs">
                Experience level
              </p>
            </div>
          </div>
          <p
            className={`${
              status === JobStatus.Draft
                ? "hidden"
                : "mt-10 xl:text-lg text-base"
            }`}
          >
            We are looking for candidates with the following skills:
          </p>

          {/* SKILLS */}
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

        {/* APPLICANTS */}
        <div
          className={`${
            status === JobStatus.Draft
              ? "hidden"
              : "lg:grid lg:grid-cols-10 gap-32 mt-8"
          }`}
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

          <div className="">
            <ProfilePhotosSection
              label="Hired"
              images={applicantsPhotos}
              profiles={data.applications}
            />
          </div>
        </div>

        {/* Calender */}
        <div
          className={`${status === JobStatus.Draft || status === JobStatus.Closed ? "hidden" : "col-span-7"}`}
        >
          <p className="font-semibold mb-4 xl:text-base text-sm mt-6">
            Pending Interviews: {interviewDates.length}
          </p>
          <Calendar highlightedDates={interviewDates} />
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
