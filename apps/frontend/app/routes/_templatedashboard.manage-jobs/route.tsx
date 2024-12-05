import { LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import JobManagement from "./jobs-displaying";
import { getEmployerJobs } from "~/servers/job.server";
import { Job } from "~/types/Job";
import { requireUserIsEmployerPublished } from "~/auth/auth.server";
import { getProfileInfo } from "~/servers/user.server";
import { fetchJobsWithApplicants } from "~/servers/job.server";

export const loader: LoaderFunction = async ({ request }) => {
  // Verify the user is a published employer
  const userId = await requireUserIsEmployerPublished(request);

  // Fetch employer profile
  const profile = await getProfileInfo({ userId });
  const employerId = profile.id;

  // Fetch jobs for the employer
  const jobs = await getEmployerJobs(employerId);

  // For each job, fetch applicants
  const jobsWithApplicants = await fetchJobsWithApplicants(jobs);

  // Return the fetched data
  return new Response(JSON.stringify({ jobs: jobsWithApplicants }), {
    headers: { "Content-Type": "application/json" },
  });
};

// Layout component
export default function Layout() {
  const { jobs } = useLoaderData<{
    jobs: (Job & { applicants: any[]; interviewedCount: number })[];
  }>();

  return (
    <div className="xl:p-8 p-2 mx-2 xl:mt-20 mt-24 font-['Switzer-Regular'] w-full">
      <JobManagement jobs={jobs} />
    </div>
  );
}
