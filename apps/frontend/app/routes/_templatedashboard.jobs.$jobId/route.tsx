import { LoaderFunctionArgs, redirect } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import { JobCardData } from '@mawaheb/db';
import { Freelancer } from '@mawaheb/db';

import {
  getJobById,
  fetchJobApplications,
  getFreelancerDetails,
  getFreelancersIdsByJobId,
  updateJobApplicationStatus,
  // getJobApplicationsByJobId,
  // getJobApplicationById,
  getJobApplicationOwnerByApplicationId,
  getReview,
  updateReview,
  saveReview,
  getJobApplicationsForFreelancer,
  getFreelancerAverageRating,
  hasAcceptedApplication,
} from '~/servers/job.server';
import { requireUserIsEmployerPublishedOrDeactivated } from '~/auth/auth.server';
import { getProfileInfoByAccountId, getCurrentProfileInfo } from '~/servers/user.server';
import { getAccountBio } from '~/servers/employer.server';
import {
  getFreelancerAbout,
  getFreelancerSkills,
  getFreelancerLanguages,
} from '~/servers/freelancer.server';
import JobDesignOne from '../_templatedashboard.manage-jobs/manage-jobs/JobDesignOne';
import JobDesignTwo from '../_templatedashboard.manage-jobs/manage-jobs/JobDesignTwo';
import JobDesignThree from '../_templatedashboard.manage-jobs/manage-jobs/JobDesignThree';
import JobApplicants from '~/common/applicant/JobApplicants';
import { FaArrowLeft } from 'react-icons/fa';
import { JobApplicationStatus } from '@mawaheb/db';

export type LoaderData = {
  jobData: JobCardData;
  freelancers: Freelancer[];
  accountBio;
  about;
  review?: { rating: number; comment: string } | null;
  canReview: boolean;
};

export async function loader({ request, params }: LoaderFunctionArgs) {
  try {
    // Ensures that the user is an employer
    await requireUserIsEmployerPublishedOrDeactivated(request);

    // Fetch the logged-in employer profile
    const currentProfile = await getCurrentProfileInfo(request);

    const { jobId } = params;
    if (!jobId) {
      return Response.json({ error: 'Job ID is required' }, { status: 400 });
    }

    const job = await getJobById(parseInt(jobId));
    if (!job) {
      return Response.json({ error: 'Job not found' }, { status: 404 });
    }

    // Restrict access: Ensure the job belongs to the logged-in employer
    if (job.employerId !== currentProfile.id) {
      return redirect(`/manage-jobs`);
    }

    const freelancerIds = await getFreelancersIdsByJobId(parseInt(jobId));
    let freelancers = (await getFreelancerDetails(freelancerIds)) || [];

    // Process freelancers to convert string dates to Date objects in workHistory
    freelancers = freelancers.map(freelancer => ({
      ...freelancer,
      workHistory: Array.isArray(freelancer.workHistory)
        ? freelancer.workHistory.map(work => ({
            ...work,
            startDate: work.startDate ? new Date(work.startDate) : new Date(),
            endDate: work.endDate ? new Date(work.endDate) : new Date(),
          }))
        : [],
      // Convert other date fields if needed
    }));

    // Fetch applicants
    const jobApplications = await fetchJobApplications(parseInt(jobId));

    let profile = null;
    let accountBio = null;
    let about = null;
    let canReview = false;

    // Enhance freelancers with review data
    if (freelancers.length > 0 && currentProfile.id) {
      // Get reviews for all freelancers
      const enhancedFreelancers = await Promise.all(
        freelancers.map(async freelancer => {
          // Get existing review if any for this specific freelancer
          const review = await getReview({
            employerId: currentProfile.id,
            freelancerId: freelancer.id,
            reviewType: 'employer_review',
          });

          return {
            ...freelancer,
            review: review
              ? {
                  rating: review.rating,
                  comment: review.comment,
                }
              : null,
          };
        })
      );

      freelancers = enhancedFreelancers;

      // Get profile info for the first freelancer (for backward compatibility)
      try {
        profile = await getProfileInfoByAccountId(freelancers[0].accountId);

        if (profile && profile.account) {
          accountBio = await getAccountBio(profile.account);
          about = await getFreelancerAbout(profile.account);
        }

        // Check if employer can review (has an application from this freelancer)
        canReview = true; // Employers can always review freelancers who have applied
      } catch (error) {
        console.error('Error fetching profile or account bio:', error);
      }
    }

    const jobData: JobCardData = {
      job: { ...job },
      applications: jobApplications,
    };

    return Response.json({
      jobData,
      accountBio,
      freelancers,
      about,
      canReview,
    });
  } catch (error) {
    console.error('Failed to load job details:', error);
    return Response.json({ success: false, error: 'Failed to load job details' }, { status: 500 });
  }
}

export const action = async ({ request }: LoaderFunctionArgs) => {
  // Ensure the user is a published employer
  await requireUserIsEmployerPublishedOrDeactivated(request);
  const currentProfile = await getCurrentProfileInfo(request);

  try {
    const formData = await request.formData();
    const actionType = formData.get('_action');

    if (actionType === 'review') {
      const freelancerId = parseInt(formData.get('freelancerId') as string, 10);
      const rating = parseInt(formData.get('rating') as string, 10);
      const comment = formData.get('comment') as string;

      if (!freelancerId || !rating || !currentProfile.id) {
        return Response.json({
          success: false,
          message: 'Missing required review data',
        });
      }

      // Check if there's an existing review
      const existingReview = await getReview({
        employerId: currentProfile.id,
        freelancerId: freelancerId,
        reviewType: 'employer_review',
      });

      try {
        if (existingReview) {
          // Update existing review
          await updateReview({
            employerId: currentProfile.id,
            freelancerId: freelancerId,
            rating,
            comment,
            reviewType: 'employer_review',
          });
        } else {
          // Create new review
          await saveReview({
            employerId: currentProfile.id,
            freelancerId: freelancerId,
            rating,
            comment,
            reviewType: 'employer_review',
          });
        }

        return Response.json({
          success: true,
          message: existingReview ? 'Review updated successfully' : 'Review submitted successfully',
        });
      } catch (error) {
        console.error('Error saving review:', error);
        return Response.json({
          success: false,
          message: 'Failed to save review',
        });
      }
    }

    return Response.json({ success: false, message: 'Invalid action type' });
  } catch (error) {
    console.error('Action error:', error);
    return Response.json({
      success: false,
      message: 'An error occurred while processing your request',
    });
  }
};

const Layout = () => {
  const { jobData } = useLoaderData<{
    jobData: JobCardData;
  }>();

  const { freelancers, accountBio, about } = useLoaderData<LoaderData>(); // needed for the ApplicantComponent

  return (
    <div>
      {/* BACKWARDS ICON */}
      <div className="mb-8 mt-4">
        <Link to="/manage-jobs">
          <FaArrowLeft className="h-10 w-10 hover:bg-slate-100 transition-all hover:rounded-full p-2 text-primaryColor cursor-pointer" />
        </Link>
      </div>

      {/* SINGLE JOB */}
      {jobData ? (
        <div>
          {/* Show JobDesignOne on md and larger screens */}
          <div className="hidden md:block">
            <JobDesignOne data={jobData} />
          </div>
          {/* Show JobDesignTwo only on sm screens */}
          <div className="hidden sm:block md:hidden">
            <JobDesignTwo data={jobData} />
          </div>
          {/* Show JobDesignThree on screens smaller than sm */}
          <div className="block sm:hidden">
            <JobDesignThree data={jobData} />
          </div>
        </div>
      ) : (
        <p className="text-center text-gray-500">Job details not available.</p>
      )}

      {freelancers.length > 0 ? (
        <JobApplicants
          freelancers={freelancers as Freelancer[]}
          accountBio={accountBio}
          status={JobApplicationStatus.Pending}
        />
      ) : (
        <p className="text-center text-gray-500">No freelancers available for this job.</p>
      )}
    </div>
  );
};

export default Layout;
