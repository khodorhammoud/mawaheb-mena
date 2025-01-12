// this is the code that is targeted using the fetcher inside recommended jobs

import { LoaderFunctionArgs } from "@remix-run/node";
import { getRecommendedJobs } from "../servers/job.server";
import { getCurrentProfileInfo } from "~/servers/user.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getCurrentProfileInfo(request);

  // TODO: check user is published, and whether it's important for the user to be a freelancer or employer

  const recommendedJobs = await getRecommendedJobs(user.id);
  return Response.json({ jobs: recommendedJobs });
}
