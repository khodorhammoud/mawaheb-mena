import EmployerOnboardingScreen from "./employer";
import FreelancerOnboardingScreen from "./freelancer";
import { redirect, useLoaderData } from "@remix-run/react";
import { AccountType } from "~/types/enums";
import {
  getCurrentProfileInfo,
  getCurrentUserAccountType,
  getCurrentUserAccountInfo,
} from "~/servers/user.server";
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import {
  CertificateFormFieldType,
  EducationFormFieldType,
  Employer,
  Freelancer,
  PortfolioFormFieldType,
  WorkHistoryFormFieldType,
} from "~/types/User";
import { requireUserVerified } from "~/auth/auth.server";
import {
  getAccountBio,
  getEmployerIndustries,
  getAllIndustries,
  getEmployerYearsInBusiness,
  getEmployerBudget,
  getEmployerAbout,
  getEmployerDashboardData,
  checkUserExists,
  updateOnboardingStatus,
  updateAccountBio,
  updateEmployerIndustries,
  updateEmployerYearsInBusiness,
  updateEmployerBudget,
  updateEmployerAbout,
  getFreelancerAbout,
  updateFreelancerAbout,
  updateFreelancerHourlyRate,
  updateFreelancerYearsOfExperience,
  updateFreelancerVideoLink,
  updateFreelancerPortfolio,
  updateFreelancerWorkHistory,
  updateFreelancerCertificates,
  updateFreelancerEducation,
  getFreelancerLanguages,
  getAllLanguages,
  getFreelancerAvailability,
  saveAvailability,
  updateAvailabilityStatus,
} from "~/servers/employer.server";
import { uploadFile, deleteFile } from "~/servers/cloudStorage.server";
import {
  saveAttachment,
  deletePreviousAttachmentByFieldId,
  getPreviousAttachmentByFieldId,
  deleteAttachmentById,
  getAttachmentByKey,
} from "~/servers/attachment.server";
import { AttachmentBelongsTo } from "~/types/enums";

export async function action({ request }: ActionFunctionArgs) {
  // user must be verified
  await requireUserVerified(request);
  try {
    const formData = await request.formData(); // always do this :)
    const target = formData.get("target-updated"); // for the switch, to not use this sentence 2 thousand times :)
    const currentProfile = await getCurrentProfileInfo(request);
    const currentAccount = await getCurrentUserAccountInfo(request);

    const userId = currentProfile.account.user.id;
    const accountType = currentProfile.account.accountType;
    const accountId = currentAccount.id;

    const file = formData.get("file") as File;

    if (file) {
      try {
        const fieldId = parseInt(formData.get("fieldId") as string, 10); // Get fieldId
        let belongsTo: AttachmentBelongsTo;

        if (target === "freelancer-portfolio") {
          belongsTo = AttachmentBelongsTo.Portfolio;
        } else if (target === "freelancer-certificates") {
          belongsTo = AttachmentBelongsTo.Certificate;
        } else {
          belongsTo = "generic" as AttachmentBelongsTo;
        }

        // Get previous attachment for the same fieldId
        const previousAttachment = await getPreviousAttachmentByFieldId(
          belongsTo,
          accountId,
          fieldId
        );

        // THIS IS NOT WOTKING, AND THE PREVIOUS FILE IN S3 BUCKET IS NOT BEING DELETED :)))))))))
        // THIS IS NOT WOTKING, AND THE PREVIOUS FILE IN S3 BUCKET IS NOT BEING DELETED :)))))))))
        // THIS IS NOT WOTKING, AND THE PREVIOUS FILE IN S3 BUCKET IS NOT BEING DELETED :)))))))))
        // THIS IS NOT WOTKING, AND THE PREVIOUS FILE IN S3 BUCKET IS NOT BEING DELETED :)))))))))
        if (previousAttachment) {
          // Delete the old file from S3
          await deleteFile(previousAttachment.bucket, previousAttachment.key);

          // Remove the old attachment record from the database
          await deleteAttachmentById(previousAttachment.id);
        }
      } catch (uploadError) {
        console.error("File upload failed:", uploadError);
        return Response.json({
          success: false,
          error: { message: "File upload failed." },
          status: 500,
        });
      }
    }

    // AVAILABILITY
    if (target === "freelancer-availability") {
      const availableForWork = formData.get("available_for_work") === "true"; //true
      const availableFromInput = formData.get("available_from") as
        | string
        | null; // calender string -> date (khodor)
      const hoursAvailableFrom = formData.get("hours_available_from") as string; // from
      const hoursAvailableTo = formData.get("hours_available_to") as string; // to
      const jobsOpenToArray = formData.getAll("jobs_open_to[]") as string[]; // carry array

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

      // Determine availableFrom value
      const availableFrom = availableFromInput
        ? new Date(availableFromInput)
        : new Date(); // Default to today's date if no input is provided

      const result = await saveAvailability({
        accountId,
        availableForWork,
        jobsOpenTo: jobsOpenToArray,
        availableFrom,
        hoursAvailableFrom,
        hoursAvailableTo,
      });

      // console.log("Save Result:", result);

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

    if (target === "freelancer-is-available-for-work") {
      const availableForWork = formData.get("available_for_work") === "true";

      // Call the query function to update availability status
      const result = await updateAvailabilityStatus(
        accountId,
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

    // EMPLOYER
    if (accountType == AccountType.Employer) {
      const employer = currentProfile as Employer;

      // ABOUT
      if (target == "employer-about") {
        const aboutContent = formData.get("about") as string;
        const aboutStatus = await updateEmployerAbout(employer, aboutContent);
        return Response.json({ success: aboutStatus.success });
      }

      // BIO
      if (target == "employer-bio") {
        const bio = {
          firstName: formData.get("firstName") as string,
          lastName: formData.get("lastName") as string,
          location: formData.get("location") as string,
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
        // Validate required fields
        if (!bio.firstName || !bio.lastName || !bio.location) {
          return Response.json(
            { success: false, error: { message: "All fields are required." } },
            { status: 400 }
          );
        }

        const bioStatus = await updateAccountBio(bio, employer.account);
        return Response.json({ success: bioStatus.success });
      }

      // INDUSTRIES
      if (target == "employer-industries") {
        const industries = formData.get("employer-industries") as string;
        const industriesIds = industries
          .split(",")
          .map((industry) => parseInt(industry));
        const industriesStatus = await updateEmployerIndustries(
          employer,
          industriesIds
        );
        return Response.json({ success: industriesStatus.success });
      }

      // YEARS IN BUSINESS
      if (target === "employer-years-in-business") {
        const yearsInBusiness = parseInt(
          formData.get("yearsInBusiness") as string
        );

        if (isNaN(yearsInBusiness)) {
          return Response.json({
            success: true,
          });
        }

        const yearsStatus = await updateEmployerYearsInBusiness(
          employer,
          yearsInBusiness
        );

        if (yearsStatus.success) {
          return Response.json({ success: true });
        } else {
          return Response.json({
            success: false,
            error: { message: "Failed to update years in business" },
          });
        }
      }

      // BUDGET
      if (target === "employer-budget") {
        const budgetValue = formData.get("employerBudget");
        const budget = parseInt(budgetValue as string, 10);

        // ✅ Treat 0 as an empty value and save null to the DB
        if (isNaN(budget) || budget === 0) {
          await updateEmployerBudget(employer, null);
          return Response.json({ success: true });
        }

        // Proceed to update if the budget is valid
        const budgetStatus = await updateEmployerBudget(employer, budget);

        if (budgetStatus.success) {
          return Response.json({ success: true });
        } else {
          return Response.json({
            success: false,
            error: { message: "Failed to update employer budget" },
          });
        }
      }

      // ONBOARDING -> TRUE ✅
      if (target == "employer-onboard") {
        const userExists = await checkUserExists(userId);
        if (!userExists.length) {
          console.warn("User not found.");
          return Response.json({
            success: false,
            error: { message: "User not found." },
            status: 404,
          });
        }

        const result = await updateOnboardingStatus(userId);
        return result.length
          ? redirect("/dashboard")
          : Response.json({
              success: false,
              error: { message: "Failed to update onboarding status" },

              status: 500,
            });
      }
    }

    // NOTE: if any submission code in the action of the freelancer accountType made problems, go to FormFields.tsx inside onboarding-form-component
    // FREELANCER
    if (accountType == AccountType.Freelancer) {
      const freelancer = currentProfile as Freelancer;

      // HOURLY RATE
      if (target == "freelancer-hourly-rate") {
        const hourlyRate = parseInt(formData.get("hourlyRate") as string, 10);
        const hourlyRateStatus = await updateFreelancerHourlyRate(
          freelancer,
          hourlyRate
        );
        return Response.json({ success: hourlyRateStatus.success });
      }

      // YEARS OF EXPERIENCE
      if (target == "freelancer-years-of-experience") {
        const yearsExperience =
          parseInt(formData.get("yearsOfExperience") as string) || 0;
        const yearsStatus = await updateFreelancerYearsOfExperience(
          freelancer,
          yearsExperience
        );
        return Response.json({ success: yearsStatus.success });
      }

      // ABOUT
      if (target == "freelancer-about") {
        const aboutContent = formData.get("about") as string;
        const aboutStatus = await updateFreelancerAbout(
          freelancer,
          aboutContent
        );

        return Response.json({ success: aboutStatus.success });
      }

      // VIDEO LINK
      if (target == "freelancer-video") {
        const videoLink = formData.get("videoLink") as string;

        console.log("Received videoLink:", videoLink);

        if (!videoLink) {
          return Response.json({
            success: false,
            error: "videoLink is empty or undefined",
          });
        }

        const videoStatus = await updateFreelancerVideoLink(
          freelancer.accountId,
          videoLink
        );
        return Response.json({ success: videoStatus.success });
      }

      // BIO
      if (target == "freelancer-bio") {
        const bio = {
          firstName: formData.get("firstName") as string,
          lastName: formData.get("lastName") as string,
          location: formData.get("location") as string,
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

      // PORTFOLIO
      if (target === "freelancer-portfolio") {
        // console.log("Processing portfolio data...");

        const portfolio = formData.get("portfolio") as string;
        if (!portfolio) {
          console.error("Portfolio data is missing from formData.");
          return Response.json(
            {
              success: false,
              error: { message: "Portfolio data is missing." },
            },
            { status: 400 }
          );
        }

        try {
          // console.log("Parsing portfolio data:", portfolio);
          const portfolioParsed = JSON.parse(
            portfolio
          ) as PortfolioFormFieldType[];
          // console.log("Parsed portfolio data:", portfolioParsed);

          for (let index = 0; index < portfolioParsed.length; index++) {
            // console.log(`Processing portfolio entry at index ${index}...`);

            const fieldIdRaw = formData.get(`fieldId[${index}]`);
            let fieldId: number;

            if (fieldIdRaw) {
              fieldId = parseInt(fieldIdRaw as string, 10);
              if (isNaN(fieldId)) {
                console.error(
                  `Invalid fieldId for index ${index}:`,
                  fieldIdRaw
                );
                return Response.json(
                  {
                    success: false,
                    error: {
                      message: `Invalid fieldId for portfolio entry at index ${index}`,
                    },
                  },
                  { status: 400 }
                );
              }
            } else {
              console.warn(
                `Missing fieldId for index ${index}. Generating fallback...`
              );
              fieldId = index + 1;
            }
            // console.log(`Field ID for index ${index}:`, fieldId);

            const portfolioImage = formData.get(
              `portfolio-attachment[${index}]`
            ) as File;

            if (portfolioImage) {
              console.log(`Uploading file for portfolio index ${index}...`);

              try {
                const uploadedMetadata = await uploadFile(
                  "portfolio",
                  portfolioImage
                );
                // console.log("Uploaded metadata:", uploadedMetadata);

                // console.log(
                // `Deleting previous attachment for fieldId ${fieldId}...`
                // );
                await deletePreviousAttachmentByFieldId(
                  AttachmentBelongsTo.Portfolio,
                  freelancer.accountId,
                  fieldId,
                  uploadedMetadata.key
                );

                // console.log("Saving new attachment metadata...");
                await saveAttachment(
                  uploadedMetadata.key,
                  uploadedMetadata.bucket,
                  uploadedMetadata.url,
                  AttachmentBelongsTo.Portfolio,
                  freelancer.accountId,
                  fieldId
                );

                // console.log(
                // `Attachment saved successfully for index ${index}.`
                // );

                portfolioParsed[index].projectImageUrl = uploadedMetadata.url;
                portfolioParsed[index].projectImageName = portfolioImage.name;
                portfolioParsed[index].attachmentName = portfolioImage.name;
              } catch (uploadError) {
                console.error(
                  `Error uploading or saving file for index ${index}:`,
                  uploadError
                );
                throw new Error(`Failed to process file for index ${index}`);
              }
            } else {
              console.warn(`No file provided for portfolio index ${index}`);
              portfolioParsed[index].projectImageUrl = "";
              portfolioParsed[index].projectImageName = "";
              portfolioParsed[index].attachmentName = "";
            }
          }

          // console.log("Updating portfolio data in the database...");
          const portfolioStatus = await updateFreelancerPortfolio(
            freelancer,
            portfolioParsed
          );
          // console.log("Portfolio updated successfully:", portfolioStatus);

          return Response.json({ success: portfolioStatus.success });
        } catch (error) {
          console.error("Error processing portfolio data:", error);
          return Response.json(
            {
              success: false,
              error: { message: "Invalid portfolio data." },
            },
            { status: 400 }
          );
        }
      }

      // CERTIFICATES
      if (target === "freelancer-certificates") {
        console.log("Processing certificates data...");

        const certificates = formData.get("certificates") as string;
        if (!certificates) {
          console.error("Certificates data is missing from formData.");
          return Response.json(
            {
              success: false,
              error: { message: "Certificates data is missing." },
            },
            { status: 400 }
          );
        }

        try {
          console.log("Parsing certificates data:", certificates);
          const certificatesParsed = JSON.parse(
            certificates
          ) as CertificateFormFieldType[];
          console.log("Parsed certificates data:", certificatesParsed);

          for (let index = 0; index < certificatesParsed.length; index++) {
            console.log(`Processing certificate entry at index ${index}...`);

            // Attempt to retrieve fieldId from formData
            const fieldIdRaw = formData.get(`fieldId[${index}]`);
            let fieldId: number;

            if (fieldIdRaw) {
              fieldId = parseInt(fieldIdRaw as string, 10);
              if (isNaN(fieldId)) {
                console.error(
                  `Invalid fieldId for index ${index}:`,
                  fieldIdRaw
                );
                return Response.json(
                  {
                    success: false,
                    error: {
                      message: `Invalid fieldId for certificate entry at index ${index}`,
                    },
                  },
                  { status: 400 }
                );
              }
            } else {
              // If fieldId is missing, log and generate a fallback
              console.warn(
                `Missing fieldId for index ${index}. Generating fallback...`
              );
              fieldId = index + 1; // Assign a fallback fieldId (e.g., index + 1)
            }
            console.log(`Field ID for index ${index}:`, fieldId);

            const certificateFile = formData.get(
              `certificates-attachment[${index}]`
            ) as File;

            if (certificateFile) {
              console.log(`Uploading file for certificate index ${index}...`);

              try {
                const uploadedMetadata = await uploadFile(
                  "certificates",
                  certificateFile
                );
                console.log("Uploaded metadata:", uploadedMetadata);

                // Delete previous attachment for this specific fieldId
                console.log(
                  `Deleting previous attachment for fieldId ${fieldId}...`
                );
                await deletePreviousAttachmentByFieldId(
                  AttachmentBelongsTo.Certificate,
                  freelancer.accountId,
                  fieldId,
                  uploadedMetadata.key
                );

                // Save the new attachment metadata to the database
                console.log("Saving new attachment metadata...");
                await saveAttachment(
                  uploadedMetadata.key,
                  uploadedMetadata.bucket,
                  uploadedMetadata.url,
                  AttachmentBelongsTo.Certificate,
                  freelancer.accountId,
                  fieldId
                );

                console.log(
                  `Attachment saved successfully for index ${index}.`
                );

                // Update the parsed certificates entry with the new file details
                certificatesParsed[index].attachmentUrl = uploadedMetadata.url;
              } catch (uploadError) {
                console.error(
                  `Error uploading or saving file for index ${index}:`,
                  uploadError
                );
                throw new Error(`Failed to process file for index ${index}`);
              }
            } else {
              console.warn(`No file provided for certificate index ${index}`);
              // Clear old fields if no new file is provided
              certificatesParsed[index].attachmentUrl = "";
            }
          }

          console.log("Updating certificates data in the database...");
          const certificatesStatus = await updateFreelancerCertificates(
            freelancer,
            certificatesParsed
          );
          console.log("Certificates updated successfully:", certificatesStatus);

          return Response.json({ success: certificatesStatus.success });
        } catch (error) {
          console.error("Error processing certificates data:", error);
          return Response.json(
            {
              success: false,
              error: { message: "Invalid certificates data." },
            },
            { status: 400 }
          );
        }
      }

      // EDUCATION
      if (target == "freelancer-educations") {
        const education = formData.get("educations") as string;
        try {
          const educationParsed = JSON.parse(
            education
          ) as EducationFormFieldType[];
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

      // WORK HISTORY
      if (target == "freelancer-work-history") {
        const workHistory = formData.get("workHistory") as string;
        let workHistoryParsed: WorkHistoryFormFieldType[];
        try {
          workHistoryParsed = JSON.parse(
            workHistory
          ) as WorkHistoryFormFieldType[];
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

      // ONBOARDING -> TRUE ✅
      if (target == "freelancer-onboard") {
        const userExists = await checkUserExists(userId);
        if (!userExists.length) {
          console.warn("User not found 2.");
          return Response.json({
            success: false,
            error: { message: "User not found." },
            status: 404,
          });
        }

        const result = await updateOnboardingStatus(userId);
        return result.length
          ? redirect("/dashboard")
          : Response.json({
              success: false,
              error: { message: "Failed to update onboarding status" },

              status: 500,
            });
      }
    }
    // DEFAULT
    throw new Error("Unknown target update");
  } catch (error) {
    console.error("Error while updating onboarding status", error);
    return Response.json({
      success: false,
      error: { message: "An unexpected error occurred." },
      status: 500,
    });
  }
}

export async function loader({ request }: LoaderFunctionArgs) {
  // Ensure the user is verified
  await requireUserVerified(request);

  // Get the account type and profile info
  const accountType = await getCurrentUserAccountType(request);
  let profile = await getCurrentProfileInfo(request);

  if (!profile) {
    return Response.json({
      success: false,
      error: { message: "Profile information not found." },
      status: 404,
    });
  }

  // Redirect to dashboard if already onboarded
  if (profile.account?.user?.isOnboarded) {
    return redirect("/dashboard");
  }

  if (accountType === AccountType.Employer) {
    profile = profile as Employer;

    const bioInfo = await getAccountBio(profile.account);
    const employerIndustries = await getEmployerIndustries(profile);
    const allIndustries = await getAllIndustries();
    const yearsInBusiness = await getEmployerYearsInBusiness(profile);
    const employerBudget = await getEmployerBudget(profile);
    const about = await getEmployerAbout(profile);
    const { activeJobCount, draftedJobCount, closedJobCount } =
      await getEmployerDashboardData(request);
    const totalJobCount = activeJobCount + draftedJobCount + closedJobCount;

    return Response.json({
      accountType,
      bioInfo,
      employerIndustries,
      allIndustries,
      currentProfile: profile,
      yearsInBusiness,
      employerBudget,
      about,
      accountOnboarded: profile.account.user.isOnboarded,
      activeJobCount,
      draftedJobCount,
      closedJobCount,
      totalJobCount,
    });
  } else if (accountType === AccountType.Freelancer) {
    profile = profile as Freelancer;

    const bioInfo = await getAccountBio(profile.account);
    const about = await getFreelancerAbout(profile);
    const { videoLink } = profile;
    let portfolio = profile.portfolio;

    // Fetch signed URLs for portfolio images
    if (portfolio && Array.isArray(portfolio)) {
      portfolio = await Promise.all(
        portfolio.map(async (item) => {
          if (item.projectImageName) {
            try {
              const attachment = await getAttachmentByKey(
                item.projectImageName
              ); // Fetch the attachment
              return {
                ...item,
                projectImageUrl: attachment.url, // URL from the database
                icon: attachment.icon, // Icon type (e.g., "pdf", "image")
              };
            } catch (error) {
              console.error(
                `Error fetching attachment for: ${item.projectImageName}`,
                error
              );
              // Fallback in case of error
              return {
                ...item,
                projectImageUrl:
                  "https://www.fivebranches.edu/wp-content/uploads/2021/08/default-image.jpg",
                icon: "default",
              };
            }
          }
          return item; // Return unchanged if no projectImageName
        })
      );
    }

    const certificates = profile.certificates;
    const educations = profile.educations;
    const workHistory = profile.workHistory;

    const freelancerLanguages = await getFreelancerLanguages(profile.id);
    const allLanguages = await getAllLanguages();

    const freelancerAvailability = await getFreelancerAvailability(
      profile.accountId
    );

    const availabilityData = {
      availableForWork: freelancerAvailability?.availableForWork ?? false,
      jobsOpenTo: freelancerAvailability?.jobsOpenTo ?? [],
      availableFrom: freelancerAvailability?.availableFrom
        ? new Date(freelancerAvailability.availableFrom)
            .toISOString()
            .split("T")[0]
        : "",
      hoursAvailableFrom: freelancerAvailability?.hoursAvailableFrom ?? "",
      hoursAvailableTo: freelancerAvailability?.hoursAvailableTo ?? "",
    };

    return Response.json({
      accountType,
      bioInfo,
      currentProfile: profile,
      about,
      videoLink,
      hourlyRate: profile.hourlyRate,
      accountOnboarded: profile.account.user.isOnboarded,
      yearsOfExperience: profile.yearsOfExperience,
      portfolio,
      certificates,
      educations,
      workHistory,
      freelancerAvailability: availabilityData,
      freelancerLanguages,
      allLanguages,
    });
  }

  return Response.json({
    success: false,
    error: { message: "Account type not found." },
    status: 404,
  });
}

// Layout component
export default function Layout() {
  const { accountType } = useLoaderData<{
    accountType: AccountType;
  }>();

  return (
    <div>
      {/* adding the header like that shall be temporary, and i shall ask about it */}
      {accountType === AccountType.Employer ? (
        <EmployerOnboardingScreen />
      ) : (
        <FreelancerOnboardingScreen />
      )}
    </div>
  );
}
