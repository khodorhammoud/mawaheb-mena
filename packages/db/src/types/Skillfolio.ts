export interface UserSkill {
  name: string;
  proficiency: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  yearsOfExperience?: number;
  lastUsed?: string;
  verifiedBy?: string[]; // ["Project", "Certificate"]
}

export interface Education {
  degree: string;
  field: string;
  institution: string;
  completedOn: string;
}

export interface Experience {
  role: string;
  company?: string;
  durationYears?: number;
  technologies?: string[];
  projectDescriptions?: string[];
}

export interface Verification {
  type: string; // e.g., "Project Use", "Reference"
  evidence?: string;
}

export interface Skillfolio {
  id: string;
  userId: string;
  domain: string; // e.g. "Technology"
  field: string; // e.g. "Information Technology"
  category?: string; // Optional: e.g. "Software Engineering"
  subfield: string; // e.g. "Backend Development"
  readinessScore?: number; // Computed dynamically
  strengths?: string[]; // Tags/skills/tools/certs
  weaknesses?: string[]; // Tags/skills/tools/certs
  gaps?: string[]; // Missing items from graph expectations
  profile: {
    skills: UserSkill[];
    tools: string[];
    certifications: string[];
    education: Education[];
    experience: Experience[];
    verifications?: Verification[];
    custom?: Record<string, any>; // Any extra user-mapped data
  };
  createdAt: string;
  updatedAt: string;
}
