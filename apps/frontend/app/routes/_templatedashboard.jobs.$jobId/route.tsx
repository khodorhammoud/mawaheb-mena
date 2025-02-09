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

    // Restrict access: Ensure the job belongs to the logged-in employer, if not, redirect to the all jobs page
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

    if (freelancers.length > 0) {
      try {
        // Fetch the profile for the first freelancer (as an example)
        profile = await getProfileInfoByAccountId(freelancers[0].accountId);
        if (profile && profile.account) {
          accountBio = await getAccountBio(profile.account);
          about = await getFreelancerAbout(profile);
        }
      } catch (error) {
        console.error("Error fetching profile or account bio:", error);
      }
    }

    const jobData: JobCardData = {
      job: {
        ...job,
      },
      applications: jobApplications,
    };

    return Response.json({
      jobData,
      accountBio,
      freelancers,
      about,
      applications: jobApplications,
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

    // extract applicationId and status from the form data
    const applicationId = parseInt(formData.get("applicationId") as string, 10); // convert the applicationId to a number
    const newStatus = formData.get(
      "status"
    ) as keyof typeof JobApplicationStatus; // extracting status as a string

    if (!applicationId || !newStatus) {
      console.error("Invalid input:", { applicationId, newStatus });
      return Response.json(
        { success: false, error: "Invalid input" },
        { status: 400 }
      );
    }

    // check if the current user is the owner of the aplpication
    const ownerEmployerId =
      await getJobApplicationOwnerByApplicationId(applicationId);
    if (!ownerEmployerId || ownerEmployerId !== currentProfile.id) {
      return Response.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // map the incoming status to the enum's key (e.g., "approved" -> "Approved") // NECCESSARY ❤️
    const enumKey = newStatus.charAt(0).toUpperCase() + newStatus.slice(1);
    const status = JobApplicationStatus[enumKey];

    // ensure it matches a valid enum key
    if (!status) {
      console.error("Invalid status:", newStatus);
      return Response.json(
        { success: false, error: "Invalid status" },
        { status: 400 }
      );
    }

    // function that update the status
    const result = await updateJobApplicationStatus(applicationId, status);

    // check if database update was successful
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
