import { Job, JobApplication } from "~/types/Job";
import { FreelancerListItem } from "./FreelancerListItem";
import { useEffect, useState } from "react";

interface EmployerJobCardProps {
  job: Job;
}

export function EmployerJobCard({ job }: EmployerJobCardProps) {
  const formattedDate = new Date(job.createdAt).toDateString();

  return (
    <div className="bg-white border rounded-xl shadow-xl p-6">
      <div className="mb-6">
        <h3 className="text-2xl leading-tight mb-4">{job.title}</h3>
        <p className="text-sm text-gray-400 mb-4">
          Fixed price - Posted {formattedDate}
        </p>
        <div className="flex gap-10 mb-6">
          <div>
            <p className="text-xl leading-tight mb-1">${job.budget}</p>
            <p className="text-gray-400 text-sm">Fixed price</p>
          </div>
          <div>
            <p className="text-xl leading-tight mb-1">{job.experienceLevel}</p>
            <p className="text-gray-400 text-sm">Experience level</p>
          </div>
        </div>
      </div>

      <div className="border-t pt-4">
        <h4 className="text-lg font-semibold mb-4">Freelancers</h4>
        <div className="space-y-4">
          {/* {jobApplications?.map((application) => (
            <FreelancerListItem
              key={application.id}
              jobApplication={application}
            />
          ))} */}
        </div>
      </div>
    </div>
  );
}
