import { JobStatus } from "./enums";

interface Skill {
  name: string;
  isStarred: boolean;
}

export interface Job {
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
  status: JobStatus;
  createdAt?: string; // Keep as string for JSON compatibility
}
