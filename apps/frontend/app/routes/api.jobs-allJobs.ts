// this is the code that is targeted using the fetcher inside all jobs

import { LoaderFunctionArgs } from '@remix-run/node';
import { getAllJobs, getJobsFiltered } from '../servers/job.server';
import { getCurrentProfileInfo } from '~/servers/user.server';
import { JobFilter } from '@mawaheb/db/types';

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getCurrentProfileInfo(request);

  // TODO: check user is published, and whether it's important for the user to be a freelancer or employer

  // Parse the URL parameters
  const url = new URL(request.url);
  const limit = parseInt(url.searchParams.get('limit') || '10', 10);
  const offset = parseInt(url.searchParams.get('offset') || '0', 10);
  const searchQuery = url.searchParams.get('searchQuery') || '';

  // Check if we have any filters
  const hasFilters =
    url.searchParams.has('jobType') ||
    url.searchParams.has('experienceLevel') ||
    url.searchParams.has('locationPreference') ||
    url.searchParams.has('employerId') ||
    searchQuery.length > 0;

  let jobs;
  let totalCount;

  if (hasFilters) {
    // Parse filter parameters
    const filter: JobFilter = {
      page: Math.floor(offset / limit) + 1,
      pageSize: limit,
      query: searchQuery,
    };

    // Add job type filter if provided
    if (url.searchParams.has('jobType') && url.searchParams.get('jobType')) {
      filter.projectType = [url.searchParams.get('jobType') as string];
    }

    // Add experience level filter if provided
    if (url.searchParams.has('experienceLevel') && url.searchParams.get('experienceLevel')) {
      filter.experienceLevel = [url.searchParams.get('experienceLevel') as string];
    }

    // Add location preference filter if provided
    if (url.searchParams.has('locationPreference') && url.searchParams.get('locationPreference')) {
      filter.locationPreference = [url.searchParams.get('locationPreference') as string];
    }

    // Add employer ID filter if provided
    if (url.searchParams.has('employerId')) {
      filter.employerId = parseInt(url.searchParams.get('employerId') || '0', 10);
    }

    // Get filtered jobs with pagination
    jobs = await getJobsFiltered(filter);

    // Get total count for pagination - this is a simplification that works for small datasets
    // For large datasets, we'd need to add a count query to getJobsFiltered
    const allFilteredJobs = await getJobsFiltered({ ...filter, page: 1, pageSize: 1000 });
    totalCount = allFilteredJobs.length;
  } else {
    // Use the simpler getAllJobs function with pagination
    jobs = await getAllJobs(limit, offset);

    // Get total count
    const allJobs = await getAllJobs();
    totalCount = allJobs.length;
  }

  return Response.json({
    jobs,
    totalCount,
  });
}
