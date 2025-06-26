import EmployerOnboardingScreen from './employer';
import FreelancerOnboardingScreen from './freelancer';
import { redirect, useLoaderData } from '@remix-run/react';
import { AccountType } from '@mawaheb/db/enums';
import {
  getCurrentProfileInfo,
  getCurrentUserAccountType,
  getCurrentUserAccountInfo,
  getCurrentUser,
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
import { getAttachmentSignedURL, uploadFile, saveAttachment } from '~/servers/cloudStorage.server';
import { fetchSkills } from '~/servers/general.server';
import { isValidYouTubeUrl } from '~/utils/video';
import { FreelancerVideoAttachmentType } from '@mawaheb/db/types/enums';

// Util to safely parse array data
function safeParseArray(data: any): any[] {
  try {
    return Array.isArray(data) ? data : JSON.parse(data ?? '[]');
  } catch {
    return [];
  }
}

export async function action({ request }: ActionFunctionArgs) {
  // const userId = await requireUserVerified(request);

  const formData = await request.formData();
  // console.log('🟢 [DEBUG] FormData:', Object.fromEntries(formData.entries()));
  // for (const [key, value] of formData.entries()) {
  //   // If it's a file, show some details
  //   if (value instanceof File) {
  //     console.log(`📦 [ACTION] FILE key: ${key}`, {
  //       name: value.name,
  //       size: value.size,
  //       type: value.type,
  //     });
  //   } else {
  //     console.log(`📝 [ACTION] FIELD key: ${key} value:`, value);
  //   }
  // }

  // Get the full user account info to determine account type
  const userAccount = await getCurrentUserAccountInfo(request);
  // console.log('🔍 [ACTION] userAccount:', userAccount);
  if (!userAccount) {
    return Response.json({
      success: false,
      error: { message: 'User account not found.' },
      status: 404,
    });
  }

  if (userAccount.accountType === 'freelancer') {
    const profile = (await getCurrentProfileInfo(request)) as Freelancer;
    // console.log('👤 [ACTION] Freelancer profile:', profile);
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
      // Clear all video-related fields
      const dbResult = await updateFreelancerVideoLink(
        profile.id,
        FreelancerVideoAttachmentType.Link, // Use Link as default when clearing
        undefined, // Clear video_link
        undefined // Clear video_attachment_id
      );

      if (!dbResult.success) {
        return Response.json({ error: { message: 'Failed to remove video.' } }, { status: 500 });
      }

      return Response.json({
        success: { message: 'Video removed from your profile!' },
      });
    }

    // 🚩 2. File Upload (user uploaded a video file)
    if (rawVideoEntry instanceof File && rawVideoEntry.size > 0) {
      console.log('[ACTION] Got a video file to upload:', {
        name: rawVideoEntry.name,
        size: rawVideoEntry.size,
        type: rawVideoEntry.type,
      });

      // Upload file and save as attachment
      const attachmentResult = await saveAttachment(rawVideoEntry, 'freelancer-introductory-video');
      if (!attachmentResult.success) {
        return Response.json(
          { error: { message: 'Failed to upload video file.' } },
          { status: 500 }
        );
      }

      console.log('[ACTION] Attachment Upload Result:', attachmentResult);

      // Save to DB with attachment type (clears video_link, sets video_attachment_id and video_type)
      const dbResult = await updateFreelancerVideoLink(
        profile.id,
        FreelancerVideoAttachmentType.Attachment,
        undefined, // Clear video_link
        attachmentResult.data.id // Set video_attachment_id
      );
      console.log('[ACTION] DB Update Result:', dbResult);

      if (!dbResult.success) {
        return Response.json(
          { error: { message: 'Failed to save video attachment.' } },
          { status: 500 }
        );
      }

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

      // Save to DB with link type (clears video_attachment_id, sets video_link and video_type)
      const dbResult = await updateFreelancerVideoLink(
        profile.id,
        FreelancerVideoAttachmentType.Link,
        url, // Set video_link
        undefined // Clear video_attachment_id
      );

      if (!dbResult.success) {
        return Response.json({ error: { message: 'Failed to save video link.' } }, { status: 500 });
      }

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
    // console.log('✅ [ACTION] Response from handleFreelancerOnboardingAction:', response);

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
    // console.log('✅ Final response before return:', await response.clone().json());

    return response;
  } else if (userAccount.accountType === 'employer') {
    const profile = (await getCurrentProfileInfo(request)) as Employer;
    // console.log('👤 [ACTION] Employer profile:', profile);
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
  // console.log('🚀 Loader: Account Type', accountType);

  let profile = await getCurrentProfileInfo(request);
  if (!profile) {
    // console.log('❌ [DEBUG] No profile found!');
    return Response.json({
      success: false,
      error: { message: 'Profile information not found.' },
      status: 404,
    });
  }

  const currentUser = await getCurrentUser(request);

  if (!currentUser || !profile) {
    // Return safe object for loader (don't break frontend)
    return Response.json(
      {
        success: false,
        error: { message: 'User/profile not found.' },
        accountType: null,
        currentProfile: null,
      },
      { status: 404 }
    );
  }

  // Redirect to identifying route or dashboard based on onboarding status and account status
  if (profile.account?.user?.isOnboarded) {
    // console.log('profile.account?.accountStatus', profile.account?.accountStatus);
    // If account status is published, redirect to dashboard
    if (profile.account?.accountStatus === 'published') {
      // console.log('🔀 [DEBUG] Redirect: Already onboarded, published → /dashboard');
      return redirect('/dashboard');
    }
    // If account is onboarded but not published, redirect to identifying route
    else {
      // console.log('🔀 [DEBUG] Redirect: Already onboarded, not published → /identification');
      return redirect('/identification');
    }
  }

  const isOwner = profile.account.user.id === currentUser.id;
  const accountOnboarded = profile.account.user.isOnboarded;
  const bioInfo = await getAccountBio(profile.account);

  if (accountType === AccountType.Employer) {
    profile = profile as Employer;

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
      accountOnboarded,
      activeJobCount,
      draftedJobCount,
      closedJobCount,
      totalJobCount,
      isOwner,
    });
  } else if (accountType === AccountType.Freelancer) {
    profile = profile as Freelancer;

    const about = await getFreelancerAbout(profile);
    const { videoLink, videoAttachmentId, videoType } = profile as any;
    let videoUrl = null;
    let videoFileName = null;

    if (videoLink && typeof videoLink === 'string') {
      if (
        videoLink.includes('youtube.com') ||
        videoLink.includes('youtu.be') ||
        videoLink.includes('vimeo.com')
      ) {
        // Public video links (YouTube/Vimeo): use directly
        videoUrl = videoLink;
      } else {
        // S3 key OR S3 URL: always generate signed URL!
        // If it's already a full S3 URL, extract the key from the URL
        let s3Key = videoLink;
        if (videoLink.startsWith('http') && videoLink.includes('.amazonaws.com/')) {
          // Example: https://bucket.s3.region.amazonaws.com/key
          const urlParts = videoLink.split('.amazonaws.com/');
          if (urlParts.length === 2) s3Key = urlParts[1].split('?')[0];
        }
        videoUrl = await getAttachmentSignedURL(s3Key);
        console.log('signed video URL:', videoUrl);
      }
    } else {
      videoUrl = null;
    }

    // Fetch video attachment file name if it exists
    if (videoType === 'attachment' && videoAttachmentId) {
      try {
        const { getAttachmentMetadataById } = await import('~/servers/cloudStorage.server');
        const attachmentResult = await getAttachmentMetadataById(videoAttachmentId);
        if (attachmentResult.success && attachmentResult.data) {
          const metadata = attachmentResult.data as any;
          // Extract filename from metadata
          videoFileName =
            metadata?.name ||
            metadata?.metadata?.name ||
            metadata?.storage?.name ||
            `Video Attachment ${videoAttachmentId}`;
        }
      } catch (error) {
        console.error('Error fetching video attachment metadata:', error);
      }
    }

    // Focused image/cert log
    // Safely parse portfolio and other arrays
    const processedProfile = {
      profile,
      portfolio: safeParseArray(profile.portfolio),
      workHistory: safeParseArray(profile.workHistory),
      certificates: safeParseArray(profile.certificates),
      educations: safeParseArray(profile.educations),
    };

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

    // Show summary
    // console.log('🟩 [DEBUG] Loader response keys:', {
    //   portfolioCount: processedPortfolio.length,
    //   certificatesCount: processedCertificates.length,
    //   portfolioSample: processedPortfolio.slice(0, 1),
    // });

    return Response.json({
      accountType,
      bioInfo,
      currentProfile: profile,
      about,
      videoLink,
      videoUrl,
      videoType,
      videoAttachmentId,
      videoFileName,
      hourlyRate: profile.hourlyRate,
      accountOnboarded: profile.account.user.isOnboarded,
      yearsOfExperience: profile.yearsOfExperience,
      portfolio: profile.portfolio,
      certificates: profile.certificates,
      educations,
      workHistory,
      freelancerAvailability: availabilityData,
      freelancerLanguages,
      allLanguages,
      initialSkills,
      freelancerSkills,
    });
  }

  // console.log('❌ [DEBUG] Account type not found!');
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
