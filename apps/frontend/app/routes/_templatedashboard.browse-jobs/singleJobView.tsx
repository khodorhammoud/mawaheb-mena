import { useFetcher } from "@remix-run/react";
import { useEffect } from "react";
import { Job } from "~/types/Job";
import JobCard from "./jobCard";
import { Button } from "~/components/ui/button";
import { Skill } from "~/types/Skill"; // Ensure the type exists

interface JobCardProps {
  job: Job & { jobSkills?: Skill[] }; // Ensure job has jobSkills
}

export default function SingleJobView({ job }: JobCardProps) {
  const fetcher = useFetcher<{ jobs: Job[]; success?: boolean }>();
  const relatedJobs = fetcher.data?.jobs || [];

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
    <div className="rounded-lg p-6 mx-auto">
      {/* Job Title */}
      <h2 className="text-lg font-bold mb-2">{job.title}</h2>
      <p className="text-gray-500 text-sm mb-4">
        {job.budget} - {job.createdAt || "recently"}
      </p>

      {/* Description */}
      <p className="text-gray-700 mb-6">{job.description}</p>

      {/* Budget, Experience Level, and Project Type */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex flex-col items-start">
          <span className="font-semibold text-gray-900">${job.budget}</span>
          <span className="text-sm text-gray-500">Fixed price</span>
        </div>
        <div className="flex flex-col items-start">
          <span className="font-semibold text-gray-900">
            {job.experienceLevel}
          </span>
          <span className="text-sm text-gray-500">Experience level</span>
        </div>
        <div className="flex flex-col items-start">
          <span className="font-semibold text-gray-900">{job.projectType}</span>
          <span className="text-sm text-gray-500">Project type</span>
        </div>
      </div>

      {/* Skills Section */}
      <div className="mb-6">
        <h3 className="font-medium text-gray-900 mb-2">Skills</h3>
        <div className="flex flex-wrap gap-2">
          {job.jobSkills && job.jobSkills.length > 0 ? (
            job.jobSkills.map((skill) => (
              <span
                key={skill.id}
                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
              >
                {skill.name}
              </span>
            ))
          ) : (
            <p className="text-gray-500">No skills listed for this job.</p>
          )}
        </div>
      </div>

      {/* Activity Section */}
      <div className="mb-6">
        <h3 className="font-medium text-gray-900 mb-2">Activity on this job</h3>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>Interested: 3</li>
          <li>Interviewed: 1</li>
          <li>Invites sent: 0</li>
        </ul>
      </div>

      {/* Interested Button */}
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
        className={`w-full ${
          fetcher.data?.success
            ? "bg-slate-600 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700"
        } text-white py-2 rounded-md font-semibold`}
      >
        {fetcher.data?.success ? "Applied" : "Interested"}
      </Button>

      {/* Related Jobs Section */}
      <div className="mb-6">
        <h3 className="font-medium text-gray-900 mb-2">Related Jobs</h3>
        {relatedJobs.length > 0 ? (
          relatedJobs.map((relatedJob) => (
            <JobCard key={relatedJob.id} job={relatedJob} onSelect={() => {}} />
          ))
        ) : (
          <p className="text-gray-500">No related jobs found.</p>
        )}
      </div>
    </div>
  );
}
