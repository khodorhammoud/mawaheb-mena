import { LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Job } from "~/types/Job";
import { getEmployerJobs, fetchJobsWithApplicants } from "~/servers/job.server";
import { requireUserIsEmployerPublished } from "~/auth/auth.server";
import { getProfileInfo } from "~/servers/user.server";
import JobManagement from "./jobs-displaying";

export const loader: LoaderFunction = async ({ request }) => {
  // Step 1: Verify the user is a published employer
  const userId = await requireUserIsEmployerPublished(request);

  // Step 2: Fetch employer profile
  const profile = await getProfileInfo({ userId });
  const employerId = profile.id;

  // Step 3: Fetch jobs for the employer
  const jobs = await getEmployerJobs(employerId);

  // For each job, fetch applicants
  const jobsWithApplicants = await fetchJobsWithApplicants(jobs);

  // Return the fetched data
  return Response.json({ jobs: jobsWithApplicants });
};

// Layout component
export default function Layout() {
  const { jobs } = useLoaderData<{
    jobs: (Job & { applicants })[];
  }>();

  return (
    <div className="xl:p-8 p-2 mx-2 xl:mt-20 mt-24 font-['Switzer-Regular'] w-full">
      <JobManagement jobs={jobs} />
    </div>
  );
}
