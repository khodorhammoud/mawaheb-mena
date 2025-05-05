import {
  pgTable,
  serial,
  varchar,
  boolean,
  integer,
  text,
  time,
  timestamp,
  jsonb,
  real,
  date,
  numeric,
} from 'drizzle-orm/pg-core';

import { sql } from 'drizzle-orm';

// import {
//   providerEnum,
//   accountStatusEnum,
//   employerAccountTypeEnum,
//   accountTypeEnum,
//   timesheetStatusEnum,
//   languageEnum,
//   jobApplicationStatusEnum,
//   countryEnum,
//   dayOfWeekEnum,
//   projectTypeEnum,
//   compensationTypeEnum,
//   locationPreferenceTypeEnum,
//   experienceLevelEnum,
//   jobStatusEnum,
//   jobsOpenToEnum,
//   belongsToEnum,
//   userRoleEnum,
// } from './types';

import { pgEnum } from 'drizzle-orm/pg-core';
import {
  AccountStatus,
  EmployerAccountType,
  ProjectType,
  CompensationType,
  Language,
  Country,
  DayOfWeek,
  AccountType,
  LocationPreferenceType,
  ExperienceLevel,
  JobStatus,
  TimesheetStatus,
  JobApplicationStatus,
  JobsOpenTo,
  Provider,
  AttachmentBelongsTo,
} from '../types/enums';

export const providerEnum = pgEnum('provider', Object.values(Provider) as [string, ...string[]]);

export const accountStatusEnum = pgEnum(
  'account_status',
  Object.values(AccountStatus) as [string, ...string[]]
);

export const employerAccountTypeEnum = pgEnum(
  'eployer_account_type',
  Object.values(EmployerAccountType) as [string, ...string[]]
);
export const accountTypeEnum = pgEnum(
  'account_type',
  Object.values(AccountType) as [string, ...string[]]
);

export const timesheetStatusEnum = pgEnum(
  'timesheet_status',
  Object.values(TimesheetStatus) as [string, ...string[]]
);

export const languageEnum = pgEnum('language', Object.values(Language) as [string, ...string[]]);

export const jobApplicationStatusEnum = pgEnum(
  'job_application_status',
  Object.values(JobApplicationStatus) as [string, ...string[]]
);

export const countryEnum = pgEnum(
  // pgEnum is for making enum in postgresql, and i call its normal enum found if i click on the word Country inside values
  'country', // this name is not depending on any other name for now !
  Object.values(Country) as [string, ...string[]] // List of all valid country values from the Country enum
);
export const dayOfWeekEnum = pgEnum(
  'day_of_week',
  Object.values(DayOfWeek) as [string, ...string[]]
);
export const projectTypeEnum = pgEnum(
  'project_type',
  Object.values(ProjectType) as [string, ...string[]]
);
export const compensationTypeEnum = pgEnum(
  'compensation_type',
  Object.values(CompensationType) as [string, ...string[]]
);

export const locationPreferenceTypeEnum = pgEnum(
  'location_preference_type',
  Object.values(LocationPreferenceType) as [string, ...string[]]
);

export const experienceLevelEnum = pgEnum(
  'experience_level',
  Object.values(ExperienceLevel) as [string, ...string[]]
);

export const jobStatusEnum = pgEnum(
  'job_status',
  Object.values(JobStatus) as [string, ...string[]]
);

export const jobsOpenToEnum = pgEnum(
  'jobs_open_to',
  Object.values(JobsOpenTo) as [string, ...string[]]
);

export const belongsToEnum = pgEnum(
  'belongs_to',
  Object.values(AttachmentBelongsTo) as [string, ...string[]]
);
/* const jobApplicationStatusEnum = pgEnum(
  "job_application_status",
  Object.values(JobApplicationStatus) as [string, ...string[]]
);
 */

export const userRoleEnum = pgEnum('user_role', ['admin', 'user']);

/**
 * Definition of the Users table.
 *
 * @property {serial} id - Primary key, serial identifier
 * @property {varchar(80)} first_name - User's first name
 * @property {varchar(80)} last_name - User's last name
 * @property {varchar(150)} email - Unique email address (not null)
 * @property {varchar} password_hash - Password hash (not null)
 * @property {boolean} is_verified - Verification status of the user account
 * @property {boolean} is_onboarded - Onboarding status of the user account
 */

// each of these are tables, and in each tables, and each row here represent a column in our db schema (in neon)
// the first word 'firstName' represent the keyword we wil use in our code (our code reference), and the second name 'first_name' is the name of the column that appears in our db (the standart naming for postgres is fname_lname)

export const UsersTable = pgTable('users', {
  id: serial('id').primaryKey(),
  firstName: varchar('first_name', { length: 80 }),
  lastName: varchar('last_name', { length: 80 }),
  email: varchar('email', { length: 150 }).unique().notNull(),
  passHash: varchar('password_hash'),
  isVerified: boolean('is_verified').default(false),
  isOnboarded: boolean('is_onboarded').default(false),
  provider: providerEnum('provider'),
  role: userRoleEnum('role').default('user'),
  deletionRequestedAt: timestamp('deletion_requested_at'),
  finalDeletionAt: timestamp('final_deletion_at'),
});

/**
 * Definition of the user_identifications table.
 *
 * @property {serial} id - Primary key, serial identifier
 * @property {integer} userId - References the UsersTable.id
 * @property {jsonb} attachments - JSONB field for multiple file attachments
 * @property {timestamp} createdAt - Timestamp for when the record was created
 */
export const userIdentificationsTable = pgTable('user_identifications', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => UsersTable.id),
  attachments: jsonb('attachments').default(sql`'{}'::jsonb`),
  createdAt: timestamp('created_at').defaultNow(),
});

/**
 * Stores the social accounts of users when they log in using social media
 * @property id - serial primary key
 * @property user_id - integer referencing the UsersTable id
 * @property provider - the name of the social media platform
 * @property provider_account_id - the id of the user's account on the social media platform
 * @property profile_url - URL to the user's profile on the social media platform
 * @property access_token -  the access token of the user's account on the social media platform
 * @property refresh_token -  the refresh token of the user's account on the social media platform
 * @property expires_at - timestamp, the expiration date of the access token
 */
export const socialAccountsTable = pgTable('social_accounts', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => UsersTable.id),
  provider: varchar('provider', { length: 50 }),
  providerAccountId: varchar('provider_account_id', { length: 255 }),
  profileUrl: varchar('profile_url', { length: 255 }),
  accessToken: varchar('access_token', { length: 500 }),
  refreshToken: varchar('refresh_token', { length: 500 }),
  expiresAt: timestamp('expires_at'),
});

/**
 * Define the accountsTable schema using PG Core types.
 *
 * @property id - serial primary key
 * @property user_id - integer referencing the UsersTable id
 * @property account_type - accountTypeEnum (freelancer or employer)
 * @property slug - varchar with length 60 the slug of the freelancer used in the url
 * @property location - varchar with length 150
 * @property country - countryEnum
 * @property region - varchar with length 100
 * @property account_status - accountStatusEnum
 * @property phone - varchar with length 30
 * @property website_url - text
 * @property social_media_links - text array with default ''
 */
export const accountsTable = pgTable('accounts', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => UsersTable.id),
  slug: varchar('slug', { length: 60 }).unique(),
  accountType: accountTypeEnum('account_type'),
  country: varchar('country', { length: 100 }),
  address: varchar('address', { length: 150 }),
  region: varchar('region', { length: 100 }),
  accountStatus: accountStatusEnum('account_status'),
  phone: varchar('phone', { length: 30 }),
  websiteURL: text('website_url'),
  socialMediaLinks: jsonb('social_media_links').default(sql`'{}'::jsonb`),
  isCreationComplete: boolean('is_creation_complete').default(false),
});

/**
 * Define the preferredWorkingTimesTable schema using PG Core types.
 *
 * @property id - serial primary key
 * @property account_id - integer referencing the accountsTable id
 * @property dayOfWeek - dayOfWeekEnum
 * @property start_time - time
 * @property end_time - time
 */
export const preferredWorkingTimesTable = pgTable('preferred_working_times', {
  id: serial('id').primaryKey(),
  accountId: integer('account_id').references(() => accountsTable.id),
  dayOfWeek: dayOfWeekEnum('day'),
  startTime: time('start_time'),
  endTime: time('end_time'),
});

/**
 * Define the freelancersTable schema using PG Core types.
 *
 * @property id - serial primary key
 * @property account_id - integer referencing the accountsTable id
 * @property about - text
 * @property fields_of_expertise - text array with default ''
 * @property portfolio - text array with default ''
 * @property cv_link - text
 * @property video_link - text
 * @property certificates_links - text array with default ''
 * @property years_of_experience - varchar with length 80
 * @property languagesSpoken - languageEnum array with default ''
 * @property preferred_project_types - projectTypeEnum array with default ''
 * @property hourlyRate - integer
 * @property compensation_type - compensationTypeEnum
 */
export const freelancersTable = pgTable('freelancers', {
  id: serial('id').primaryKey(),
  accountId: integer('account_id').references(() => accountsTable.id),
  about: text('about'),
  fieldsOfExpertise: text('fields_of_expertise')
    .array()
    .default(sql`'{}'::text[]`),
  portfolio: jsonb('portfolio').default(sql`'[]'::jsonb`),
  workHistory: jsonb('work_history').default(sql`'[]'::jsonb`),
  cvLink: text('cv_link'),
  videoLink: text('video_link'),
  certificates: jsonb('certificates').default(sql`'[]'::jsonb`),
  educations: jsonb('educations').default(sql`'[]'::jsonb`),
  yearsOfExperience: integer('years_of_experience'),
  preferredProjectTypes: projectTypeEnum('preferred_project_types')
    .array()
    .default(sql`ARRAY[]::project_type[]`),
  hourlyRate: integer('hourly_rate'),
  compensationType: compensationTypeEnum('compensation_type'),
  availableForWork: boolean('available_for_work').default(false),
  dateAvailableFrom: date('available_from'),
  jobsOpenTo: jobsOpenToEnum('jobs_open_to')
    .array()
    .default(sql`ARRAY[]::jobs_open_to[]`), // array that allows only the enum
  hoursAvailableFrom: time('hours_available_from'),
  hoursAvailableTo: time('hours_available_to'),
});

/**
 * Define the relation between freelancers and languages where each employer can have zero to many languages
 *
 * @property id - serial primary key
 * @property freelancer_id - integer referencing the freelancersTable id
 * @property language_id - integer referencing the languagesTable id
 * @property timestamp - timestamp
 */
export const freelancerLanguagesTable = pgTable('freelancer_languages', {
  id: serial('id').primaryKey(),
  freelancerId: integer('freelancer_id').references(() => freelancersTable.id),
  languageId: integer('language_id').references(() => languagesTable.id),
  createdAt: timestamp('timestamp').default(sql`now()`),
});

/**
 * Define the employersTable schema using PG Core types.
 *
 * @property id - serial primary key
 * @property account_id - integer referencing the accountsTable id
 * @property budget - text
 * @property company_name - varchar with length 100
 * @property employer_name - varchar with length 100
 * @property company_email - varchar with length 150
 * @property about - text
 * @property industry_sector - text
 * @property company_rep_name - varchar with length 100
 * @property company_rep_email - varchar with length 150
 * @property company_rep_position - varchar with length 60
 * @property company_rep_phone - varchar with length 30
 * @property tax_id_number - varchar
 * @property tax_id_document_link - text
 * @property business_license_link - text
 * @property certification_of_incorporation_link - text
 */
export const employersTable = pgTable('employers', {
  id: serial('id').primaryKey(),
  accountId: integer('account_id').references(() => accountsTable.id),
  budget: integer('budget'),
  employerAccountType: employerAccountTypeEnum('employerAccountType'),
  companyName: varchar('company_name', { length: 100 }),
  employerName: varchar('employer_name', { length: 100 }),
  companyEmail: varchar('company_email', { length: 150 }),
  about: text('about'),
  industrySector: text('industry_sector'),
  yearsInBusiness: integer('years_in_business'),
  companyRepName: varchar('company_rep_name', { length: 100 }),
  companyRepEmail: varchar('company_rep_email', { length: 150 }),
  companyRepPosition: varchar('company_rep_position', { length: 60 }),
  companyRepPhone: varchar('company_rep_phone', { length: 30 }),
  taxIdNumber: varchar('tax_id_number'),
  taxIdDocumentLink: text('tax_id_document_link'),
  businessLicenseLink: text('business_license_link'),
  certificationOfIncorporationLink: text('certification_of_incorporation_link'),
});

/**
 * Define the languagesTable schema using PG Core types.
 *
 * @property id - serial primary key
 * @property name - varchar with length 25
 */
export const languagesTable = pgTable('languages', {
  id: serial('id').primaryKey(),
  language: varchar('language', { length: 25 }),
});

/**
 * Define the accountLanguagesTable schema using PG Core types.
 *
 * @property id - serial primary key
 * @property account_id - integer referencing the accountsTable id
 * @property language_id - integer referencing the languagesTable id
 */
export const accountLanguagesTable = pgTable('account_languages', {
  id: serial('id').primaryKey(),
  accountId: integer('account_id').references(() => accountsTable.id),
  languageId: integer('language_id').references(() => languagesTable.id),
});

/**
 * Define the userVerificationTable schema using PG Core types.
 * used to store account verification tokens sent to users after registration
 *
 * @property id - serial primary key
 * @property user_id - integer referencing the UsersTable id
 * @property token - varchar with length 256
 * @property expiry - timestamp
 * @property is_used - boolean
 * @property created_at - timestamp
 */

export const userVerificationsTable = pgTable('user_verifications', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => UsersTable.id),
  token: varchar('token', { length: 256 }),
  expiry: timestamp('expiry'),
  isUsed: boolean('is_used').default(false),
  createdAt: timestamp('created_at').default(sql`now()`),
});

/**
 * Define the industries schema using PG Core types.
 *
 * @property id - serial primary key
 * @property label - string with length 50 saves the industry name
 * @property metadata - list of strings, saves the industry metadata which are other search labels for the industry
 */
export const industriesTable = pgTable('industries', {
  id: serial('id').primaryKey(),
  label: text('label').unique(),
  metadata: text('metadata').array(),
});

/**
 * Define the relation between employers and industries where each employer can have zero to many insudries
 * @property id - serial primary key
 * @property employer_id - integer referencing the employersTable id
 * @property industry_id - integer referencing the industriesTable id
 * @property timestamp - timestamp
 */
export const employerIndustriesTable = pgTable('employer_industries', {
  id: serial('id').primaryKey(),
  employerId: integer('employer_id').references(() => employersTable.id),
  industryId: integer('industry_id').references(() => industriesTable.id),
  createdAt: timestamp('timestamp').default(sql`now()`),
});

/**
 * Define the JobCategories table schema that stores the job categories
 *
 * @property id - serial primary key
 * @property label - text
 * @property createdAt - timestamp
 */
export const jobCategoriesTable = pgTable('job_categories', {
  id: serial('id').primaryKey(),
  label: text('label'),
  createdAt: timestamp('timestamp').default(sql`now()`),
});

/**
 * Define the Jobs table schema
 *
 * @property id - serial primary key
 * @property employer_id - integer referencing the employersTable id
 * @property title - text
 * @property description - text
 * @property job_category_id - integer referencing the jobCategoriesTable id
 * @property working_hours_per_week - integer
 * @property location_preference - locationPreferenceTypeEnum
 * @property requred_skills - text array
 * @property project_type - projectTypeEnum
 * @property budget - integer
 * @property experience_level - experienceLevelEnum
 * @property status - jobStatusEnum
 * @property created_at - timestamp
 * @property fulfilledAt - timestamp
 */

export const jobsTable = pgTable('jobs', {
  id: serial('id').primaryKey(),
  employerId: integer('employer_id').references(() => employersTable.id),
  title: text('title'),
  description: text('description'),
  jobCategoryId: integer('job_category_id').references(() => jobCategoriesTable.id),
  workingHoursPerWeek: integer('working_hours_per_week'),
  locationPreference: text('location_preference'),
  //locationPreferenceTypeEnum("location_preference_type"),
  projectType: projectTypeEnum('project_type'),
  budget: integer('budget'),
  experienceLevel: experienceLevelEnum('experience_level'),
  status: text('status'), //jobStatusEnum("status"),
  createdAt: timestamp('created_at').default(sql`now()`),
  fulfilledAt: timestamp('fulfilled_at'),
});

/**
 * Define the Skills table schema
 *
 * @property id - serial primary key
 * @property name - text
 * @property metaData - jsonb
 */
export const skillsTable = pgTable('skills', {
  id: serial('id').primaryKey(),
  label: text('label'),
  metaData: text('meta_data').default('[]'),
  isHot: boolean('is_hot').default(false),
  createdAt: timestamp('created_at').default(sql`now()`),
});

/**
 * Define the relation between jobs and skills where each job can have zero to many skills
 * @property id - serial primary key
 * @property job_id - integer referencing the jobsTable id
 * @property skill_id - integer referencing the skillsTable id
 * @property isStarred - boolean
 */
export const jobSkillsTable = pgTable('job_skills', {
  id: serial('id').primaryKey(),
  jobId: integer('job_id').references(() => jobsTable.id),
  skillId: integer('skill_id').references(() => skillsTable.id),
  isStarred: boolean('is_starred').default(false),
});

/**
 * Define the relation between freelancers and skills where each freelancer can have zero to many skills
 * @property id - serial primary key
 * @property freelancer_id - integer referencing the freelancersTable
 * @property skill_id - integer referencing the skillsTable id
 * @property years_of_experience - integer the number of years of experience the freelancer has with the skill
 */
export const freelancerSkillsTable = pgTable('freelancer_skills', {
  id: serial('id').primaryKey(),
  freelancerId: integer('freelancer_id').references(() => freelancersTable.id),
  skillId: integer('skill_id').references(() => skillsTable.id),
  yearsOfExperience: integer('years_of_experience'),
  isStarred: boolean('is_starred').default(false),
});

/**
 * Define the Jobs Applications table schema
 *
 * @property id - serial primary key
 * @property job_id - integer referencing the jobsTable id
 * @property freelancer_id - integer referencing the freelancersTable id
 * @property status - jobApplicationStatusEnum
 * @property created_at - timestamp
 */
export const jobApplicationsTable = pgTable('job_applications', {
  id: serial('id').primaryKey(),
  jobId: integer('job_id').references(() => jobsTable.id),
  freelancerId: integer('freelancer_id').references(() => freelancersTable.id),
  status: jobApplicationStatusEnum('status'),
  createdAt: timestamp('created_at').default(sql`now()`),
});

// projectType: projectTypeEnum("project_type"),

/**
 * Define the Reviews table schema
 *
 * @property id - serial primary key
 * @property employer_id - integer referencing the employersTable id
 * @property freelancer_id - integer referencing the freelancersTable id
 * @property rating - real (floating-point) rating between 1.0 and 5.0
 * @property comment - text field for review comments
 * @property created_at - timestamp when the review was submitted
 */
export const reviewsTable = pgTable('reviews', {
  id: serial('id').primaryKey(),
  employerId: integer('employer_id').references(() => employersTable.id),
  freelancerId: integer('freelancer_id').references(() => freelancersTable.id),
  rating: real('rating').notNull(),
  comment: text('comment'),
  createdAt: timestamp('created_at').default(sql`now()`),
  reviewType: text('review_type').notNull(),
});

/**
 * Define the Timesheets table schema
 *
 * @property id - serial primary key
 * @property freelancer_id - integer referencing the freelancersTable id
 * @property jobApplicationId - integer referencing the jobApplicationsTable id
 * @property start_time - timestamp
 * @property end_time - timestamp
 * @property description - text
 * @property created_at - timestamp
 */
export const timesheetEntriesTable = pgTable('timesheet_entries', {
  id: serial('id').primaryKey(),
  freelancerId: integer('freelancer_id').references(() => freelancersTable.id),
  jobApplicationId: integer('job_application_id').references(() => jobApplicationsTable.id),
  date: date('date'),
  startTime: timestamp('start_time'),
  endTime: timestamp('end_time'),
  description: text('description'),
  createdAt: timestamp('created_at').default(sql`now()`),
});

/**
 * Define the relation between timesheet submissions and timesheet entries where each timesheet submission can have zero to many timesheet entries
 * @property id - serial primary key
 * @property timesheet_submission_id - integer referencing the timesheetSubmissionsTable id
 * @property timesheet_entry_id - integer referencing the timesheetEntriesTable id
 */
export const TimesheetSubmissionEntriesTable = pgTable('timesheet_submission_entries', {
  id: serial('id').primaryKey(),
  timesheetSubmissionId: integer('timesheet_submission_id').references(
    () => timesheetSubmissionsTable.id
  ),
  timesheetEntryId: integer('timesheet_entry_id').references(() => timesheetEntriesTable.id),
});

/**
 * Define the timesheet submissions table schema
 * @property id - serial primary key
 * @property freelancer_id - integer referencing the freelancersTable id
 * @property job_application_id - integer referencing the jobApplicationsTable id
 * @property submission_date - date
 * @property total_hours - numeric
 * @property status - varchar with length 50
 * @property created_at - timestamp
 * @property updated_at - timestamp
 */
export const timesheetSubmissionsTable = pgTable('timesheet_submissions', {
  id: serial('id').primaryKey(),
  freelancerId: integer('freelancer_id').references(() => freelancersTable.id),
  jobApplicationId: integer('job_application_id').references(() => jobApplicationsTable.id),
  submissionDate: date('submission_date').notNull(), // The date the work was performed
  totalHours: numeric('total_hours').notNull(),
  status: timesheetStatusEnum('status').notNull().default(TimesheetStatus.Submitted), // pending, approved, rejected
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

/**
 * Define the attachments table schema
 * @property id
 * @property key
 * @property metadata
 * @property createdAty
 */
export const attachmentsTable = pgTable('attachments', {
  id: serial('id').primaryKey(),
  key: varchar('key').notNull(),
  metadata: jsonb('metadata').default({}),
  createdAt: timestamp('created_at').defaultNow(),
});

/**
 * Definition of the exit_feedback table.
 */
export const exitFeedbackTable = pgTable('exit_feedback', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => UsersTable.id),
  feedback: text('feedback'),
  createdAt: timestamp('created_at').default(sql`now()`),
});

export const notificationsTable = pgTable('notifications', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => UsersTable.id),
  type: varchar('type', { length: 50 }), // e.g., "message", "alert", "reminder"
  title: text('title'),
  message: text('message'),
  payload: jsonb('payload').default(sql`'{}'::jsonb`),
  isRead: boolean('is_read').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  readAt: timestamp('read_at'),
});

export const skillfoliosTable = pgTable('skillfolios', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => UsersTable.id),
  domain: text('domain'),
  field: text('field'),
  category: text('category'),
  subfield: text('subfield'),
  readiness_score: integer('readiness_score'),
  strengths: text('strengths').array(),
  weaknesses: text('weaknesses').array(),
  gaps: text('gaps').array(),
  profile: jsonb('profile').default(sql`'{}'::jsonb`),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});
