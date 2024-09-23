// import { integer } from 'drizzle-orm/pg-core';
import { db } from "../drizzle/connector";
import {
  UsersTable,
  accountsTable,
  preferredWorkingTimesTable,
  freelancersTable,
  employersTable,
  languagesTable,
  accountLanguagesTable,
  industriesTable,
} from "../drizzle/schemas/schema"; // adjust the import path accordingly
import { faker } from "@faker-js/faker";

import * as dotenv from "dotenv";
dotenv.config({
  path: ".env",
});

// dotenv.config();

async function seed() {
  // Seed Users
  for (let i = 0; i < 10; i++) {
    await db.insert(UsersTable).values({
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: faker.internet.email(),
      passHash: faker.internet.password(),
      isVerified: faker.datatype.boolean(),
    });
  }

  // Seed Accounts
  for (let i = 0; i < 10; i++) {
    await db.insert(accountsTable).values({
      userId: i + 1,
      accountType: faker.helpers.arrayElement(["freelancer", "employer"]),
      freelancerId: i % 2 === 0 ? i + 1 : null,
      employerId: i % 2 !== 0 ? i + 1 : null,
      location: faker.location.streetAddress(),
      country: faker.helpers.arrayElement([
        "Albania",
        "Algeria",
        "Bahrain",
        "Egypt",
        "Iran",
        "Iraq",
        "Jordan",
        "Kuwait",
        "Lebanon",
      ]),
      region: faker.location.state(),
      accountStatus: faker.helpers.arrayElement([
        "draft",
        "pending",
        "published",
        "closed",
        "suspended",
      ]),
      phone: faker.phone.number().substring(0, 20),
    });
  }

  // Seed Preferred Working Times
  for (let i = 0; i < 10; i++) {
    await db.insert(preferredWorkingTimesTable).values({
      accountId: i + 1,
      dayOfWeek: faker.helpers.arrayElement([
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ]),
      startTime: faker.date.recent().toISOString().substring(11, 19),
      endTime: faker.date.future().toISOString().substring(11, 19),
    });
  }

  // Seed Freelancers
  for (let i = 0; i < 10; i++) {
    await db.insert(freelancersTable).values({
      accountId: i + 1,
      fieldsOfExpertise: faker.helpers.arrayElements([
        "Web Development",
        "Graphic Design",
        "Content Writing",
      ]),
      portfolio: faker.helpers.arrayElements([
        faker.internet.url(),
        faker.internet.url(),
      ]),
      portfolioDescription: faker.lorem.paragraph(),
      cvLink: faker.internet.url(),
      videoLink: faker.internet.url(),
      certificatesLinks: faker.helpers.arrayElements([
        faker.internet.url(),
        faker.internet.url(),
      ]),
      yearsOfExperience: faker.helpers.arrayElement([
        "1-2 years",
        "3-5 years",
        "5-10 years",
      ]),
      languagesSpoken: faker.helpers.arrayElements(["English", "Spanish"]),
      preferredProjectTypes: faker.helpers.arrayElements([
        "short-term",
        "long-term",
        "per-project-basis",
      ]),
      compensationType: faker.helpers.arrayElement([
        "project-based-rate",
        "hourly-rate",
      ]),
    });
  }

  // Seed Employers
  for (let i = 0; i < 10; i++) {
    await db.insert(employersTable).values({
      accountId: i + 1,
      companyName: faker.company.name(),
      employerName: faker.person.fullName(),
      companyEmail: faker.internet.email(),
      industrySector: faker.commerce.department(),
      companyRepName: faker.person.fullName(),
      companyRepEmail: faker.internet.email(),
      companyRepPosition: faker.person.jobTitle(),
      companyRepPhone: faker.phone.number().substring(0, 20),
      taxIdNumber: faker.string.uuid(),
      taxIdDocumentLink: faker.internet.url(),
      businessLicenseLink: faker.internet.url(),
      certificationOfIncorporationLink: faker.internet.url(),
      WebsiteURL: faker.internet.url(),
      socialMediaLinks: faker.helpers.arrayElements([
        faker.internet.url(),
        faker.internet.url(),
      ]),
    });
  }

  // Seed Languages
  for (const language of [
    "Spanish",
    "English",
    "Italian",
    "Arabic",
    "French",
    "Turkish",
    "German",
    "Portuguese",
    "Russian",
  ]) {
    await db.insert(languagesTable).values({
      name: language,
    });
  }

  // Seed Account Languages
  for (let i = 0; i < 10; i++) {
    await db.insert(accountLanguagesTable).values({
      accountId: i + 1,
      languageId: faker.datatype.number({ min: 1, max: 9 }),
    });
  }

  // seed industries
  const industries = [
    {
      label: "Accounting",
      metadata: [
        "accounting",
        "banking",
        "capital markets",
        "financial services",
        "insurance",
        "investment banking",
        "investment management",
      ],
    },
    {
      label: "Data Engineering",
      metadata: [
        "data engineering",
        "data science",
        "data analysis",
        "data visualization",
        "data warehousing",
        "data mining",
        "big data",
        "business intelligence",
        "data analytics",
        "data management",
        "data quality",
        "data governance",
        "data modeling",
        "data architecture",
        "data integration",
        "data migration",
        "data transformation",
      ],
    },
    {
      label: "Data Science",
      metadata: [
        "data science",
        "data analysis",
        "data visualization",
        "data warehousing",
        "data mining",
        "big data",
        "business intelligence",
        "data analytics",
        "data management",
        "data quality",
        "data governance",
        "data modeling",
        "data architecture",
        "data integration",
        "data migration",
        "data transformation",
      ],
    },
    {
      label: "Design",
      metadata: [
        "design",
        "graphic design",
        "web design",
        "ui/ux design",
        "product design",
        "industrial design",
        "interior design",
        "fashion design",
        "design thinking",
        "design research",
        "design management",
        "design strategy",
        "design systems",
        "design ops",
        "design leadership",
        "design education",
        "design ethics",
        "design psychology",
        "design philosophy",
        "design history",
        "design theory",
        "design criticism",
        "design culture",
        "design technology",
        "design tools",
        "design software",
        "design hardware",
        "design process",
      ],
    },
    {
      label: "Data Security",
      metadata: [
        "data security",
        "cybersecurity",
        "information security",
        "network security",
        "cloud security",
        "application security",
        "endpoint security",
        "data protection",
        "data privacy",
        "data encryption",
        "data loss prevention",
        "data recovery",
        "data backup",
        "data breach",
        "data leak",
        "data theft",
      ],
    },
    {
      label: "Digital Marketing",
      metadata: [
        "digital marketing",
        "social media marketing",
        "content marketing",
        "email marketing",
        "influencer marketing",
        "affiliate marketing",
        "search engine marketing",
        "search engine optimization",
        "pay-per-click",
        "display advertising",
        "retargeting",
        "remarketing",
        "lead generation",
        "conversion rate optimization",
        "customer acquisition",
        "customer retention",
        "customer loyalty",
        "customer engagement",
        "customer experience",
        "customer journey",
        "customer relationship management",
        "customer satisfaction",
      ],
    },
  ];

  for (const industry of industries) {
    await db.insert(industriesTable).values({
      label: industry.label,
      metadata: industry.metadata,
    });
  }
}

seed()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
