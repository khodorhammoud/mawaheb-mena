import { pgEnum } from "drizzle-orm/pg-core";
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
} from "~/types/enums";

export const accountStatusEnum = pgEnum(
  "account_status",
  Object.values(AccountStatus) as [string, ...string[]]
);
export const employerAccountTypeEnum = pgEnum(
  "eployer_account_type",
  Object.values(EmployerAccountType) as [string, ...string[]]
);
export const accountTypeEnum = pgEnum(
  "account_type",
  Object.values(AccountType) as [string, ...string[]]
);
export const languageEnum = pgEnum(
  "language",
  Object.values(Language) as [string, ...string[]]
);
export const countryEnum = pgEnum(
  "country",
  Object.values(Country) as [string, ...string[]]
);
export const dayOfWeekEnum = pgEnum(
  "day_of_week",
  Object.values(DayOfWeek) as [string, ...string[]]
);
export const projectTypeEnum = pgEnum(
  "project_type",
  Object.values(ProjectType) as [string, ...string[]]
);
export const compensationTypeEnum = pgEnum(
  "compensation_type",
  Object.values(CompensationType) as [string, ...string[]]
);

export const locationPreferenceTypeEnum = pgEnum(
  "location_preference_type",
  Object.values(LocationPreferenceType) as [string, ...string[]]
);

export const experienceLevelEnum = pgEnum(
  "experience_level",
  Object.values(ExperienceLevel) as [string, ...string[]]
);
