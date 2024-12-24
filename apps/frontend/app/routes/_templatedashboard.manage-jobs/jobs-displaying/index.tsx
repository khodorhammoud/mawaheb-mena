import { useState } from "react";
import { JobCardData } from "~/types/Job";
import Job from "../manage-jobs/Job";
import Header from "../manage-jobs-heading/Header";

export default function JobManagement({ data }: { data: JobCardData[] }) {
  const [viewMode, setViewMode] = useState("one");

  // Group jobs by their statuses
  const groupedJobs = data.reduce(
    (acc, jobCardData) => {
      const status = jobCardData.job.status; // Adjust the key as per your data structure
      if (!acc[status]) {
        acc[status] = [];
      }
      acc[status].push(jobCardData);
      return acc;
    },
    {} as Record<string, JobCardData[]>
  );

  return (
    <div>
      <Header setViewMode={setViewMode} />
      <p className="text-black text-sm mt-2 ml-4">{data.length} Jobs Found</p>
      <section className="mb-20">
        {Object.keys(groupedJobs).map((status) => (
          <div key={status} className="mt-10">
            {/* Display the header dynamically */}
            <h2 className="font-semibold xl:mb-10 mb-8 xl:text-3xl lg:text-2xl text-2xl ml-1">
              {status} Jobs
            </h2>
            <div
              className={
                viewMode === "two"
                  ? "grid grid-cols-1 md:grid-cols-2 gap-4"
                  : viewMode === "three"
                    ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
                    : "flex flex-col"
              }
            >
              {/* Render jobs under the current status */}
              {groupedJobs[status].map((jobCardData) => (
                <Job
                  key={jobCardData.job.id}
                  data={jobCardData}
                  viewMode={viewMode}
                />
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
