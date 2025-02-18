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
} from "~/servers/job.server";
import { requireUserIsEmployerPublished } from "~/auth/auth.server";
import {
  getProfileInfoByAccountId,
  getCurrentProfileInfo,
} from "~/servers/user.server";
import { getAccountBio } from "~/servers/employer.server";
import { getFreelancerAbout } from "~/servers/freelancer.server";
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

    // Fetch freelancers
    const freelancers = (await getFreelancerDetails(freelancerIds)) || [];

    // Fetch applicants
    const jobApplications = await fetchJobApplications(parseInt(jobId));

    let profile = null;
    let accountBio = null;
    let about = null;
    let review = null;
    let canReview = false;
    let averageRating = 0;

    if (freelancers.length > 0) {
      try {
        profile = await getProfileInfoByAccountId(freelancers[0].accountId);
        if (profile && profile.account) {
          accountBio = await getAccountBio(profile.account);
          about = await getFreelancerAbout(profile);
        }

        // ✅ Fetch review for employer → freelancer (if exists)
        review = await getReview(
          freelancers[0].id,
          currentProfile.id,
          "freelancer_review"
        );

        // ✅ Fetch average rating for the freelancer
        averageRating = await getFreelancerAverageRating(freelancers[0].id); // ✅ New function

        // ✅ Allow reviewing only if the freelancer is linked to the employer
        canReview = freelancers.some(
          (freelancer) => freelancer.accountId === profile?.accountId
        );
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
      applications: jobApplications,
      review, // ✅ Sends back existing review if available
      canReview, // ✅ Tells frontend whether employer can review
      averageRating, // ✅ Send to frontend
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
  await requireUserIsEmployerPublished(request);

  const currentProfile = await getCurrentProfileInfo(request);
  try {
    const formData = await request.formData();
    const actionType = formData.get("_action");

    if (actionType === "review") {
      const freelancerId = parseInt(formData.get("freelancerId") as string, 10);
      const rating = parseInt(formData.get("rating") as string, 10);
      const comment = formData.get("comment") as string;

      if (!freelancerId || !rating) {
        return Response.json({ success: false, message: "Invalid data" });
      }

      // ✅ Ensure employer owns this freelancer's job application
      const jobApplications = await getJobApplicationsForFreelancer(
        freelancerId,
        currentProfile.id
      );
      if (!jobApplications.length) {
        return Response.json({
          success: false,
          message: "Unauthorized to review this freelancer",
        });
      }

      const existingReview = await getReview(
        freelancerId,
        currentProfile.id,
        "freelancer_review"
      );

      if (existingReview) {
        await updateReview({
          reviewerId: currentProfile.id,
          revieweeId: freelancerId,
          rating,
          comment,
          reviewType: "freelancer_review",
        });
      } else {
        await saveReview({
          reviewerId: currentProfile.id,
          revieweeId: freelancerId,
          rating,
          comment,
          reviewType: "freelancer_review",
        });
      }

      return Response.json({ success: true, message: "Review submitted" });
    }

    // ✅ Preserve existing job application status update logic
    const applicationId = parseInt(formData.get("applicationId") as string, 10);
    const newStatus = formData.get(
      "status"
    ) as keyof typeof JobApplicationStatus;

    if (!applicationId || !newStatus) {
      console.error("Invalid input:", { applicationId, newStatus });
      return Response.json(
        { success: false, error: "Invalid input" },
        { status: 400 }
      );
    }

    const ownerEmployerId =
      await getJobApplicationOwnerByApplicationId(applicationId);
    if (!ownerEmployerId || ownerEmployerId !== currentProfile.id) {
      return Response.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const enumKey = newStatus.charAt(0).toUpperCase() + newStatus.slice(1);
    const status = JobApplicationStatus[enumKey];

    if (!status) {
      console.error("Invalid status:", newStatus);
      return Response.json(
        { success: false, error: "Invalid status" },
        { status: 400 }
      );
    }

    const result = await updateJobApplicationStatus(applicationId, status);
    if (result.success) {
      return Response.json({ success: true });
    } else {
      console.error("Database update error:", result.error);
      return Response.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Failed to update job application status:", error);
    return Response.json(
      { success: false, error: "Failed to update job application status" },
      { status: 500 }
    );
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
          about={about}
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
