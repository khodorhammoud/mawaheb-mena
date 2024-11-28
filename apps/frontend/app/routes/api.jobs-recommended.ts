import { LoaderFunctionArgs } from "@remix-run/node";
import { getJobsFiltered } from "../servers/job.server";
import { authenticator } from "~/auth/auth.server";
import { JobFilter } from "~/types/Job";

export async function loader({ request }: LoaderFunctionArgs) {
  // if the curretn user is not logged in, redirect them to the login screen
  const user = await authenticator.isAuthenticated(request);
  if (!user) {
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
