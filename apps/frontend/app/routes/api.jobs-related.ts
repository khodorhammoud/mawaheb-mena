import { LoaderFunctionArgs } from '@remix-run/node';
import { getJobsFiltered } from '../servers/job.server';
import { requireUserIsFreelancerPublished } from '~/auth/auth.server';
import { JobFilter } from '@mawaheb/db/types';

export async function loader({ request }: LoaderFunctionArgs) {
  // user must be a published freelancer
  const userId = await requireUserIsFreelancerPublished(request);
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // check if user is active
  /* if (user.account.accountStatus !== AccountStatus.Published) {
        return Response.json({ error: "User is not active" }, { status: 401 });
    } */
  const filter: JobFilter = {};

  //  get query params for related job type
  const url = new URL(request.url);
  const jobType = url.searchParams.get('jobType');
  if (jobType == 'by-employer') {
    // get employer id from query params
    const employerId = parseInt(url.searchParams.get('employerId') || '0');
    if (employerId > 0) {
      filter.employerId = employerId;
      filter.pageSize = 2;
    }
  }

  // some very complex fingerprint matching happens here

  const jobs = await getJobsFiltered(filter);

  return Response.json({ jobs });
}
