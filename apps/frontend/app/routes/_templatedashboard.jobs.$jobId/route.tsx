import { LoaderFunctionArgs } from "@remix-run/node";
import { getJobById } from "~/servers/job.server";
import { requireUserIsEmployerPublished } from "~/auth/auth.server";
import { getProfileInfo } from "~/servers/user.server";
import { Job } from "~/types/Job";
import { useLoaderData } from "@remix-run/react";

export async function loader({ request, params }: LoaderFunctionArgs) {
  // user must be a published freelancer
  const userId = await requireUserIsEmployerPublished(request);
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { jobId } = params; // Extract the jobId

  if (!jobId) {
    console.log("Job ID is required");
    return Response.json({ error: "Job ID is required" }, { status: 400 });
  }

  // check if the job exists
  const job = await getJobById(parseInt(jobId));
  if (!job) {
    return Response.json({ error: "Job not found" }, { status: 404 });
  }

  const employer = await getProfileInfo({ userId });

  // check if the job belongs to the employer
  if (job.employerId !== employer.id) {
    return Response.json(
      { error: "Job does not belong to the employer" },
      { status: 403 }
    );
  }

  return Response.json({ job });
}

const Layout = () => {
  const { job } = useLoaderData<{
    job: Job;
  }>();

  return <div>{JSON.stringify(job)}</div>;
};

export default Layout;
