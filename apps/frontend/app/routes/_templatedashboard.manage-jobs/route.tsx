import { LoaderFunction, ActionFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { JobCardData } from '@mawaheb/db';
import { updateJobStatus, fetchJobsWithApplications } from '~/servers/job.server';
import { requireUserAccountStatusPublishedOrDeactivated } from '~/auth/auth.server';
import { getProfileInfo } from '~/servers/user.server';
import JobManagement from './jobs-displaying';

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

export const loader: LoaderFunction = async ({ request }) => {
  // Step 1: Verify the user is a published employer
  const userId = await requireUserAccountStatusPublishedOrDeactivated(request);

  // Step 2: Fetch employer profile
  const profile = await getProfileInfo({ userId });
  const employerId = profile.id;

  // console.log('Route loader: User profile data', {
  //   accountStatus: profile.account?.accountStatus,
  //   employerId,
  // });

  // For each job, fetch applicants
  const jobsWithApplications = await fetchJobsWithApplications(employerId);

  // Return the fetched data along with the account status
  return Response.json({
    jobs: jobsWithApplications,
    userAccountStatus: profile.account?.accountStatus,
  });
};

// Layout component
export default function Layout() {
  // Get the data from the loader with the correct type
  const loaderData = useLoaderData<{
    jobs: JobCardData[];
    userAccountStatus: string;
  }>();

  // console.log('Layout component: User account status', loaderData.userAccountStatus);

  return (
    <div className="xl:p-8 p-2 mx-2 font-['Switzer-Regular'] w-full">
      <JobManagement data={loaderData.jobs} userAccountStatus={loaderData.userAccountStatus} />
    </div>
  );
}
