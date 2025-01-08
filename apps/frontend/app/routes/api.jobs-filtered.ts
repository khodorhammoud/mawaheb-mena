import { LoaderFunctionArgs } from "@remix-run/node";
import { requireUserIsFreelancerPublished } from "~/auth/auth.server";
// import { AccountStatus } from "~/types/enums";
// import { JobFilter } from "~/types/Job";
import { getCurrentProfileInfo } from "~/servers/user.server";
import {
  getJobsFiltered,
  getJobApplicationsByFreelancerId,
  getAllJobs,
} from "../servers/job.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getCurrentProfileInfo(request);

  // check if user is active
  /* if (user.account.accountStatus !== AccountStatus.Published) {
        return Response.json({ error: "User is not active" }, { status: 401 });
    } */

  const url = new URL(request.url);
  const searchParams = url.searchParams;
  //   const query = searchParams.get("query");
  // const projectType = searchParams.get("projectType");
  // const experienceLevel = searchParams.get("experienceLevel");
  // const locationPreference = searchParams.get("locationPreference");

  // Fetch all jobs
  const allJobs = await getAllJobs();

  // Fetch job applications
  const appliedJobs = await getJobApplicationsByFreelancerId(user.id);
  const appliedJobIds = appliedJobs.map((application) => application.jobId);

  // Filter out jobs the freelancer has already applied for
  const filteredJobs = allJobs.filter((job) => !appliedJobIds.includes(job.id));

  return Response.json({ jobs: filteredJobs });
}
