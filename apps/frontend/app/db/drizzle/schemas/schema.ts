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
  json,
} from "drizzle-orm/pg-core";

/** Import custom enums and types from the schemaTypes file. */
import {
  projectTypeEnum,
  accountStatusEnum,
  accountTypeEnum,
  languageEnum,
  countryEnum,
  dayOfWeekEnum,
  compensationTypeEnum,
  employerAccountTypeEnum,
  // jobStatusEnum,
  // locationPreferenceTypeEnum,
  // experienceLevelEnum,
} from "./schemaTypes";

import { sql } from "drizzle-orm";

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

export const UsersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  firstName: varchar("first_name", { length: 80 }),
  lastName: varchar("last_name", { length: 80 }),
  email: varchar("email", { length: 150 }).unique().notNull(),
  passHash: varchar("password_hash").notNull(),
  isVerified: boolean("is_verified").default(false),
  isOnboarded: boolean("is_onboarded").default(false), // Make sure this matches your DB column
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
export const accountsTable = pgTable("accounts", {
  id: serial("id").primaryKey(), // The serial type makes sure the id is a number that automatically increases for each new account
  userId: integer("user_id").references(() => UsersTable.id), // foreign key
  slug: varchar("slug", { length: 60 }).unique(),
  accountType: accountTypeEnum("account_type"),
  // freelancerId: integer("freelancerId").references(() => freelancersTable.id),
  // employerId: integer("employerId").references(() => employersTable.id),
  location: varchar("location", { length: 150 }),
  country: countryEnum("country"), // countryEnum is a variable, and we are calling it only, and the name inside paranthesis is the one that will apear in the table schema // click on countryEnum if you want
  region: varchar("region", { length: 100 }),
  accountStatus: accountStatusEnum("account_status"), // the emun defines a field that can only hold specific values // freelancer or employer
  phone: varchar("phone", { length: 30 }),
  websiteURL: text("website_url"),
  socialMediaLinks: jsonb("social_media_links").default(sql`'{}'::jsonb`),
  isCreationComplete: boolean("is_creation_complete").default(false),
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
export const preferredWorkingTimesTable = pgTable("preferred_working_times", {
  id: serial("id").primaryKey(),
  accountId: integer("account_id").references(() => accountsTable.id),
  dayOfWeek: dayOfWeekEnum("day"),
  startTime: time("start_time"),
  endTime: time("end_time"),
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
export const freelancersTable = pgTable("freelancers", {
  id: serial("id").primaryKey(),
  accountId: integer("account_id").references(() => accountsTable.id),
  about: text("about"),
  fieldsOfExpertise: text("fields_of_expertise")
    .array()
    .default(sql`'{}'::text[]`),
  // portfolio: jsonb("portfolio").default(sql`'[]'::jsonb`),
  portfolio: jsonb("portfolio").default(sql`'[]'::jsonb`),
  workHistory: jsonb("work_history").default(sql`'[]'::jsonb`),
  cvLink: text("cv_link"),
  videoLink: text("video_link"),
  certificates: jsonb("certificates").default(sql`'[]'::jsonb`),
  educations: jsonb("educations").default(sql`'[]'::jsonb`),
  yearsOfExperience: integer("years_of_experience"),
  preferredProjectTypes: projectTypeEnum("preferred_project_types")
    .array()
    .default(sql`ARRAY[]::project_type[]`),
  hourlyRate: integer("hourly_rate"),
  compensationType: compensationTypeEnum("compensation_type"),
});

/**
 * Define the relation between freelancers and languages where each employer can have zero to many languages
 *
 * @property id - serial primary key
 * @property freelancer_id - integer referencing the freelancersTable id
 * @property language_id - integer referencing the languagesTable id
 * @property timestamp - timestamp
 */
export const freelancerLanguagesTable = pgTable("freelancer_languages", {
  id: serial("id").primaryKey(),
  freelancerId: integer("freelancer_id").references(() => freelancersTable.id),
  languageId: integer("language_id").references(() => languagesTable.id),
  createdAt: timestamp("timestamp").default(sql`now()`),
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
export const employersTable = pgTable("employers", {
  id: serial("id").primaryKey(),
  accountId: integer("account_id").references(() => accountsTable.id),
  budget: integer("budget"),
  employerAccountType: employerAccountTypeEnum("employerAccountType"),
  companyName: varchar("company_name", { length: 100 }),
  employerName: varchar("employer_name", { length: 100 }),
  companyEmail: varchar("company_email", { length: 150 }),
  about: text("about"),
  industrySector: text("industry_sector"),
  yearsInBusiness: integer("years_in_business"),
  companyRepName: varchar("company_rep_name", { length: 100 }),
  companyRepEmail: varchar("company_rep_email", { length: 150 }),
  companyRepPosition: varchar("company_rep_position", { length: 60 }),
  companyRepPhone: varchar("company_rep_phone", { length: 30 }),
  taxIdNumber: varchar("tax_id_number"),
  taxIdDocumentLink: text("tax_id_document_link"),
  businessLicenseLink: text("business_license_link"),
  certificationOfIncorporationLink: text("certification_of_incorporation_link"),
});

/**
 * Define the languagesTable schema using PG Core types.
 *
 * @property id - serial primary key
 * @property name - languageEnum
 */
export const languagesTable = pgTable("languages", {
  id: serial("id").primaryKey(),
  name: languageEnum("language"),
});

/**
 * Define the accountLanguagesTable schema using PG Core types.
 *
 * @property id - serial primary key
 * @property account_id - integer referencing the accountsTable id
 * @property language_id - integer referencing the languagesTable id
 */
export const accountLanguagesTable = pgTable("account_languages", {
  id: serial("id").primaryKey(),
  accountId: integer("account_id").references(() => accountsTable.id),
  languageId: integer("language_id").references(() => languagesTable.id),
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

export const userVerificationsTable = pgTable("user_verifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => UsersTable.id),
  token: varchar("token", { length: 256 }),
  expiry: timestamp("expiry"),
  isUsed: boolean("is_used").default(false),
  createdAt: timestamp("created_at").default(sql`now()`),
});

/**
 * Define the industries schema using PG Core types.
 *
 * @property id - serial primary key
 * @property label - string with length 50 saves the industry name
 * @property metadata - list of strings, saves the industry metadata which are other search labels for the industry
 */
export const industriesTable = pgTable("industries", {
  id: serial("id").primaryKey(),
  label: text("label").unique(),
  metadata: text("metadata").array(),
});

/**
 * ***********************************
 * ***********************************
 * Define the relation between employers and industries where each employer can have zero to many insudries
 * ***********************************
 * ***********************************
 * @property id - serial primary key
 * @property employer_id - integer referencing the employersTable id
 * @property industry_id - integer referencing the industriesTable id
 * @property timestamp - timestamp
 */
export const employerIndustriesTable = pgTable("employer_industries", {
  id: serial("id").primaryKey(),
  employerId: integer("employer_id").references(() => employersTable.id),
  industryId: integer("industry_id").references(() => industriesTable.id),
  createdAt: timestamp("timestamp").default(sql`now()`),
});

/**
 * Define the JobCategories table schema that stores the job categories
 *
 * @property id - serial primary key
 * @property label - text
 * @property createdAt - timestamp
 */
export const jobCategoriesTable = pgTable("job_categories", {
  id: serial("id").primaryKey(),
  label: text("label"),
  createdAt: timestamp("timestamp").default(sql`now()`),
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
 */

export const jobsTable = pgTable("jobs", {
  id: serial("id").primaryKey(),
  employerId: integer("employer_id").references(() => employersTable.id),
  title: text("title"),
  description: text("description"),
  jobCategoryId: integer("job_category_id").references(
    () => jobCategoriesTable.id
  ),
  workingHoursPerWeek: integer("working_hours_per_week"),
  locationPreference: text("location_preference"),
  //locationPreferenceTypeEnum("location_preference_type"),
  // Updated requiredSkills to be an array of JSON objects
  // TODO: remove required skills since we are using job_skills table
  requiredSkills: json("required_skills")
    .notNull()
    .default(sql`'[]'::jsonb`),

  projectType: projectTypeEnum("project_type"),
  budget: integer("budget"),
  experienceLevel: text("experience_level"),
  //experienceLevelEnum("experience_level"),
  status: text("status"), //jobStatusEnum("status"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const skillsTable = pgTable("skills", {
  id: serial("id").primaryKey(),
  name: text("name"),
  metaData: jsonb("meta_data").default(sql`'{}'::jsonb`),
});

export const jobSkillsTable = pgTable("job_skills", {
  id: serial("id").primaryKey(),
  jobId: integer("job_id").references(() => jobsTable.id),
  skillId: integer("skill_id").references(() => skillsTable.id),
  isStarred: boolean("is_starred").default(false),
});
