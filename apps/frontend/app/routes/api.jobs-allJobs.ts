// i used for the AllJobs tab these codes: Job.ts / job.server.ts / allJobs.tsx / this file :)
// -- HOW IT ALL CONNECTS --
// 1. User applies filters/search on the AllJobs tab UI (allJobs.tsx).
// 2. allJobs.tsx sends filter/search params to the API loader (this file) using fetcher.submit.
// 3. The loader parses these params, builds a JobFilter, and calls getAllJobs() in job.server.ts.
// 4. getAllJobs() queries the database using the filter criteria and returns the filtered job data.
// 5. The loader returns these jobs as JSON to allJobs.tsx, which renders the job cards.
// 6. All types are shared and enforced via Job.ts for safety and clarity.

import { LoaderFunctionArgs } from '@remix-run/node';
import { getAllJobs } from '../servers/job.server';
import { requireUserIsFreelancerPublished } from '../auth/auth.server';
import { JobFilter } from '@mawaheb/db/types';

// Loader function to handle fetching jobs with filtering and pagination
export async function loader({ request }: LoaderFunctionArgs) {
  try {
    // Ensure the user is an authenticated freelancer (and published)
    const userId = await requireUserIsFreelancerPublished(request);
    if (!userId) {
      // User not authorized, return 401 response
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse query parameters from the request URL
    const url = new URL(request.url);

    // Parse pagination settings: limit (number of jobs), offset (start position)
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);
    const offset = parseInt(url.searchParams.get('offset') || '0', 10);

    // Parse freelancer ID (if present, used for application status)
    const freelancerId = url.searchParams.has('freelancerId')
      ? parseInt(url.searchParams.get('freelancerId')!, 10)
      : undefined;

    // Parse job filtering criteria from query params
    const jobType = url.searchParams.getAll('jobType'); // array (frontend sends jobType)
    const locationPreference = url.searchParams.getAll('locationPreference'); // array
    const experienceLevel = url.searchParams.getAll('experienceLevel'); // array

    // Optional employer filter (show jobs from a specific employer)
    const employerId = url.searchParams.has('employerId')
      ? parseInt(url.searchParams.get('employerId')!, 10)
      : undefined;

    // Optional pagination via page/pageSize
    const page = url.searchParams.has('page')
      ? parseInt(url.searchParams.get('page')!, 10)
      : undefined;
    const pageSize = url.searchParams.has('pageSize')
      ? parseInt(url.searchParams.get('pageSize')!, 10)
      : undefined;

    // Exclude job IDs already applied to (array of job IDs)
    const jobIdsToExclude = url.searchParams.getAll('jobIdsToExclude').map(Number).filter(Boolean);

    // Parse numeric filters (budget, working hours)
    const budgetRaw = url.searchParams.get('budget');
    const budget = budgetRaw ? parseInt(budgetRaw, 10) : undefined;

    const workingHoursFromRaw = url.searchParams.get('workingHoursFrom');
    const workingHoursFrom = workingHoursFromRaw ? parseInt(workingHoursFromRaw, 10) : undefined;

    const workingHoursToRaw = url.searchParams.get('workingHoursTo');
    const workingHoursTo = workingHoursToRaw ? parseInt(workingHoursToRaw, 10) : undefined;

    // Map frontend 'searchQuery' param to backend 'query' (for text search)
    const queryRaw = url.searchParams.get('searchQuery');
    const query = queryRaw || undefined;

    // Build the filters object, using only populated/defined filter values
    const filters: JobFilter = {
      projectType: jobType.length ? jobType : undefined, // jobType → projectType (backend expects 'projectType')
      locationPreference: locationPreference.length ? locationPreference : undefined,
      experienceLevel: experienceLevel.length ? experienceLevel : undefined,
      employerId,
      page,
      pageSize,
      jobIdsToExclude: jobIdsToExclude.length ? jobIdsToExclude : undefined,
      query, // maps searchQuery to query
      budget,
      workingHoursFrom,
      workingHoursTo,
    };

    // Fetch jobs (returns jobs based on all active filters and pagination)
    const jobs = await getAllJobs(limit, offset, freelancerId, filters);

    // Fetch total count (for UI pagination display)
    const totalCount = (await getAllJobs(undefined, undefined, freelancerId, filters)).length;

    // Return jobs and count as JSON
    return Response.json({ jobs, totalCount });
  } catch (error) {
    // Handle unexpected errors (return HTTP 500)
    console.error('Error fetching jobs:', error);
    return Response.json({ error: 'Failed to fetch jobs' }, { status: 500 });
  }
}
