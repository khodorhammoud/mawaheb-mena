import { integer } from 'drizzle-orm/pg-core';
import { db } from '../drizzle/connector';
import {
  UsersTable,
  accountsTable,
  preferredWorkingTimesTable,
  freelancersTable,
  employersTable,
  languagesTable,
  accountLanguagesTable,
} from '../drizzle/schemas/schema'; // adjust the import path accordingly
import { faker } from '@faker-js/faker';

import * as dotenv from 'dotenv';
dotenv.config({
  path: '.env',
});

// dotenv.config();

console.log('process.env', process.env);

async function seed() {
  // Seed Users
  for (let i = 0; i < 10; i++) {
    await db.insert(UsersTable).values({
      // @ts-ignore
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
      accountType: faker.helpers.arrayElement(['freelancer', 'employer']),
      freelancerId: i % 2 === 0 ? i + 1 : null,
      employerId: i % 2 !== 0 ? i + 1 : null,
      location: faker.location.streetAddress(),
      country: faker.helpers.arrayElement([
        'Albania',
        'Algeria',
        'Bahrain',
        'Egypt',
        'Iran',
        'Iraq',
        'Israel',
        'Jordan',
        'Kuwait',
        'Lebanon',
      ]),
      region: faker.location.state(),
      accountStatus: faker.helpers.arrayElement([
        'draft',
        'pending',
        'published',
        'closed',
        'suspended',
      ]),
      phone: faker.phone.number(),
    });
  }

  // Seed Preferred Working Times
  for (let i = 0; i < 10; i++) {
    await db.insert(preferredWorkingTimesTable).values({
      //@ts-ignore
      accountId: i + 1,
      dayOfWeek: faker.helpers.arrayElement([
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday',
      ]),
      startTime: faker.date.recent(),
      endTime: faker.date.future(),
    });
  }

  // Seed Freelancers
  for (let i = 0; i < 10; i++) {
    await db.insert(freelancersTable).values({
      accountId: i + 1,
      fieldsOfExpertise: faker.helpers.arrayElements([
        'Web Development',
        'Graphic Design',
        'Content Writing',
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
        '1-2 years',
        '3-5 years',
        '5-10 years',
      ]),
      languagesSpoken: faker.helpers.arrayElements(['English', 'Spanish']),
      preferredProjectTypes: faker.helpers.arrayElements([
        'short-term',
        'long-term',
        'per-project-basis',
      ]),
      compensationType: faker.helpers.arrayElement([
        'project-based-rate',
        'hourly-rate',
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
      companyRepPhone: faker.phone.number(),
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
    'Spanish',
    'English',
    'Italian',
    'Arabic',
    'French',
    'Turkish',
    'German',
    'Portuguese',
    'Russian',
  ]) {
    await db.insert(languagesTable).values({
      // @ts-ignore
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
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
