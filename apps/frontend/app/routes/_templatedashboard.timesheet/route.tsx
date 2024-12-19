import type { TimesheetProps } from "./types/timesheet";
import type { LoaderFunctionArgs } from "@remix-run/node"; // or cloudflare/deno

import { requireUserIsFreelancerPublished } from "~/auth/auth.server";
import { getJobApplicationsByFreelancerId, getJobApplicationByJobIdAndFreelancerId } from "~/servers/job.server";
import { useLoaderData } from "@remix-run/react";
import TimeSheetPage from "./components/TimeSheetPage";
import JobsPage from "./components/JobsPage";
import { Job } from "~/types/Job";
import { useState } from "react";
export async function loader({ request, params }: LoaderFunctionArgs) {
  // user must be a published freelancer
  const userId = await requireUserIsFreelancerPublished(request);
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // get current freelancer job applications
  const jobApplications = await getJobApplicationsByFreelancerId(userId);

  const jobs = await Promise.all(jobApplications.map(async (jobApplication) => {
    const job = await getJobApplicationByJobIdAndFreelancerId(jobApplication.jobId, userId);
    return job;
  }));

  return Response.json({ jobs });
  const { jobId } = params; // Extract the jobId

  if (!jobId) {
    console.log("Job ID is required");
    return Response.json({ error: "Job ID is required" }, { status: 400 });
  }
}

const Page: React.FC<TimesheetProps> = ({
  allowOverlap = true,
}: TimesheetProps) => {
  const { jobs } = useLoaderData<typeof loader>();
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  console.log(jobs);


  return (
    <div>
      {selectedJob ? <TimeSheetPage job={selectedJob} /> : <JobsPage onJobSelect={setSelectedJob} />}
    </div>
  );
};

export default Page;
