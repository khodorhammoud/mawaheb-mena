// this route has so much uses calls a function that filteres jobs that will appear in SingleJobView, according to matching skills, if any, and according to job level (senior/mid_level) + excluding jobs that the freelancer had applied to of course :)

import { LoaderFunctionArgs, ActionFunctionArgs, redirect, json } from '@remix-run/node';
import { useState } from 'react';
import { getCurrentUserAccountType, getCurrentProfileInfo } from '~/servers/user.server';
import { AccountType, AccountStatus } from '@mawaheb/db/enums';
import { requireUserIsFreelancer } from '~/auth/auth.server';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import RecommendedJobs from './recommendedJobs';
import AllJobs from './allJobs';
import MyJobs from './myJobs';
import { Sheet, SheetContent, SheetDescription, SheetHeader } from '~/components/ui/sheet';
import { Job } from '@mawaheb/db/types';
import SingleJobView from './singleJobView';
import { getJobSkills } from '~/servers/skill.server';
import { Skill } from '@mawaheb/db/types';
import { useFetcher, useLoaderData } from '@remix-run/react';
import {
  getReview,
  saveReview,
  updateReview,
  hasAcceptedApplication,
  getEmployerIdByJobId,
  getAccountIdbyUserId,
  getJobApplicationStats,
  getJobById,
  getSuggestedJobsForJob,
} from '~/servers/job.server';
import { getFreelancerIdByAccountId } from '~/servers/freelancer.server';

// --- Type for loader's return data ---
export type LoaderData = {
  jobSkills: Skill[];
  review?: { rating: number; comment: string; employerId: number } | null;
  canReview: boolean;
  freelancerId: number | null;
  appStats: { interested: number; interviewed: number; invites: number };
  suggestedJobs: Job[];
};

// --- Action (handles reviews for employer) ---
export async function action({ request }: ActionFunctionArgs) {
  const userId = await requireUserIsFreelancer(request);
  if (!userId) return redirect('/login-employer');

  // Get user profile to check account status
  const profile = await getCurrentProfileInfo(request);

  // Check if the user's account is deactivated or not published
  if (!profile?.account || profile.account.accountStatus !== AccountStatus.Published) {
    return redirect('/dashboard');
  }

  const formData = await request.formData();
  const actionType = formData.get('_action');
  const jobId = Number(formData.get('jobId') || 0);
  const employerId = Number(formData.get('employerId') || 0);
  const rating = Number(formData.get('rating') || 0);
  const comment = (formData.get('comment') as string) || '';

  if (!jobId || !employerId) {
    return json({ success: false, message: 'Invalid job or employer ID.' });
  }

  const accountId = await getAccountIdbyUserId(userId);
  const freelancerId = await getFreelancerIdByAccountId(accountId);
  if (!freelancerId) {
    return json({ success: false, message: 'Freelancer account not found.' });
  }

  // Check if the freelancer has an accepted job application for this employer
  const hasApplication = await hasAcceptedApplication(freelancerId, employerId);
  if (!hasApplication) {
    return json({
      success: false,
      message: 'You must have an accepted job application to review this employer.',
    });
  }

  try {
    if (actionType === 'review') {
      const existingReview = await getReview({
        freelancerId: freelancerId,
        employerId: employerId,
        reviewType: 'freelancer_review',
      });

      if (existingReview) {
        await updateReview({
          freelancerId: freelancerId,
          employerId: employerId,
          rating,
          comment,
          reviewType: 'freelancer_review',
        });
      } else {
        await saveReview({
          freelancerId: freelancerId,
          employerId: employerId,
          rating,
          comment,
          reviewType: 'freelancer_review',
        });
      }
      return json({ success: true });
    }

    return json({ success: false, message: 'Invalid action type.' });
  } catch (error) {
    return json({ success: false, message: (error as Error).message });
  }
}

// --- Loader (fetches main data for all views) ---
export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await requireUserIsFreelancer(request);
  if (!userId) return redirect('/login-employer');

  // Get user profile to check account status
  const profile = await getCurrentProfileInfo(request);

  // Check if the user's account is deactivated or not published
  if (!profile?.account || profile.account.accountStatus !== AccountStatus.Published) {
    return redirect('/dashboard');
  }

  const accountType: AccountType = await getCurrentUserAccountType(request);
  if (accountType !== AccountType.Freelancer) return redirect('/dashboard');

  const url = new URL(request.url);
  const jobId = parseInt(url.searchParams.get('jobId') || '0', 10);
  let employerId = parseInt(url.searchParams.get('employerId') || '0', 10);

  // If employerId not provided, fetch it from job
  if (jobId > 0 && employerId === 0) {
    employerId = (await getEmployerIdByJobId(jobId)) || 0;
  }

  // --- Get freelancer context ---
  const accountId = await getAccountIdbyUserId(userId);
  const freelancerId = await getFreelancerIdByAccountId(accountId);

  // --- Job application stats (for activity section) ---
  const appStats =
    jobId > 0 ? await getJobApplicationStats(jobId) : { interested: 0, interviewed: 0, invites: 0 };

  // --- Suggested jobs logic (uses skills & level, excludes already-applied) ---
  let suggestedJobs: Job[] = [];
  if (jobId > 0 && freelancerId) {
    const currentJob = await getJobById(jobId);
    if (currentJob) {
      suggestedJobs = await getSuggestedJobsForJob(currentJob, freelancerId, 4);
    }
  }

  if (!freelancerId) {
    return json({
      success: false,
      message: 'Freelancer not found.',
      jobSkills: [],
      review: null,
      canReview: false,
      appStats,
      suggestedJobs: [],
    });
  }

  // --- Job skills for the single job view ---
  const jobSkills = jobId > 0 ? await getJobSkills(jobId) : [];

  // --- Permission to review this employer? ---
  const canReview = employerId > 0 ? await hasAcceptedApplication(freelancerId, employerId) : false;

  // --- Employer review data (if exists) ---
  let existingReview = null;
  if (employerId > 0) {
    const fetchedReview = await getReview({
      freelancerId: freelancerId,
      employerId: employerId,
      reviewType: 'freelancer_review',
    });

    if (fetchedReview) {
      existingReview = {
        ...fetchedReview,
        employerId: employerId,
      };
    }
  }

  return json({
    jobSkills,
    review: existingReview,
    canReview,
    freelancerId,
    appStats,
    suggestedJobs,
  });
}

// --- MAIN LAYOUT/ROUTE COMPONENT ---
export default function Layout() {
  // State for selected job in the modal sheet
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);

  // fetcher is used to re-fetch job details and suggested jobs when opening the modal
  const fetcher = useFetcher<LoaderData>();
  const loaderData = useLoaderData<LoaderData>();
  const { freelancerId } = loaderData;

  const reloadJob = (job: Job) => {
    fetcher.load(`/browse-jobs?jobId=${job.id}&employerId=${job.employerId}`);
  };

  // --- Open modal with the job details, triggers fetch for extra details (and suggested jobs) ---
  const handleJobSelect = (jobData: Job) => {
    if (!jobData) return;
    setIsLoading(true);
    setSelectedJob(jobData);
    setOpen(true);
    fetcher.load(`/browse-jobs?jobId=${jobData.id}&employerId=${jobData.employerId}`);
    setIsLoading(false);
  };

  // --- All props for the single job modal (handles live updates) ---
  const singleJobProps = {
    job: selectedJob as any, // Pass the job object (TS ignore if null)
    jobSkills: fetcher.data?.jobSkills || loaderData.jobSkills || [],
    review:
      fetcher.data?.review &&
      selectedJob &&
      fetcher.data.review.employerId === selectedJob.employerId
        ? fetcher.data.review
        : loaderData.review,
    canReview: fetcher.data?.canReview ?? loaderData.canReview,
    appStats: fetcher.data?.appStats || loaderData.appStats,
    suggestedJobs: fetcher.data?.suggestedJobs || loaderData.suggestedJobs || [],
    onSelect: handleJobSelect, // <-- CRITICAL: pass the handler for clicking suggested jobs!
    refetchJob: reloadJob,
  };

  return (
    <div>
      {/* --- JOB DETAILS MODAL SHEET --- */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="right"
          className="bg-white xl:w-[800px] lg:w-[800px] md:w-3/4 w-full px-2 max-h-screen overflow-y-auto"
        >
          <SheetHeader>
            {isLoading ? (
              <div>Loading...</div>
            ) : (
              <SheetDescription>
                {selectedJob && (fetcher.data || loaderData) ? (
                  <SingleJobView {...singleJobProps} />
                ) : (
                  'No job selected'
                )}
              </SheetDescription>
            )}
          </SheetHeader>
        </SheetContent>
      </Sheet>

      {/* --- TABS FOR JOB LISTS --- */}
      <Tabs defaultValue="recommended-jobs" className="">
        <TabsList className="mt-4 mb-6">
          <TabsTrigger value="recommended-jobs">Recommended Jobs</TabsTrigger>
          <TabsTrigger value="all-jobs">All Jobs</TabsTrigger>
          <TabsTrigger value="my-jobs">My Jobs</TabsTrigger>
        </TabsList>
        <TabsContent value="recommended-jobs" className="">
          <RecommendedJobs onJobSelect={handleJobSelect} freelancerId={freelancerId} />
        </TabsContent>
        <TabsContent value="all-jobs">
          <AllJobs onJobSelect={handleJobSelect} />
        </TabsContent>
        <TabsContent value="my-jobs">
          <MyJobs onJobSelect={handleJobSelect} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
