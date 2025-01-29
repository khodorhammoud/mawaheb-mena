import { useFetcher } from "@remix-run/react";
import { useEffect } from "react";
import { Job } from "~/types/Job";
import JobCard from "./jobCard";

interface RecommendedJobsProps {
  onJobSelect: (job: Job) => void;
}

export default function RecommendedJobs({ onJobSelect }: RecommendedJobsProps) {
  const fetcher = useFetcher<{ jobs: Job[] }>();
  const allJobs = fetcher.data?.jobs || [];

  useEffect(() => {
    fetcher.submit(null, {
      method: "get",
      action: "/api/jobs-recommended",
    });
  }, []);

  return (
    <div>
      {allJobs.map((job) => (
        <JobCard key={job.id} onSelect={onJobSelect} job={job} />
      ))}
    </div>
  );
}
