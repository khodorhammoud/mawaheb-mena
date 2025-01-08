// import type { TimesheetProps } from "../../types/Timesheet";
import type { LoaderFunctionArgs } from "@remix-run/node"; // or cloudflare/deno

import {
  requireUserIsEmployerPublished,
  requireUserIsFreelancerPublished,
  requireUserOnboarded,
} from "~/auth/auth.server";
import {
  getJobApplicationsByFreelancerId,
  getJobApplicationByJobIdAndFreelancerId,
  getEmployerJobs,
  getJobApplicationsByJobId,
} from "~/servers/job.server";
import TimeSheetPage from "./components/TimeSheetPage";
import JobsPage from "./components/JobsPage";
import { JobApplication } from "~/types/Job";
import { useState } from "react";
import {
  getEmployerIdFromUserId,
  getFreelancerIdFromUserId,
  getUserAccountType,
} from "~/servers/user.server";
import { useLoaderData } from "@remix-run/react";
import { AccountType } from "~/types/enums";
import { FreelancerTimesheetHeader } from "./components/FreelancerTimesheetHeader";
import { OtherFreelancers } from "./components/OtherFreelancers";
import { EmployerJobsList } from "./components/EmployerJobsList";
export async function loader({ request, params }: LoaderFunctionArgs) {
  const userId = await requireUserOnboarded(request);
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const accountType = await getUserAccountType(userId);

  let profileId: number | null = null;
  if (accountType === AccountType.Freelancer) {
    // user must be a published freelancer
    await requireUserIsFreelancerPublished(request);

    const freelancerId = await getFreelancerIdFromUserId(userId);
    console.log("freelancerId", freelancerId);
    profileId = freelancerId;
  } else if (accountType === AccountType.Employer) {
    // user must be an employer
    await requireUserIsEmployerPublished(request);
    const employerId = await getEmployerIdFromUserId(userId);
    profileId = employerId;
  }

  if (!profileId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (accountType === AccountType.Freelancer) {
    // get current freelancer job applications
    console.log("profileId", profileId);
    const jobApplicationsPartialData =
      await getJobApplicationsByFreelancerId(profileId);

    console.log("jobApplicationsPartialData", jobApplicationsPartialData);

    const jobApplications = await Promise.all(
      jobApplicationsPartialData.map(async (jobApp) => {
        console.log(jobApp);
        console.log(profileId);
        const jobApplication = await getJobApplicationByJobIdAndFreelancerId(
          jobApp.jobId,
          profileId
        );
        return jobApplication;
      })
    );

    return Response.json({ jobApplications, accountType });
  } else if (accountType === AccountType.Employer) {
    const employerId = await getEmployerIdFromUserId(userId);

    if (params.freelancerId && params.jobId) {
      // Viewing specific freelancer's timesheet
      const jobApplication = await getJobApplicationByJobIdAndFreelancerId(
        parseInt(params.jobId),
        parseInt(params.freelancerId)
      );
      const allJobApplications = await getJobApplicationsByJobId(
        parseInt(params.jobId)
      );

      return Response.json({ jobApplication, allJobApplications, accountType });
    } else {
      // Viewing list of jobs
      const jobs = await getEmployerJobs(employerId);
      return Response.json({ jobs, accountType });
    }
  }
}

export default function Page() {
  const { accountType, jobs, jobApplication, allJobApplications } =
    useLoaderData<typeof loader>();

  const allowOverlap = true;
  const [selectedJobApplication, setSelectedJobApplication] =
    useState<JobApplication | null>(null);

  if (accountType === AccountType.Employer) {
    if (jobApplication) {
      return (
        <div className="mt-10 mb-20">
          <FreelancerTimesheetHeader jobApplication={jobApplication} />
          <TimeSheetPage
            accountType={accountType}
            allowOverlap={true}
            jobApplication={jobApplication}
            freelancerId={jobApplication.freelancerId}
          />
          <OtherFreelancers
            jobApplications={allJobApplications}
            currentFreelancerId={jobApplication.freelancerId}
            jobId={jobApplication.jobId}
          />
        </div>
      );
    }

    return (
      <div className="mt-10 mb-20">
        <h2 className="text-2xl font-semibold mb-6">Your Projects</h2>
        <EmployerJobsList jobs={jobs} />
      </div>
    );
  }
  return (
    <div className="mt-10 mb-20">
      {selectedJobApplication ? (
        <TimeSheetPage
          accountType={accountType}
          allowOverlap={allowOverlap}
          jobApplication={selectedJobApplication}
        />
      ) : (
        <JobsPage onJobSelect={setSelectedJobApplication} />
      )}
    </div>
  );
}
