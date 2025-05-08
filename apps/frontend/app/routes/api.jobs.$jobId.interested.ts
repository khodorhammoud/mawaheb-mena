import { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import {
  createJobApplication,
  getJobApplicationByJobIdAndFreelancerId,
  getJobById,
} from '../servers/job.server';
import { requireUserIsFreelancerPublished } from '~/auth/auth.server';
import { JobFilter } from '@mawaheb/db/types';
import { JobStatus } from '@mawaheb/db/enums';
import { getProfileInfo } from '~/servers/user.server';

export async function loader({ request }: LoaderFunctionArgs) {
  // user must be a published freelancer
  const userId = await requireUserIsFreelancerPublished(request);
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

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

  return Response.json({ hi: 'hi' });
}

export async function action({ request, params }: ActionFunctionArgs) {
  // user must be a published freelancer
  const userId = await requireUserIsFreelancerPublished(request);
  const { jobId } = params; // Extract the jobId
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // const url = new URL(request.url);

  // const jobId = url.searchParams.get("jobId");
  if (!jobId) {
    console.error('Job ID is required');
    return Response.json({ error: 'Job ID is required' }, { status: 400 });
  }

  // check if the job exists
  const job = await getJobById(parseInt(jobId));
  if (!job) {
    return Response.json({ error: 'Job not found' }, { status: 404 });
  }

  // check if the job is already closed
  if (job.status !== JobStatus.Active) {
    return Response.json({ error: 'Job is not active' }, { status: 400 });
  }

  // check if the job is already filled
  if (job.fulfilledAt) {
    return Response.json({ error: 'Job is already filled' }, { status: 400 });
  }

  // get user account from user id
  const freelancer = await getProfileInfo({ userId });

  // check if the user has already applied for this job
  const jobApplication = await getJobApplicationByJobIdAndFreelancerId(
    parseInt(jobId),
    freelancer.account.id
  );
  if (jobApplication) {
    return Response.json({ error: 'User has already applied for this job' }, { status: 400 });
  }

  // TODO: further checks to see if user has the right to apply for this job
  // like if the user has exceeded their max application limit for this job

  // create the job application
  try {
    const jobApplication = await createJobApplication(parseInt(jobId), freelancer.id);
    return Response.json({ success: true, jobApplication });
  } catch (error) {
    return Response.json({ success: false, error });
  }
}
