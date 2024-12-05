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
  console.log("params:", params); // Debug line

  // Authenticate the user
  const userId = await requireUserIsEmployerPublished(request);
  console.log("Authenticated user ID:", userId);

  const { jobId } = params;
  if (!jobId) {
    console.log("Job ID is required");
    return Response.json({ error: "Job ID is required" }, { status: 400 });
  }

  const job = await getJobById(parseInt(jobId));
  if (!job) {
    console.log("Job not found for ID:", jobId);
    return Response.json({ error: "Job not found" }, { status: 404 });
  }
  console.log("Job fetched successfully:", job);

  // Fetch freelancers
  const freelancers = (await getFreelancersForJob(parseInt(jobId))) || [];
  console.log("Freelancers fetched for job:", freelancers);

  // Fetch applicants
  const applicants = await fetchJobApplications(parseInt(jobId));
  console.log("Applicants fetched for job:", applicants);

  let profile = null;
  let accountBio = null;
  let about = null;

  if (freelancers.length > 0) {
    try {
      // Fetch the profile for the first freelancer (as an example)
      profile = await getProfileInfoByAccountId(freelancers[0].account_id);
      if (profile && profile.account) {
        accountBio = await getAccountBio(profile.account);
        about = await getFreelancerAbout(profile);
      }
    } catch (error) {
      console.error("Error fetching profile or account bio:", error);
    }
  } else {
    console.log("No freelancers available for this job.");
  }

  const enrichedJob = {
    ...job,
    applicants,
  };
  console.log("Enriched job object:", enrichedJob);

  return Response.json({
    job: enrichedJob,
    accountBio,
    freelancers,
    about,
  });
}

const Layout = () => {
  const { job } = useLoaderData<{
    job: Job & { applicants: any[]; interviewedCount: number };
  }>();

  console.log("lanshooooof 2iza fi jobay");
  console.log("Loaded Job:", job); // Add this line to inspect the job object

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
        {job ? (
          <JobDesignOne job={job} />
        ) : (
          <p className="text-center text-gray-500">
            Job details not available.
          </p>
        )}
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
