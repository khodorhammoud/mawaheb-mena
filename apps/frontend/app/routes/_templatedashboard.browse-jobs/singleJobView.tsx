import { useFetcher } from "@remix-run/react";
import { useEffect } from "react";
import { Job } from "~/types/Job";
import JobCard from "./jobCard";
import { Button } from "~/components/ui/button";
import { Skill } from "~/types/Skill";
import SkillBadgeList from "~/common/skill/SkillBadge";
import { formatTimeAgo } from "~/utils/formatTimeAgo";
import { InformationCircleIcon } from "@heroicons/react/24/solid";

interface JobCardProps {
  job: Job;
  jobSkills: Skill[]; // ✅ Accept jobSkills as a separate prop
}

export default function SingleJobView({ job, jobSkills }: JobCardProps) {
  // console.log("📌 Job Skills in SingleJobView:", jobSkills); // ✅ Debugging log

  const fetcher = useFetcher<{ jobs: Job[]; success?: boolean }>();
  const relatedJobs = fetcher.data?.jobs || [];

  // ✅ Transform `jobSkills` to match `SkillBadgeList` expected format
  const requiredSkills = jobSkills.map((skill) => ({
    name: skill.name,
    isStarred: skill.isStarred || false,
  }));

  useEffect(() => {
    if (job.employerId) {
      const params = new URLSearchParams({
        jobType: "by-employer",
        employerId: job.employerId.toString(),
      });

      fetcher.submit(null, {
        method: "get",
        action: `/api/jobs-related?${params.toString()}`,
      });
    }
  }, [job.employerId]); // ✅ Added dependency

  return (
    <div className="rounded-lg mx-auto text-black pr-10">
      {/* Job Title */}
      <div className="pt-6 px-6">
        <h2 className="lg:text-3xl md:text-2xl text-xl mb-3">{job.title}</h2>

        {/* Date */}
        <p className="text-sm mb-8 text-gray-400">
          Fixed price -{" "}
          {job.createdAt ? formatTimeAgo(job.createdAt) : "recently"}
        </p>
      </div>

      <div className="grid grid-cols-[60%,40%] mb-8">
        {/* Description */}
        <div className="px-6 py-4 border-r border-gray-200">
          <div
            className="mb-12"
            dangerouslySetInnerHTML={{ __html: job.description }}
          />

          <div className="flex justify-between items-center mb-12">
            {/* Budget */}
            <div className="flex flex-col items-start gap-1">
              <span className="text-base">${job.budget}</span>
              <span className="text-sm text-gray-500">Fixed price</span>
            </div>

            {/* Experience Level */}
            <div className="flex flex-col items-start gap-1">
              <span className="text-base">{job.experienceLevel}</span>
              <span className="text-sm text-gray-500">Experience level</span>
            </div>

            {/* Project Type */}
            <div className="flex flex-col items-start gap-1">
              <span className="text-base">{job.projectType}</span>
              <span className="text-sm text-gray-500">Project type</span>
            </div>
          </div>

          {/* Skills Section */}
          <div className="mb-12">
            <p className="text-base mb-2">Skills</p>
            {/* SKILLS */}
            <div className="mt-2 text-base">
              {requiredSkills.length > 0 ? (
                <SkillBadgeList skills={requiredSkills} /> // ✅ Use SkillBadgeList instead of manual mapping
              ) : (
                <p>No skills provided.</p>
              )}
            </div>
          </div>

          {/* Activity Section */}
          <div className="mb-6">
            <p className="text-base font-medium text-gray-900 mb-2">
              Activity on this job
            </p>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>Interested: 3</li>
              <li>Interviewed: 1</li>
              <li>Invites sent: 0</li>
            </ul>
          </div>
        </div>

        {/* Interested Button */}
        <div className="pl-6 pr-6 pt-4">
          <Button
            disabled={
              fetcher.data?.success === true || fetcher.state === "submitting"
            }
            onClick={() => {
              if (!fetcher.data?.success) {
                fetcher.submit(null, {
                  method: "post",
                  action: `/api/jobs/${job.id}/interested`,
                });
              }
            }}
            className={`w-full mb-4 ${
              fetcher.data?.success
                ? "bg-slate-600 cursor-not-allowed"
                : "bg-primaryColor"
            } text-white py-2 rounded-md font-semibold`}
          >
            {fetcher.data?.success ? "Applied" : "Interested"}
          </Button>
          <div className="flex items-start text-gray-500 text-sm">
            <InformationCircleIcon className="w-8 h-8 text-gray-600 mr-2" />
            <p className="mt-1">
              Clicking &quot;Interested&quot; notifies the job poster, who can
              then interview you.
            </p>
          </div>
        </div>
      </div>

      {/* Related Jobs Section */}
      {relatedJobs.length > 0 && (
        <div className="grid grid-cols-[60%,40%] mb-10">
          <div className="pl-6 py-10 pr-2">
            <p className="text-lg mb-6">
              Employer&apos;s recent jobs ({relatedJobs.length})
            </p>
            {relatedJobs.length > 0 ? (
              relatedJobs.map((relatedJob) => (
                <JobCard
                  key={relatedJob.id}
                  job={relatedJob}
                  onSelect={() => {}}
                />
              ))
            ) : (
              <p className="text-gray-500">No related jobs found.</p>
            )}
          </div>
          <div className=""></div>
        </div>
      )}
    </div>
  );
}
