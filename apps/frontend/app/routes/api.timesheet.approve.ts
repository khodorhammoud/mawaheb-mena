import { ActionFunctionArgs } from "@remix-run/node";
import { requireUserIsEmployerPublished } from "~/auth/auth.server";
import { updateTimesheetEntriesStatus } from "~/servers/timesheet.server";
import { TimesheetStatus } from "~/types/enums";

export async function action({ request }: ActionFunctionArgs) {
  await requireUserIsEmployerPublished(request);

  const formData = await request.formData();
  const date = formData.get("date") as string;
  const jobApplicationId = parseInt(formData.get("jobApplicationId") as string);

  await updateTimesheetEntriesStatus(
    jobApplicationId,
    new Date(date),
    TimesheetStatus.Approved
  );

  return Response.json({ success: true });
}
