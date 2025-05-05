import { LoaderFunctionArgs, ActionFunctionArgs, redirect } from '@remix-run/node';
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
} from '~/servers/job.server';
import { getFreelancerIdByAccountId } from '~/servers/freelancer.server';

// ✅ Define a type for the Loader's return data
export type LoaderData = {
  job: Job & { applicationStatus?: string };
  jobSkills: Skill[];
  review?: { rating: number; comment: string; employerId: number } | null;
  canReview: boolean; // ✅ Add this
  freelancerId: number | null;
};

export async function action({ request }: ActionFunctionArgs) {
  const userId = await requireUserIsFreelancer(request);
  if (!userId) {
    return redirect('/login-employer');
  }

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
    return Response.json({
      success: false,
      message: 'Invalid job or employer ID.',
    });
  }

  const accountId = await getAccountIdbyUserId(userId);

  const freelancerId = await getFreelancerIdByAccountId(accountId);
  if (!freelancerId) {
    return Response.json({
      success: false,
      message: 'Freelancer account not found.',
    });
  }

  // Check if the freelancer has an accepted job application for this employer
  const hasApplication = await hasAcceptedApplication(freelancerId, employerId);

  if (!hasApplication) {
    return Response.json({
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

      return Response.json({ success: true });
    }

    return Response.json({ success: false, message: 'Invalid action type.' });
  } catch (error) {
    return Response.json({ success: false, message: (error as Error).message });
  }
}

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await requireUserIsFreelancer(request);
  if (!userId) return redirect('/login-employer');
  // console.log("🚀 Loader: Account ID =", userId);

  // Get user profile to check account status
  const profile = await getCurrentProfileInfo(request);

  // Check if the user's account is deactivated or not published
  if (!profile?.account || profile.account.accountStatus !== AccountStatus.Published) {
    return redirect('/dashboard');
  }

  const accountType: AccountType = await getCurrentUserAccountType(request);
  if (accountType !== AccountType.Freelancer) return redirect('/dashboard');
  // console.log("🚀 Loader: Account Type =", accountType);

  const url = new URL(request.url);
  const jobId = parseInt(url.searchParams.get('jobId') || '0', 10);
  let employerId = parseInt(url.searchParams.get('employerId') || '0', 10);

  if (jobId > 0 && employerId === 0) {
    employerId = (await getEmployerIdByJobId(jobId)) || 0;
  }

  const accountId = await getAccountIdbyUserId(userId);
  // console.log("🚀 Loader: Account ID =", accountId);

  const freelancerId = await getFreelancerIdByAccountId(accountId);
  // console.log("🚀 Loader: Freelancer ID =", freelancerId);

  if (!freelancerId) {
    return Response.json({
      success: false,
      message: 'Freelancer not found.',
      jobSkills: [],
      review: null,
      canReview: false,
    });
  }
  // console.log("🚀 Loader: Freelancer ID =", freelancerId);

  const jobSkills = jobId > 0 ? await getJobSkills(jobId) : [];
  // console.log("🚀 Loader: Job Skills =", jobSkills);

  const canReview = employerId > 0 ? await hasAcceptedApplication(freelancerId, employerId) : false;

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
  return Response.json({
    jobSkills,
    review: existingReview,
    canReview,
    freelancerId,
  });
}

export default function Layout() {
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const fetcher = useFetcher<LoaderData>();
  const { freelancerId } = useLoaderData<LoaderData>();
  // console.log("freelancerId", freelancerId);

  const handleJobSelect = async (jobData: Job) => {
    setIsLoading(true);
    setSelectedJob(jobData);
    setOpen(true);
    fetcher.load(`/browse-jobs?jobId=${jobData.id}&employerId=${jobData.employerId}`);
    setIsLoading(false);
  };

  return (
    <div>
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
                {selectedJob ? (
                  <SingleJobView
                    job={selectedJob}
                    jobSkills={fetcher.data?.jobSkills || []}
                    review={
                      fetcher.data?.review &&
                      fetcher.data.review.employerId === selectedJob?.employerId
                        ? fetcher.data.review
                        : null
                    }
                    canReview={fetcher.data?.canReview || false} // ✅ Pass canReview properly
                  />
                ) : (
                  'No job selected'
                )}
              </SheetDescription>
            )}
          </SheetHeader>
        </SheetContent>
      </Sheet>

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
