import { db } from "../db/drizzle/connector";
import {
  freelancersTable,
  languagesTable,
  freelancerLanguagesTable,
  attachmentsTable,
  freelancerSkillsTable,
  skillsTable,
  jobSkillsTable,
  accountsTable,
} from "../db/drizzle/schemas/schema";
import { eq, inArray } from "drizzle-orm";
import {
  Freelancer,
  PortfolioFormFieldType,
  WorkHistoryFormFieldType,
  CertificateFormFieldType,
  EducationFormFieldType,
  AttachmentsType,
} from "../types/User";
import { SuccessVerificationLoaderStatus } from "~/types/misc";
import DOMPurify from "isomorphic-dompurify";
import { redirect } from "@remix-run/react";
import { updateAccountBio } from "./employer.server";
import { checkUserExists, updateOnboardingStatus } from "./user.server";
import { genParseCV } from "./cvParser.server";
import {
  deleteFileFromS3,
  uploadFile,
  // generatePresignedUrl,
  // uploadFileToBucket,
} from "./cloudStorage.server";
import { FreelancerSkill } from "~/routes/_templatedashboard.onboarding/types";

/***************************************************
 ************Insert/update freelancer info************
 *************************************************** */

export async function handleFreelancerOnboardingAction(
  formData: FormData,
  freelancer: Freelancer
) {
  const target = formData.get("target-updated") as string;
  const userId = freelancer.account.user.id;

  // Add this to handleFreelancerOnboardingAction switch case
  async function handleFreelancerCV(
    formData: FormData,
    freelancer: Freelancer
  ) {
    try {
      const cvFile = formData.get("cvFile") as File;
      if (!cvFile) {
        throw new Error("No CV file provided");
      }

      // Parse CV with OpenAI
      const parsedData = await genParseCV(cvFile);

      // Update freelancer profile with parsed data
      await Promise.all([
        // Update about section
        updateFreelancerAbout(freelancer, parsedData.about),

        // Update portfolio/projects
        updateFreelancerPortfolio(
          freelancer,
          parsedData.projects.map((p: any) => ({
            projectName: p.projectName,
            projectDescription: p.projectDescription,
            projectLink: p.projectLink,
            projectImageUrl: "", // No image from CV
          })),
          [] // No images to upload
        ),

        // Update work history
        updateFreelancerWorkHistory(freelancer, parsedData.workHistory),

        // Update certificates
        updateFreelancerCertificates(
          freelancer,
          parsedData.certificates.map((c: any) => ({
            name: c.name,
            issuer: c.issuer,
            issueDate: c.issueDate,
            attachmentUrl: "", // No attachment from CV
          })),
          [] // No images to upload
        ),

        // Update education
        updateFreelancerEducation(freelancer, parsedData.education),
      ]);

      return Response.json({ success: true });
    } catch (error) {
      console.error("Error processing CV:", error);
      return Response.json({
        success: false,
        error: { message: "Failed to process CV" },
        status: 500,
      });
    }
  }

  async function handleFreelancerBio(formData: FormData, userId: number) {
    const bio = {
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      address: formData.get("address") as string,
      country: formData.get("country") as string,
      websiteURL: formData.get("website") as string,
      socialMediaLinks: {
        linkedin: formData.get("linkedin") as string,
        github: formData.get("github") as string,
        gitlab: formData.get("gitlab") as string,
        dribbble: formData.get("dribbble") as string,
        stackoverflow: formData.get("stackoverflow") as string,
      },
      userId: userId,
    };
    const bioStatus = await updateAccountBio(bio, freelancer.account);
    return Response.json({ success: bioStatus.success });
  }

  async function handleFreelancerHourlyRate(
    formData: FormData,
    freelancer: Freelancer
  ) {
    // use formName from GeneralizableFormCard
    const hourlyRate = parseInt(formData.get("hourlyRate") as string, 10); // use fieldName from GeneralizableFormCard
    const hourlyRateStatus = await updateFreelancerHourlyRate(
      freelancer,
      hourlyRate
    );
    return Response.json({ success: hourlyRateStatus.success });
  }

  async function handleFreelancerYearsOfExperience(
    formData: FormData,
    freelancer: Freelancer
  ) {
    const yearsExperience =
      parseInt(formData.get("yearsOfExperience") as string) || 0;
    const yearsStatus = await updateFreelancerYearsOfExperience(
      freelancer,
      yearsExperience
    );
    return Response.json({ success: yearsStatus.success });
  }

  async function handleFreelancerVideo(
    formData: FormData,
    freelancer: Freelancer
  ) {
    const videoLink = formData.get("videoLink") as string;
    const videoStatus = await updateFreelancerVideoLink(
      freelancer.id,
      videoLink
    );
    return Response.json({ success: videoStatus.success });
  }

  async function handleFreelancerAbout(
    formData: FormData,
    freelancer: Freelancer
  ) {
    const aboutContent = formData.get("about") as string;
    const aboutStatus = await updateFreelancerAbout(freelancer, aboutContent);
    return Response.json({ success: aboutStatus.success });
  }

  async function handleFreelancerPortfolio(
    formData: FormData,
    freelancer: Freelancer
  ) {
    const portfolio = formData.get("portfolio") as string;

    try {
      if (!portfolio) {
        throw new Error("Portfolio data is missing or invalid.");
      }

      // Parse the portfolio JSON from the form
      const portfolioParsed = JSON.parse(portfolio) as PortfolioFormFieldType[];

      const portfolioImages: File[] = [];

      // Iterate over the portfolio entries to gather files from the form data
      for (let index = 0; index < portfolioParsed.length; index++) {
        const portfolioImage = formData.get(
          `portfolio-attachment[${index}]`
        ) as unknown as File;

        if (portfolioImage && portfolioImage.size > 0) {
          portfolioImages.push(portfolioImage);
        } else {
          portfolioImages.push(null); // No image for this portfolio entry
        }
      }

      // Update freelancer portfolio and process attachments
      const portfolioStatus = await updateFreelancerPortfolio(
        freelancer,
        portfolioParsed,
        portfolioImages
      );

      return Response.json({ success: portfolioStatus.success });
    } catch (error) {
      console.error("Error processing freelancer portfolio:", error);

      return Response.json({
        success: false,
        error: { message: "Invalid portfolio data." },
        status: 400,
      });
    }
  }

  async function handleFreelancerWorkHistory(
    formData: FormData,
    freelancer: Freelancer
  ) {
    const workHistory = formData.get("workHistory") as string;
    let workHistoryParsed: WorkHistoryFormFieldType[];
    try {
      workHistoryParsed = JSON.parse(workHistory) as WorkHistoryFormFieldType[];
    } catch (error) {
      return Response.json({
        success: false,
        error: { message: "Invalid work history data." },
        status: 400,
      });
    }
    const workHistoryStatus = await updateFreelancerWorkHistory(
      freelancer,
      workHistoryParsed
    );
    return Response.json({ success: workHistoryStatus.success });
  }

  async function handleFreelancerCertificates(
    formData: FormData,
    freelancer: Freelancer
  ) {
    const certificates = formData.get("certificates") as string;

    try {
      const certificatesParsed = JSON.parse(
        certificates
      ) as CertificateFormFieldType[];
      const certificatesImages: File[] = [];
      for (let index = 0; index < certificatesParsed.length; index++) {
        const certificateImage = formData.get(
          `certificates-attachment[${index}]`
        ) as unknown as File;
        certificatesImages.push(certificateImage ?? new File([], ""));
      }
      const certificatesStatus = await updateFreelancerCertificates(
        freelancer,
        certificatesParsed,
        certificatesImages
      );
      return Response.json({ success: certificatesStatus.success });
    } catch (error) {
      return Response.json({
        success: false,
        error: { message: "Invalid certificates data." },
        status: 400,
      });
    }
  }

  async function handleFreelancerEducations(
    formData: FormData,
    freelancer: Freelancer
  ) {
    const education = formData.get("educations") as string;
    try {
      const educationParsed = JSON.parse(education) as EducationFormFieldType[];
      const educationStatus = await updateFreelancerEducation(
        freelancer,
        educationParsed
      );
      return Response.json({ success: educationStatus.success });
    } catch (error) {
      return Response.json({
        success: false,
        error: { message: "Invalid education data." },
        status: 400,
      });
    }
  }

  async function handleFreelancerAvailability(
    formData: FormData,
    freelancer: Freelancer
  ) {
    const availableForWork = formData.get("available_for_work") === "true";
    const availableFromInput = formData.get("available_from") as string | null;
    const hoursAvailableFrom = formData.get("hours_available_from") as string;
    const hoursAvailableTo = formData.get("hours_available_to") as string;
    const jobsOpenToArray = formData.getAll("jobs_open_to[]") as string[];

    // Validate hours
    const startTime = new Date(`1970-01-01T${hoursAvailableFrom}:00Z`);
    const endTime = new Date(`1970-01-01T${hoursAvailableTo}:00Z`);

    if (endTime <= startTime) {
      return Response.json(
        {
          success: false,
          error: { message: "End time must be later than start time." },
        },
        { status: 400 }
      );
    }

    const availableFrom = availableFromInput
      ? new Date(availableFromInput)
      : new Date(); // Default to today's date if no input is provided

    const result = await updateFreelancerAvailability({
      accountId: freelancer.accountId,
      availableForWork,
      jobsOpenTo: jobsOpenToArray,
      availableFrom,
      hoursAvailableFrom,
      hoursAvailableTo,
    });

    return result
      ? Response.json({ success: true })
      : Response.json(
          {
            success: false,
            error: { message: "Failed to save availability." },
          },
          { status: 500 }
        );
  }

  async function handleFreelancerIsAvailableForWork(
    formData: FormData,
    freelancer: Freelancer
  ) {
    const availableForWork = formData.get("available_for_work") === "true";

    // Call the query function to update availability status
    const result = await updateFreelancerAvailabilityStatus(
      freelancer.accountId,
      availableForWork
    );

    return result
      ? Response.json({ success: true })
      : Response.json(
          {
            success: false,
            error: { message: "Failed to update availability." },
          },
          { status: 500 }
        );
  }

  async function handleFreelancerLanguages(
    formData: FormData,
    freelancer: Freelancer
  ) {
    const languages = formData.get("languages") as string;
    // languages are a string of ids separated by commas
    try {
      const languagesParsed = JSON.parse(languages) as { id: number }[];
      const languagesStatus = await updateFreelancerLanguages(
        freelancer.id,
        languagesParsed.map((language) => language.id)
      );
      return Response.json({ success: languagesStatus.success });
    } catch (error) {
      console.error("Error parsing languages", error);
      return Response.json(
        { success: false, error: { message: "Invalid languages data." } },
        { status: 400 }
      );
    }
  }

  async function handleFreelancerSkills(
    formData: FormData,
    freelancer: Freelancer
  ) {
    const skills = formData.get("skills");
    try {
      const skillsParsed = JSON.parse(skills as string) as FreelancerSkill[];
      const skillsStatus = await updateFreelancerSkills(
        freelancer.id,
        skillsParsed
      );
      return Response.json({ success: skillsStatus.success });
    } catch (error) {
      console.error("Error parsing skills", error);
    }
    return Response.json({ success: true });
  }

  async function handleFreelancerOnboard(userId: number) {
    const userExists = await checkUserExists(userId);
    if (!userExists.length)
      return Response.json({
        success: false,
        error: { message: "User not found." },
        status: 404,
      });

    const result = await updateOnboardingStatus(userId);
    return result.length
      ? redirect("/dashboard")
      : Response.json({
          success: false,
          error: { message: "Failed to update onboarding status" },

          status: 500,
        });
  }

  switch (target) {
    case "freelancer-cv":
      return handleFreelancerCV(formData, freelancer);
    case "freelancer-bio":
      return handleFreelancerBio(formData, userId);
    case "freelancer-hourly-rate":
      return handleFreelancerHourlyRate(formData, freelancer);
    case "freelancer-years-of-experience":
      return handleFreelancerYearsOfExperience(formData, freelancer);
    case "freelancer-video":
      return handleFreelancerVideo(formData, freelancer);
    case "freelancer-about":
      return handleFreelancerAbout(formData, freelancer);
    case "freelancer-portfolio":
      return handleFreelancerPortfolio(formData, freelancer);
    case "freelancer-work-history":
      return handleFreelancerWorkHistory(formData, freelancer);
    case "freelancer-certificates":
      return handleFreelancerCertificates(formData, freelancer);
    case "freelancer-educations":
      return handleFreelancerEducations(formData, freelancer);
    case "freelancer-availability":
      return handleFreelancerAvailability(formData, freelancer);
    case "freelancer-is-available-for-work":
      return handleFreelancerIsAvailableForWork(formData, freelancer);
    case "freelancer-skills":
      return handleFreelancerSkills(formData, freelancer);
    case "freelancer-languages":
      return handleFreelancerLanguages(formData, freelancer);
    case "freelancer-onboard":
      return handleFreelancerOnboard(userId);
    default:
      throw new Error("Unknown target update");
  }
}

export async function getFreelancerIdByAccountId(
  accountId: number
): Promise<number | null> {
  const result = await db
    .select({ freelancerId: freelancersTable.id })
    .from(freelancersTable)
    .where(eq(freelancersTable.accountId, accountId))
    .limit(1);

  return result.length > 0 ? result[0].freelancerId : null;
}

export async function getFreelancerIdByUserId(userId: number) {
  // console.log("🔍 Looking for freelancerId using userId:", userId);

  const result = await db
    .select({
      freelancerId: freelancersTable.id,
      accountId: accountsTable.id,
      userId: accountsTable.userId,
    })
    .from(freelancersTable)
    .innerJoin(accountsTable, eq(freelancersTable.accountId, accountsTable.id))
    .where(eq(accountsTable.userId, userId))
    .limit(1);

  // console.log("📌 Query result in `getFreelancerIdByUserId`:", result);

  if (result.length === 0) {
    console.error(`❌ No freelancer found for userId: ${userId}`);
    return null;
  }

  // console.log(
  //   "✅ Found freelancerId:",
  //   result[0].freelancerId,
  //   "for userId:",
  //   result[0].userId,
  //   "and accountId:",
  //   result[0].accountId
  // );
  return result[0].freelancerId;
}

export async function updateFreelancerPortfolio(
  freelancer: Freelancer,
  portfolio: PortfolioFormFieldType[],
  portfolioImages: File[]
): Promise<SuccessVerificationLoaderStatus> {
  try {
    for (let i = 0; i < portfolioImages.length; i++) {
      const file = portfolioImages[i];

      if (file && file.size > 0) {
        // Check if an attachment already exists
        if (portfolio[i].attachmentId) {
          const existingAttachment = await db
            .select()
            .from(attachmentsTable)
            .where(eq(attachmentsTable.id, portfolio[i].attachmentId))
            .limit(1);

          if (existingAttachment.length > 0) {
            // Delete the old file from S3
            await deleteFileFromS3(
              process.env.S3_PRIVATE_BUCKET_NAME!,
              existingAttachment[0].key
            );
          }

          // Delete the old attachment record from the database
          await db
            .delete(attachmentsTable)
            .where(eq(attachmentsTable.id, portfolio[i].attachmentId));
        }

        // Upload the new file to S3
        const uploadResult = await uploadFile("portfolio", file);

        // Save the new file reference into the attachments table
        const [attachmentRes] = await db
          .insert(attachmentsTable)
          .values({
            key: uploadResult.key,
            metadata: {
              fileSize: file.size,
              contentType: file.type,
            },
          } as AttachmentsType)
          .returning({ id: attachmentsTable.id });

        if (!attachmentRes) {
          throw new Error("Failed to save attachment in the database.");
        }

        // Save the attachment ID and generate the pre-signed URL
        portfolio[i].attachmentId = attachmentRes.id;
        portfolio[i].projectImageName = uploadResult.key;
      } else {
        // Handle cases where no file was uploaded
        portfolio[i].attachmentId = null;
        portfolio[i].projectImageName = null;
      }

      // Sanitize the project description
      portfolio[i].projectDescription = DOMPurify.sanitize(
        portfolio[i].projectDescription || ""
      );
    }

    // Update the freelancer's portfolio in the database
    const res = await db
      .update(freelancersTable)
      .set({
        portfolio: JSON.stringify(portfolio), // Save the updated portfolio
      })
      .where(eq(freelancersTable.id, freelancer.id))
      .returning({ id: freelancersTable.id });

    if (!res.length) {
      throw new Error("Failed to update freelancer portfolio.");
    }

    return { success: true };
  } catch (error) {
    console.error("Error updating freelancer portfolio:", error);
    throw error;
  }
}

export async function updateFreelancerCertificates(
  freelancer: Freelancer,
  certificates: CertificateFormFieldType[],
  certificatesImages: File[]
): Promise<SuccessVerificationLoaderStatus> {
  try {
    for (let i = 0; i < certificatesImages.length; i++) {
      const file = certificatesImages[i];

      if (file && file.size > 0) {
        // Check if an attachment already exists
        if (certificates[i].attachmentId) {
          const existingAttachment = await db
            .select()
            .from(attachmentsTable)
            .where(eq(attachmentsTable.id, certificates[i].attachmentId))
            .limit(1);

          if (existingAttachment.length > 0) {
            // Delete the old file from S3
            await deleteFileFromS3(
              process.env.S3_PRIVATE_BUCKET_NAME!,
              existingAttachment[0].key
            );
          }

          // Delete the old attachment record from the database
          await db
            .delete(attachmentsTable)
            .where(eq(attachmentsTable.id, certificates[i].attachmentId));
        }

        // Upload the new file to S3
        const uploadResult = await uploadFile("certificates", file);

        // Save the new file reference into the attachments table
        const [attachmentRes] = await db
          .insert(attachmentsTable)
          .values({
            key: uploadResult.key,
            metadata: {
              fileSize: file.size,
              contentType: file.type,
            },
          } as AttachmentsType)
          .returning({ id: attachmentsTable.id });

        if (!attachmentRes) {
          throw new Error("Failed to save attachment in the database.");
        }

        // Save the attachment ID (but not the signed URL) in the certificates array
        certificates[i].attachmentId = attachmentRes.id;
        certificates[i].attachmentName = uploadResult.key; // Save the file name for future use
      } else {
        // Handle cases where no file was uploaded
        certificates[i].attachmentId = null;
        certificates[i].attachmentName = null;
      }

      // Sanitize the certificate name and issuer
      certificates[i].certificateName = DOMPurify.sanitize(
        certificates[i].certificateName || ""
      );
      certificates[i].issuedBy = DOMPurify.sanitize(
        certificates[i].issuedBy || ""
      );
    }

    // Update the freelancer's certificates in the database
    const res = await db
      .update(freelancersTable)
      .set({
        certificates: JSON.stringify(certificates), // Save the updated certificates
      })
      .where(eq(freelancersTable.id, freelancer.id))
      .returning({ id: freelancersTable.id });

    if (!res.length) {
      throw new Error("Failed to update freelancer certificates.");
    }

    return { success: true };
  } catch (error) {
    console.error("Error updating freelancer certificates:", error);
    throw error;
  }
}

export async function updateFreelancerWorkHistory(
  freelancer: Freelancer,
  workHistory: WorkHistoryFormFieldType[]
): Promise<SuccessVerificationLoaderStatus> {
  for (let i = 0; i < workHistory.length; i++) {
    workHistory[i].jobDescription = DOMPurify.sanitize(
      workHistory[i].jobDescription
    );
  }
  try {
    const res = await db
      .update(freelancersTable)
      .set({ workHistory: JSON.stringify(workHistory) })
      .where(eq(freelancersTable.id, freelancer.id))
      .returning({ id: freelancersTable.id });

    if (!res.length) {
      throw new Error("Failed to update freelancer work history");
    }
    return { success: true };
  } catch (error) {
    console.error("Error updating freelancer work history", error);
    throw error;
  }
}

export async function updateFreelancerEducation(
  freelancer: Freelancer,
  education: EducationFormFieldType[]
): Promise<SuccessVerificationLoaderStatus> {
  try {
    const res = await db
      .update(freelancersTable)
      .set({ educations: JSON.stringify(education) })
      .where(eq(freelancersTable.id, freelancer.id))
      .returning({ id: freelancersTable.id });

    if (!res.length) {
      throw new Error("Failed to update freelancer education");
    }
    return { success: true };
  } catch (error) {
    console.error("Error updating freelancer education", error);
    throw error;
  }
}

export async function updateFreelancerLanguages(
  freelancerId: number,
  languages: number[]
): Promise<SuccessVerificationLoaderStatus> {
  try {
    // Delete existing languages
    await db
      .delete(freelancerLanguagesTable)
      .where(eq(freelancerLanguagesTable.freelancerId, freelancerId));

    // Ensure languages are unique
    languages = [...new Set(languages)];

    // Insert new languages
    for (const languageId of languages) {
      await db.insert(freelancerLanguagesTable).values({
        freelancerId,
        languageId,
      });
    }
  } catch (error) {
    console.error("Error updating freelancer languages", error);
    throw error;
  }
  return { success: true };
}

export async function updateFreelancerSkills(
  freelancerId: number,
  skillsData: FreelancerSkill[]
): Promise<SuccessVerificationLoaderStatus> {
  try {
    // delete existing skills
    await db
      .delete(freelancerSkillsTable)
      .where(eq(freelancerSkillsTable.freelancerId, freelancerId));

    // insert new skills
    await db.insert(freelancerSkillsTable).values(
      skillsData.map(
        (skill: { skillId: number; yearsOfExperience: number }) => ({
          freelancerId,
          skillId: skill.skillId,
          yearsOfExperience: skill.yearsOfExperience,
        })
      )
    );

    return { success: true };
  } catch (error) {
    console.error("Error updating freelancer skills", error);
    throw error;
  }
}

export async function updateFreelancerAbout(
  freelancer: Freelancer,
  aboutContent: string
): Promise<{ success: boolean }> {
  const accountId = freelancer.accountId;
  const sanitizedContent = DOMPurify.sanitize(aboutContent);
  try {
    await db
      .update(freelancersTable)
      .set({
        about: sanitizedContent, // Set the about column with the new content
      })
      .where(eq(freelancersTable.accountId, accountId));

    return { success: true };
  } catch (error) {
    console.error("Error updating freelancer about section", error);
    return { success: false }; // Return failure status
  }
}

export async function updateFreelancerVideoLink(
  freelancerId: number,
  videoLink: string
): Promise<{ success: boolean }> {
  return db
    .update(freelancersTable)
    .set({ videoLink: videoLink })
    .where(eq(freelancersTable.accountId, freelancerId))
    .then(() => {
      return { success: true };
    })
    .catch((error) => {
      console.error("Error updating freelancer video link", error);
      return { success: false };
    });
}

export async function updateFreelancerYearsOfExperience(
  freelancer: Freelancer,
  yearsOfExperience: number
): Promise<{ success: boolean }> {
  const accountId = freelancer.accountId;

  try {
    if (isNaN(yearsOfExperience)) {
      throw new Error("Years experience must be a number");
    }
    if (yearsOfExperience < 0) {
      throw new Error("Years experience must be a positive number");
    }
    if (yearsOfExperience > 30) {
      throw new Error("Years experience must be less than 30");
    }
    await db
      .update(freelancersTable)
      .set({ yearsOfExperience })
      .where(eq(freelancersTable.accountId, accountId));

    return { success: true };
  } catch (error) {
    console.error("Error updating freelancer years experience", error);
    return { success: false }; // Return failure status
  }
}

export async function updateFreelancerHourlyRate(
  freelancer: Freelancer,
  hourlyRate: number
): Promise<{ success: boolean }> {
  const accountId = freelancer.accountId;

  try {
    await db
      .update(freelancersTable)
      .set({
        hourlyRate, // Set the hourlyRate column with the new rate
      })
      .where(eq(freelancersTable.accountId, accountId));

    return { success: true };
  } catch (error) {
    console.error("Error updating freelancer hourly rate", error);
    return { success: false }; // Return failure status
  }
}

export async function updateFreelancerAvailability({
  accountId,
  availableForWork,
  availableFrom,
  hoursAvailableFrom,
  hoursAvailableTo,
  jobsOpenTo,
}: {
  accountId: number;
  availableForWork: boolean;
  availableFrom: Date | null;
  hoursAvailableFrom: string;
  hoursAvailableTo: string;
  jobsOpenTo: string[];
}) {
  // Validate hours
  const startTime = new Date(`1970-01-01T${hoursAvailableFrom}:00Z`);
  const endTime = new Date(`1970-01-01T${hoursAvailableTo}:00Z`);

  if (endTime <= startTime) {
    throw new Error("End time must be later than start time.");
  }

  const formattedDateAvailableFrom = availableFrom
    ? availableFrom.toISOString().split("T")[0]
    : null;

  const result = await db
    .update(freelancersTable)
    .set({
      availableForWork,
      dateAvailableFrom: formattedDateAvailableFrom,
      hoursAvailableFrom,
      hoursAvailableTo,
      jobsOpenTo,
    })
    .where(eq(freelancersTable.accountId, accountId))
    .returning();

  return result.length > 0;
}

export async function updateFreelancerAvailabilityStatus(
  accountId: number,
  availableForWork: boolean
) {
  try {
    const result = await db
      .update(freelancersTable)
      .set({ availableForWork })
      .where(eq(freelancersTable.accountId, accountId))
      .returning();

    return result.length > 0; // Returns true if the update was successful
  } catch (error) {
    console.error("Error updating availability status:", error);
    return false;
  }
}

/***************************************************
 ***************fetch freelancer info***************
 *************************************************** */

export async function getFreelancerAvailability(accountId: number) {
  const result = await db
    .select({
      availableForWork: freelancersTable.availableForWork,
      availableFrom: freelancersTable.dateAvailableFrom,
      hoursAvailableFrom: freelancersTable.hoursAvailableFrom,
      hoursAvailableTo: freelancersTable.hoursAvailableTo,
      jobsOpenTo: freelancersTable.jobsOpenTo,
    })
    .from(freelancersTable)
    .where(eq(freelancersTable.accountId, accountId))
    .limit(1);

  const availability = result[0] || null;

  // Ensure `availableFrom` is a valid date before formatting
  if (availability?.availableFrom) {
    const availableFromDate = new Date(availability.availableFrom); // Convert to Date
    availability.availableFrom = !isNaN(availableFromDate.getTime()) // Check if valid Date
      ? availableFromDate.toISOString().split("T")[0] // Format as yyyy-MM-dd
      : null; // Fallback to null if invalid
  }

  return result[0] || null;
}

export async function getFreelancerAbout(
  freelancer: Freelancer
): Promise<string> {
  const accountId = freelancer.accountId;

  try {
    const result = await db
      .select({
        about: freelancersTable.about, // Fetch the about column
      })
      .from(freelancersTable)
      .where(eq(freelancersTable.accountId, accountId))
      .limit(1); // Limit to 1 row since we're expecting one result

    // console.log("📡 [getFreelancerAbout] Query Result:", result);

    // Return the fetched about content or default to an empty string if no result
    return result[0]?.about ? String(result[0].about) : "";
  } catch (error) {
    console.error("Error fetching freelancer about section", error);
    throw error; // Re-throw error for further handling
  }
}

export async function getFreelancerHourlyRate(
  freelancer: Freelancer
): Promise<number> {
  const accountId = freelancer.accountId;

  try {
    const result = await db
      .select({
        hourlyRate: freelancersTable.hourlyRate, // Fetch the hourlyRate column
      })
      .from(freelancersTable)
      .where(eq(freelancersTable.accountId, accountId))
      .limit(1); // Limit to 1 row since we're expecting one result

    // Return the fetched hourly rate or default to 0 if no result
    return result[0]?.hourlyRate ?? 0;
  } catch (error) {
    console.error("Error fetching freelancer hourly rate", error);
    throw error; // Re-throw error for further handling
  }
}

export async function getFreelancerLanguages(
  freelancerId: number
): Promise<{ id: number; language: string }[]> {
  try {
    const languages = await db
      .select({ id: languagesTable.id, language: languagesTable.language })
      .from(freelancerLanguagesTable)
      .leftJoin(
        languagesTable,
        eq(freelancerLanguagesTable.languageId, languagesTable.id)
      )
      .where(eq(freelancerLanguagesTable.freelancerId, freelancerId));

    // console.log(
    //   "🔥 DATABASE: Fetched Languages for Freelancer",
    //   freelancerId,
    //   languages
    // );

    if (!languages) {
      throw new Error("Failed to get freelancer languages");
    }

    return languages ?? []; // Ensure it always returns an array
  } catch (error) {
    console.error("Error getting freelancer languages", error);
    throw error;
  }
}

export async function getFreelancerSkills(freelancerId: number) {
  /**
   * Fetches all skills associated with a freelancer
   * @param freelancerId The id of the freelancer whose skills to fetch
   * @returns An array of objects with `skillId` and `label` properties
   */
  // console.log(`🔥 DATABASE: Fetching skills for freelancerId: ${freelancerId}`);

  const skills = await db
    .select({
      skillId: freelancerSkillsTable.skillId,
      label: skillsTable.label,
    })
    .from(freelancerSkillsTable)
    .leftJoin(skillsTable, eq(skillsTable.id, freelancerSkillsTable.skillId))
    .where(eq(freelancerSkillsTable.freelancerId, freelancerId));

  // console.log(
  //   `🔥 DATABASE: Fetched skills for freelancerId ${freelancerId}:`,
  //   skills
  // );

  return skills;
}

// fetch freelancer's skills
export async function fetchFreelancerSkills(
  freelancerId: number
): Promise<FreelancerSkill[]> {
  const skills = await db
    .select()
    .from(freelancerSkillsTable)
    .where(eq(freelancerSkillsTable.freelancerId, freelancerId));

  // get skill labels from skills table
  const skillLabels = await db
    .select({ id: skillsTable.id, label: skillsTable.label })
    .from(skillsTable)
    .where(
      inArray(
        skillsTable.id,
        skills.map((skill) => skill.skillId)
      )
    );

  // add skill labels to skills
  const freelancerSkills: FreelancerSkill[] = skills.map((skill) => ({
    skillId: skill.skillId,
    label: skillLabels.find((label) => label.id === skill.skillId)?.label,
    yearsOfExperience: skill.yearsOfExperience,
  }));

  return freelancerSkills;
}
