import { Skill } from "~/types/Skill";

export interface Job {
  id?: number;
  employerId: number;
  title: string;
  description: string;
  jobCategoryId?: number; // Add this line to match the jobData structure
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
  createdAt?: string; // Keep as string for JSON compatibility
}
