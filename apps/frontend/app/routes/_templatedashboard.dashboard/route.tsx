import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import {
  getCurrentProfileInfo,
  getCurrentUserAccountType,
  getCurrentUser,
} from "~/servers/user.server";
import {
  PortfolioFormFieldType,
  WorkHistoryFormFieldType,
  Employer,
  Freelancer,
} from "~/types/User";
import EmployerDashboard from "./employer";
import FreelancerDashboard from "./freelancer";
import { useLoaderData } from "@remix-run/react";
import { AccountType } from "~/types/enums";
import {
  getAllIndustries,
  getAccountBio,
  getEmployerIndustries,
  getEmployerYearsInBusiness,
  getEmployerBudget,
  getEmployerAbout,
  getEmployerDashboardData,
  getAllLanguages,
  handleEmployerOnboardingAction,
} from "~/servers/employer.server";

import {
  getFreelancerAbout,
  getFreelancerAvailability,
  getFreelancerLanguages,
  handleFreelancerOnboardingAction,
} from "~/servers/freelancer.server";

import Header from "../_templatedashboard/header";
import { requireUserOnboarded, requireUserVerified } from "~/auth/auth.server";

export async function action({ request }: ActionFunctionArgs) {
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
  // see that the user is verified
  await requireUserOnboarded(request);

  // Determine the account type (freelancer/employer)
  const accountType: AccountType = await getCurrentUserAccountType(request);

  // Get the current profile
  let currentProfile = await getCurrentProfileInfo(request);

  const currentUser = await getCurrentUser(request);
  if (!currentUser) {
    throw new Error("User not authenticated");
  }
  // Determine if the current user owns the account
  const isOwner = currentProfile.account.user.id === currentUser.id;

  const accountOnboarded = currentProfile?.account?.user?.isOnboarded;
  const bioInfo = await getAccountBio(currentProfile.account);

  // Check if the user is an Employer
  if (accountType === AccountType.Employer) {
    currentProfile = currentProfile as Employer;
    const employerIndustries = await getEmployerIndustries(currentProfile);
    const allIndustries = (await getAllIndustries()) || [];
    const yearsInBusiness = await getEmployerYearsInBusiness(currentProfile);
    const employerBudget = await getEmployerBudget(currentProfile);
    const aboutContent = await getEmployerAbout(currentProfile);
    const { activeJobCount, draftedJobCount, closedJobCount } =
      await getEmployerDashboardData(request);
    const totalJobCount = activeJobCount + draftedJobCount + closedJobCount;

    // Return response for Employer
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
    // Freelancer-specific data
    currentProfile = currentProfile as Freelancer;

    const freelancerLanguages = await getFreelancerLanguages(profile.id);
    const allLanguages = await getAllLanguages();

    // Get the freelancer availability data
    const freelancerAvailability = await getFreelancerAvailability(
      currentProfile.accountId
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
      educations: profile.educations,
      certificates: profile.certificates,
      portfolio,
      workHistory,
      isOwner, // Added isOwner
      canEdit: isOwner, // Freelancers can edit if they are the owner
      currentUser: currentProfile,
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
      <Header />
      {accountType === AccountType.Employer ? (
        <EmployerDashboard />
      ) : (
        <FreelancerDashboard />
      )}
    </div>
  );
}
