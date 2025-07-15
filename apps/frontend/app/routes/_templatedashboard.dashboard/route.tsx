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
} from '@mawaheb/db/types';
import EmployerDashboard from './employer';
import FreelancerDashboard from './freelancer';
import { useLoaderData } from '@remix-run/react';
import { AccountType } from '@mawaheb/db/enums';
import {
  getAllIndustries,
  getAccountBio,
  getEmployerIndustries,
  getEmployerYearsInBusiness,
  getEmployerBudget,
  getEmployerAbout,
  getEmployerDashboardData,
  handleEmployerOnboardingAction,
} from '~/servers/employer.server';
import {
  getFreelancerAbout,
  getFreelancerLanguages,
  getFreelancerSkills,
  handleFreelancerOnboardingAction,
} from '~/servers/freelancer.server';
import Header from '../_templatedashboard/header';
import {
  requireUserAccountStatusPublishedOrDeactivated,
  requireUserVerified,
} from '~/auth/auth.server';
import { getFileType } from '~/common/profileView/onboarding-form-component/formFields/fieldTemplates';
import { extractS3Key, getAttachmentSignedURL } from '~/servers/cloudStorage.server';

// Util to safely parse array data
function safeParseArray(data: any): any[] {
  try {
    return Array.isArray(data) ? data : JSON.parse(data ?? '[]');
  } catch {
    return [];
  }
}

function normalizePortfolioFiles(portfolio) {
  return portfolio.map(item => {
    const fileType = getFileType(
      item.projectImageName || item.attachmentName || item.projectImageUrl || item.attachmentUrl
    );
    if (fileType === 'pdf' || fileType === 'word' || fileType === 'video') {
      return {
        ...item,
        projectImageUrl: item.attachmentUrl,
        projectImageName: item.attachmentName,
      };
    }
    return item;
  });
}

// Signs any S3 (non-public) URLs in your portfolio so the frontend can use them safely
async function signPortfolioFiles(portfolio: any[]): Promise<any[]> {
  if (!Array.isArray(portfolio)) return [];

  return await Promise.all(
    portfolio.map(async item => {
      let signedProjectImageUrl = item.projectImageUrl;
      let signedAttachmentUrl = item.attachmentUrl;

      // Always re-sign with extracted, decoded key
      if (
        signedProjectImageUrl &&
        typeof signedProjectImageUrl === 'string' &&
        !signedProjectImageUrl.startsWith('blob:')
      ) {
        try {
          const key = extractS3Key(signedProjectImageUrl);
          signedProjectImageUrl = key ? await getAttachmentSignedURL(key) : '';
        } catch (err) {
          console.error(
            '[signPortfolioFiles] Could not sign projectImageUrl',
            signedProjectImageUrl,
            err
          );
        }
      }

      if (
        signedAttachmentUrl &&
        typeof signedAttachmentUrl === 'string' &&
        !signedAttachmentUrl.startsWith('blob:')
      ) {
        try {
          const key = extractS3Key(signedAttachmentUrl);
          signedAttachmentUrl = key ? await getAttachmentSignedURL(key) : '';
        } catch (err) {
          console.error(
            '[signPortfolioFiles] Could not sign attachmentUrl',
            signedAttachmentUrl,
            err
          );
        }
      }

      // console.log('portfolio item after sign:', {
      //   projectImageUrl: signedProjectImageUrl,
      //   attachmentUrl: signedAttachmentUrl,
      // });

      return {
        ...item,
        projectImageUrl: signedProjectImageUrl,
        attachmentUrl: signedAttachmentUrl,
      };
    })
  );
}

export async function action({ request }: ActionFunctionArgs) {
  await requireUserVerified(request);

  try {
    const formData = await request.formData();
    const userProfile = await getCurrentProfileInfo(request);
    const accountType = userProfile.account.accountType;

    if (accountType === AccountType.Employer) {
      return handleEmployerOnboardingAction(formData, userProfile as Employer);
    }

    if (accountType === AccountType.Freelancer) {
      return handleFreelancerOnboardingAction(formData, userProfile as Freelancer);
    }

    throw new Error('Unknown account type');
  } catch (error) {
    console.error('Action error:', error);
    return Response.json(
      { success: false, error: { message: 'An unexpected error occurred.' } },
      { status: 500 }
    );
  }
}

export async function loader({ request }: LoaderFunctionArgs) {
  await requireUserAccountStatusPublishedOrDeactivated(request);

  const accountType = await getCurrentUserAccountType(request);
  let currentProfile = await getCurrentProfileInfo(request);
  const currentUser = await getCurrentUser(request);

  if (!currentUser) {
    throw new Error('User not authenticated');
  }

  const isOwner = currentProfile.account.user.id === currentUser.id;
  const accountOnboarded = currentProfile.account.user.isOnboarded;
  const bioInfo = await getAccountBio(currentProfile.account);

  if (accountType === AccountType.Employer) {
    currentProfile = currentProfile as Employer;

    const employerIndustries = await getEmployerIndustries(currentProfile);
    const allIndustries = (await getAllIndustries()) || [];
    const yearsInBusiness = await getEmployerYearsInBusiness(currentProfile);
    const employerBudget = await getEmployerBudget(currentProfile);
    const aboutContent = await getEmployerAbout(currentProfile);
    const {
      activeJobCount,
      draftedJobCount,
      closedJobCount,
      pausedJobCount,
      deletedJobCount,
      completedJobCount,
      totalApplicantsCount,
      shortlistedApplicantsCount,
      interviewedApplicantsCount,
    } = await getEmployerDashboardData(request);

    const totalJobCount = activeJobCount + draftedJobCount + closedJobCount + pausedJobCount;

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
      pausedJobCount,
      totalJobCount,
      deletedJobCount,
      completedJobCount,
      isOwner,
      canEdit: false,

      // 👇 Add these
      totalApplicantsCount,
      shortlistedApplicantsCount,
      interviewedApplicantsCount,
    });
  }

  if (accountType === AccountType.Freelancer) {
    currentProfile = currentProfile as Freelancer;

    const about = await getFreelancerAbout(currentProfile);
    const { videoLink, videoAttachmentId, videoType } = currentProfile as any;

    // Fetch video attachment file name if it exists
    let videoFileName = null;
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

    const skills = await getFreelancerSkills(currentProfile.id);
    const languages = await getFreelancerLanguages(currentProfile.id);

    const safeParseArray = (data: any): any[] => {
      try {
        return Array.isArray(data) ? data : JSON.parse(data ?? '[]');
      } catch {
        console.error('Error parsing array:', data);
        return [];
      }
    };

    // 1. Normalize fields for preview
    const normalizedPortfolio = normalizePortfolioFiles(safeParseArray(currentProfile.portfolio));
    // 2. Sign all S3 links
    const signedPortfolio = await signPortfolioFiles(normalizedPortfolio);

    const processedProfile = {
      ...currentProfile,
      portfolio: signedPortfolio,
      workHistory: safeParseArray(currentProfile.workHistory),
      certificates: safeParseArray(currentProfile.certificates),
      educations: safeParseArray(currentProfile.educations),
      skills,
      languages,
    };

    return Response.json({
      accountType,
      accountStatus: currentProfile.account.accountStatus,
      bioInfo,
      currentProfile: processedProfile,
      about,
      videoLink,
      videoType,
      videoAttachmentId,
      videoFileName,
      hourlyRate: currentProfile.hourlyRate,
      accountOnboarded: currentProfile.account.user.isOnboarded,
      yearsOfExperience: currentProfile.yearsOfExperience,
      educations: currentProfile.educations,
      certificates: currentProfile.certificates,
      portfolio: processedProfile.portfolio,
      workHistory: processedProfile.workHistory,
      freelancerAvailability: {
        availableForWork: currentProfile.availableForWork ?? false,
        jobsOpenTo: currentProfile.jobsOpenTo ?? [],
        availableFrom: currentProfile.availableFrom ?? '',
        hoursAvailableFrom: currentProfile.hoursAvailableFrom ?? '',
        hoursAvailableTo: currentProfile.hoursAvailableTo ?? '',
      },
      isOwner,
      canEdit: isOwner,
      currentUser,
    });
  }

  return Response.json({
    success: false,
    error: { message: 'Account type not found.' },
    status: 404,
  });
}

// Layout
export default function Layout() {
  const { accountType } = useLoaderData<{ accountType: AccountType }>();

  return (
    <div>
      <Header />
      {accountType === AccountType.Employer ? <EmployerDashboard /> : <FreelancerDashboard />}
    </div>
  );
}
