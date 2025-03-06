// apps/frontend/app/routes/api.job-recommendations.ts
import { LoaderFunctionArgs } from "@remix-run/node";
import { getJobRecommendations } from "../servers/job.server";
import { requireUserIsFreelancerPublished } from "../auth/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  // Ensure user is a published freelancer
  const userId = await requireUserIsFreelancerPublished(request);
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get query parameters
  const url = new URL(request.url);
  const freelancerId = parseInt(url.searchParams.get("freelancerId") || "0");
  const limit = parseInt(url.searchParams.get("limit") || "10");

  if (!freelancerId) {
    return Response.json(
      { error: "Freelancer ID is required" },
      { status: 400 }
    );
  }

  try {
    const recommendations = await getJobRecommendations(freelancerId, limit);
    return Response.json({ recommendations });
  } catch (error) {
    console.error("Error getting job recommendations:", error);
    return Response.json(
      { error: "Failed to get job recommendations" },
      { status: 500 }
    );
  }
}
