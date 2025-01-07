import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { getJobApplicationsByJobId } from "../servers/job.server";
import { requireUserAccountStatusPublished } from "~/auth/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  // user must be a published freelancer
  await requireUserAccountStatusPublished(request);
  const url = new URL(request.url);
  const jobIds = url.searchParams.getAll("jobIds"); // Fetch all `jobIds` query parameters

  //const jobIds = JSON.parse(jobIds_String) as unknown as number[];

  if (jobIds.length === 0) {
    return Response.json(
      { error: "jobIds parameter is required" },
      { status: 400 }
    );
  }
  const jobIdsParsed = jobIds.map((jobId) => parseInt(jobId));

  const jobApplications = await getJobApplicationsByJobId(jobIdsParsed);
  return Response.json({ jobApplications });
}

export async function action({ request }: ActionFunctionArgs) {
  await requireUserAccountStatusPublished(request);
  const formData = await request.formData();

  const jobId = formData.get("jobId");
  if (!jobId) {
    return Response.json({ error: "jobId is required" }, { status: 400 });
  }

  const jobApplications = await getJobApplicationsByJobId(
    parseInt(jobId as string)
  );

  return Response.json({ jobApplications });
}
