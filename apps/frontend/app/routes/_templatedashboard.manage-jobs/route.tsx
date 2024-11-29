import { LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import JobManagement from "./jobs-displaying";
import { getEmployerJobs } from "~/servers/job.server"; // Assume this is where your database fetching function resides
import { Job } from "~/types/Job";
import { requireUserIsEmployerPublished } from "~/auth/auth.server";
import { getProfileInfo } from "~/servers/user.server";

export const loader: LoaderFunction = async ({ request }) => {
  // require current user is a published employer
  const userId = await requireUserIsEmployerPublished(request);

  const profile = await getProfileInfo({ userId });
  const employerId = profile.id;
  // Fetch jobs from the database
  const jobs = await getEmployerJobs(employerId); // This function should return jobs in the format defined in `Job`

  // Return the fetched jobs in the JSON response
  return Response.json({ jobs });
};

// Layout component
export default function Layout() {
  const { jobs } = useLoaderData<{ jobs: Job[] }>(); // Destructure jobs from loader data

  return (
    <div className="xl:p-8 p-2 mx-2 xl:mt-20 mt-24 font-['Switzer-Regular'] w-full">
      <JobManagement jobs={jobs} />
    </div>
  );
}
