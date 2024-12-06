import { Job as JobType } from "../../../types/Job";
import Job from "../manage-jobs/Job";
import { useState } from "react";
import Header from "../manage-jobs-heading/Header";

interface JobManagementProps {
  jobs: (JobType & { applicants })[];
}

export default function JobManagement({ jobs }: JobManagementProps) {
  const [viewMode, setViewMode] = useState("one");

  return (
    <div>
      <Header setViewMode={setViewMode} />
      <p className="text-black text-sm mt-2 ml-4">{jobs.length} Jobs Found</p>
      <section className="mb-20">
        <h2 className="font-semibold mt-10 xl:mb-10 mb-8 xl:text-3xl lg:text-2xl text-2xl ml-1">
          Active Jobs
        </h2>

        {/* Conditional layout based on viewMode */}
        <div
          className={
            viewMode === "two"
              ? "grid grid-cols-1 md:grid-cols-2 gap-4"
              : viewMode === "three"
                ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
                : "flex flex-col"
          }
        >
          {jobs.map((job) => (
            <Job key={job.id} job={job} viewMode={viewMode} />
          ))}
        </div>
      </section>
    </div>
  );
}
