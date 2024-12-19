import { useLoaderData } from "@remix-run/react";
import JobCard from "~/routes/_templatedashboard.browse-jobs/jobCard";
import { Job } from "~/types/Job";
export default function JobsPage(
  { onJobSelect }: { onJobSelect: (job: Job) => void }
) {
  const { jobs } = useLoaderData<{ jobs: Job[] }>();
  return (
    <div>
      {jobs.map((job) => (
        <JobCard onSelect={onJobSelect} key={job.id} job={job} />
      ))}
    </div>
  );
}
