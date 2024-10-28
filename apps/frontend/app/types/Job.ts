export type Job = {
  id?: number;
  employerId: number;
  title: string;
  description: string;
  jobCategoryId?: number;
  workingHoursPerWeek?: number;
  locationPreference?: string;
  requiredSkills?: string[];
  projectType: string;
  budget: number;
  experienceLevel: string;
  isActive: boolean;
  isDeleted: boolean;
  isDraft: boolean;
  isClosed: boolean;
  isPaused: boolean;
  createdAt?: Date;
};
