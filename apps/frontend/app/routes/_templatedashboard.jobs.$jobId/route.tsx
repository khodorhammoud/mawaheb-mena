import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { JobCardData } from "~/types/Job";
import { Freelancer } from "~/types/User";
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
} from "~/servers/job.server";
import { requireUserIsEmployerPublished } from "~/auth/auth.server";
import {
  getProfileInfoByAccountId,
  getCurrentProfileInfo,
} from "~/servers/user.server";
import { getAccountBio } from "~/servers/employer.server";
import {
  getFreelancerAbout,
  getFreelancerSkills,
  getFreelancerLanguages,
} from "~/servers/freelancer.server";
import JobDesignOne from "../_templatedashboard.manage-jobs/manage-jobs/JobDesignOne";
import JobDesignTwo from "../_templatedashboard.manage-jobs/manage-jobs/JobDesignTwo";
import JobDesignThree from "../_templatedashboard.manage-jobs/manage-jobs/JobDesignThree";
import JobApplicants from "~/common/applicant/JobApplicants";
import { FaArrowLeft } from "react-icons/fa";
import { JobApplicationStatus } from "~/types/enums";

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
    await requireUserIsEmployerPublished(request);

    // Fetch the logged-in employer profile
    const currentProfile = await getCurrentProfileInfo(request);

    const { jobId } = params;
    if (!jobId) {
      return Response.json({ error: "Job ID is required" }, { status: 400 });
    }

    const job = await getJobById(parseInt(jobId));
    if (!job) {
      return Response.json({ error: "Job not found" }, { status: 404 });
    }

    // Restrict access: Ensure the job belongs to the logged-in employer
    if (job.employerId !== currentProfile.id) {
      return redirect(`/manage-jobs`);
    }

    const freelancerIds = await getFreelancersIdsByJobId(parseInt(jobId));
    const freelancers = (await getFreelancerDetails(freelancerIds)) || [];

    // Fetch applicants
    const jobApplications = await fetchJobApplications(parseInt(jobId));

    let profile = null;
    let accountBio = null;
    let about = null;
    let review = null;
    let canReview = false;

    if (freelancers.length > 0) {
      try {
        profile = await getProfileInfoByAccountId(freelancers[0].accountId);

        if (profile && profile.account) {
          accountBio = await getAccountBio(profile.account);
          about = await getFreelancerAbout(profile.account);
        }

        // Get existing review if any
        if (freelancers[0].id && currentProfile.id) {
          review = await getReview({
            reviewerId: currentProfile.id,
            revieweeId: freelancers[0].id,
            reviewType: "employer_review",
          });
          // Check if employer can review (has an application from this freelancer)
          canReview = true; // Employers can always review freelancers who have applied
        }
      } catch (error) {
        console.error("Error fetching profile or account bio:", error);
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
      review,
      canReview,
    });
  } catch (error) {
    console.error("Failed to load job details:", error);
    return Response.json(
      { success: false, error: "Failed to load job details" },
      { status: 500 }
    );
  }
}

export const action = async ({ request }: LoaderFunctionArgs) => {
  // Ensure the user is a published employer
  await requireUserIsEmployerPublished(request);
  const currentProfile = await getCurrentProfileInfo(request);

  try {
    const formData = await request.formData();
    const actionType = formData.get("_action");

    if (actionType === "review") {
      const freelancerId = parseInt(formData.get("freelancerId") as string, 10);
      const rating = parseInt(formData.get("rating") as string, 10);
      const comment = formData.get("comment") as string;

      if (!freelancerId || !rating || !currentProfile.id) {
        return Response.json({
          success: false,
          message: "Missing required review data",
        });
      }

      // Check if there's an existing review
      const existingReview = await getReview({
        reviewerId: currentProfile.id,
        revieweeId: freelancerId,
        reviewType: "employer_review",
      });

      try {
        if (existingReview) {
          // Update existing review
          await updateReview({
            reviewerId: currentProfile.id,
            revieweeId: freelancerId,
            rating,
            comment,
            reviewType: "employer_review",
          });
        } else {
          // Create new review
          await saveReview({
            reviewerId: currentProfile.id,
            revieweeId: freelancerId,
            rating,
            comment,
            reviewType: "employer_review",
          });
        }

        return Response.json({
          success: true,
          message: existingReview
            ? "Review updated successfully"
            : "Review submitted successfully",
        });
      } catch (error) {
        console.error("Error saving review:", error);
        return Response.json({
          success: false,
          message: "Failed to save review",
        });
      }
    }

    return Response.json({ success: false, message: "Invalid action type" });
  } catch (error) {
    console.error("Action error:", error);
    return Response.json({
      success: false,
      message: "An error occurred while processing your request",
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
          freelancers={freelancers}
          accountBio={accountBio}
          status={JobApplicationStatus.Pending}
        />
      ) : (
        <p className="text-center text-gray-500">
          No freelancers available for this job.
        </p>
      )}
    </div>
  );
};

export default Layout;
