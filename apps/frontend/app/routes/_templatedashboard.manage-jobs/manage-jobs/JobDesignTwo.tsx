import { useState } from "react";
import { Job as JobType } from "../../../types/Job";
import StatusButton from "../../../common/job-state-button/JobStateButton";
import Calendar from "~/common/calender/Calender";
import SkillBadge from "~/common/skill/SkillBadge";
import AvatarList from "../../../common/avatar/AvatarList";

export default function JobDesignTwo({
  job,
}: {
  job: JobType & { applicants: any[]; interviewedCount: number };
}) {
  const formattedDate =
    typeof job.createdAt === "string" ? new Date(job.createdAt) : job.createdAt;

  const [jobStatus, setJobStatus] = useState<
    "active" | "draft" | "paused" | "close"
  >(job.status ? "active" : "draft");

  const handleStatusChange = (
    newStatus: "active" | "draft" | "paused" | "close"
  ) => {
    setJobStatus(newStatus);
  };

  const interviewedPhotos = [
    "https://www.fivebranches.edu/wp-content/uploads/2021/08/default-image.jpg",
    "https://www.fivebranches.edu/wp-content/uploads/2021/08/default-image.jpg",
  ];

  const interviewDates = ["2024-11-11", "2024-11-17", "2024-11-24"];

  return (
    <div className="md:grid xl:p-8 p-6 bg-white border rounded-xl shadow-xl gap-4 mb-10">
      {/* STATUS BUTTON AND CONDITIONAL EDIT BUTTON */}
      <div className="flex items-center mb-6">
        <StatusButton status={jobStatus} onStatusChange={handleStatusChange} />
        {jobStatus === "draft" && (
          <button className="ml-4 bg-blue-500 text-white px-4 py-2 rounded">
            Edit
          </button>
        )}
      </div>

      {/* JOB INFO */}
      <div>
        <h3 className="xl:text-2xl md:text-xl text-lg">{job.title}</h3>
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
            <p className="text-gray-400 xl:text-sm text-xs">Experience level</p>
          </div>
        </div>
        <p className="mt-10 xl:text-lg text-base">
          We are looking for candidates with the following skills:
        </p>

        {/* SKILLS */}
        <div className="lg:mt-8 mt-4 flex flex-wrap gap-2 xl:text-base text-sm">
          {job.requiredSkills.map((skill, index) => (
            <SkillBadge
              key={index}
              name={skill.name}
              isStarred={skill.isStarred}
            />
          ))}
        </div>
      </div>

      {/* APPLICANTS AND CALENDAR */}
      <div className="lg:grid lg:grid-cols-10 gap-4">
        <div className="col-span-3 text-left">
          <p className="font-semibold xl:text-base text-sm flex items-center mb-2">
            Applicants: {job.applicants.length}
          </p>
          <AvatarList
            photos={Array(job.applicants.length).fill(
              "https://www.fivebranches.edu/wp-content/uploads/2021/08/default-image.jpg"
            )}
          />

          <p className="font-semibold xl:text-base text-sm mt-4 flex items-center mb-2">
            Interviewed: {interviewedPhotos.length}
          </p>
          <AvatarList photos={interviewedPhotos} />
        </div>
        <div className="col-span-7">
          <p className="font-semibold mb-4 xl:text-base text-sm mt-6">
            Pending Interviews: {interviewDates.length}
          </p>
          <Calendar highlightedDates={interviewDates} />
        </div>
      </div>
    </div>
  );
}
