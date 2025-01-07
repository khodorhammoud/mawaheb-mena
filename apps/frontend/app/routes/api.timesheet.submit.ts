import { ActionFunctionArgs } from "@remix-run/node";
import { requireUserIsFreelancerPublished } from "~/auth/auth.server";
import { getFreelancerIdFromUserId } from "~/servers/user.server";
import {
  submitTimesheetDay,
  getTimesheetSubmissions,
} from "~/servers/timesheet.server";

export async function action({ request }: ActionFunctionArgs) {
  const userId = await requireUserIsFreelancerPublished(request);
  const formData = await request.formData();
  const freelancerId = await getFreelancerIdFromUserId(userId);
  const date = new Date(formData.get("date") as string);
  const jobApplicationId = Number(formData.get("jobApplicationId"));

  // Check if already submitted
  const existingSubmissions = await getTimesheetSubmissions(
    freelancerId,
    jobApplicationId,
    date,
    date
  );

  if (existingSubmissions.length > 0) {
    return Response.json(
      { error: "This day has already been submitted" },
      { status: 400 }
    );
  }

  try {
    const submission = await submitTimesheetDay(
      freelancerId,
      jobApplicationId,
      date
    );
    return Response.json({ success: true, submission });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(error);
      return Response.json(
        { error: "Failed to submit timesheet", details: error.message },
        { status: 400 }
      );
    }
    console.error("Unknown error", error);
    return Response.json(
      { error: "Failed to submit timesheet", details: "Unknown error" },
      { status: 400 }
    );
  }
}
