// this is the code that is targeted using the fetcher inside my jobs

import { LoaderFunctionArgs } from '@remix-run/node';
import { getMyJobs } from '../servers/job.server';
import { getCurrentProfileInfo } from '~/servers/user.server';

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getCurrentProfileInfo(request);

  // TODO: check user is published, and whether it's important for the user to be a freelancer or employer

  // Parse pagination parameters
  const url = new URL(request.url);
  const limit = parseInt(url.searchParams.get('limit') || '10', 10);

  // Get all jobs to calculate total count
  const myJobs = await getMyJobs(user.id);
  const totalCount = myJobs.length;

  // Get paginated jobs
  const paginatedJobs = await getMyJobs(user.id, limit);

  return Response.json({
    jobs: paginatedJobs,
    totalCount,
  });
}
