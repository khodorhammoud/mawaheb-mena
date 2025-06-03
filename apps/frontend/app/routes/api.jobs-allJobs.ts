import { LoaderFunctionArgs } from '@remix-run/node';
import { getAllJobs } from '../servers/job.server';
import { requireUserIsFreelancerPublished } from '../auth/auth.server';

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const userId = await requireUserIsFreelancerPublished(request);
    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);
    const offset = parseInt(url.searchParams.get('offset') || '0', 10);
    const freelancerId = url.searchParams.has('freelancerId')
      ? parseInt(url.searchParams.get('freelancerId'))
      : undefined;

    const jobs = await getAllJobs(limit, offset, freelancerId);
    const totalCount = (await getAllJobs(undefined, undefined, freelancerId)).length;

    return Response.json({ jobs, totalCount });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return Response.json({ error: 'Failed to fetch jobs' }, { status: 500 });
  }
}
