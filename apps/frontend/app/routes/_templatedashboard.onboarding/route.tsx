import EmployerOnboardingScreen from "./employer";
import FreelancerOnboardingScreen from "./freelancer";
import { redirect, useLoaderData } from "@remix-run/react";
import { AccountType } from "~/types/enums";
import {
  getCurrentProfileInfo,
  getCurrentUserAccountType,
} from "~/servers/user.server";
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Employer, Freelancer } from "~/types/User";
import { requireUserVerified } from "~/auth/auth.server";
import {
  getAccountBio,
  getEmployerIndustries,
  getAllIndustries,
  getEmployerYearsInBusiness,
  getEmployerBudget,
  getEmployerAbout,
  getEmployerDashboardData,
  getAllLanguages,
  handleEmployerOnboardingAction,
} from "~/servers/employer.server";

import {
  getFreelancerAbout,
  getFreelancerLanguages,
  getFreelancerAvailability,
  handleFreelancerOnboardingAction,
} from "~/servers/freelancer.server";

export async function action({ request }: ActionFunctionArgs) {
  // user must be verified
  await requireUserVerified(request);

  try {
    const formData = await request.formData();
    const userProfile = await getCurrentProfileInfo(request);
    const currentProfile = await getCurrentProfileInfo(request);
    const accountType = currentProfile.account.accountType;

    // EMPLOYER
    if (accountType == AccountType.Employer) {
      return handleEmployerOnboardingAction(formData, userProfile as Employer);
    }
    if (accountType == AccountType.Freelancer) {
      return handleFreelancerOnboardingAction(
        formData,
        userProfile as Freelancer
      );
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
    console.log("Employer account detected");
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

    const availabilityData = {
      availableForWork: freelancerAvailability?.availableForWork ?? false,
      jobsOpenTo: freelancerAvailability?.jobsOpenTo ?? [],
      availableFrom: freelancerAvailability?.availableFrom
        ? new Date(freelancerAvailability.availableFrom)
            .toISOString()
            .split("T")[0] // Convert to yyyy-MM-dd
        : "", // Fallback to empty string
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
