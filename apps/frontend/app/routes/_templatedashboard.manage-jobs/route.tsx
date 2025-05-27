import { LoaderFunction, ActionFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { updateJobStatus, fetchJobsWithApplications } from '~/servers/job.server';
import { requireUserAccountStatusPublishedOrDeactivated } from '~/auth/auth.server';
import { getProfileInfo } from '~/servers/user.server';
import JobManagement from './jobs-displaying';

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

  // Fetch ALL jobs with skills, no paging
  const { jobs } = await fetchJobsWithApplications(employerId);

  // Convert to JobCardData[] as expected by JobManagement
  const jobsWithApplications = jobs.map(job => ({
    job: {
      ...job,
      requiredSkills: job.requiredSkills || [],
    },
    applications: [],
    applicationCount: 0,
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
