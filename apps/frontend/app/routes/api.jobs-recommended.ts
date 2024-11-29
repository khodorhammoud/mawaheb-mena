import { LoaderFunctionArgs } from "@remix-run/node";
import { getJobsFiltered } from "../servers/job.server";
import { requireUserIsFreelancerPublished } from "~/auth/auth.server";
import { JobFilter } from "~/types/Job";

export async function loader({ request }: LoaderFunctionArgs) {
  // require that current user is a published freelancer
  const userId = await requireUserIsFreelancerPublished(request);
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  // check if user is active
  /* if (user.account.accountStatus !== AccountStatus.Published) {
        return Response.json({ error: "User is not active" }, { status: 401 });
    } */

  // TODO: some very complex fingerprint matching happens here

  const filter: JobFilter = {};

  const jobs = await getJobsFiltered(filter);

  return Response.json({ jobs });
}
