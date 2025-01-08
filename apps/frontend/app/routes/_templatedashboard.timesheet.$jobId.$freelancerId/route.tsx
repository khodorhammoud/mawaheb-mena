import { LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { requireUserOnboarded } from "~/auth/auth.server";
import { AccountType } from "~/types/enums";
import { getUserAccountType } from "~/servers/user.server";
import TimeSheetPage from "~/routes/_templatedashboard.timesheet/components/TimeSheetPage";
import { FreelancerTimesheetHeader } from "~/routes/_templatedashboard.timesheet/components/FreelancerTimesheetHeader";
import { OtherFreelancers } from "~/routes/_templatedashboard.timesheet/components/OtherFreelancers";
import {
  getJobApplicationByJobIdAndFreelancerId,
  getJobApplicationsByJobId,
} from "~/servers/job.server";
import { JobApplication } from "~/types/Job";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const userId = await requireUserOnboarded(request);
  const accountType = await getUserAccountType(userId);

  if (accountType !== AccountType.Employer) {
    throw new Response("Unauthorized", { status: 403 });
  }

  const { jobId, freelancerId } = params;

  if (!jobId || !freelancerId) {
    throw new Response("Missing required parameters", { status: 400 });
  }

  const [jobApplication, allJobApplications] = await Promise.all([
    getJobApplicationByJobIdAndFreelancerId(
      parseInt(jobId),
      parseInt(freelancerId)
    ),
    getJobApplicationsByJobId(parseInt(jobId)),
  ]);

  if (!jobApplication) {
    throw new Response("Job application not found", { status: 404 });
  }

  return json({
    jobApplication,
    allJobApplications,
    accountType,
  });
}

export default function FreelancerTimesheetPage() {
  const { jobApplication, allJobApplications, accountType } = useLoaderData<{
    jobApplication: JobApplication;
    allJobApplications: JobApplication[];
    accountType: AccountType;
  }>();

  return (
    <div className="mt-10 mb-20">
      <FreelancerTimesheetHeader jobApplication={jobApplication} />
      <TimeSheetPage
        accountType={accountType}
        allowOverlap={true}
        jobApplication={jobApplication}
      />
      <OtherFreelancers
        jobApplications={allJobApplications}
        currentFreelancerId={jobApplication.freelancerId}
        jobId={jobApplication.jobId}
      />
    </div>
  );
}
