// this is the code that is targeted using the fetcher inside my jobs

import { LoaderFunctionArgs } from "@remix-run/node";
import { getMyJobs } from "../servers/job.server";
import { getCurrentProfileInfo } from "~/servers/user.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getCurrentProfileInfo(request);

  // TODO: check user is published, and whether it's important for the user to be a freelancer or employer

  const myJobs = await getMyJobs(user.id);
  return Response.json({ jobs: myJobs });
}
