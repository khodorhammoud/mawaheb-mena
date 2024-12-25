import { useState } from "react";
import { JobCardData } from "~/types/Job";
import Job from "../manage-jobs/Job";
import Header from "../manage-jobs-heading/Header";

export default function JobManagement({ data }: { data: JobCardData[] }) {
  const [viewMode, setViewMode] = useState("one");

  return (
    <div>
      <Header setViewMode={setViewMode} />
      <p className="text-black text-sm mt-2 ml-4">{data.length} Jobs Found</p>
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
          {data.map((jobCardData) => (
            <Job
              key={jobCardData.job.id}
              data={jobCardData}
              viewMode={viewMode}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
