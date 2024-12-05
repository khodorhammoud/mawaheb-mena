import { LoaderFunctionArgs } from "@remix-run/node";
import { getJobById } from "~/servers/job.server";
import { requireUserIsEmployerPublished } from "~/auth/auth.server";
import { getProfileInfo } from "~/servers/user.server";
import { Job } from "~/types/Job";
import { useLoaderData } from "@remix-run/react";
import JobDesignOne from "../_templatedashboard.manage-jobs/manage-jobs/JobDesignOne";
import JobDesignTwo from "../_templatedashboard.manage-jobs/manage-jobs/JobDesignTwo";
import JobDesignThree from "../_templatedashboard.manage-jobs/manage-jobs/JobDesignThree";
import { fetchJobApplications } from "~/servers/job.server";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Applicants from "./applicants/applicants";
import { Freelancer } from "~/types/User";
import { getFreelancersForJob } from "~/servers/job.server";
import { getProfileInfoByAccountId } from "~/servers/user.server";
import { getAccountBio } from "~/servers/employer.server";
import { getFreelancerAbout } from "~/servers/employer.server";

export type LoaderData = {
  job: Job & { applicants: any[] };
  freelancers: Freelancer[];
  accountBio;
  about;
};

export async function loader({ request, params }: LoaderFunctionArgs) {
  // Step 1: Authenticate the user
  const userId = await requireUserIsEmployerPublished(request);
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { jobId } = params;

  if (!jobId) {
    return Response.json({ error: "Job ID is required" }, { status: 400 });
  }

  // Fetch freelancers who applied for the job
  const freelancers = (await getFreelancersForJob(parseInt(jobId))) || [];

  if (freelancers.length === 0) {
    return Response.json(
      { error: "No freelancers found for this job" },
      { status: 404 }
    );
  }

  // Fetch the profile for the first freelancer (as an example)
  let profile = null;
  let accountBio = null;
  let about = null;

  try {
    profile = await getProfileInfoByAccountId(freelancers[0].account_id); // Assuming the first freelancer for this example
    accountBio = await getAccountBio(profile.account);
  } catch (error) {
    console.error("Error fetching account bio:", error);
  }

  about = await getFreelancerAbout(profile);

  // Fetch the job details
  const job = await getJobById(parseInt(jobId));
  if (!job) {
    return Response.json({ error: "Job not found" }, { status: 404 });
  }

  // Verify the job belongs to the employer
  const employer = await getProfileInfo({ userId });
  if (job.employerId !== employer.id) {
    return Response.json(
      { error: "Job does not belong to the employer" },
      { status: 403 }
    );
  }

  // Fetch the applicants for the job
  const applicants = await fetchJobApplications(parseInt(jobId));

  // Enrich the job details
  const enrichedJob = {
    ...job,
    applicants,
  };

  // Return the enriched job, freelancers, and accountBio
  return Response.json({
    job: enrichedJob,
    freelancers,
    accountBio,
    about,
  });
}

const Layout = () => {
  const { job } = useLoaderData<{
    job: Job & { applicants: any[]; interviewedCount: number };
  }>();

  const navigate = useNavigate();

  const handleBackClick = () => {
    navigate("/manage-jobs"); // Navigate to the manage-jobs page
  };

  return (
    <div>
      {/* BACKWARDS ICON */}
      <div className="mb-8">
        <FaArrowLeft
          onClick={handleBackClick}
          className="h-7 w-7 hover:bg-slate-100 transition-all hover:rounded-xl p-1 text-primaryColor cursor-pointer"
        />
      </div>

      {/* SINGLE JOB */}
      <div>
        {/* Show JobDesignOne on md and larger screens */}
        <div className="hidden md:block">
          <JobDesignOne job={job} />
        </div>
        {/* Show JobDesignTwo only on sm screens */}
        <div className="hidden sm:block md:hidden">
          <JobDesignTwo job={job} />
        </div>
        {/* Show JobDesignThree on screens smaller than sm */}
        <div className="block sm:hidden">
          <JobDesignThree job={job} />
        </div>
      </div>

      {/* TITLE and BUTTONS */}
      <div className="mt-20 mb-10 md:flex md:gap-10 gap-4 items-center">
        <h2 className="font-semibold xl:text-3xl md:text-2xl text-xl ml-1">
          Applicants
        </h2>
        <div className="sm:flex grid grid-cols-1 w-[60%] xs:w-[60%] ml-0 gap-1 xl:space-x-2 lg:space-x-1 md:mt-0 mt-4">
          <button className="text-primaryColor hover:text-white border border-gray-300 rounded-xl xl:px-4 px-2 py-2 hover:bg-primaryColor-dark not-active-gradient text-sm xl:text-base">
            Interviewed
          </button>
          <button className="text-primaryColor hover:text-white border border-gray-300 rounded-xl xl:px-4 px-2 py-2 hover:bg-primaryColor-dark not-active-gradient text-sm xl:text-base">
            shortlisted
          </button>
          <button className="text-primaryColor hover:text-white border border-gray-300 rounded-xl xl:px-4 px-2 py-2 hover:bg-primaryColor-dark not-active-gradient text-sm xl:text-base">
            Hired
          </button>
        </div>
      </div>
      <Applicants />
    </div>
  );
};

export default Layout;
