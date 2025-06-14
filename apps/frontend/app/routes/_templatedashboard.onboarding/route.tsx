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

export async function action({ request }: ActionFunctionArgs) {
  const userId = await requireUserVerified(request);
  const formData = await request.formData();
  const targetUpdated = formData.get('target-updated');

  // Log everything coming in
  console.log('🎯 [ACTION] Incoming target-updated:', targetUpdated);

  // Log all FormData entries (works in Node with for...of!)
  for (const [key, value] of formData.entries()) {
    // If it's a file, show some details
    if (value instanceof File) {
      console.log(`📦 [ACTION] FILE key: ${key}`, {
        name: value.name,
        size: value.size,
        type: value.type,
      });
    } else {
      console.log(`📝 [ACTION] FIELD key: ${key} value:`, value);
    }
  }

  // Get the full user account info to determine account type
  const userAccount = await getCurrentUserAccountInfo(request);
  console.log('🔍 [ACTION] userAccount:', userAccount);

  if (!userAccount) {
    return Response.json({
      success: false,
      error: { message: 'User account not found.' },
      status: 404,
    });
  }

  if (userAccount.accountType === 'freelancer') {
    const profile = (await getCurrentProfileInfo(request)) as Freelancer;
    console.log('👤 [ACTION] Freelancer profile:', profile);
    if (!profile) {
      return Response.json({
        success: false,
        error: { message: 'Profile not found.' },
        status: 404,
      });
    }
    const response = await handleFreelancerOnboardingAction(formData, profile);
    console.log('✅ [ACTION] Response from handleFreelancerOnboardingAction:', response);
    return response;
  } else if (userAccount.accountType === 'employer') {
    const profile = (await getCurrentProfileInfo(request)) as Employer;
    console.log('👤 [ACTION] Employer profile:', profile);
    if (!profile) {
      return Response.json({
        success: false,
        error: { message: 'Profile not found.' },
        status: 404,
      });
    }
    const response = await handleEmployerOnboardingAction(formData, profile);
    console.log('✅ [ACTION] Response from handleEmployerOnboardingAction:', response);
    return response;
  }

  return null;
}

export async function loader({ request }: LoaderFunctionArgs) {
  // Ensure the user is verified
  await requireUserVerified(request);

  // Get the account type and profile info
  const accountType = await getCurrentUserAccountType(request);
  // console.log('🚀 Loader: Account Type', accountType);

  let profile = await getCurrentProfileInfo(request);
  if (!profile) {
    // console.log('❌ Profile not found!');
    return Response.json({
      success: false,
      error: { message: 'Profile information not found.' },
      status: 404,
    });
  }

  // Redirect to identifying route or dashboard based on onboarding status and account status
  if (profile.account?.user?.isOnboarded) {
    // console.log('profile.account?.accountStatus', profile.account?.accountStatus);
    // If account status is published, redirect to dashboard
    if (profile.account?.accountStatus === 'published') {
      return redirect('/dashboard');
    }
    // If account is onboarded but not published, redirect to identifying route
    else {
      return redirect('/identification');
    }
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

    // Process portfolio
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

    // Process certificates
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

    // Fetch freelancer-specific data
    const freelancerLanguages = await getFreelancerLanguages(profile.id);
    const allLanguages = await getAllLanguages();

    // Get the freelancer availability data
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

    // Log **raw** profile, **parsed** portfolio, and processedPortfolio
    // console.log('🖼️ Raw portfolio:', profile.portfolio);
    // console.log('🖼️ Processed portfolio:', processedPortfolio);

    // Log the final output object
    const responseData = {
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
    };

    return Response.json(responseData);
  }

  return Response.json({
    success: false,
    error: { message: 'Account type not found.' },
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
