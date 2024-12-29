import type { TimesheetProps } from "../../types/Timesheet";
import type { LoaderFunctionArgs } from "@remix-run/node"; // or cloudflare/deno

import { requireUserIsFreelancerPublished } from "~/auth/auth.server";
import {
  getJobApplicationsByFreelancerId,
  getJobApplicationByJobIdAndFreelancerId,
} from "~/servers/job.server";
import TimeSheetPage from "./components/TimeSheetPage";
import JobsPage from "./components/JobsPage";
import { JobApplication } from "~/types/Job";
import { useState } from "react";
import { getFreelancerIdFromUserId } from "~/servers/user.server";
export async function loader({ request, params }: LoaderFunctionArgs) {
  // user must be a published freelancer
  const userId = await requireUserIsFreelancerPublished(request);
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const freelancerId = await getFreelancerIdFromUserId(userId);

  // get current freelancer job applications
  const jobApplicationsPartialData =
    await getJobApplicationsByFreelancerId(freelancerId);

  const jobApplications = await Promise.all(
    jobApplicationsPartialData.map(async (jobApp) => {
      const jobApplication = await getJobApplicationByJobIdAndFreelancerId(
        jobApp.jobId,
        freelancerId
      );
      return jobApplication;
    })
  );

  return Response.json({ jobApplications });
  const { jobId } = params; // Extract the jobId

  if (!jobId) {
    console.log("Job ID is required");
    return Response.json({ error: "Job ID is required" }, { status: 400 });
  }
}

const Page: React.FC<TimesheetProps> = ({
  allowOverlap = true,
}: TimesheetProps) => {
  const [selectedJobApplication, setSelectedJobApplication] =
    useState<JobApplication | null>(null);

  return (
    <div>
      {selectedJobApplication ? (
        <TimeSheetPage
          allowOverlap={allowOverlap}
          jobApplication={selectedJobApplication}
        />
      ) : (
        <JobsPage onJobSelect={setSelectedJobApplication} />
      )}
    </div>
  );
};

export default Page;
