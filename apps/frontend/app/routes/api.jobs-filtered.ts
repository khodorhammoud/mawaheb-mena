import { LoaderFunctionArgs } from "@remix-run/node";
import { getJobsFiltered } from "../servers/job.server";
import { requireUserIsFreelancerPublished } from "~/auth/auth.server";
// import { AccountStatus } from "~/types/enums";
import { JobFilter } from "~/types/Job";

export async function loader({ request }: LoaderFunctionArgs) {
  // user must be a published freelancer
  const userId = await requireUserIsFreelancerPublished(request);
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  // check if user is active
  /* if (user.account.accountStatus !== AccountStatus.Published) {
        return Response.json({ error: "User is not active" }, { status: 401 });
    } */

  const url = new URL(request.url);
  const searchParams = url.searchParams;
  //   const query = searchParams.get("query");
  const projectType = searchParams.get("projectType");
  const experienceLevel = searchParams.get("experienceLevel");
  const locationPreference = searchParams.get("locationPreference");

  const filter: JobFilter = {
    projectType: projectType ? [projectType] : [],
    experienceLevel: experienceLevel ? [experienceLevel] : [],
    locationPreference: locationPreference ? [locationPreference] : [],
  };

  const jobs = await getJobsFiltered(filter);

  return Response.json({ jobs });
}
