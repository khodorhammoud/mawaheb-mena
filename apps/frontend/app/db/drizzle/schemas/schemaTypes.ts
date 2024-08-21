import { pgEnum } from "drizzle-orm/pg-core";

export const accountStatusEnum = pgEnum("account_status", [
  "draft",
  "pending",
  "published",
  "closed",
  "suspended",
]);

export const accountTypeEnum = pgEnum("account_type", [
  "freelancer",
  "employer",
]);

export const languageEnum = pgEnum("language", [
  "Spanish",
  "English",
  "Italian",
  "Arabic",
  "French",
  "Turkish",
  "German",
  "Portuguese",
  "Russian",
]);

export const employerAccountTypeEnum = pgEnum("employer_account_type", [
  "personal",
  "company",
]);

export const countryEnum = pgEnum("country", [
  "Albania",
  "Algeria",
  "Bahrain",
  "Egypt",
  "Iran",
  "Iraq",
  "Israel",
  "Jordan",
  "Kuwait",
  "Lebanon",
  "Libya",
  "Morocco",
  "Oman",
  "Palestine",
  "Qatar",
  "Saudi_Arabia",
  "Syria",
  "Tunisia",
  "Turkey",
  "United_Arab_Emirates",
  "Yemen",
]);

export const dayOfWeekEnum = pgEnum("day_of_week", [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
]);

export const projectTypeEnum = pgEnum("project_type", [
  "short-term",
  "long-term",
  "per-project-basis",
]);

export const compensationTypeEnum = pgEnum("compensation_type", [
  "project-based-rate",
  "hourly-rate",
]);
