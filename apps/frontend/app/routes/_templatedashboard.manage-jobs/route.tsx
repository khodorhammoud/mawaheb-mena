import { LoaderFunction, ActionFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import {
  updateJobStatus,
  fetchJobsWithApplications,
  fetchJobApplications,
} from '~/servers/job.server';
import { requireUserAccountStatusPublishedOrDeactivated } from '~/auth/auth.server';
import { getProfileInfo } from '~/servers/user.server';
import JobManagement from './jobs-displaying';
import { JobCardData } from '@mawaheb/db/types';

// --- ACTION ---
export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const jobId = parseInt(formData.get('jobId') as string, 10);
  const newStatus = formData.get('status') as string;

  try {
    await updateJobStatus(jobId, newStatus);
    return Response.json({ success: true });
  } catch (error) {
    console.error('Failed to update job status:', error);
    return Response.json({ success: false, error: 'Failed to update job status' }, { status: 500 });
  }
};

// --- LOADER ---
export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireUserAccountStatusPublishedOrDeactivated(request);
  const profile = await getProfileInfo({ userId });
  const employerId = profile.id;

  const { jobs } = await fetchJobsWithApplications(employerId);

  // Now jobs[i] already has applications and applicationCount
  const jobsWithApplications: JobCardData[] = jobs.map(job => ({
    job: {
      ...job,
      requiredSkills: job.requiredSkills || [],
      expectedHourlyRate: job.expectedHourlyRate ?? 0, // <-- Ensure this field is present
    },
    applications: job.applications,
    applicationCount: job.applicationCount,
  }));

  return Response.json({
    jobs: jobsWithApplications,
    userAccountStatus: profile.account?.accountStatus || 'active',
  });
};

// --- MAIN COMPONENT ---
export default function ManageJobs() {
  const { jobs, userAccountStatus } = useLoaderData<typeof loader>();

  return (
    <div className="container mx-auto px-4 mt-10">
      <JobManagement data={jobs} userAccountStatus={userAccountStatus} />
    </div>
  );
}
