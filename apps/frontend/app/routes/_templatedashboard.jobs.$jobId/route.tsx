import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Job } from "~/types/Job";
import { Freelancer } from "~/types/User";
import {
  getJobById,
  fetchJobApplications,
  getFreelancerDetails,
  getFreelancersIdsByJobId,
} from "~/servers/job.server";
import { requireUserIsEmployerPublished } from "~/auth/auth.server";
import { getProfileInfoByAccountId } from "~/servers/user.server";
import { getAccountBio, getFreelancerAbout } from "~/servers/employer.server";
import JobDesignOne from "../_templatedashboard.manage-jobs/manage-jobs/JobDesignOne";
import JobDesignTwo from "../_templatedashboard.manage-jobs/manage-jobs/JobDesignTwo";
import JobDesignThree from "../_templatedashboard.manage-jobs/manage-jobs/JobDesignThree";
import ApplicantComponent from "~/common/applicant/ApplicantComponent";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export type LoaderData = {
  job: Job & { applicants: any[] };
  freelancers: Freelancer[];
  accountBio;
  about;
};

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { jobId } = params;
  if (!jobId) {
    return Response.json({ error: "Job ID is required" }, { status: 400 });
  }

  const job = await getJobById(parseInt(jobId));
  if (!job) {
    return Response.json({ error: "Job not found" }, { status: 404 });
  }

  const freelancerIds = await getFreelancersIdsByJobId(parseInt(jobId));

  // Fetch freelancers
  const freelancers = (await getFreelancerDetails(freelancerIds)) || [];

  // Fetch applicants
  const applicants = await fetchJobApplications(parseInt(jobId));

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
  } else {
    console.log("No freelancers available for this job.");
  }

  const enrichedJob = {
    ...job,
    applicants,
  };

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
  const { freelancers, accountBio, about } = useLoaderData<LoaderData>(); // needed for the ApplicantComponent

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
      {job ? (
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
      ) : (
        <p className="text-center text-gray-500">Job details not available.</p>
      )}

      <ApplicantComponent
        job={job}
        freelancers={freelancers}
        accountBio={accountBio}
        about={about}
        state="default" // only for now // this should be job.state, or something like that, so that the satte will be decided from the database, and the component will act with respect to it :D
      />
    </div>
  );
};

export default Layout;
