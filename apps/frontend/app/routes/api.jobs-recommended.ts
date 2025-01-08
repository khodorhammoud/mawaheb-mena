// this is the code that is targeted using the fetcher inside recommended jobs

import { LoaderFunctionArgs } from "@remix-run/node";
import {
  getJobsFiltered,
  getJobApplicationsByFreelancerId,
  getAllJobs,
} from "../servers/job.server";
import { requireUserIsFreelancerPublished } from "~/auth/auth.server";
import { JobFilter } from "~/types/Job";
import { getCurrentProfileInfo } from "~/servers/user.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getCurrentProfileInfo(request);

  // check if user is active
  /* if (user.account.accountStatus !== AccountStatus.Published) {
        return Response.json({ error: "User is not active" }, { status: 401 });
    } */

  // TODO: some very complex fingerprint matching happens here

  // Fetch all jobs
  const allJobs = await getAllJobs();

  // Fetch job applications
  const appliedJobs = await getJobApplicationsByFreelancerId(user.id);
  const appliedJobIds = appliedJobs.map((application) => application.jobId);

  // Filter out jobs the freelancer has already applied for
  const filteredJobs = allJobs.filter((job) => !appliedJobIds.includes(job.id));

  return Response.json({ jobs: filteredJobs });
}
