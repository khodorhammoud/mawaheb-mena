
-- use this in https://dbdiagram.io to generate a diagram

Table "users" {
  "id" SERIAL [pk, increment]
  "firstName" VARCHAR(80)
  "lastName" VARCHAR(80) [unique, not null]
  "email" VARCHAR(150) [unique, not null]
  "passHash" VARCHAR [not null]
  "isVerified" BOOLEAN [default: FALSE]
}

Table "accounts" {
  "id" SERIAL [pk, increment]
  "userId" INTEGER
  "accountType" accountTypeEnum
  "freelancerId" INTEGER
  "employerId" INTEGER
  "location" VARCHAR(150)
  "country" countryEnum
  "region" VARCHAR(100)
  "accountStatus" accountStatusEnum
  "phone" VARCHAR(20)
}

Table "preferred_working_times" {
  "id" SERIAL [pk, increment]
  "accountId" INTEGER
  "dayOfWeek" dayOfWeekEnum
  "startTime" TIME
  "endTime" TIME
}

Table "freelancers" {
  "id" SERIAL [pk, increment]
  "accountId" INTEGER
  "fieldsOfExpertise" "TEXT[]" [default: '{}']
  "portfolio" "TEXT[]" [default: '{}']
  "portfolioDescription" TEXT
  "cvLink" TEXT
  "videoLink" TEXT
  "certificatesLinks" "TEXT[]" [default: '{}']
  "yearsOfExperience" VARCHAR(80)
  "languagesSpoken" "languageEnum[]" [default: `ARRAY[]::languageEnum[]`]
  "preferredProjectTypes" "projectTypeEnum[]" [default: `ARRAY[]::projectTypeEnum[]`]
  "compensationType" compensationTypeEnum
}

Table "employers" {
  "id" SERIAL [pk, increment]
  "accountId" INTEGER
  "companyName" VARCHAR(100)
  "employerName" VARCHAR(100)
  "companyEmail" VARCHAR(150)
  "industrySector" TEXT
  "companyRepName" VARCHAR(100)
  "companyRepEmail" VARCHAR(150)
  "companyRepPosition" VARCHAR(60)
  "companyRepPhone" VARCHAR(20)
  "taxIdNumber" VARCHAR
  "taxIdDocumentLink" TEXT
  "businessLicenseLink" TEXT
  "certificationOfIncorporationLink" TEXT
  "WebsiteURL" TEXT
  "socialMediaLinks" "TEXT[]" [default: '{}']
}

Table "languages" {
  "id" SERIAL [pk, increment]
  "name" languageEnum
}

Table "account_languages" {
  "id" SERIAL [pk, increment]
  "accountId" INTEGER
  "languageId" INTEGER
}

Ref:"users"."id" < "accounts"."userId"

Ref:"freelancers"."id" < "accounts"."freelancerId"

Ref:"employers"."id" < "accounts"."employerId"

Ref:"accounts"."id" < "preferred_working_times"."accountId"

Ref:"accounts"."id" < "freelancers"."accountId"

Ref:"accounts"."id" < "employers"."accountId"

Ref:"accounts"."id" < "account_languages"."accountId"

Ref:"languages"."id" < "account_languages"."languageId"
