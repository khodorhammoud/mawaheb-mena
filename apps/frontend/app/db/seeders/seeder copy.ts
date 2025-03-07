// import { integer } from 'drizzle-orm/pg-core';
import { db } from "../drizzle/connector";
// import { asc, eq } from "drizzle-orm";
import {
  UsersTable,
  accountsTable,
  // preferredWorkingTimesTable,
  freelancersTable,
  employersTable,
  languagesTable,
  freelancerLanguagesTable,
  industriesTable,
  skillsTable,
  jobsTable,
  jobSkillsTable,
  freelancerSkillsTable,
  jobCategoriesTable,
  jobApplicationsTable,
  userVerificationsTable,
} from "../drizzle/schemas/schema"; // adjust the import path accordingly
import { faker } from "@faker-js/faker";

import * as dotenv from "dotenv";
import {
  AccountStatus,
  AccountType,
  Provider,
  CompensationType,
  ProjectType,
  JobStatus,
  ExperienceLevel,
  LocationPreferenceType,
  JobsOpenTo,
} from "~/types/enums";
dotenv.config({
  path: ".env",
});
import { hash } from "bcrypt-ts";
import { sql } from "drizzle-orm";

// dotenv.config();

async function seed() {
  await db.transaction(async (tx) => {
    try {
      // Clear existing data to avoid conflicts
      // Note: Order matters due to foreign key constraints
      await tx.delete(freelancerSkillsTable);
      await tx.delete(jobSkillsTable);
      await tx.delete(freelancerLanguagesTable);
      await tx.delete(jobApplicationsTable);
      await tx.delete(jobsTable);
      await tx.delete(freelancersTable);
      await tx.delete(employersTable);
      await tx.delete(accountsTable);
      await tx.delete(userVerificationsTable);
      await tx.delete(UsersTable);
      await tx.delete(skillsTable);
      await tx.delete(languagesTable);
      await tx.delete(freelancerLanguagesTable);
      await tx.delete(industriesTable);
      await tx.delete(jobCategoriesTable);

      console.log("Existing data cleared. Resetting sequences...");

      // Reset sequences for all tables
      await tx.execute(sql`
        ALTER SEQUENCE users_id_seq RESTART WITH 1;
        ALTER SEQUENCE accounts_id_seq RESTART WITH 1;
        ALTER SEQUENCE freelancers_id_seq RESTART WITH 1;
        ALTER SEQUENCE employers_id_seq RESTART WITH 1;
        ALTER SEQUENCE languages_id_seq RESTART WITH 1;
        ALTER SEQUENCE freelancer_languages_id_seq RESTART WITH 1;
        ALTER SEQUENCE industries_id_seq RESTART WITH 1;
        ALTER SEQUENCE skills_id_seq RESTART WITH 1;
        ALTER SEQUENCE jobs_id_seq RESTART WITH 1;
        ALTER SEQUENCE job_skills_id_seq RESTART WITH 1;
        ALTER SEQUENCE freelancer_skills_id_seq RESTART WITH 1;
        ALTER SEQUENCE job_categories_id_seq RESTART WITH 1;
        ALTER SEQUENCE job_applications_id_seq RESTART WITH 1;
        ALTER SEQUENCE user_verifications_id_seq RESTART WITH 1;
      `);

      console.log("Sequences reset. Starting fresh seed...");

      // Seed Languages
      console.log("Seeding languages...");
      const languages = [
        "Spanish",
        "English",
        "Italian",
        "Arabic",
        "French",
        "Turkish",
        "German",
        "Portuguese",
        "Russian",
      ];

      for (const language of languages) {
        await tx.insert(languagesTable).values({
          language: language,
        });
      }

      // Seed Industries
      console.log("Seeding industries...");
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
        await tx.insert(industriesTable).values({
          label: industry.label,
          metadata: industry.metadata,
        });
      }

      // Seed Skills
      console.log("Seeding skills...");
      const skills = [
        {
          label: "Web Development",
          metaData: [
            "web development",
            "web design",
            "web programming",
            "web development",
          ],
          isHot: true,
        },
        {
          label: "Graphic Design",
          metaData: [
            "graphic design",
            "art",
            "design",
            "illustration",
            "photography",
            "digital art",
            "animation",
            "video editing",
            "graphic design",
            "photoshop",
            "illustrator",
            "adobe",
            "canva",
            "figma",
            "photoshop",
          ],
        },
        {
          label: "Content Writing",
          metaData: [
            "content writing",
            "copywriting",
            "blog writing",
            "article writing",
          ],
        },
        {
          label: "Digital Marketing",
          metaData: [
            "digital marketing",
            "social media marketing",
            "content marketing",
            "email marketing",
          ],
          isHot: true,
        },
        {
          label: "Project Management",
          metaData: [
            "project management",
            "project planning",
            "project execution",
            "project monitoring",
            "project evaluation",
            "project control",
            "project risk management",
            "project communication",
            "project documentation",
          ],
        },
        {
          label: "Data Analysis",
          metaData: [
            "data analysis",
            "python",
            "sql",
            "data visualization",
            "data modeling",
            "data warehousing",
            "data mining",
            "data analytics",
            "data management",
            "data quality",
          ],
        },
        {
          label: "Data Engineering",
          metaData: [
            "data engineering",
            "data science",
            "data analysis",
            "data visualization",
            "data warehousing",
          ],
          isHot: true,
        },
        {
          label: "JavaScript",
          metaData: [
            "javascript",
            "js",
            "frontend",
            "react",
            "vue",
            "angular",
            "node",
          ],
          isHot: true,
        },
        {
          label: "Python",
          metaData: [
            "python",
            "django",
            "flask",
            "fastapi",
            "data science",
            "machine learning",
          ],
          isHot: true,
        },
        {
          label: "UI/UX Design",
          metaData: [
            "ui",
            "ux",
            "user interface",
            "user experience",
            "figma",
            "sketch",
            "adobe xd",
          ],
          isHot: true,
        },
      ];

      for (const skill of skills) {
        await tx.insert(skillsTable).values({
          label: skill.label,
          metaData: JSON.stringify(skill.metaData),
          isHot: skill.isHot || false,
        });
      }

      // Seed Job Categories
      console.log("Seeding job categories...");
      const jobCategories = [
        "Web Development",
        "Mobile Development",
        "Design",
        "Writing",
        "Marketing",
        "Data Science",
        "Project Management",
        "Customer Support",
        "Sales",
        "Administrative",
      ];

      for (const category of jobCategories) {
        await tx.insert(jobCategoriesTable).values({
          label: category,
        });
      }

      // Create admin account
      console.log("Creating admin account...");
      const adminPassword = "123";
      const hashedPassword = await hash(adminPassword, 10);

      await tx.insert(UsersTable).values({
        firstName: "Admin",
        lastName: "User",
        email: "admin@mawaheb.com",
        passHash: hashedPassword,
        isVerified: true,
        isOnboarded: true,
        role: "admin",
        provider: Provider.Credentials,
      });

      // Create freelancer accounts
      console.log("Creating freelancer accounts...");
      const freelancerEmails = [
        "freelancer1@example.com",
        "freelancer2@example.com",
        "freelancer3@example.com",
        "freelancer4@example.com",
      ];

      const freelancerUserIds = [];
      const freelancerIds = [];

      for (let i = 0; i < freelancerEmails.length; i++) {
        // Create user
        const userResult = await tx
          .insert(UsersTable)
          .values({
            firstName: `Freelancer${i + 1}`,
            lastName: `User${i + 1}`,
            email: freelancerEmails[i],
            passHash: await hash("123", 10),
            isVerified: true,
            isOnboarded: true,
            role: "user",
            provider: Provider.Credentials,
          })
          .returning({ id: UsersTable.id });

        const userId = userResult[0].id;
        freelancerUserIds.push(userId);

        // Create account
        const accountResult = await tx
          .insert(accountsTable)
          .values({
            userId: userId,
            accountType: AccountType.Freelancer,
            accountStatus: AccountStatus.Published,
            country: faker.helpers.arrayElement([
              "Egypt",
              "Jordan",
              "Lebanon",
              "United Arab Emirates",
              "Saudi Arabia",
            ]),
            region: faker.location.state(),
            address: faker.location.streetAddress(),
            phone: faker.phone.number().substring(0, 20),
            websiteURL: faker.internet.url(),
            socialMediaLinks: JSON.stringify({
              linkedin: faker.internet.url(),
              github: faker.internet.url(),
              twitter: faker.internet.url(),
            }),
          })
          .returning({ id: accountsTable.id });

        const accountId = accountResult[0].id;

        // Create freelancer profile
        const portfolio = [];
        for (let j = 0; j < 3; j++) {
          portfolio.push({
            projectName: `Project ${j + 1}`,
            projectLink: faker.internet.url(),
            projectDescription: faker.lorem.paragraph(),
            projectImageName: `project-image-${j + 1}.jpg`,
            projectImageUrl: faker.image.url(),
            attachmentName: `attachment-${j + 1}.pdf`,
            attachmentId: j + 1,
          });
        }

        const workHistory = [];
        for (let j = 0; j < 3; j++) {
          const startDate = faker.date.past({ years: 5 });
          const endDate =
            j === 0
              ? null
              : faker.date.between({ from: startDate, to: new Date() });

          workHistory.push({
            title: faker.person.jobTitle(),
            company: faker.company.name(),
            currentlyWorkingThere: j === 0,
            startDate: startDate.toISOString().split("T")[0],
            endDate: j === 0 ? null : endDate.toISOString().split("T")[0],
            jobDescription: faker.lorem.paragraph(),
          });
        }

        const certificates = [];
        for (let j = 0; j < 2; j++) {
          certificates.push({
            name: `Certificate ${j + 1}`,
            issuer: faker.company.name(),
            issueDate: faker.date
              .past({ years: 3 })
              .toISOString()
              .split("T")[0],
            expiryDate: faker.date
              .future({ years: 2 })
              .toISOString()
              .split("T")[0],
            credentialId: faker.string.alphanumeric(10),
            credentialURL: faker.internet.url(),
          });
        }

        const educations = [];
        for (let j = 0; j < 2; j++) {
          educations.push({
            institution: faker.company.name() + " University",
            degree: faker.helpers.arrayElement([
              "Bachelor's",
              "Master's",
              "PhD",
            ]),
            fieldOfStudy: faker.person.jobArea(),
            startDate: faker.date
              .past({ years: 10 })
              .toISOString()
              .split("T")[0],
            endDate: faker.date.past({ years: 5 }).toISOString().split("T")[0],
            description: faker.lorem.paragraph(),
          });
        }

        const freelancerResult = await tx
          .insert(freelancersTable)
          .values({
            accountId: accountId,
            about: faker.lorem.paragraphs(3),
            fieldsOfExpertise: faker.helpers.arrayElements(
              [
                "Web Development",
                "Graphic Design",
                "Content Writing",
                "Digital Marketing",
                "Data Analysis",
                "Project Management",
              ],
              { min: 2, max: 4 }
            ),
            portfolio: portfolio,
            workHistory: workHistory,
            cvLink: faker.internet.url(),
            videoLink: faker.internet.url(),
            certificates: certificates,
            educations: educations,
            yearsOfExperience: faker.number.int({ min: 1, max: 10 }),
            preferredProjectTypes: faker.helpers.arrayElements(
              [
                ProjectType.ShortTerm,
                ProjectType.LongTerm,
                ProjectType.PerProjectBasis,
              ],
              { min: 1, max: 3 }
            ),
            hourlyRate: faker.number.int({ min: 20, max: 100 }),
            compensationType: faker.helpers.arrayElement([
              CompensationType.HourlyRate,
              CompensationType.ProjectBasedRate,
            ]),
            availableForWork: true,
            dateAvailableFrom: faker.date
              .soon({ days: 10 })
              .toISOString()
              .split("T")[0],
            jobsOpenTo: faker.helpers.arrayElements(
              [
                JobsOpenTo.FullTimeRoles,
                JobsOpenTo.PartTimeRoles,
                JobsOpenTo.EmployeeRoles,
              ],
              { min: 1, max: 3 }
            ),
            hoursAvailableFrom: "09:00:00",
            hoursAvailableTo: "17:00:00",
          })
          .returning({ id: freelancersTable.id });

        const freelancerId = freelancerResult[0].id;
        freelancerIds.push(freelancerId);

        // Add languages for freelancer
        const languageCount = faker.number.int({ min: 1, max: 3 });
        const languageIds = faker.helpers.arrayElements(
          [1, 2, 3, 4, 5, 6, 7, 8, 9],
          { min: languageCount, max: languageCount }
        );

        for (const languageId of languageIds) {
          await tx.insert(freelancerLanguagesTable).values({
            freelancerId: freelancerId,
            languageId: languageId,
          });
        }

        // Add skills for freelancer
        const skillCount = faker.number.int({ min: 3, max: 6 });
        const skillIds = faker.helpers.arrayElements(
          [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
          { min: skillCount, max: skillCount }
        );

        for (const skillId of skillIds) {
          await tx.insert(freelancerSkillsTable).values({
            freelancerId: freelancerId,
            skillId: skillId,
            yearsOfExperience: faker.number.int({ min: 1, max: 8 }),
          });
        }
      }

      // Create employer accounts
      console.log("Creating employer accounts...");
      const employerEmails = ["employer1@example.com", "employer2@example.com"];

      const employerIds = [];

      for (let i = 0; i < employerEmails.length; i++) {
        // Create user
        const userResult = await tx
          .insert(UsersTable)
          .values({
            firstName: `Employer${i + 1}`,
            lastName: `User${i + 1}`,
            email: employerEmails[i],
            passHash: await hash("123", 10),
            isVerified: true,
            isOnboarded: true,
            role: "user",
            provider: Provider.Credentials,
          })
          .returning({ id: UsersTable.id });

        const userId = userResult[0].id;

        // Create account
        const accountResult = await tx
          .insert(accountsTable)
          .values({
            userId: userId,
            accountType: AccountType.Employer,
            accountStatus: AccountStatus.Published,
            country: faker.helpers.arrayElement([
              "Egypt",
              "Jordan",
              "Lebanon",
              "United Arab Emirates",
              "Saudi Arabia",
            ]),
            region: faker.location.state(),
            address: faker.location.streetAddress(),
            phone: faker.phone.number().substring(0, 20),
            websiteURL: faker.internet.url(),
            socialMediaLinks: JSON.stringify({
              linkedin: faker.internet.url(),
              facebook: faker.internet.url(),
              twitter: faker.internet.url(),
            }),
          })
          .returning({ id: accountsTable.id });

        const accountId = accountResult[0].id;

        // Create employer profile
        const employerResult = await tx
          .insert(employersTable)
          .values({
            accountId: accountId,
            companyName: faker.company.name(),
            employerName: faker.person.fullName(),
            companyEmail: faker.internet.email(),
            industrySector: faker.helpers.arrayElement([
              "Technology",
              "Finance",
              "Healthcare",
              "Education",
              "Retail",
            ]),
            companyRepName: faker.person.fullName(),
            companyRepEmail: faker.internet.email(),
            companyRepPosition: faker.person.jobTitle(),
            companyRepPhone: faker.phone.number().substring(0, 20),
            taxIdNumber: faker.string.alphanumeric(10),
            taxIdDocumentLink: faker.internet.url(),
            businessLicenseLink: faker.internet.url(),
            certificationOfIncorporationLink: faker.internet.url(),
            WebsiteURL: faker.internet.url(),
            socialMediaLinks: JSON.stringify({
              linkedin: faker.internet.url(),
              facebook: faker.internet.url(),
              twitter: faker.internet.url(),
            }),
          })
          .returning({ id: employersTable.id });

        const employerId = employerResult[0].id;
        employerIds.push(employerId);

        const JOB_TITLES = [
          "Frontend Developer",
          "Backend Engineer",
          "Full Stack Developer",
          "UI/UX Designer",
          "Graphic Designer",
          "Content Writer",
          "Digital Marketing Specialist",
          "Data Analyst",
          "Data Scientist",
          "Project Manager",
          "Product Manager",
          "DevOps Engineer",
          "Mobile App Developer",
          "QA Engineer",
          "SEO Specialist",
          "Social Media Manager",
          "Copywriter",
          "Video Editor",
          "3D Modeler",
          "Game Developer",
        ];

        const JOB_DESCRIPTIONS = [
          "We're looking for a talented professional to join our team. You'll be responsible for developing and maintaining high-quality solutions that meet our clients' needs.",
          "Join our growing team to work on exciting projects. The ideal candidate has strong problem-solving skills and can work independently as well as collaboratively.",
          "This role requires expertise in multiple technologies and the ability to adapt quickly to new challenges. You'll be working directly with clients to understand their requirements.",
          "We need someone who can bring creative ideas and technical skills to our projects. This position offers competitive compensation and opportunities for growth.",
          "The successful candidate will contribute to all phases of the development lifecycle, from concept to deployment. Experience with agile methodologies is a plus.",
        ];

        console.log(`Creating 10 jobs for employer ${i + 1}...`);

        const jobStatuses = [
          JobStatus.Active,
          JobStatus.Active,
          JobStatus.Active,
          JobStatus.Active,
          JobStatus.Active,
          JobStatus.Active,
          JobStatus.Active,
          JobStatus.Draft,
          JobStatus.Paused,
          JobStatus.Closed,
        ];

        for (let j = 0; j < 10; j++) {
          // Create a diverse set of jobs with different characteristics
          const status = jobStatuses[j];
          const jobCategoryId = (j % 10) + 1; // Distribute across categories

          // Generate a unique job title
          const baseTitle = JOB_TITLES[j % JOB_TITLES.length];
          const jobTitle = `${baseTitle} - ${faker.company.buzzNoun()}`;

          // Generate a detailed job description
          const baseDescription = JOB_DESCRIPTIONS[j % JOB_DESCRIPTIONS.length];
          const detailedDescription = `
            ${baseDescription}
            
            Responsibilities:
            - ${faker.company.buzzPhrase()}
            - ${faker.company.buzzPhrase()}
            - ${faker.company.buzzPhrase()}
            - ${faker.company.buzzPhrase()}
            
            Requirements:
            - ${faker.number.int({ min: 1, max: 5 })}+ years of experience in ${baseTitle}
            - Strong knowledge of ${faker.helpers.arrayElement(["JavaScript", "Python", "React", "Node.js", "UI/UX", "Adobe Creative Suite"])}
            - Excellent communication and teamwork skills
            - ${faker.helpers.arrayElement(["Bachelor's degree", "Master's degree", "Relevant certification", "Portfolio of work"])} required
            
            Benefits:
            - Competitive salary
            - ${faker.helpers.arrayElement(["Remote work options", "Flexible hours", "Professional development", "Health insurance"])}
            - ${faker.helpers.arrayElement(["Paid time off", "Performance bonuses", "Team events", "Career advancement"])}
          `;

          // Vary project types, experience levels, and budgets
          const projectType =
            j % 3 === 0
              ? ProjectType.ShortTerm
              : j % 3 === 1
                ? ProjectType.LongTerm
                : ProjectType.PerProjectBasis;

          const experienceLevel =
            j % 4 === 0
              ? ExperienceLevel.Entry
              : j % 4 === 1
                ? ExperienceLevel.Mid
                : j % 4 === 2
                  ? ExperienceLevel.Expert
                  : ExperienceLevel.Mid;

          // Vary budgets based on experience level and project type
          let budget = 0;
          if (experienceLevel === ExperienceLevel.Entry) {
            budget = faker.number.int({ min: 500, max: 2000 });
          } else if (experienceLevel === ExperienceLevel.Mid) {
            budget = faker.number.int({ min: 2000, max: 5000 });
          } else {
            budget = faker.number.int({ min: 5000, max: 15000 });
          }

          // Adjust budget for project type
          if (projectType === ProjectType.ShortTerm) {
            budget = Math.round(budget * 0.7); // Lower for short term
          } else if (projectType === ProjectType.LongTerm) {
            budget = Math.round(budget * 1.3); // Higher for long term
          }

          // Vary location preferences
          const locationPreference =
            j % 5 === 0
              ? LocationPreferenceType.Remote
              : j % 5 === 1
                ? LocationPreferenceType.Onsite
                : j % 5 === 2
                  ? LocationPreferenceType.Mixed
                  : LocationPreferenceType.Onsite;

          // Create the job
          const jobResult = await tx
            .insert(jobsTable)
            .values({
              employerId: employerId,
              title: jobTitle,
              description: detailedDescription,
              jobCategoryId: jobCategoryId,
              workingHoursPerWeek: faker.number.int({ min: 10, max: 40 }),
              locationPreference: locationPreference,
              projectType: projectType,
              budget: budget,
              experienceLevel: experienceLevel,
              status: status,
              createdAt: faker.date.recent({ days: 30 }),
              fulfilledAt:
                status === JobStatus.Completed
                  ? faker.date.recent({ days: 10 })
                  : null,
            })
            .returning({ id: jobsTable.id });

          const jobId = jobResult[0].id;

          // Add skills to job - vary the number and types of skills
          // For tech jobs, add more tech skills; for creative jobs, add more design skills, etc.
          let skillPool = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

          // Adjust skill pool based on job title
          if (jobTitle.includes("Developer") || jobTitle.includes("Engineer")) {
            // Tech-focused skills (assuming IDs 1, 2, 7, 8 are tech skills)
            skillPool = [1, 2, 7, 8, 9];
          } else if (
            jobTitle.includes("Designer") ||
            jobTitle.includes("Creative")
          ) {
            // Design-focused skills (assuming IDs 3, 4, 10 are design skills)
            skillPool = [3, 4, 10];
          } else if (
            jobTitle.includes("Marketing") ||
            jobTitle.includes("Content")
          ) {
            // Marketing-focused skills (assuming IDs 5, 6 are marketing skills)
            skillPool = [5, 6];
          }

          // Determine number of skills based on job complexity
          const skillCount =
            experienceLevel === ExperienceLevel.Expert
              ? faker.number.int({ min: 4, max: 6 })
              : faker.number.int({ min: 2, max: 4 });

          const skillIds = faker.helpers.arrayElements(skillPool, {
            min: skillCount,
            max: skillCount,
          });

          // Add skills to the job, with some marked as starred (important)
          for (const skillId of skillIds) {
            // Mark some skills as starred (more important)
            const isStarred = faker.number.int({ min: 1, max: 3 }) === 1; // 1/3 chance of being starred

            await tx.insert(jobSkillsTable).values({
              jobId: jobId,
              skillId: skillId,
              isStarred: isStarred,
            });
          }
        }
      }

      console.log("Seeding completed successfully!");
    } catch (err) {
      console.error("Error during seeding:", err);
      tx.rollback();
      throw err;
    }
  });
}

seed()
  .catch((err) => {
    console.error("Seeding failed:", err);
    process.exit(1);
  })
  .finally(() => {
    console.log("Seeding process completed.");
    process.exit(0);
  });
