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
  updateFreelancerVideoLink,
} from '~/servers/freelancer.server';
import { getAttachmentSignedURL } from '~/servers/cloudStorage.server';
import { fetchSkills } from '~/servers/general.server';
import { isValidYouTubeUrl } from '~/utils/video';

export async function action({ request }: ActionFunctionArgs) {
  const userId = await requireUserVerified(request);
  const formData = await request.formData();
  console.log('🟢 [DEBUG] FormData:', Object.fromEntries(formData.entries()));

  // Get the full user account info to determine account type
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

    // This is inside your action handler
    const rawVideoEntry = formData.get('videoLink');

    // 🚩 1. REMOVE video (user cleared field, either string or empty File)
    if (
      (typeof rawVideoEntry === 'string' && rawVideoEntry.trim() === '') ||
      (rawVideoEntry instanceof File && rawVideoEntry.size === 0)
    ) {
      console.log(
        '🔥🔥🔥 REMOVE: updateFreelancerVideoLink called with NULL (empty string or empty file)'
      );
      await updateFreelancerVideoLink(profile.id, null);
      return Response.json({
        success: { message: 'Video removed from your profile!' },
      });
    }

    // 🚩 2. File Upload (user uploaded a video file)
    if (rawVideoEntry instanceof File && rawVideoEntry.size > 0) {
      // ...your upload logic...
      const uploadedUrl = `/uploads/${rawVideoEntry.name}`;
      await updateFreelancerVideoLink(profile.id, uploadedUrl);
      return Response.json({ success: { message: 'Video file uploaded and saved!' } });
    }

    // 🚩 3. YouTube URL (user pasted a link)
    if (typeof rawVideoEntry === 'string' && rawVideoEntry.trim().length > 0) {
      const url = rawVideoEntry.trim();
      if (!isValidYouTubeUrl(url)) {
        return Response.json(
          {
            success: false,
            error: { message: 'Invalid video URL. Please provide a valid YouTube link.' },
          },
          { status: 400 }
        );
      }
      await updateFreelancerVideoLink(profile.id, url);
      return Response.json({ success: { message: 'YouTube video saved!' } });
    }

    const file = formData.get('videoFile') as File | null;

    if (file && typeof file === 'object' && 'type' in file) {
      // Accept only real video MIME types
      const allowedTypes = [
        'video/mp4',
        'video/webm',
        'video/ogg',
        'video/quicktime', // mov
        // Add more as you like
      ];

      if (!allowedTypes.includes(file.type)) {
        return Response.json(
          {
            success: false,
            error: {
              message: 'Invalid file type. Please upload a valid video file (MP4, WebM, MOV).',
            },
          },
          { status: 400 }
        );
      }

      // (Optional) Limit size
      const maxSizeMB = 100;
      if (file.size > maxSizeMB * 1024 * 1024) {
        return Response.json(
          {
            success: false,
            error: { message: `Video file is too large. Max allowed size is ${maxSizeMB}MB.` },
          },
          { status: 400 }
        );
      }
    }

    const response = await handleFreelancerOnboardingAction(formData, profile);

    // ✅ If there's no success.message, we inject a generic one
    if (
      response?.status === 200 &&
      response?.headers.get('Content-Type')?.includes('application/json')
    ) {
      const cloned = response.clone();
      const json = await cloned.json();
      if (json?.success === true || (json?.success && typeof json.success === 'object')) {
        if (!json.success.message) {
          json.success = { message: 'Profile updated successfully!' };
          return Response.json(json); // 🔥 Inject toast-friendly response
        }
      }
    }

    console.log('✅ Final response before return:', await response.clone().json());

    return response;
  } else if (userAccount.accountType === 'employer') {
    const profile = (await getCurrentProfileInfo(request)) as Employer;
    if (!profile) {
      return Response.json({
        success: false,
        error: { message: 'Profile not found.' },
        status: 404,
      });
    }
    const response = await handleEmployerOnboardingAction(formData, profile);

    return response;
  }

  return null;
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

// Layout component
export default function Layout() {
  const { accountType } = useLoaderData<{
    accountType: AccountType;
  }>();

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
