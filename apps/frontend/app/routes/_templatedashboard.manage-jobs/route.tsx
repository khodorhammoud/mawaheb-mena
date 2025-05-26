import { LoaderFunction, ActionFunction } from '@remix-run/node';
import { useLoaderData, useNavigate, useSearchParams } from '@remix-run/react';
import { JobCardData, Job } from '@mawaheb/db/types';
import { JobStatus } from '@mawaheb/db/enums';
import { updateJobStatus, fetchJobsWithApplications } from '~/servers/job.server';
import { requireUserAccountStatusPublishedOrDeactivated } from '~/auth/auth.server';
import { getProfileInfo } from '~/servers/user.server';
import JobManagement from './jobs-displaying';
import Carousel from '~/common/Carousel';

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

  // Get page, status, and view mode from URL
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get('page') || '1', 10);
  const viewMode = url.searchParams.get('viewMode') || 'one';
  const statusFilter = url.searchParams.get('status') || 'all';

  // Set limit based on view mode
  const limit = viewMode === 'three' ? 20 : viewMode === 'two' ? 15 : 10;

  // Fetch paginated jobs with applications and filtering
  const { jobs, totalCount, totalPages, currentPage } = await fetchJobsWithApplications(
    employerId,
    page,
    limit,
    statusFilter
  );

  // Calculate start and end job numbers for current page
  const startJob = (currentPage - 1) * limit + 1;
  const endJob = Math.min(startJob + jobs.length - 1, totalCount);

  // Transform jobs into JobCardData format
  const jobsWithApplications: JobCardData[] = jobs.map(job => ({
    job: {
      id: job.id,
      employerId: job.employerId,
      title: job.title,
      description: job.description,
      budget: job.budget,
      workingHoursPerWeek: job.workingHoursPerWeek,
      locationPreference: job.locationPreference,
      projectType: job.projectType,
      experienceLevel: job.experienceLevel,
      status: job.status || JobStatus.Draft,
      createdAt: job.createdAt,
      jobCategoryId: job.jobCategoryId,
      requiredSkills: [],
      fulfilledAt: job.fulfilledAt,
    },
    applications: [],
    applicationCount: 0,
  }));

  return Response.json({
    jobs: jobsWithApplications,
    totalCount,
    totalPages,
    currentPage,
    startJob,
    endJob,
    userAccountStatus: profile.account?.accountStatus || 'active',
    currentFilter: statusFilter,
    currentViewMode: viewMode,
  });
};

// Layout component
export default function ManageJobs() {
  const {
    jobs,
    currentPage,
    totalPages,
    statusFilter,
    currentViewMode,
    totalCount,
    startJob,
    endJob,
  } = useLoaderData<typeof loader>();
  const userAccountStatus = useLoaderData<typeof loader>().userAccountStatus;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const handlePageChange = (page: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', page.toString());
    navigate(`?${newParams.toString()}`);
  };

  return (
    <div className="container mx-auto px-4 mt-10">
      <JobManagement
        data={jobs}
        userAccountStatus={userAccountStatus}
        initialFilter={statusFilter}
        initialViewMode={currentViewMode}
        totalCount={totalCount}
        startJob={startJob}
        endJob={endJob}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
