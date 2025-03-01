import { ActionFunctionArgs, LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData, useActionData } from "@remix-run/react";
import { JobApplicationStatus } from "~/types/enums";
import { ApplicationOverview } from "~/components/application/ApplicationOverview";
import { JobDetails } from "~/components/application/JobDetails";
import { FreelancerProfile } from "~/components/application/FreelancerProfile";
import {
  getApplicationDetails,
  updateApplicationStatus,
} from "../application.server";

// Helper function to safely parse JSON
function safeParseJSON<T>(
  jsonString: string | null | undefined,
  defaultValue: T
): T {
  if (!jsonString) return defaultValue;
  try {
    return JSON.parse(jsonString) as T;
  } catch (error) {
    console.error("Error parsing JSON:", error);
    return defaultValue;
  }
}

export async function loader({ params }: LoaderFunctionArgs) {
  const applicationId = params.applicationId;

  if (!applicationId) {
    throw new Response("Application ID is required", { status: 400 });
  }

  return getApplicationDetails(applicationId);
}

export async function action({ request, params }: ActionFunctionArgs) {
  const formData = await request.formData();
  const status = formData.get("status") as JobApplicationStatus;
  const applicationId = params.applicationId;

  if (!applicationId || !status) {
    return json({ success: false, error: "Missing required fields" });
  }

  return json(await updateApplicationStatus(applicationId, status));
}

export default function ApplicationDetails() {
  const { application } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  return (
    <div className="space-y-8">
      <ApplicationOverview application={application} actionData={actionData} />
      <JobDetails job={application.job} />
      <FreelancerProfile
        freelancer={application.freelancer}
        jobSkills={application.job.skills}
      />
    </div>
  );
}
