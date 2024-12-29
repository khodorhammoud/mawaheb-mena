import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { JobCardData } from "~/types/Job";
import { Freelancer } from "~/types/User";
import {
  getJobById,
  fetchJobApplications,
  getFreelancerDetails,
  getFreelancersIdsByJobId,
} from "~/servers/job.server";
import { requireUserIsEmployerPublished } from "~/auth/auth.server";
import {
  getProfileInfoByAccountId,
  getCurrentProfileInfo,
} from "~/servers/user.server";
import { getAccountBio, getFreelancerAbout } from "~/servers/employer.server";
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
  // ensures that the user is an employer
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
  } else {
    console.log("No freelancers available for this job.");
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
  });
}

const Layout = () => {
  const { jobData } = useLoaderData<{
    jobData: JobCardData;
  }>();

  const { freelancers, accountBio, about } = useLoaderData<LoaderData>(); // needed for the ApplicantComponent

  return (
    <div>
      {/* BACKWARDS ICON */}
      <div className="mb-8">
        <Link to="/manage-jobs">
          <FaArrowLeft className="h-7 w-7 hover:bg-slate-100 transition-all hover:rounded-xl p-1 text-primaryColor cursor-pointer" />
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

      <JobApplicants
        freelancers={freelancers}
        accountBio={accountBio}
        about={about}
        // TODO: only for now // this should be job.state, or something like that, so that the satte will be decided from the database, and the component will act with respect to it :D
        status={JobApplicationStatus.Pending}
      />
    </div>
  );
};

export default Layout;
