/** Import PG Core types from drizzle-orm/pg-core. */
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
export const UsersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  firstName: varchar("first_name", { length: 80 }),
  lastName: varchar("last_name", { length: 80 }),
  email: varchar("email", { length: 150 }).unique().notNull(),
  passHash: varchar("password_hash").notNull(),
  isVerified: boolean("is_verified").default(false),
  isOnboarded: boolean("is_onboarded").default(false),
});

/**
 * Define the accountsTable schema using PG Core types.
 *
 * @property id - serial primary key
 * @property user_id - integer referencing the UsersTable id
 * @property account_type - accountTypeEnum (freelancer or employer)
 * @property location - varchar with length 150
 * @property country - countryEnum
 * @property region - varchar with length 100
 * @property account_status - accountStatusEnum
 * @property phone - varchar with length 30
 */
export const accountsTable = pgTable("accounts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => UsersTable.id),
  accountType: accountTypeEnum("account_type"),
  // freelancerId: integer("freelancerId").references(() => freelancersTable.id),
  // employerId: integer("employerId").references(() => employersTable.id),
  location: varchar("location", { length: 150 }),
  country: countryEnum("country"),
  region: varchar("region", { length: 100 }),
  accountStatus: accountStatusEnum("account_status"),
  phone: varchar("phone", { length: 30 }),
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
 * @property fields_of_expertise - text array with default ''
 * @property portfolio - text array with default ''
 * @property portfolio_description - text
 * @property cv_link - text
 * @property video_link - text
 * @property certificates_links - text array with default ''
 * @property years_of_experience - varchar with length 80
 * @property languagesSpoken - languageEnum array with default ''
 * @property preferred_project_types - projectTypeEnum array with default ''
 * @property compensation_type - compensationTypeEnum
 */
export const freelancersTable = pgTable("freelancers", {
  id: serial("id").primaryKey(),
  accountId: integer("account_id").references(() => accountsTable.id),
  fieldsOfExpertise: text("fields_of_expertise")
    .array()
    .default(sql`'{}'::text[]`),
  portfolio: text("portfolio")
    .array()
    .default(sql`'{}'::text[]`),
  portfolioDescription: text("portfolio_description"),
  cvLink: text("cv_link"),
  videoLink: text("video_link"),
  certificatesLinks: text("certificates_links")
    .array()
    .default(sql`'{}'::text[]`),
  yearsOfExperience: varchar("years_of_experience", { length: 80 }),
  languagesSpoken: languageEnum("language")
    .array()
    .default(sql`ARRAY[]::language[]`),
  preferredProjectTypes: projectTypeEnum("preferred_project_types")
    .array()
    .default(sql`ARRAY[]::project_type[]`),
  compensationType: compensationTypeEnum("compensation_type"),
});

/**
 * Define the employersTable schema using PG Core types.
 *
 * @property id - serial primary key
 * @property account_id - integer referencing the accountsTable id
 * @property company_name - varchar with length 100
 * @property employer_name - varchar with length 100
 * @property company_email - varchar with length 150
 * @property industry_sector - text
 * @property company_rep_name - varchar with length 100
 * @property company_rep_email - varchar with length 150
 * @property company_rep_position - varchar with length 60
 * @property company_rep_phone - varchar with length 30
 * @property tax_id_number - varchar
 * @property tax_id_document_link - text
 * @property business_license_link - text
 * @property certification_of_incorporation_link - text
 * @property website_url - text
 * @property social_media_links - text array with default ''
 */
export const employersTable = pgTable("employers", {
  id: serial("id").primaryKey(),
  accountId: integer("account_id").references(() => accountsTable.id),
  employerAccountType: employerAccountTypeEnum("employerAccountType"),
  companyName: varchar("company_name", { length: 100 }),
  employerName: varchar("employer_name", { length: 100 }),
  companyEmail: varchar("company_email", { length: 150 }),
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
  websiteURL: text("website_url"),
  socialMediaLinks: jsonb("social_media_links").default(sql`'{}'::jsonb`),
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
 * Define the relation between employers and industries where each employer can have zero to many insudries
 *
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
