import { db } from '@mawaheb/db/server';
import {
  freelancersTable,
  languagesTable,
  freelancerLanguagesTable,
  attachmentsTable,
  freelancerSkillsTable,
  skillsTable,
  jobSkillsTable,
  accountsTable,
  userIdentificationsTable,
} from '@mawaheb/db';
import { eq, inArray } from 'drizzle-orm';
import {
  Freelancer,
  PortfolioFormFieldType,
  WorkHistoryFormFieldType,
  CertificateFormFieldType,
  EducationFormFieldType,
  AttachmentsType,
} from '@mawaheb/db/types';
import { SuccessVerificationLoaderStatus } from '~/types/misc';
import DOMPurify from 'isomorphic-dompurify';
import { redirect } from '@remix-run/react';
import { updateAccountBio } from './employer.server';
import { checkUserExists, updateOnboardingStatus } from './user.server';
import { genParseCV } from './cvParser.server';
import {
  deleteFileFromS3,
  uploadFile,
  // generatePresignedUrl,
  // uploadFileToBucket,sd
  saveAttachments,
  uploadFileToS3,
  saveAttachment,
} from './cloudStorage.server';
import { FreelancerSkill } from '~/routes/_templatedashboard.onboarding/types';
import { deleteAttachmentById } from '~/servers/attachment.server';
import { isValidVideoUrl } from '~/utils/video';
import { FreelancerVideoAttachmentType } from '@mawaheb/db/types/enums';

/***************************************************
 ************Insert/update freelancer info************
 *************************************************** */

export async function handleFreelancerOnboardingAction(formData: FormData, freelancer: Freelancer) {
  console.log('🔥🔥🔥 HIT MAIN ACTION with target:', formData.get('target-updated'));
  const target = formData.get('target-updated') as string;
  const userId = freelancer.account.user.id;

  // Add this to handleFreelancerOnboardingAction switch case
  async function handleFreelancerCV(formData: FormData, freelancer: Freelancer) {
    try {
      const cvFile = formData.get('cvFile') as File;
      if (!cvFile) {
        throw new Error('No CV file provided');
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
            projectImageUrl: '', // No image from CV
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
            attachmentUrl: '', // No attachment from CV
          })),
          [] // No images to upload
        ),

        // Update education
        updateFreelancerEducation(freelancer, parsedData.education),
      ]);

      return Response.json({ success: { message: 'CV parsed and profile updated!' } });
    } catch (error) {
      console.error('Error processing CV:', error);
      return Response.json({
        success: false,
        error: { message: 'Failed to process CV' },
        status: 500,
      });
    }
  }

  async function handleFreelancerBio(formData: FormData, userId: number) {
    const bio = {
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      address: formData.get('address') as string,
      country: formData.get('country') as string,
      websiteURL: formData.get('website') as string,
      socialMediaLinks: {
        linkedin: formData.get('linkedin') as string,
        github: formData.get('github') as string,
        gitlab: formData.get('gitlab') as string,
        dribbble: formData.get('dribbble') as string,
        stackoverflow: formData.get('stackoverflow') as string,
      },
      userId: userId,
    };
    const bioStatus = await updateAccountBio(bio, freelancer.account);
    return Response.json({
      success: bioStatus.success ? { message: 'Bio updated successfully!' } : false,
    });
  }

  async function handleFreelancerHourlyRate(formData: FormData, freelancer: Freelancer) {
    // use formName from GeneralizableFormCard
    const hourlyRate = parseInt(formData.get('hourlyRate') as string, 10); // use fieldName from GeneralizableFormCard
    const hourlyRateStatus = await updateFreelancerHourlyRate(freelancer, hourlyRate);
    return Response.json({ success: { message: 'Hourly rate updated!' } });
  }

  async function handleFreelancerYearsOfExperience(formData: FormData, freelancer: Freelancer) {
    const yearsExperience = parseInt(formData.get('yearsOfExperience') as string) || 0;
    const yearsStatus = await updateFreelancerYearsOfExperience(freelancer, yearsExperience);
    return Response.json({
      success: yearsStatus.success ? { message: 'Experience updated!' } : false,
    });
  }

  async function handleFreelancerVideo(formData: FormData, freelancer: Freelancer) {
    const rawVideoEntry = formData.get('videoLink');
    console.log('[DEBUG] rawVideoEntry:', rawVideoEntry, '| Type:', typeof rawVideoEntry);

    // Handle File Upload
    if (rawVideoEntry instanceof File && rawVideoEntry.size > 0) {
      console.log('[DEBUG] Detected File upload:', rawVideoEntry.name, rawVideoEntry.size);
      const s3Result = await saveAttachment(rawVideoEntry, 'freelancer-introductory-video');
      if (!s3Result.success) {
        return Response.json(
          { error: { message: 'Failed to upload video file.' } },
          { status: 500 }
        );
      }
      const uploadedUrl = s3Result.data.url;
      console.log('[DEBUG] uploadedUrl:', uploadedUrl);
      console.log('[DEBUG] s3Result:', s3Result);
      await updateFreelancerVideoLink(
        freelancer.id,
        FreelancerVideoAttachmentType.Attachment,
        undefined,
        s3Result.data.id
      );
      return Response.json({ success: { message: 'Video file uploaded and saved!' } });
    }

    // Handle YouTube/URL
    if (typeof rawVideoEntry === 'string') {
      const url = rawVideoEntry.trim();
      console.log('[DEBUG] Detected string videoLink:', url);
      if (!url) {
        return Response.json({ error: { message: 'Video URL is empty!' } }, { status: 400 });
      }
      // Only check if it’s a valid YouTube or video URL when it's a string
      if (!isValidVideoUrl(url)) {
        return Response.json(
          { error: { message: 'Invalid video URL. Please provide a valid YouTube link.' } },
          { status: 400 }
        );
      }
      await updateFreelancerVideoLink(freelancer.id, FreelancerVideoAttachmentType.Link, url);
      return Response.json({ success: { message: 'YouTube video saved!' } });
    }

    // Fallback: Neither file nor string
    return Response.json(
      { error: { message: 'No valid video input provided (neither URL nor file).' } },
      { status: 400 }
    );
  }

  async function handleFreelancerAbout(formData: FormData, freelancer: Freelancer) {
    const aboutContent = formData.get('about') as string;
    const aboutStatus = await updateFreelancerAbout(freelancer, aboutContent);
    return Response.json({ success: { message: 'About section saved!' } });
  }

  async function handleFreelancerPortfolio(formData: FormData, freelancer: Freelancer) {
    const portfolio = formData.get('portfolio') as string;

    try {
      if (!portfolio) {
        throw new Error('Portfolio data is missing or invalid.');
      }

      const portfolioParsed = JSON.parse(portfolio) as PortfolioFormFieldType[];
      const portfolioImages: (File | null)[] = [];

      for (let index = 0; index < portfolioParsed.length; index++) {
        const portfolioItem = portfolioParsed[index];

        // --- Handle File Uploads for Portfolio Item (image or non-image) ---
        // If your frontend only supports a *single* file per project, and you want to decide type here:
        const file = formData.get(`portfolio-attachment[${index}]`) as File | null;
        if (file && file.size > 0) {
          const s3Result = await uploadFile('portfolio', file); // { key, url, ... }

          if (file.type.startsWith('image/')) {
            // Image files: use projectImageUrl/projectImageName
            portfolioItem.projectImageUrl = s3Result.url;
            portfolioItem.projectImageName = file.name;
            // Clean out doc fields if any
            portfolioItem.attachmentUrl = '';
            portfolioItem.attachmentName = '';
            portfolioImages[index] = file;
          } else {
            // PDFs, DOCXs, ...: use attachmentUrl/attachmentName
            portfolioItem.attachmentUrl = s3Result.url;
            portfolioItem.attachmentName = file.name;
            // Clean out image fields if any
            portfolioItem.projectImageUrl = '';
            portfolioItem.projectImageName = '';
          }
        } else if (
          portfolioItem.projectImageUrl &&
          typeof portfolioItem.projectImageUrl === 'string' &&
          portfolioItem.projectImageUrl.startsWith('blob:')
        ) {
          // Remove stale image blobs
          portfolioItem.projectImageUrl = '';
          portfolioItem.projectImageName = '';
        } else if (
          portfolioItem.attachmentUrl &&
          typeof portfolioItem.attachmentUrl === 'string' &&
          portfolioItem.attachmentUrl.startsWith('blob:')
        ) {
          // Remove stale doc blobs
          portfolioItem.attachmentUrl = '';
          portfolioItem.attachmentName = '';
        }

        // --- If you have a *separate* field for attachment (pdf/docx) files, keep this (it won’t hurt) ---
        const attachmentFile = formData.get(`portfolio-attachment-file[${index}]`) as File | null;
        if (attachmentFile && attachmentFile.size > 0) {
          const s3Result = await uploadFile('portfolio', attachmentFile);
          portfolioItem.attachmentUrl = s3Result.url;
          portfolioItem.attachmentName = attachmentFile.name;
          // (optional) If you want to clean image fields:
          // portfolioItem.projectImageUrl = '';
          // portfolioItem.projectImageName = '';
        } else if (
          portfolioItem.attachmentUrl &&
          typeof portfolioItem.attachmentUrl === 'string' &&
          portfolioItem.attachmentUrl.startsWith('blob:')
        ) {
          portfolioItem.attachmentUrl = '';
          portfolioItem.attachmentName = '';
        }
      }

      // --- Save to DB ---
      const portfolioStatus = await updateFreelancerPortfolio(
        freelancer,
        portfolioParsed,
        portfolioImages // Keep passing this in case you need it for old logic
      );

      return Response.json({
        success: portfolioStatus.success ? { message: 'Portfolio saved!' } : false,
      });
    } catch (error) {
      console.error('Error processing freelancer portfolio:', error);

      return Response.json({
        success: false,
        error: { message: 'Invalid portfolio data.' },
        status: 400,
      });
    }
  }

  async function handleFreelancerWorkHistory(formData: FormData, freelancer: Freelancer) {
    const workHistory = formData.get('workHistory') as string;
    let workHistoryParsed: WorkHistoryFormFieldType[];
    try {
      workHistoryParsed = JSON.parse(workHistory);
    } catch (error) {
      return Response.json({
        success: false,
        error: { message: 'Invalid work history data.' },
        status: 400,
      });
    }
    const workHistoryStatus = await updateFreelancerWorkHistory(freelancer, workHistoryParsed);
    return Response.json({
      success: workHistoryStatus.success ? { message: 'Work history updated!' } : false,
    });
  }

  async function handleFreelancerCertificates(formData: FormData, freelancer: Freelancer) {
    const certificates = formData.get('certificates') as string;

    try {
      if (!certificates) {
        throw new Error('Certificates data is missing or invalid.');
      }

      const certificatesParsed = JSON.parse(certificates) as CertificateFormFieldType[];
      const certificatesImages: File[] = [];
      for (let index = 0; index < certificatesParsed.length; index++) {
        const certificateImage = formData.get(
          `certificates-attachment[${index}]`
        ) as unknown as File;
        certificatesImages.push(certificateImage ?? new File([], ''));
      }
      const certificatesStatus = await updateFreelancerCertificates(
        freelancer,
        certificatesParsed,
        certificatesImages
      );
      return Response.json({
        success: certificatesStatus.success ? { message: 'Certificates saved!' } : false,
      });
    } catch (error) {
      return Response.json({
        success: false,
        error: { message: 'Invalid certificates data.' },
        status: 400,
      });
    }
  }

  async function handleFreelancerEducations(formData: FormData, freelancer: Freelancer) {
    const education = formData.get('educations') as string;
    try {
      const educationParsed = JSON.parse(education) as EducationFormFieldType[];
      const educationStatus = await updateFreelancerEducation(freelancer, educationParsed);
      return Response.json({
        success: educationStatus.success ? { message: 'Education saved!' } : false,
      });
    } catch (error) {
      return Response.json({
        success: false,
        error: { message: 'Invalid education data.' },
        status: 400,
      });
    }
  }

  async function handleFreelancerAvailability(formData: FormData, freelancer: Freelancer) {
    const availableForWork = formData.get('available_for_work') === 'true';
    const availableFromInput = formData.get('available_from') as string | null;
    const hoursAvailableFrom = formData.get('hours_available_from') as string;
    const hoursAvailableTo = formData.get('hours_available_to') as string;
    const jobsOpenToArray = formData.getAll('jobs_open_to[]') as string[];

    // Validate hours
    const startTime = new Date(`1970-01-01T${hoursAvailableFrom}:00Z`);
    const endTime = new Date(`1970-01-01T${hoursAvailableTo}:00Z`);

    if (endTime <= startTime) {
      return Response.json(
        {
          success: false,
          error: { message: 'End time must be later than start time.' },
        },
        { status: 400 }
      );
    }

    const availableFrom = availableFromInput ? new Date(availableFromInput) : new Date();

    const result = await updateFreelancerAvailability({
      accountId: freelancer.accountId,
      availableForWork,
      jobsOpenTo: jobsOpenToArray,
      availableFrom,
      hoursAvailableFrom,
      hoursAvailableTo,
    });

    return result
      ? Response.json({ success: { message: 'Availability updated successfully!' } })
      : Response.json(
          {
            success: false,
            error: { message: 'Failed to save availability.' },
          },
          { status: 500 }
        );
  }

  async function handleFreelancerIsAvailableForWork(formData: FormData, freelancer: Freelancer) {
    const availableForWork = formData.get('available_for_work') === 'true';

    // Call the query function to update availability status
    const result = await updateFreelancerAvailabilityStatus(freelancer.accountId, availableForWork);

    return result
      ? Response.json({ success: { message: 'Availability status updated successfully!' } })
      : Response.json(
          {
            success: false,
            error: { message: 'Failed to update availability.' },
          },
          { status: 500 }
        );
  }

  async function handleFreelancerLanguages(formData: FormData, freelancer: Freelancer) {
    const languages = formData.get('languages') as string;
    // languages are a string of ids separated by commas
    try {
      const languagesParsed = JSON.parse(languages) as { id: number }[];
      const languagesStatus = await updateFreelancerLanguages(
        freelancer.id,
        languagesParsed.map(language => language.id)
      );
      return Response.json({
        success: languagesStatus.success ? { message: 'Languages updated!' } : false,
      });
    } catch (error) {
      console.error('Error parsing languages', error);
      return Response.json(
        { success: false, error: { message: 'Invalid languages data.' } },
        { status: 400 }
      );
    }
  }

  async function handleFreelancerSkills(formData: FormData, freelancer: Freelancer) {
    const skills = formData.get('skills');
    // console.log('🔥 FREELANCER SERVER: Received Skills Form Data:', skills);
    try {
      const skillsParsed = JSON.parse(skills as string) as FreelancerSkill[];
      for (const skill of skillsParsed) {
        if (!skill.yearsOfExperience || skill.yearsOfExperience < 1) {
          return Response.json(
            {
              success: false,
              error: { message: 'Each skill must have at least 1 year of experience.' },
            },
            { status: 400 }
          );
        }
      }

      const skillsStatus = await updateFreelancerSkills(freelancer.id, skillsParsed);

      return Response.json({
        success: skillsStatus.success ? { message: 'Skills updated!' } : false,
      });
    } catch (error) {
      console.error('🔥 FREELANCER SERVER: Error updating skills', error);
      return Response.json(
        { success: false, error: { message: 'Failed to update skills.' } },
        { status: 500 }
      );
    }
  }

  async function handleFreelancerOnboard(userId: number) {
    const userExists = await checkUserExists(userId);
    if (!userExists.length)
      return Response.json({
        success: false,
        error: { message: 'User not found.' },
        status: 404,
      });

    const result = await updateOnboardingStatus(userId);
    return result.length
      ? redirect('/identification')
      : Response.json({
          success: false,
          error: { message: 'Failed to update onboarding status' },
          status: 500,
        });
  }

  switch (target) {
    case 'freelancer-cv':
    case 'cvParser':
      return handleFreelancerCV(formData, freelancer);
    case 'freelancer-bio':
      return handleFreelancerBio(formData, userId);
    case 'freelancer-hourly-rate':
      return handleFreelancerHourlyRate(formData, freelancer);
    case 'freelancer-years-of-experience':
      return handleFreelancerYearsOfExperience(formData, freelancer);
    case 'freelancer-video':
      console.log('🔥 HIT freelancer-video case!');
      return handleFreelancerVideo(formData, freelancer);
    case 'freelancer-about':
      return handleFreelancerAbout(formData, freelancer);
    case 'freelancer-portfolio':
      return handleFreelancerPortfolio(formData, freelancer);
    case 'freelancer-work-history':
      return handleFreelancerWorkHistory(formData, freelancer);
    case 'freelancer-certificates':
      return handleFreelancerCertificates(formData, freelancer);
    case 'freelancer-educations':
      return handleFreelancerEducations(formData, freelancer);
    case 'freelancer-availability':
      return handleFreelancerAvailability(formData, freelancer);
    case 'freelancer-is-available-for-work':
      return handleFreelancerIsAvailableForWork(formData, freelancer);
    case 'freelancer-skills':
      return handleFreelancerSkills(formData, freelancer);
    case 'freelancer-languages':
      return handleFreelancerLanguages(formData, freelancer);
    case 'freelancer-onboard':
      return handleFreelancerOnboard(userId);
    default:
      console.log('❌ DEFAULT CASE. target was:', target);
      throw new Error('Unknown target update');
  }
}

export async function getFreelancerIdByAccountId(accountId: number): Promise<number | null> {
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
            await deleteFileFromS3(process.env.S3_PRIVATE_BUCKET_NAME!, existingAttachment[0].key);
          }

          // Delete the old attachment record from the database
          await db
            .delete(attachmentsTable)
            .where(eq(attachmentsTable.id, portfolio[i].attachmentId));
        }

        // Upload the new file to S3
        const uploadResult = await uploadFile('portfolio', file);

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
          throw new Error('Failed to save attachment in the database.');
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
      portfolio[i].projectDescription = DOMPurify.sanitize(portfolio[i].projectDescription || '');
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
      throw new Error('Failed to update freelancer portfolio.');
    }

    return { success: true };
  } catch (error) {
    console.error('Error updating freelancer portfolio:', error);
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
            await deleteFileFromS3(process.env.S3_PRIVATE_BUCKET_NAME!, existingAttachment[0].key);
          }

          // Delete the old attachment record from the database
          await db
            .delete(attachmentsTable)
            .where(eq(attachmentsTable.id, certificates[i].attachmentId));
        }

        // Upload the new file to S3
        const uploadResult = await uploadFile('certificates', file);

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
          throw new Error('Failed to save attachment in the database.');
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
      certificates[i].certificateName = DOMPurify.sanitize(certificates[i].certificateName || '');
      certificates[i].issuedBy = DOMPurify.sanitize(certificates[i].issuedBy || '');
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
      throw new Error('Failed to update freelancer certificates.');
    }

    return { success: true };
  } catch (error) {
    console.error('Error updating freelancer certificates:', error);
    throw error;
  }
}

export async function updateFreelancerWorkHistory(
  freelancer: Freelancer,
  workHistory: WorkHistoryFormFieldType[]
): Promise<SuccessVerificationLoaderStatus> {
  for (let i = 0; i < workHistory.length; i++) {
    workHistory[i].jobDescription = DOMPurify.sanitize(workHistory[i].jobDescription);
  }
  try {
    const res = await db
      .update(freelancersTable)
      .set({ workHistory: JSON.stringify(workHistory) })
      .where(eq(freelancersTable.id, freelancer.id))
      .returning({ id: freelancersTable.id });

    if (!res.length) {
      throw new Error('Failed to update freelancer work history');
    }
    return { success: true };
  } catch (error) {
    console.error('Error updating freelancer work history', error);
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
      throw new Error('Failed to update freelancer education');
    }
    return { success: true };
  } catch (error) {
    console.error('Error updating freelancer education', error);
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
    console.error('Error updating freelancer languages', error);
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
    const skillsToInsert = skillsData.map((skill: FreelancerSkill) => ({
      freelancerId,
      skillId: skill.skillId,
      label: skill.label || '',
      // 🚩 Force yearsOfExperience to be at least 1
      yearsOfExperience: Math.max(1, Number(skill.yearsOfExperience) || 1),
      isStarred: skill.isStarred || false,
    }));

    await db.insert(freelancerSkillsTable).values(skillsToInsert);

    // Update fields_of_expertise in freelancers table
    const fieldsOfExpertise = skillsData.map(skill => skill.label || '').filter(Boolean);

    // Update the freelancers table with the skills array
    await db
      .update(freelancersTable)
      .set({
        fieldsOfExpertise,
      })
      .where(eq(freelancersTable.id, freelancerId));

    return { success: true };
  } catch (error) {
    console.error('Error updating freelancer skills:', error);
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
    console.error('Error updating freelancer about section', error);
    return { success: false }; // Return failure status
  }
}

// for the video upload in freelancers onboarding view
export async function updateFreelancerVideoLink(
  freelancerId: number,
  attachmentType: FreelancerVideoAttachmentType,
  videoLink?: string,
  videoAttachmentId?: number
) {
  if (attachmentType === FreelancerVideoAttachmentType.Attachment) {
    return db
      .update(freelancersTable)
      .set({
        videoAttachmentId: videoAttachmentId,
        videoType: attachmentType,
        videoLink: undefined,
      })
      .where(eq(freelancersTable.id, freelancerId))
      .then(() => ({ success: true }))
      .catch(error => {
        console.error('Error updating freelancer video link', error);
        return { success: false };
      });
  }
  if (attachmentType === FreelancerVideoAttachmentType.Link) {
    return db
      .update(freelancersTable)
      .set({ videoLink, videoAttachmentId: undefined, videoType: attachmentType })
      .where(eq(freelancersTable.id, freelancerId))
      .then(() => ({ success: true }))
      .catch(error => {
        console.error('Error updating freelancer video link', error);
        return { success: false };
      });
  }
  return { success: false };
  /* return db
    .update(freelancersTable)
    .set({ videoLink })
    .where(eq(freelancersTable.id, freelancerId))
    .then(() => ({ success: true }))
    .catch(error => {
      console.error('Error updating freelancer video link', error);
      return { success: false };
    }); */
}

export async function updateFreelancerYearsOfExperience(
  freelancer: Freelancer,
  yearsOfExperience: number
): Promise<{ success: boolean }> {
  const accountId = freelancer.accountId;

  try {
    if (isNaN(yearsOfExperience)) {
      throw new Error('Years experience must be a number');
    }
    if (yearsOfExperience < 0) {
      throw new Error('Years experience must be a positive number');
    }
    if (yearsOfExperience > 30) {
      throw new Error('Years experience must be less than 30');
    }
    await db
      .update(freelancersTable)
      .set({ yearsOfExperience })
      .where(eq(freelancersTable.accountId, accountId));

    return { success: true };
  } catch (error) {
    console.error('Error updating freelancer years experience', error);
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
    console.error('Error updating freelancer hourly rate', error);
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
    throw new Error('End time must be later than start time.');
  }

  const formattedDateAvailableFrom = availableFrom
    ? availableFrom.toISOString().split('T')[0]
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
    console.error('Error updating availability status:', error);
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
      ? availableFromDate.toISOString().split('T')[0] // Format as yyyy-MM-dd
      : null; // Fallback to null if invalid
  }

  return result[0] || null;
}

export async function getFreelancerAbout(freelancer: Freelancer): Promise<string> {
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
    return result[0]?.about ? String(result[0].about) : '';
  } catch (error) {
    console.error('Error fetching freelancer about section', error);
    throw error; // Re-throw error for further handling
  }
}

export async function getFreelancerHourlyRate(freelancer: Freelancer): Promise<number> {
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
    console.error('Error fetching freelancer hourly rate', error);
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
      .leftJoin(languagesTable, eq(freelancerLanguagesTable.languageId, languagesTable.id))
      .where(eq(freelancerLanguagesTable.freelancerId, freelancerId));

    // console.log(
    //   "🔥 DATABASE: Fetched Languages for Freelancer",
    //   freelancerId,
    //   languages
    // );

    if (!languages) {
      throw new Error('Failed to get freelancer languages');
    }

    return languages ?? []; // Ensure it always returns an array
  } catch (error) {
    console.error('Error getting freelancer languages', error);
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
export async function fetchFreelancerSkills(freelancerId: number): Promise<FreelancerSkill[]> {
  // console.log('🔥 FREELANCER SERVER: Fetching skills for freelancer:', freelancerId);

  const skills = await db
    .select()
    .from(freelancerSkillsTable)
    .where(eq(freelancerSkillsTable.freelancerId, freelancerId));

  // console.log('🔥 FREELANCER SERVER: Raw skills from DB:', skills);

  // get skill labels from skills table
  const skillLabels = await db
    .select({ id: skillsTable.id, label: skillsTable.label })
    .from(skillsTable)
    .where(
      inArray(
        skillsTable.id,
        skills.map(skill => skill.skillId)
      )
    );

  // console.log('🔥 FREELANCER SERVER: Skill labels from DB:', skillLabels);

  // add skill labels to skills
  const freelancerSkills: FreelancerSkill[] = skills.map(skill => {
    const skillWithLabel = {
      skillId: skill.skillId,
      label: skillLabels.find(label => label.id === skill.skillId)?.label,
      yearsOfExperience: skill.yearsOfExperience,
      isStarred: skill.isStarred,
    };
    // console.log('🔥 FREELANCER SERVER: Processing skill:', skill, 'Result:', skillWithLabel);
    return skillWithLabel;
  });

  // console.log('🔥 FREELANCER SERVER: Final freelancer skills:', freelancerSkills);
  return freelancerSkills;
}

export async function createFreelancerIdentification(
  userId: number,
  attachmentsData: {
    identification?: File[];
    trade_license?: File[];
    filesToDelete?: number[];
  }
) {
  try {
    // Process files to delete if any
    if (attachmentsData.filesToDelete && attachmentsData.filesToDelete.length > 0) {
      // Delete the files from the attachments table
      for (const fileId of attachmentsData.filesToDelete) {
        try {
          await deleteAttachmentById(fileId);
        } catch (error) {
          console.error(`DEBUG - Error deleting attachment with ID ${fileId}:`, error);
          // Continue with other deletions even if one fails
        }
      }
    }

    // Save identification attachments to the attachments table
    let identificationIds: { success: boolean; data: number[] } = {
      success: true,
      data: [],
    };

    let tradeLicenseIds: { success: boolean; data: number[] } = {
      success: true,
      data: [],
    };

    if (attachmentsData.identification && attachmentsData.identification.length > 0) {
      // Make sure we're passing valid File objects to saveAttachments
      const validFiles = attachmentsData.identification.filter(
        file => file instanceof File && file.size > 0
      );

      if (validFiles.length > 0) {
        const result = await saveAttachments(validFiles, 'identification');

        // Check if the attachment uploads failed
        if (!result.success) {
          throw new Error('Failed to save attachments');
        }

        identificationIds = { success: true, data: result.data || [] };
      }
    }

    // Process trade license files if provided
    if (attachmentsData.trade_license && attachmentsData.trade_license.length > 0) {
      // Make sure we're passing valid File objects to saveAttachments
      const validFiles = attachmentsData.trade_license.filter(
        file => file instanceof File && file.size > 0
      );

      if (validFiles.length > 0) {
        const result = await saveAttachments(validFiles, 'trade_license');

        // Check if the attachment uploads failed
        if (!result.success) {
          throw new Error('Failed to save trade license attachments');
        }

        tradeLicenseIds = { success: true, data: result.data || [] };
      }
    }

    // Prepare the attachments object with only the new attachments
    const attachments = {
      identification: identificationIds.data || [],
      trade_license: tradeLicenseIds.data || [],
    };

    // Check if a record already exists for this user
    const existingRecord = await db
      .select()
      .from(userIdentificationsTable)
      .where(eq(userIdentificationsTable.userId, userId))
      .limit(1);

    let result;

    if (existingRecord.length > 0) {
      // Update existing record
      result = await db
        .update(userIdentificationsTable)
        .set({
          attachments,
          updatedAt: new Date(),
        })
        .where(eq(userIdentificationsTable.userId, userId))
        .returning();
    } else {
      // Insert new record
      result = await db
        .insert(userIdentificationsTable)
        .values({
          userId,
          attachments,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();
    }

    return { success: true, data: result[0] };
  } catch (error) {
    console.error('Error creating freelancer identification:', error);
    return { success: false, error };
  }
}

export async function getFreelancerIdentification(userId: number) {
  try {
    // console.log('DEBUG - getFreelancerIdentification called with userId:', userId);

    const result = await db
      .select()
      .from(userIdentificationsTable)
      .where(eq(userIdentificationsTable.userId, userId));

    // console.log(
    //   'DEBUG - Raw DB result for freelancer identification:',
    //   JSON.stringify(result, null, 2)
    // );

    // Check if we have the expected data format
    // if (result.length > 0) {
    //   console.log(
    //     'DEBUG - Freelancer attachments found:',
    //     result[0].attachments ? JSON.stringify(result[0].attachments, null, 2) : 'No attachments'
    //   );
    // } else {
    //   console.log('DEBUG - No freelancer identification record found for userId:', userId);
    // }

    return { success: true, data: result[0] || null };
  } catch (error) {
    console.error('Error getting freelancer identification:', error);
    return { success: false, error };
  }
}

export async function updateFreelancerIdentification(
  userId: number,
  attachmentsData: {
    identification?: File[];
    trade_license?: File[];
    filesToDelete?: number[];
  }
) {
  try {
    // Get existing identification data
    const existingIdentification = await getFreelancerIdentification(userId);

    if (!existingIdentification.data) {
      // If no record exists, create a new one
      return createFreelancerIdentification(userId, attachmentsData);
    }

    // Get existing attachments
    const existingAttachments =
      (existingIdentification.data.attachments as {
        identification?: number[];
        trade_license?: number[];
      }) || {};

    // Initialize empty arrays if they don't exist
    if (!existingAttachments.identification) {
      existingAttachments.identification = [];
    }

    if (!existingAttachments.trade_license) {
      existingAttachments.trade_license = [];
    }

    // Process files to delete if any
    if (attachmentsData.filesToDelete && attachmentsData.filesToDelete.length > 0) {
      // Ensure all IDs are valid numbers
      const validFilesToDelete = attachmentsData.filesToDelete.filter(
        id => typeof id === 'number' && !isNaN(id) && id > 0
      );

      if (validFilesToDelete.length !== attachmentsData.filesToDelete.length) {
        console.warn(
          'DEBUG - Some filesToDelete IDs are invalid:',
          attachmentsData.filesToDelete.filter(
            id => !(typeof id === 'number' && !isNaN(id) && id > 0)
          )
        );
      }

      // Filter out deleted file IDs from existing attachments
      existingAttachments.identification = existingAttachments.identification.filter(id => {
        const keep = !validFilesToDelete.includes(id);
        if (!keep) console.log(`DEBUG - Removing ID ${id} from identification attachments`);
        return keep;
      });

      existingAttachments.trade_license = existingAttachments.trade_license.filter(id => {
        const keep = !validFilesToDelete.includes(id);
        if (!keep) console.log(`DEBUG - Removing ID ${id} from trade_license attachments`);
        return keep;
      });

      // Delete the files from the attachments table
      for (const fileId of validFilesToDelete) {
        try {
          await deleteAttachmentById(fileId);
        } catch (error) {
          console.error(`DEBUG - Error deleting attachment with ID ${fileId}:`, error);
          // Continue with other deletions even if one fails
        }
      }
    }

    // Save new attachments if provided
    let identificationIds: { success: boolean; data: number[] } = {
      success: true,
      data: [],
    };

    let tradeLicenseIds: { success: boolean; data: number[] } = {
      success: true,
      data: [],
    };

    if (attachmentsData.identification && attachmentsData.identification.length > 0) {
      // Make sure we're passing valid File objects to saveAttachments
      const validFiles = attachmentsData.identification.filter(
        file => file instanceof File && file.size > 0
      );

      if (validFiles.length > 0) {
        const result = await saveAttachments(validFiles, 'identification');

        if (!result.success) {
          throw new Error('Failed to save identification attachments');
        }
        identificationIds = { success: true, data: result.data || [] };
      }
    }

    // Process trade license files if provided
    if (attachmentsData.trade_license && attachmentsData.trade_license.length > 0) {
      // Make sure we're passing valid File objects to saveAttachments
      const validFiles = attachmentsData.trade_license.filter(
        file => file instanceof File && file.size > 0
      );

      if (validFiles.length > 0) {
        const result = await saveAttachments(validFiles, 'trade_license');

        if (!result.success) {
          throw new Error('Failed to save trade license attachments');
        }
        tradeLicenseIds = { success: true, data: result.data || [] };
      }
    }

    // Combine existing and new attachment IDs, ensuring no duplicates
    const updatedAttachments = {
      identification: [
        ...new Set([...existingAttachments.identification, ...identificationIds.data]),
      ],
      trade_license: [...new Set([...existingAttachments.trade_license, ...tradeLicenseIds.data])],
    };

    // Update the identification record with combined attachment IDs
    const result = await db
      .update(userIdentificationsTable)
      .set({
        attachments: updatedAttachments,
        updatedAt: new Date(),
      })
      .where(eq(userIdentificationsTable.userId, userId))
      .returning();

    return { success: true, data: result[0] };
  } catch (error) {
    console.error('Error updating freelancer identification:', error);
    return { success: false, error };
  }
}

export async function updateFreelancerAccountStatusToPending(accountId: number) {
  try {
    const result = await db
      .update(accountsTable)
      .set({
        accountStatus: 'pending',
      })
      .where(eq(accountsTable.id, accountId))
      .returning();

    return { success: true, data: result[0] };
  } catch (error) {
    console.error('Error updating freelancer account status:', error);
    return { success: false, error };
  }
}
