// apps/frontend/app/routes/api.jobs-recommendationJobs.ts
import { LoaderFunctionArgs } from '@remix-run/node';
import { getJobRecommendations } from '../servers/job.server';
import { requireUserIsFreelancerPublished } from '../auth/auth.server';

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    // console.log("🚀 API called: /api/jobs-recommendationJobs");

    // Ensure user is a published freelancer
    const userId = await requireUserIsFreelancerPublished(request);
    if (!userId) {
      console.error('Unauthorized: User is not a published freelancer');
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // console.log("✅ User ID:", userId);

    // Get query parameters
    const url = new URL(request.url);
    const freelancerId = parseInt(url.searchParams.get('freelancerId') || '0');
    // console.log("✅ Freelancer ID:", freelancerId);

    const limit = parseInt(url.searchParams.get('limit') || '10');

    if (!freelancerId) {
      console.error('FreelancerId is required but was not provided');
      return Response.json({ error: 'Freelancer ID is required' }, { status: 400 });
    }

    // console.log("🔍 Fetching job recommendations...");
    // First get all possible recommendations to know total count
    const allRecommendations = await getJobRecommendations(freelancerId, 1000);
    const totalCount = allRecommendations.length;

    // Then get the paginated recommendations
    const recommendations = await getJobRecommendations(freelancerId, limit);
    // console.log(`✅ Found ${recommendations.length} recommendations`);

    // Transform recommendations to match the Job type expected by the frontend
    const jobs = recommendations.map(rec => ({
      id: rec.jobId,
      title: rec.title,
      description: rec.description,
      budget: rec.budget,
      workingHoursPerWeek: rec.workingHoursPerWeek,
      locationPreference: rec.locationPreference,
      projectType: rec.projectType,
      experienceLevel: rec.experienceLevel,
      createdAt: rec.createdAt,
      // Add match score and skills information
      matchScore: rec.matchScore,
      skillsMatch: rec.skillsMatch,
    }));

    return Response.json({ jobs, totalCount });
  } catch (error) {
    console.error('Error getting job recommendations:', error);
    return Response.json({ error: 'Failed to get job recommendations' }, { status: 500 });
  }
}
