import { useFetcher } from "@remix-run/react";
import { useEffect } from "react";
// import { getEmployerJobs } from "~/servers/job.server";
import { Job } from "~/types/Job";
// import { Employer } from "~/types/User";
import JobCard from "./jobCard";

interface RecommendedJobsProps {
  onJobSelect: (job: Job) => void;
}

export default function AllJobs({ onJobSelect }: RecommendedJobsProps) {
  // const { employer } = useLoaderData<{ employer: Employer }>();
  const fetcher = useFetcher<{ jobs: Job[] }>();
  const allJobs = fetcher.data?.jobs || [];

  //  want to fetch from /api/jobs-filtered
  useEffect(() => {
    fetcher.submit(null, {
      method: "get",
      action: "/api/jobs-filtered",
    });
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:gap-x-12 md:gap-x-8 gap-4 mt-4">
      {allJobs.map((job) => (
        <JobCard onSelect={onJobSelect} key={job.id} job={job} />
      ))}
    </div>
  );
}
