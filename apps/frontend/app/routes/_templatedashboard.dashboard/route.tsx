import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  redirect,
  TypedResponse,
} from "@remix-run/node";
import {
  getCurrentProfileInfo,
  getCurrentUserAccountType,
  getCurrentUser,
} from "~/servers/user.server";
import {
  CertificateFormFieldType,
  EducationFormFieldType,
  LoaderFunctionError,
  OnboardingEmployerFields,
  OnboardingFreelancerFields,
  PortfolioFormFieldType,
  WorkHistoryFormFieldType,
  Employer,
  Freelancer,
} from "~/types/User";
import EmployerDashboard from "./employer";
import FreelancerDashboard from "./freelancer";
import { useLoaderData } from "@remix-run/react";
import { AccountType, JobStatus } from "~/types/enums";
import {
  getAllIndustries,
  getAccountBio,
  getEmployerIndustries,
  updateAccountBio,
  updateEmployerIndustries,
  updateEmployerYearsInBusiness,
  getEmployerYearsInBusiness,
  getEmployerBudget,
  updateEmployerBudget,
  updateEmployerAbout,
  getEmployerAbout,
  checkUserExists,
  updateOnboardingStatus,
  getEmployerDashboardData,
  getFreelancerAbout,
  updateFreelancerAbout,
  updateFreelancerHourlyRate,
  updateFreelancerYearsOfExperience,
  updateFreelancerVideoLink,
  updateFreelancerPortfolio,
  updateFreelancerWorkHistory,
  updateFreelancerCertificates,
  updateFreelancerEducation,
} from "~/servers/employer.server";
import Header from "../_templatedashboard/header";
import { requireUserOnboarded } from "~/auth/auth.server";
import { Job } from "~/types/Job";
import { createJobPosting } from "~/servers/job.server";

export async function action({ request }: ActionFunctionArgs) {
  try {
    const formData = await request.formData(); // always do this :)
    const target = formData.get("target-updated"); // for the if and else, to not use this sentence 2 thousand times :)
    const currentUser = await getCurrentUser(request);
    const userId = currentUser.id;
    const employer = (await getCurrentProfileInfo(request)) as Employer;

    const currentProfile = await getCurrentProfileInfo(request);
    const accountType = currentProfile.account.accountType;

    // EMPLOYER
    if (accountType == AccountType.Employer) {
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
      if (target == "years-in-business") {
        const fetchedValue = formData.get("years-in-business");
        const yearsInBusiness = parseInt(fetchedValue as string) || 0;

        const yearsStatus = await updateEmployerYearsInBusiness(
          employer,
          yearsInBusiness
        );
        return Response.json({ success: yearsStatus.success });
      }
      // BUDGET
      if (target == "employer-budget") {
        const budgetValue = formData.get("budget");
        const budget = parseInt(budgetValue as string, 10);

        const budgetStatus = await updateEmployerBudget(employer, budget);
        return Response.json({ success: budgetStatus.success });
      }
      // ONBOARDING -> TRUE ✅
      if (target == "employer-onboard") {
        const userExists = await checkUserExists(userId);
        if (!userExists.length) {
          console.warn("User not found.");
          return Response.json(
            { success: false, error: { message: "User not found." } },
            { status: 404 }
          );
        }

        const result = await updateOnboardingStatus(userId);
        return result.length
          ? redirect("/dashboard")
          : Response.json(
              {
                success: false,
                error: { message: "Failed to update onboarding status" },
              },
              { status: 500 }
            );
      }
      if (target == "post-job") {
        // TODO: Add validation for the form fields
        const jobData: Job = {
          employerId: employer.id,
          title: formData.get("jobTitle") as string,
          description: formData.get("jobDescription") as string,
          workingHoursPerWeek:
            parseInt(formData.get("workingHours") as string, 10) || 0,
          locationPreference: formData.get("location") as string,
          requiredSkills: (formData.get("skills") as string)
            .split(",")
            .map((skill) => ({ name: skill.trim(), isStarred: false })),

          projectType: formData.get("projectType") as string,
          budget: parseInt(formData.get("budget") as string, 10) || 0,
          experienceLevel: formData.get("experienceLevel") as string,
          status: JobStatus.Active,
        };

        const jobStatus = await createJobPosting(jobData);

        if (jobStatus.success) {
          return redirect("/dashboard");
        } else {
          return Response.json(
            {
              success: false,
              error: { message: "Failed to create job posting" },
            },
            { status: 500 }
          );
        }
      }
    }

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
        const yearsExperience = parseInt(
          formData.get("yearsOfExperience") as string
        );

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
        const videoStatus = await updateFreelancerVideoLink(
          freelancer.id,
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
    return Response.json(
      { success: false, error: { message: "An unexpected error occurred." } },
      { status: 500 }
    );
  }
}

export async function loader({
  request,
}: LoaderFunctionArgs): Promise<
  | TypedResponse<OnboardingEmployerFields>
  | TypedResponse<OnboardingFreelancerFields>
  | TypedResponse<LoaderFunctionError>
  | TypedResponse<never>
> {
  // Require that the current user is verified
  await requireUserOnboarded(request);

  // Determine the account type (freelancer/employer)
  const accountType: AccountType = await getCurrentUserAccountType(request);

  // Get the current profile
  const currentProfile = await getCurrentProfileInfo(request);

  const currentUser = await getCurrentUser(request);
  if (!currentUser) {
    throw new Error("User not authenticated");
  }
  // Determine if the current user owns the account
  const isOwner = currentProfile.account.user.id === currentUser.id;

  const accountOnboarded = currentProfile?.account?.user?.isOnboarded;
  const bioInfo = await getAccountBio(currentProfile.account);

  let correntProfile = await getCurrentProfileInfo(request);

  if (accountType === AccountType.Employer) {
    correntProfile = correntProfile as Employer;
    const employerIndustries = await getEmployerIndustries(correntProfile);
    const allIndustries = (await getAllIndustries()) || [];
    const yearsInBusiness = await getEmployerYearsInBusiness(correntProfile);
    const employerBudget = await getEmployerBudget(correntProfile);
    const aboutContent = await getEmployerAbout(correntProfile);
    const { activeJobCount, draftedJobCount, closedJobCount } =
      await getEmployerDashboardData(request);

    const totalJobCount = activeJobCount + draftedJobCount + closedJobCount;

    return Response.json({
      accountType,
      bioInfo,
      employerIndustries,
      allIndustries,
      currentUser: currentProfile,
      yearsInBusiness,
      employerBudget,
      aboutContent,
      accountOnboarded,
      activeJobCount,
      draftedJobCount,
      closedJobCount,
      totalJobCount,
      isOwner, // Added isOwner
      canEdit: false, // Employers cannot edit
    });
  } else if (accountType === AccountType.Freelancer) {
    const profile = currentProfile as Freelancer;

    // Fetch all the necessary data safely
    const about = await getFreelancerAbout(profile);
    const { videoLink } = profile;
    const portfolio = profile.portfolio as PortfolioFormFieldType[];
    const workHistory = profile.workHistory as WorkHistoryFormFieldType[];

    return Response.json({
      accountType,
      bioInfo,
      currentProfile: profile,
      about,
      videoLink,
      hourlyRate: profile.hourlyRate,
      accountOnboarded: profile.account.user.isOnboarded,
      yearsOfExperience: profile.yearsOfExperience,
      educations: profile.educations,
      certificates: profile.certificates,
      portfolio,
      workHistory,
      isOwner, // Added isOwner
      canEdit: isOwner, // Freelancers can edit if they are the owner
    });
  } else {
    return Response.json({
      accountType,
      currentUser: currentProfile,
      accountOnboarded: currentProfile.account?.user?.isOnboarded,
      bioInfo,
      isOwner, // Added isOwner
      canEdit: false, // Default to non-editable
    });
  }
}

// Layout component
export default function Layout() {
  const { accountType } = useLoaderData<{
    accountType: AccountType;
  }>();

  return (
    <div>
      {/* adding the header like that shall be temporary, and i shall ask about it */}
      <Header />
      {accountType === AccountType.Employer ? (
        <EmployerDashboard />
      ) : (
        <FreelancerDashboard />
      )}
    </div>
  );
}
