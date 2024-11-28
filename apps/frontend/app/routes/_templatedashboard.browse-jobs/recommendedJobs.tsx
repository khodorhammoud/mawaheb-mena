import { useFetcher } from "@remix-run/react";
import { useEffect } from "react";
// import { getEmployerJobs } from "~/servers/job.server";
import { Job } from "~/types/Job";
// import { Employer } from "~/types/User";
import JobCard from "./jobCard";

interface RecommendedJobsProps {
  onJobSelect: (job: Job) => void;
}

export default function RecommendedJobs({ onJobSelect }: RecommendedJobsProps) {
  // const { employer } = useLoaderData<{ employer: Employer }>();
  const fetcher = useFetcher<{ jobs: Job[] }>();
  const allJobs = fetcher.data?.jobs || [];

  //  want to fetch from /api/jobs-filtered
  useEffect(() => {
    fetcher.submit(null, {
      method: "get",
      action: "/api/jobs-recommended",
    });
  }, []);

  return (
    <div>
      {allJobs.map((job) => (
        <JobCard onSelect={onJobSelect} key={job.id} job={job} />
      ))}
    </div>
  );
}
