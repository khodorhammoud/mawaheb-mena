import { useFetcher } from "@remix-run/react";
import { useEffect } from "react";
// import { getEmployerJobs } from "~/servers/job.server";
import { Job } from "~/types/Job";
// import { Employer } from "~/types/User";
import JobCard from "./jobCard";

export default function AllJobs() {
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
    <div>
      {allJobs.map((job) => (
        <JobCard key={job.id} job={job} />
      ))}
    </div>
  );
}
