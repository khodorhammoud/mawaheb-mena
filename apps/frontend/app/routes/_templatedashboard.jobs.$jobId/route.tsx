import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { JobCardData } from "~/types/Job";
import { Freelancer, UserAccount } from "~/types/User";
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
  getCurrentProfileInfo,
  getCurrentUserAccountType,
  getCurrentUser,
} from "~/servers/user.server";
import { getAccountBio } from "~/servers/employer.server";
import JobDesignOne from "../_templatedashboard.manage-jobs/manage-jobs/JobDesignOne";
import JobDesignTwo from "../_templatedashboard.manage-jobs/manage-jobs/JobDesignTwo";
import JobDesignThree from "../_templatedashboard.manage-jobs/manage-jobs/JobDesignThree";
import JobApplicants from "~/common/applicant/JobApplicants";
import { FaArrowLeft } from "react-icons/fa";
import { JobApplicationStatus, AccountType } from "~/types/enums";

export type LoaderData = {
  jobData: JobCardData;
  freelancers: Freelancer[];
  accountBio: any;
  about: string;
};

export async function loader({ request, params }: LoaderFunctionArgs) {
  await requireUserIsEmployerPublished(request);

  const [accountType, currentProfile, currentUser] = await Promise.all([
    getCurrentUserAccountType(request),
    getCurrentProfileInfo(request),
    getCurrentUser(request),
  ]);
  if (!currentUser) throw new Error("User not authenticated");

  const { jobId } = params;
  if (!jobId) throw new Error("Job ID is required");

  const [job, freelancerIds, jobApplications] = await Promise.all([
    getJobById(parseInt(jobId)),
    getFreelancersIdsByJobId(parseInt(jobId)),
    fetchJobApplications(parseInt(jobId)),
  ]);

  if (!job) throw new Error("Job not found");
  if (job.employerId !== currentProfile.id) return redirect(`/manage-jobs`);

  const freelancers = (await getFreelancerDetails(freelancerIds)) || [];

  function safeParseArray(data: any): any[] {
    try {
      return typeof data === "string"
        ? JSON.parse(data)
        : Array.isArray(data)
          ? data
          : [];
    } catch {
      console.error("Error parsing array:", data);
      return [];
    }
  }

  const parsedFreelancers = freelancers.map((f) => ({
    ...f,
    portfolio: Array.isArray(f.portfolio)
      ? f.portfolio
      : safeParseArray(f.portfolio),
    workHistory: Array.isArray(f.workHistory)
      ? f.workHistory
      : safeParseArray(f.workHistory),
    certificates: Array.isArray(f.certificates)
      ? f.certificates
      : safeParseArray(f.certificates),
    educations: Array.isArray(f.educations)
      ? f.educations
      : safeParseArray(f.educations),
  }));

  const profile = parsedFreelancers[0]
    ? await getCurrentProfileInfo(request)
    : null;

  const accountBio = profile ? await getAccountBio(profile.account) : null;

  // const bioInfo = await getAccountBio(currentProfile.account);

  return Response.json({
    jobData: { job, applications: jobApplications },
    freelancers: parsedFreelancers,
    profile,
    accountBio,
    accountType,
    currentProfile,
    currentUser,
    isOwner: currentProfile.account.user.id === currentUser.id,
    accountOnboarded: currentProfile.account.user.isOnboarded,
    // bioInfo, // add this for the if you want to add the Heading component
  });
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
  const { jobData, freelancers, accountBio } = useLoaderData<LoaderData>();

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

      {jobData ? (
        <div>
          <JobApplicants
            freelancers={freelancers ?? []}
            accountBio={accountBio ?? {}}
            status={JobApplicationStatus.Pending}
          />
        </div>
      ) : (
        <p className="text-center text-gray-500">
          Job applicants not available.
        </p>
      )}
    </div>
  );
};

export default Layout;
