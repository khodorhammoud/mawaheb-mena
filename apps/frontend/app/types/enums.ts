export enum AccountStatus {
  Draft = 'draft',
  Pending = 'pending',
  Published = 'published',
  Closed = 'closed',
  Suspended = 'suspended',
  Deleted = 'deleted',
  Deactivated = 'deactivated',
}

export enum Provider {
  Credentials = 'credentials',
  SocialAccount = 'social_account',
}

export enum AccountType {
  Freelancer = 'freelancer',
  Employer = 'employer',
  Admin = 'admin',
}

export enum EmployerAccountType {
  Personal = 'personal',
  Company = 'company',
}

export enum ProjectType {
  ShortTerm = 'short-term',
  LongTerm = 'long-term',
  PerProjectBasis = 'per-project-basis',
}

export enum LocationPreferenceType {
  Remote = 'remote',
  Onsite = 'onsite',
  Mixed = 'mixed',
}

export enum CompensationType {
  ProjectBasedRate = 'project-based-rate',
  HourlyRate = 'hourly-rate',
}

export enum Language {
  Spanish = 'Spanish',
  English = 'English',
  Italian = 'Italian',
  Arabic = 'Arabic',
  French = 'French',
  Turkish = 'Turkish',
  German = 'German',
  Portuguese = 'Portuguese',
  Russian = 'Russian',
}

export enum Country {
  Albania = 'Albania',
  Algeria = 'Algeria',
  Bahrain = 'Bahrain',
  Egypt = 'Egypt',
  Iran = 'Iran',
  Iraq = 'Iraq',
  Jordan = 'Jordan',
  Kuwait = 'Kuwait',
  Lebanon = 'Lebanon',
  Libya = 'Libya',
  Morocco = 'Morocco',
  Oman = 'Oman',
  Palestine = 'Palestine',
  Qatar = 'Qatar',
  SaudiArabia = 'Saudi_Arabia',
  Syria = 'Syria',
  Tunisia = 'Tunisia',
  Turkey = 'Turkey',
  UnitedArabEmirates = 'United_Arab_Emirates',
  Yemen = 'Yemen',
}

export enum DayOfWeek {
  Monday = 'Monday',
  Tuesday = 'Tuesday',
  Wednesday = 'Wednesday',
  Thursday = 'Thursday',
  Friday = 'Friday',
  Saturday = 'Saturday',
  Sunday = 'Sunday',
}

export enum ExperienceLevel {
  Entry = 'entry_level',
  Mid = 'mid_level',
  Expert = 'senior_level',
}

export enum JobStatus {
  Draft = 'draft',
  Active = 'active',
  Closed = 'closed',
  Completed = 'completed',
  Paused = 'paused',
  Deleted = 'deleted',
}

export enum JobApplicationStatus {
  Pending = 'pending',
  Shortlisted = 'shortlisted',
  Approved = 'approved',
  Rejected = 'rejected',
}

export enum TimesheetStatus {
  Draft = 'draft',
  Submitted = 'submitted',
  Approved = 'approved',
  Rejected = 'rejected',
}

export enum JobsOpenTo {
  FullTimeRoles = 'full-time-roles',
  PartTimeRoles = 'part-time-roles',
  EmployeeRoles = 'employee-roles',
}

export enum AttachmentBelongsTo {
  Portfolio = 'portfolio',
  Certificate = 'certificate',
}
