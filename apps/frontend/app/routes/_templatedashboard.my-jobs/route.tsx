import { json, LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import JobManagement from "./jobs-displaying";
import { getJobs } from "~/servers/employer.server"; // Assume this is where your database fetching function resides

interface Skill {
  name: string;
  isStarred: boolean;
}

interface Job {
  id?: number;
  employerId: number;
  title: string;
  description: string;
  workingHoursPerWeek: number;
  locationPreference: string;
  requiredSkills: Skill[];
  projectType: string;
  budget: number;
  experienceLevel: string;
  isActive: boolean;
  isDraft: boolean;
  isClosed: boolean;
  isPaused: boolean;
  createdAt?: string;
}

export const loader: LoaderFunction = async () => {
  // Fetch jobs from the database
  const jobs = await getJobs(); // This function should return jobs in the format defined in `Job`

  // Return the fetched jobs in the JSON response
  return json({ jobs });
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
