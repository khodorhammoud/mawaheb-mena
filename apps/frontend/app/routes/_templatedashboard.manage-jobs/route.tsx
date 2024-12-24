import { LoaderFunction, ActionFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { JobCardData } from "~/types/Job";
import {
  updateJobStatus,
  fetchJobsWithApplications,
} from "~/servers/job.server";
import { requireUserIsEmployerPublished } from "~/auth/auth.server";
import { getProfileInfo } from "~/servers/user.server";
import JobManagement from "./jobs-displaying";

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const jobId = parseInt(formData.get("jobId") as string, 10);
  const newStatus = formData.get("status") as string;

  try {
    await updateJobStatus(jobId, newStatus);
    return Response.json({ success: true });
  } catch (error) {
    console.error("Failed to update job status:", error);
    return Response.json(
      { success: false, error: "Failed to update job status" },
      { status: 500 }
    );
  }
};

export const loader: LoaderFunction = async ({ request }) => {
  // Step 1: Verify the user is a published employer
  const userId = await requireUserIsEmployerPublished(request);

  // Step 2: Fetch employer profile
  const profile = await getProfileInfo({ userId });
  const employerId = profile.id;

  // For each job, fetch applicants
  const jobsWithApplications = await fetchJobsWithApplications(employerId);

  // Return the fetched data
  return Response.json(jobsWithApplications);
};

// Layout component
export default function Layout() {
  const jobsWithApplications = useLoaderData<JobCardData[]>();

  return (
    <div className="xl:p-8 p-2 mx-2 xl:mt-20 mt-24 font-['Switzer-Regular'] w-full">
      <JobManagement data={jobsWithApplications} />
    </div>
  );
}
