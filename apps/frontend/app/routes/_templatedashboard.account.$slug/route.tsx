import { type FC } from "react";
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  TypedResponse,
} from "@remix-run/node";

import { useLoaderData, redirect } from "@remix-run/react";

import FreelancerPage from "./freelancer";
import EmployerPage from "./employer";
import { AccountType } from "~/types/enums";
import {
  getCurrentProfileInfo,
  getCurrentUserAccountType,
  getAccountBySlug,
} from "~/servers/user.server";
import {
  Employer,
  Freelancer,
  LoaderFunctionError,
  OnboardingEmployerFields,
  OnboardingFreelancerFields,
  PortfolioFormFieldType,
  WorkHistoryFormFieldType,
  UserAccount,
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
  handleEmployerOnboardingAction,
} from "~/servers/employer.server";

import {
  getFreelancerAbout,
  handleFreelancerOnboardingAction,
} from "~/servers/freelancer.server";
// import { getCurrentProfile } from "~/auth/session.server";

export async function action({ request }: ActionFunctionArgs) {
  try {
    const formData = await request.formData(); // always do this :)
    const currentUser = await getCurrentProfileInfo(request);
    const accountType = currentUser.account.accountType;

    // EMPLOYER
    if (accountType === AccountType.Employer) {
      return handleEmployerOnboardingAction(formData, currentUser as Employer);
    } else if (accountType === AccountType.Freelancer) {
      return handleFreelancerOnboardingAction(
        formData,
        currentUser as Freelancer
      );
    }
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
  if (accountType === AccountType.Employer) {
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
  if (accountType === AccountType.Freelancer) {
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
      {userAccount.accountType === AccountType.Employer ? (
        <EmployerPage />
      ) : (
        <FreelancerPage />
      )}
    </div>
  );
};

export default Layout;
