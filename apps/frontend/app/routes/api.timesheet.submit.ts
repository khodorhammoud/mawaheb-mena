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
  const totalHours = Number(formData.get("totalHours"));

  // Check if there are any hours to submit
  if (totalHours <= 0) {
    return Response.json(
      { error: "Cannot submit a day with no entries" },
      { status: 400 }
    );
  }

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
      date,
      totalHours
    );
    return Response.json({ success: true, submission });
  } catch (error) {
    return Response.json(
      { error: "Failed to submit timesheet" },
      { status: 400 }
    );
  }
}
