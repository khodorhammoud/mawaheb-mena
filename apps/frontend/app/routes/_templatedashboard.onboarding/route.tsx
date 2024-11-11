import EmployerOnboardingScreen from "./employer";
import FreelancerOnboardingScreen from "./freelancer";
import { json, redirect, useLoaderData } from "@remix-run/react";
import { AccountType } from "~/types/enums";
import Header from "../_templatedashboard/header";
import {
  getCurrentProfileInfo,
  getCurrentUserAccountType,
} from "~/servers/user.server";
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  TypedResponse,
} from "@remix-run/node";
import {
  Employer,
  Freelancer,
  LoaderFunctionError,
  OnboardingEmployerFields,
  OnboardingFreelancerFields,
  PortfolioFormFieldType,
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
} from "~/servers/employer.server";
import { getCurrentProfile } from "~/auth/session.server";

export async function action({ request }: ActionFunctionArgs) {
  try {
    const formData = await request.formData(); // always do this :)
    const target = formData.get("target-updated"); // for the switch, to not use this sentence 2 thousand times :)
    const currentUser = await getCurrentProfile(request);

    const userId = currentUser.id;
    const accountType = currentUser.account.accountType;

    if (accountType == "employer") {
      const employer = (await getCurrentProfileInfo(request)) as Employer;

      // ABOUT
      if (target == "employer-about") {
        const aboutContent = formData.get("about") as string;
        const aboutStatus = await updateEmployerAbout(employer, aboutContent);
        return json({ success: aboutStatus.success });
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
        return json({ success: bioStatus.success });
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
        return json({ success: industriesStatus.success });
      }
      // YEARS IN BUSINESS
      if (target == "employer-years-in-business") {
        const yearsInBusiness =
          parseInt(formData.get("yearsInBusiness") as string) || 0;

        const yearsStatus = await updateEmployerYearsInBusiness(
          employer,
          yearsInBusiness
        );
        return json({ success: yearsStatus.success });
      }
      // BUDGET
      if (target == "employer-budget") {
        const budgetValue = formData.get("employerBudget");
        const budget = parseInt(budgetValue as string, 10);

        const budgetStatus = await updateEmployerBudget(employer, budget);
        return json({ success: budgetStatus.success });
      }
      // ONBOARDING -> TRUE ✅
      if (target == "employer-onboard") {
        const userId = currentUser.account.user.id;
        const userExists = await checkUserExists(userId);
        if (!userExists.length)
          return json({
            success: false,
            error: { message: "User not found." },
            status: 404,
          });

        const result = await updateOnboardingStatus(userId);
        return result.length
          ? redirect("/dashboard")
          : json({
              success: false,
              error: { message: "Failed to update onboarding status" },

              status: 500,
            });
      }
    }
    if (accountType == "freelancer") {
      const freelancer = (await getCurrentProfileInfo(request)) as Freelancer;
      // HOURLY RATE
      if (target == "freelancer-hourly-rate") {
        const hourlyRate = parseInt(formData.get("hourlyRate") as string, 10);
        const hourlyRateStatus = await updateFreelancerHourlyRate(
          freelancer,
          hourlyRate
        );
        return json({ success: hourlyRateStatus.success });
      }

      // YEARS OF EXPERIENCE
      if (target == "freelancer-years-of-experience") {
        const yearsExperience =
          parseInt(formData.get("yearsOfExperience") as string) || 0;
        const yearsStatus = await updateFreelancerYearsOfExperience(
          freelancer,
          yearsExperience
        );
        return json({ success: yearsStatus.success });
      }

      // ABOUT
      if (target == "freelancer-about") {
        const aboutContent = formData.get("about") as string;
        const aboutStatus = await updateFreelancerAbout(
          freelancer,
          aboutContent
        );
        return json({ success: aboutStatus.success });
      }
      // VIDEO LINK
      if (target == "freelancer-video") {
        const videoLink = formData.get("videoLink") as string;
        const videoStatus = await updateFreelancerVideoLink(
          freelancer.id,
          videoLink
        );
        return json({ success: videoStatus.success });
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
        return json({ success: bioStatus.success });
      }
      // PORTFOLIO
      if (target == "freelancer-portfolio") {
        const portfolio = formData.get("portfolio") as string;
        try {
          const portfolioParsed = JSON.parse(
            portfolio
          ) as PortfolioFormFieldType[];
          console.log("portfolioParsed", portfolioParsed);
          return json({ success: true });
          // const portfolioStatus = await updateFreelancerPortfolio(
          //   freelancer,
          //   portfolioParsed
          // );
          // return json({ success: portfolioStatus.success });
        } catch (error) {
          return json({
            success: false,
            error: { message: "Invalid portfolio data." },
            status: 400,
          });
        }
      }

      // ONBOARDING -> TRUE ✅
      if (target == "freelancer-onboard") {
        const userId = currentUser.account.user.id;
        const userExists = await checkUserExists(userId);
        if (!userExists.length)
          return json({
            success: false,
            error: { message: "User not found." },
            status: 404,
          });

        const result = await updateOnboardingStatus(userId);
        return result.length
          ? redirect("/dashboard")
          : json({
              success: false,
              error: { message: "Failed to update onboarding status" },

              status: 500,
            });
      }
    }
    // DEFAULT
    throw new Error("Unknown target update");
  } catch (error) {
    return json({
      success: false,
      error: { message: "An unexpected error occurred." },
      status: 500,
    });
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
  const currentUser = await authenticator.isAuthenticated(request);
  if (!currentUser) {
    return redirect("/login-employer");
  }
  const accountType: AccountType = await getCurrentUserAccountType(request);
  let profile = await getCurrentProfileInfo(request);

  if (!profile) {
    return json({
      success: false,
      error: { message: "Profile information not found." },
      status: 404,
    });
  }

  // if the current user is not onboarded, redirect them to the onboarding screen
  if (profile.account?.user?.isOnboarded) {
    return redirect("/dashboard");
  }

  // fetch employwer data
  if (accountType == "employer") {
    profile = profile as Employer;

    // Fetch all the necessary data safely
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

    // Return the response data
    return json({
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
    });
  } else if (accountType == "freelancer") {
    profile = (await getCurrentProfileInfo(request)) as Freelancer;

    // Fetch all the necessary data safely
    const bioInfo = await getAccountBio(profile.account);
    const about = await getFreelancerAbout(profile);
    const { videoLink } = profile;

    return json({
      accountType,
      bioInfo,
      currentProfile: profile,
      about,
      videoLink,
      hourlyRate: profile.hourlyRate,
      accountOnboarded: profile.account.user.isOnboarded,
      yearsOfExperience: profile.yearsOfExperience,
    });
  }
  return json({
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
      <Header />
      {accountType === "employer" ? (
        <EmployerOnboardingScreen />
      ) : (
        <FreelancerOnboardingScreen />
      )}
    </div>
  );
}
