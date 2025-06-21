import EmployerOnboardingScreen from './employer';
import FreelancerOnboardingScreen from './freelancer';
import { redirect, useLoaderData } from '@remix-run/react';
import { AccountType } from '@mawaheb/db/enums';
import {
  getCurrentProfileInfo,
  getCurrentUserAccountType,
  getCurrentUserAccountInfo,
} from '~/servers/user.server';
import { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { Employer, Freelancer } from '@mawaheb/db/types';
import { requireUserVerified } from '~/auth/auth.server';
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
} from '~/servers/employer.server';
import {
  getFreelancerAbout,
  getFreelancerLanguages,
  getFreelancerAvailability,
  handleFreelancerOnboardingAction,
  fetchFreelancerSkills,
} from '~/servers/freelancer.server';
import { getAttachmentSignedURL } from '~/servers/cloudStorage.server';
import { fetchSkills } from '~/servers/general.server';

// --- ACTION: handles both employer & freelancer onboarding saves ---
export async function action({ request }: ActionFunctionArgs) {
  await requireUserVerified(request);
  const formData = await request.formData();

  const userAccount = await getCurrentUserAccountInfo(request);
  if (!userAccount) {
    return Response.json({
      success: false,
      error: { message: 'User account not found.' },
      status: 404,
    });
  }

  if (userAccount.accountType === 'freelancer') {
    const profile = (await getCurrentProfileInfo(request)) as Freelancer;
    if (!profile) {
      return Response.json({
        success: false,
        error: { message: 'Profile not found.' },
        status: 404,
      });
    }
    return handleFreelancerOnboardingAction(formData, profile);
  }

  if (userAccount.accountType === 'employer') {
    const profile = (await getCurrentProfileInfo(request)) as Employer;
    if (!profile) {
      return Response.json({
        success: false,
        error: { message: 'Profile not found.' },
        status: 404,
      });
    }
    return handleEmployerOnboardingAction(formData, profile);
  }

  return Response.json({
    success: false,
    error: { message: 'Unknown account type.' },
    status: 400,
  });
}

// --- LOADER: fetches all required onboarding data for employer or freelancer ---
export async function loader({ request }: LoaderFunctionArgs) {
  await requireUserVerified(request);

  const accountType = await getCurrentUserAccountType(request);
  let profile = await getCurrentProfileInfo(request);

  if (!profile) {
    return Response.json({
      success: false,
      error: { message: 'Profile information not found.' },
      status: 404,
    });
  }

  // If already onboarded, redirect as appropriate
  if (profile.account?.user?.isOnboarded) {
    if (profile.account?.accountStatus === 'published') {
      return redirect('/dashboard');
    }
    return redirect('/identification');
  }

  if (accountType === AccountType.Employer) {
    profile = profile as Employer;
    const bioInfo = await getAccountBio(profile.account);
    const employerIndustriesRaw = await getEmployerIndustries(profile);
    const employerIndustries = employerIndustriesRaw.map(i => ({
      id: i.id,
      name: i.label, // 💥 MAP label TO name!
    }));

    // 🟢 PATCH: inject mapped industries into the profile object
    profile.industries = employerIndustries;

    const allIndustries = await getAllIndustries();
    const yearsInBusiness = await getEmployerYearsInBusiness(profile);
    const employerBudget = await getEmployerBudget(profile);
    const about = await getEmployerAbout(profile);
    const { activeJobCount, draftedJobCount, closedJobCount } =
      await getEmployerDashboardData(request);
    const totalJobCount = activeJobCount + draftedJobCount + closedJobCount;

    // console.log('🟡 LOADER: employerIndustriesRaw:', employerIndustriesRaw);
    // console.log('🟢 LOADER: employerIndustries (mapped):', employerIndustries);
    // console.log('🔵 LOADER: currentProfile:', profile);

    return Response.json({
      accountType,
      bioInfo,
      employerIndustries, // ← SELECTED industries for this employer (can be empty)
      allIndustries, // ← ALL possible industries (for the multi-select/search)
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
  }

  if (accountType === AccountType.Freelancer) {
    profile = profile as Freelancer;
    const bioInfo = await getAccountBio(profile.account);
    const about = await getFreelancerAbout(profile);
    const { videoLink } = profile;

    // Portfolio and certificates: resolve file URLs
    const portfolio = Array.isArray(profile.portfolio)
      ? profile.portfolio
      : JSON.parse(profile.portfolio || '[]');
    const processedPortfolio = await Promise.all(
      portfolio.map(async item => {
        if (item.projectImageName) {
          item.projectImageUrl = await getAttachmentSignedURL(item.projectImageName);
        }
        return item;
      })
    );
    const certificates = Array.isArray(profile.certificates)
      ? profile.certificates
      : JSON.parse(profile.certificates || '[]');
    const processedCertificates = await Promise.all(
      certificates.map(async item => {
        if (item.attachmentName) {
          item.attachmentUrl = await getAttachmentSignedURL(item.attachmentName);
        }
        return item;
      })
    );

    const educations = profile.educations;
    const workHistory = profile.workHistory;

    // Languages, skills, etc.
    const freelancerLanguages = await getFreelancerLanguages(profile.id);
    const allLanguages = await getAllLanguages();
    const freelancerAvailability = await getFreelancerAvailability(profile.accountId);
    const availabilityData = {
      availableForWork: freelancerAvailability?.availableForWork ?? false,
      jobsOpenTo: freelancerAvailability?.jobsOpenTo ?? [],
      availableFrom: freelancerAvailability?.availableFrom
        ? new Date(freelancerAvailability.availableFrom).toISOString().split('T')[0]
        : '',
      hoursAvailableFrom: freelancerAvailability?.hoursAvailableFrom ?? '',
      hoursAvailableTo: freelancerAvailability?.hoursAvailableTo ?? '',
    };
    const initialSkills = await fetchSkills(true, 10);
    const freelancerSkills = await fetchFreelancerSkills(profile.id);

    return Response.json({
      accountType,
      bioInfo,
      currentProfile: profile,
      about,
      videoLink,
      hourlyRate: profile.hourlyRate,
      accountOnboarded: profile.account.user.isOnboarded,
      yearsOfExperience: profile.yearsOfExperience,
      portfolio: JSON.stringify(processedPortfolio),
      certificates: JSON.stringify(processedCertificates),
      educations,
      workHistory,
      freelancerAvailability: availabilityData,
      freelancerLanguages,
      allLanguages,
      initialSkills,
      freelancerSkills,
    });
  }

  return Response.json({
    success: false,
    error: { message: 'Account type not found.' },
    status: 404,
  });
}

// --- Layout Component: chooses the correct onboarding screen ---
export default function Layout() {
  const { accountType } = useLoaderData<{ accountType: AccountType }>();

  return (
    <div>
      {accountType === AccountType.Employer ? (
        <EmployerOnboardingScreen />
      ) : (
        <FreelancerOnboardingScreen />
      )}
    </div>
  );
}
