import { Skill } from "./Skill";
import { JobStatus } from "./enums";

export interface Job {
  id?: number;
  employerId: number;
  title: string;
  description: string;
  jobCategoryId: number;
  workingHoursPerWeek: number;
  locationPreference: string;
  requiredSkills: Skill[];
  projectType: string;
  budget: number;
  experienceLevel: string;
  status: JobStatus;
  createdAt?: string; // Keep as string for JSON compatibility
}
