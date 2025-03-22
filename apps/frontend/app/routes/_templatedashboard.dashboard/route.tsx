import { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import {
  getCurrentProfileInfo,
  getCurrentUserAccountType,
  getCurrentUser,
} from '~/servers/user.server';
import {
  PortfolioFormFieldType,
  WorkHistoryFormFieldType,
  Employer,
  Freelancer,
} from '~/types/User';
import EmployerDashboard from './employer';
import FreelancerDashboard from './freelancer';
import { useLoaderData } from '@remix-run/react';
import { AccountType } from '~/types/enums';
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
} from '~/servers/employer.server';
import {
  getFreelancerAbout,
  getFreelancerAvailability,
  getFreelancerLanguages,
  handleFreelancerOnboardingAction,
  getFreelancerSkills,
} from '~/servers/freelancer.server';
import Header from '../_templatedashboard/header';
import {
  requireUserAccountStatusPublishedOrDeactivated,
  requireUserVerified,
} from '~/auth/auth.server';

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
      return handleFreelancerOnboardingAction(formData, userProfile as Freelancer);
    }
    // DEFAULT
    throw new Error('Unknown target update');
  } catch (error) {
    return Response.json(
      { success: false, error: { message: 'An unexpected error occurred.' } },
      { status: 500 }
    );
  }
}

export async function loader({ request }: LoaderFunctionArgs) {
  // Ensure user is verified and has either published or deactivated account status
  await requireUserAccountStatusPublishedOrDeactivated(request);

  // Determine account type (Freelancer/Employer)
  const accountType: AccountType = await getCurrentUserAccountType(request);

  // Get the current profile
  let currentProfile = await getCurrentProfileInfo(request);

  const currentUser = await getCurrentUser(request);
  if (!currentUser) {
    throw new Error('User not authenticated');
  }

  // Check if current user owns the account
  const isOwner = currentProfile.account.user.id === currentUser.id;
  const accountOnboarded = currentProfile?.account?.user?.isOnboarded;
  const bioInfo = await getAccountBio(currentProfile.account);

  // ✅ Employer Handling
  if (accountType === AccountType.Employer) {
    currentProfile = currentProfile as Employer;

    // Fetch employer-specific data
    const employerIndustries = await getEmployerIndustries(currentProfile);
    const allIndustries = (await getAllIndustries()) || [];
    const yearsInBusiness = await getEmployerYearsInBusiness(currentProfile);
    const employerBudget = await getEmployerBudget(currentProfile);
    const aboutContent = await getEmployerAbout(currentProfile);
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
  }

  // ✅ Freelancer Handling
  if (accountType === AccountType.Freelancer) {
    currentProfile = currentProfile as Freelancer;
    const profile = currentProfile;

    const about = await getFreelancerAbout(profile);
    const { videoLink } = profile;
    const portfolio = profile.portfolio as PortfolioFormFieldType[];
    const workHistory = profile.workHistory as WorkHistoryFormFieldType[];

    const safeParseArray = (data: any): any[] => {
      try {
        return Array.isArray(data) ? data : JSON.parse(data ?? '[]');
      } catch {
        console.error('Error parsing array:', data);
        return [];
      }
    };

    // ✅ Fetch skills and languages using the correct ID
    const skills = await getFreelancerSkills(currentProfile.id);
    const languages = await getFreelancerLanguages(currentProfile.id);

    // console.log("🔥 LOADER: Fetched Skills:", skills);
    // console.log("🔥 LOADER: Fetched Languages:", languages);

    // ✅ Attach skills and languages to the processed profile
    const processedProfile = {
      ...currentProfile,
      portfolio: safeParseArray(currentProfile.portfolio),
      workHistory: safeParseArray(currentProfile.workHistory),
      certificates: safeParseArray(currentProfile.certificates),
      educations: safeParseArray(currentProfile.educations),
      skills, // ✅ Attach skills here
      languages, // ✅ Attach languages here
    };

    // console.log("🔥 LOADER: Final Processed Profile:", processedProfile);

    return Response.json({
      accountType,
      accountStatus: currentProfile.account.accountStatus,
      bioInfo,
      currentProfile: processedProfile,
      about,
      videoLink,
      hourlyRate: profile.hourlyRate,
      accountOnboarded: profile.account.user.isOnboarded,
      yearsOfExperience: profile.yearsOfExperience,
      educations: profile.educations,
      certificates: profile.certificates,
      portfolio,
      workHistory,
      isOwner,
      canEdit: isOwner,
      currentUser,
      freelancerAvailability: {
        availableForWork: profile.availableForWork ?? false,
        jobsOpenTo: profile.jobsOpenTo ?? [],
        availableFrom: profile.availableFrom ?? '',
        hoursAvailableFrom: profile.hoursAvailableFrom ?? '',
        hoursAvailableTo: profile.hoursAvailableTo ?? '',
      },
    });
  }

  return Response.json({
    success: false,
    error: { message: 'Account type not found.' },
    status: 404,
  });
}

// Layout component
export default function Layout() {
  const { accountType, accountStatus } = useLoaderData<{
    accountType: AccountType;
    accountStatus: string;
  }>();

  return (
    <div>
      {/* adding the header like that shall be temporary, and i shall ask about it */}
      <Header />
      {accountType === AccountType.Employer ? <EmployerDashboard /> : <FreelancerDashboard />}
    </div>
  );
}
