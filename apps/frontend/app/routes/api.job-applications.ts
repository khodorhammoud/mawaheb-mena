import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { getJobApplicationsByJobId } from "../servers/job.server";
import { requireUserAccountStatusPublished } from "~/auth/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  // user must be a published freelancer
  await requireUserAccountStatusPublished(request);
  const url = new URL(request.url);
  const jobIds = url.searchParams.getAll("jobIds"); // Fetch all `jobIds` query parameters
  console.log("jobIds_String", jobIds_String);
  //const jobIds = JSON.parse(jobIds_String) as unknown as number[];

  if (jobIds.length === 0) {
    return Response.json(
      { error: "jobIds parameter is required" },
      { status: 400 }
    );
  }
  console.log("jobIds", jobIds);
  const jobApplications = await getJobApplicationsByJobId(jobIds);
  return Response.json({ jobApplications });
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const jobIds = formData.get("jobIds");
  console.log("jobIds", jobIds);
  const jobIdsArray = JSON.parse(jobIds as string) as unknown as number[];
  const jobApplications = await getJobApplicationsByJobId(jobIdsArray);
  return Response.json({ jobApplications });
}
