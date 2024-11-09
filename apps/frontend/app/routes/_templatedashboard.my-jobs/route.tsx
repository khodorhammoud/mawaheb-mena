import { json, LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import JobManagement from "./jobs-displaying";

// Define Skill interface
interface Skill {
  name: string;
  isStarred: boolean;
}

// Update Job interface
interface Job {
  id: number;
  title: string;
  description: string;
  workingHoursPerWeek: number;
  locationPreference: string;
  requiredSkills: Skill[]; // Change to Skill[] instead of string[]
  projectType: string;
  budget: number;
  experienceLevel: string;
  isActive: boolean;
  isDraft: boolean;
  isClosed: boolean;
  isPaused: boolean;
  createdAt: string; // Keep as string for JSON compatibility
}

const dummyJobs: Job[] = [
  {
    id: 1,
    title: "Frontend Developer",
    description: "Developing UI components for a web app.",
    workingHoursPerWeek: 40,
    locationPreference: "Remote",
    requiredSkills: [
      { name: "React", isStarred: true },
      { name: "TypeScript", isStarred: false },
      { name: "CSS", isStarred: true },
    ],
    projectType: "Fixed",
    budget: 3000,
    experienceLevel: "Mid",
    isActive: true,
    isDraft: false,
    isClosed: false,
    isPaused: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    title: "Backend Developer",
    description: "Implementing APIs and database operations.",
    workingHoursPerWeek: 40,
    locationPreference: "On-site",
    requiredSkills: [
      { name: "Node.js", isStarred: true },
      { name: "Express", isStarred: false },
      { name: "SQL", isStarred: true },
    ],
    projectType: "Hourly",
    budget: 50,
    experienceLevel: "Senior",
    isActive: true,
    isDraft: true,
    isClosed: false,
    isPaused: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 3,
    title: "UI/UX Designer",
    description: "Designing user-friendly interfaces.",
    workingHoursPerWeek: 30,
    locationPreference: "Hybrid",
    requiredSkills: [
      { name: "Figma", isStarred: true },
      { name: "Sketch", isStarred: false },
      { name: "User Research", isStarred: true },
    ],
    projectType: "Fixed",
    budget: 2000,
    experienceLevel: "Entry",
    isActive: true,
    isDraft: false,
    isClosed: false,
    isPaused: true,
    createdAt: new Date().toISOString(),
  },
];

// Loader function with artificial delay
export const loader: LoaderFunction = async () => {
  return json({ jobs: dummyJobs });
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
