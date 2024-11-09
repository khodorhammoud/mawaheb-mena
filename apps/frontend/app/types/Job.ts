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
  isActive: boolean;
  isDraft: boolean;
  isClosed: boolean;
  isPaused: boolean;
  createdAt?: string; // Keep as string for JSON compatibility
}
