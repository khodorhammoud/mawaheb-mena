import EmployerOnboardingScreen from "./employer";
import FreelancerOnboardingScreen from "./freelancer";
import { redirect, useLoaderData } from "@remix-run/react";
import { AccountType } from "~/types/enums";
import {
  getCurrentProfileInfo,
  getCurrentUserAccountType,
  getCurrentUserAccountInfo,
} from "~/servers/user.server";
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  TypedResponse,
} from "@remix-run/node";
import {
  CertificateFormFieldType,
  EducationFormFieldType,
  Employer,
  Freelancer,
  LoaderFunctionError,
  OnboardingEmployerFields,
  OnboardingFreelancerFields,
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

export async function action({ request }: ActionFunctionArgs) {
  // user must be verified
  await requireUserVerified(request);
  try {
    const formData = await request.formData(); // always do this :)
    const target = formData.get("target-updated"); // for the switch, to not use this sentence 2 thousand times :)
    const currentProfile = await getCurrentProfileInfo(request);

    const userId = currentProfile.account.user.id;
    const accountType = currentProfile.account.accountType;
    const currentAccount = await getCurrentUserAccountInfo(request);
    const accountId = currentAccount.id;

    // AVAILABILITY
    if (target === "freelancer-availability") {
      const availableForWork = formData.get("available_for_work") === "true"; //true
      const availableFrom = formData.get("available_from"); // calender string -> date (khodor)
      const hoursAvailableFrom = formData.get("hours_available_from"); // from
      const hoursAvailableTo = formData.get("hours_available_to"); // to
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

      // transfer the string date, into an actual date
      const availableFromAsADate = new Date(availableFrom as string);

      const result = await saveAvailability({
        accountId,
        availableForWork,
        jobsOpenTo: jobsOpenToArray,
        availableFrom: availableFromAsADate,
        hoursAvailableFrom: hoursAvailableFrom as string,
        hoursAvailableTo: hoursAvailableTo as string,
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
      if (target == "freelancer-portfolio") {
        const portfolio = formData.get("portfolio") as string;

        try {
          const portfolioParsed = JSON.parse(
            portfolio
          ) as PortfolioFormFieldType[];

          const portfolioImages: File[] = [];
          // iterate over indexes of portfolioParsed and get the file type from the form
          for (let index = 0; index < portfolioParsed.length; index++) {
            const portfolioImage = formData.get(
              `portfolio-attachment[${index}]`
            ) as unknown as File;
            portfolioImages.push(portfolioImage ?? new File([], ""));
          }
          const portfolioStatus = await updateFreelancerPortfolio(
            freelancer,
            portfolioParsed,
            portfolioImages
          );
          return Response.json({ success: portfolioStatus.success });
        } catch (error) {
          return Response.json({
            success: false,
            error: { message: "Invalid portfolio data." },
            status: 400,
          });
        }
      }

      // CERTIFICATES
      if (target == "freelancer-certificates") {
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

    // Fetch data for the employer
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

    // Fetch data for the freelancer
    const bioInfo = await getAccountBio(profile.account);
    const about = await getFreelancerAbout(profile);
    const { videoLink } = profile;
    const portfolio = profile.portfolio;
    const certificates = profile.certificates;
    const educations = profile.educations;
    const workHistory = profile.workHistory;

    // Fetch freelancer-specific data
    const freelancerLanguages = await getFreelancerLanguages(profile.id);
    const allLanguages = await getAllLanguages();

    // Get the freelancer availability data
    const freelancerAvailability = await getFreelancerAvailability(
      profile.accountId
    );

    // Ensure all necessary data is returned
    const availabilityData = {
      availableForWork: freelancerAvailability?.availableForWork ?? false,
      jobsOpenTo: freelancerAvailability?.jobsOpenTo ?? [],
      availableFrom: freelancerAvailability?.availableFrom ?? "",
      hoursAvailableFrom: freelancerAvailability?.hoursAvailableFrom ?? "09:00",
      hoursAvailableTo: freelancerAvailability?.hoursAvailableTo ?? "17:00",
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
