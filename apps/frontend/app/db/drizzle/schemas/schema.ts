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
 * @property {varchar(80)} firstName - User's first name
 * @property {varchar(80)} lastName - User's last name
 * @property {varchar(150)} email - Unique email address (not null)
 * @property {varchar} passHash - Password hash (not null)
 * @property {boolean} isVerified - Verification status of the user account
 */
export const UsersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  firstName: varchar("firstName", { length: 80 }),
  lastName: varchar("lastName", { length: 80 }),
  email: varchar("email", { length: 150 }).unique().notNull(),
  passHash: varchar("passHash").notNull(),
  isVerified: boolean("isVerified").default(false),
  isOnboarded: boolean("isOnboarded").default(false),
});

/**
 * Define the accountsTable schema using PG Core types.
 *
 * @property id - serial primary key
 * @property userId - integer referencing the UsersTable id
 * @property accountType - accountTypeEnum
 * @property freelancerId - integer referencing the freelancersTable id
 * @property employerId - integer referencing the employersTable id
 * @property location - varchar with length 150
 * @property country - countryEnum
 * @property region - varchar with length 100
 * @property accountStatus - accountStatusEnum
 * @property phone - varchar with length 20
 */
export const accountsTable = pgTable("accounts", {
  id: serial("id").primaryKey(),
  userId: integer("userId").references(() => UsersTable.id),
  accountType: accountTypeEnum("accountType"),
  freelancerId: integer("freelancerId").references(() => freelancersTable.id),
  employerId: integer("employerId").references(() => employersTable.id),
  location: varchar("location", { length: 150 }),
  country: countryEnum("country"),
  region: varchar("region", { length: 100 }),
  accountStatus: accountStatusEnum("accountStatus"),
  phone: varchar("phone", { length: 20 }),
});

/**
 * Define the preferredWorkingTimesTable schema using PG Core types.
 *
 * @property id - serial primary key
 * @property accountId - integer referencing the accountsTable id
 * @property dayOfWeek - dayOfWeekEnum
 * @property startTime - time
 * @property endTime - time
 */
export const preferredWorkingTimesTable = pgTable("preferred_working_times", {
  id: serial("id").primaryKey(),
  accountId: integer("accountId").references(() => accountsTable.id),
  dayOfWeek: dayOfWeekEnum("day"),
  startTime: time("startTime"),
  endTime: time("endTime"),
});

/**
 * Define the freelancersTable schema using PG Core types.
 *
 * @property id - serial primary key
 * @property accountId - integer referencing the accountsTable id
 * @property fieldsOfExpertise - text array with default ''
 * @property portfolio - text array with default ''
 * @property portfolioDescription - text
 * @property cvLink - text
 * @property videoLink - text
 * @property certificatesLinks - text array with default ''
 * @property yearsOfExperience - varchar with length 80
 * @property languagesSpoken - languageEnum array with default ''
 * @property preferredProjectTypes - projectTypeEnum array with default ''
 * @property compensationType - compensationTypeEnum
 */
export const freelancersTable = pgTable("freelancers", {
  id: serial("id").primaryKey(),
  accountId: integer("accountId").references(() => accountsTable.id),
  fieldsOfExpertise: text("fieldsOfExpertise")
    .array()
    .default(sql`'{}'::text[]`),
  portfolio: text("portfolio")
    .array()
    .default(sql`'{}'::text[]`),
  portfolioDescription: text("portfolioDescription"),
  cvLink: text("cvLink"),
  videoLink: text("videoLink"),
  certificatesLinks: text("certificatesLinks")
    .array()
    .default(sql`'{}'::text[]`),
  yearsOfExperience: varchar("yearsOfExperience", { length: 80 }),
  languagesSpoken: languageEnum("language")
    .array()
    .default(sql`ARRAY[]::language[]`),
  preferredProjectTypes: projectTypeEnum("preferredProjectTypes")
    .array()
    .default(sql`ARRAY[]::project_type[]`),
  compensationType: compensationTypeEnum("compensationType"),
});

/**
 * Define the employersTable schema using PG Core types.
 *
 * @property id - serial primary key
 * @property accountId - integer referencing the accountsTable id
 * @property companyName - varchar with length 100
 * @property employerName - varchar with length 100
 * @property companyEmail - varchar with length 150
 * @property industrySector - text
 * @property companyRepName - varchar with length 100
 * @property companyRepEmail - varchar with length 150
 * @property companyRepPosition - varchar with length 60
 * @property companyRepPhone - varchar with length 20
 * @property taxIdNumber - varchar
 * @property taxIdDocumentLink - text
 * @property businessLicenseLink - text
 * @property certificationOfIncorporationLink - text
 * @property WebsiteURL - text
 * @property socialMediaLinks - text array with default ''
 */
export const employersTable = pgTable("employers", {
  id: serial("id").primaryKey(),
  accountId: integer("accountId").references(() => accountsTable.id),
  employerAccountType: employerAccountTypeEnum("employerAccountType"),
  companyName: varchar("companyName", { length: 100 }),
  employerName: varchar("employerName", { length: 100 }),
  companyEmail: varchar("companyEmail", { length: 150 }),
  industrySector: text("industrySector"),
  companyRepName: varchar("companyRepName", { length: 100 }),
  companyRepEmail: varchar("companyRepEmail", { length: 150 }),
  companyRepPosition: varchar("companyRepPosition", { length: 60 }),
  companyRepPhone: varchar("companyRepPhone", { length: 20 }),
  taxIdNumber: varchar("taxIdNumber"),
  taxIdDocumentLink: text("taxIdDocumentLink"),
  businessLicenseLink: text("businessLicenseLink"),
  certificationOfIncorporationLink: text("certificationOfIncorporationLink"),
  WebsiteURL: text("WebsiteURL"),
  socialMediaLinks: text("socialMediaLinks")
    .array()
    .default(sql`'{}'::text[]`),
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
 * @property accountId - integer referencing the accountsTable id
 * @property languageId - integer referencing the languagesTable id
 */
export const accountLanguagesTable = pgTable("account_languages", {
  id: serial("id").primaryKey(),
  accountId: integer("accountId").references(() => accountsTable.id),
  languageId: integer("languageId").references(() => languagesTable.id),
});

/**
 * Define the userVerificationTable schema using PG Core types.
 * used to store account verification tokens sent to users after registration
 *
 * @property id - serial primary key
 * @property userId - integer referencing the UsersTable id
 * @property token - varchar with length 256
 * @property expiry - timestamp
 * @property isUsed - boolean
 * @property createdAt - timestamp
 */

export const userVerificationTable = pgTable("user_verification", {
  id: serial("id").primaryKey(),
  userId: integer("userId").references(() => UsersTable.id),
  token: varchar("token", { length: 256 }),
  expiry: timestamp("expiry"),
  isUsed: boolean("isUsed").default(false),
  createdAt: timestamp("createdAt").default(sql`now()`),
});
