import { type FC } from "react";
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { getAccountBySlug } from "~/servers/user.server";
import { useLoaderData } from "@remix-run/react";
import { UserAccount } from "~/types/User";
import FreelancerPage from "./freelancer";
import EmployerPage from "./employer";
import { redirect } from "@remix-run/react";
import { AccountType } from "~/types/enums";
import {
  getCurrentProfileInfo,
  getCurrentUserAccountType,
} from "~/servers/user.server";
import { TypedResponse } from "@remix-run/node";
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
import { authenticator } from "~/auth/auth.server";
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
} from "~/servers/employer.server";
// import { getCurrentProfile } from "~/auth/session.server";

export async function action({ request }: ActionFunctionArgs) {
  try {
    const formData = await request.formData(); // always do this :)
    const target = formData.get("target-updated"); // for the switch, to not use this sentence 2 thousand times :)
    const currentUser = await getCurrentProfileInfo(request);

    const userId = currentUser.id;
    const accountType = currentUser.account.accountType;

    // EMPLOYER
    if (accountType == "employer") {
      const employer = (await getCurrentProfileInfo(request)) as Employer;

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
      if (target == "employer-years-in-business") {
        const yearsInBusiness =
          parseInt(formData.get("yearsInBusiness") as string) || 0;

        const yearsStatus = await updateEmployerYearsInBusiness(
          employer,
          yearsInBusiness
        );
        return Response.json({ success: yearsStatus.success });
      }
      // BUDGET
      if (target == "employer-budget") {
        const budgetValue = formData.get("employerBudget");
        const budget = parseInt(budgetValue as string, 10);

        const budgetStatus = await updateEmployerBudget(employer, budget);
        return Response.json({ success: budgetStatus.success });
      }
      // ONBOARDING -> TRUE ✅
      if (target == "employer-onboard") {
        const userId = currentUser.account.user.id;
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
    }

    // FREELANCER
    if (accountType == "freelancer") {
      const freelancer = (await getCurrentProfileInfo(request)) as Freelancer;

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

      // HOURLY RATE
      if (target == "freelancer-hourly-rate") {
        // use formName from GeneralizableFormCard
        const hourlyRate = parseInt(formData.get("hourlyRate") as string, 10); // use fieldName from GeneralizableFormCard
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

      // VIDEO LINK
      if (target == "freelancer-video") {
        const videoLink = formData.get("videoLink") as string;
        const videoStatus = await updateFreelancerVideoLink(
          freelancer.id,
          videoLink
        );
        return Response.json({ success: videoStatus.success });
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

      // ONBOARDING -> TRUE ✅
      if (target == "freelancer-onboard") {
        const userId = currentUser.account.user.id;
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
    }
    // DEFAULT
    throw new Error("Unknown target update");
  } catch (error) {
    return Response.json({
      success: false,
      error: { message: "An unexpected error occurred." },
      status: 500,
    });
  }
}

export async function loader({
  request,
  params,
}: LoaderFunctionArgs): Promise<
  | TypedResponse<OnboardingEmployerFields>
  | TypedResponse<OnboardingFreelancerFields>
  | TypedResponse<LoaderFunctionError>
  | TypedResponse<never>
> {
  // Check if params contains a slug
  const slug = params?.slug;

  if (!slug) {
    throw new Response("Account not found", { status: 404 });
  }
  // Fetch account by slug
  const userAccount = await getAccountBySlug(slug); // this is what make me capable to access first Name or last Name or whatever correspondes to them :)))
  if (!userAccount) {
    throw new Response("Account not found", { status: 404 });
  }

  // Authenticate the current user
  const currentUser = await authenticator.isAuthenticated(request);
  if (!currentUser) {
    return redirect("/login-employer");
  }

  // Determine account type and fetch profile information
  const accountType: AccountType = await getCurrentUserAccountType(request);
  let profile = await getCurrentProfileInfo(request);

  if (!profile) {
    return Response.json({
      success: false,
      error: { message: "Profile information not found." },
      status: 404,
    });
  }

  // Handle employer account type
  if (accountType === "employer") {
    profile = profile as Employer;

    // Fetch necessary employer data
    const bioInfo = await getAccountBio(profile.account);
    const employerIndustries = await getEmployerIndustries(profile);
    const allIndustries = (await getAllIndustries()) || [];
    const yearsInBusiness = await getEmployerYearsInBusiness(profile);
    const employerBudget = await getEmployerBudget(profile);
    const about = await getEmployerAbout(profile);
    const { activeJobCount, draftedJobCount, closedJobCount } =
      await getEmployerDashboardData(request);

    // Check if employer.account exists before accessing nested properties
    const accountOnboarded = profile.account.user.isOnboarded;
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
      accountOnboarded,
      activeJobCount,
      draftedJobCount,
      closedJobCount,
      totalJobCount,
      userAccount,
    });
  }

  // Handle freelancer account type
  if (accountType === "freelancer") {
    profile = (await getCurrentProfileInfo(request)) as Freelancer;

    const bioInfo = await getAccountBio(profile.account);
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
      userAccount,
    });
  }

  // Fallback if account type is not found
  return Response.json({
    success: false,
    error: { message: "Account type not found." },
    status: 404,
  });
}

const Layout: FC = () => {
  const { userAccount } = useLoaderData<{
    userAccount: UserAccount;
  }>();

  return (
    <div>
      {userAccount.accountType === "employer" ? (
        <EmployerPage />
      ) : (
        <FreelancerPage />
      )}
    </div>
  );
};

export default Layout;
