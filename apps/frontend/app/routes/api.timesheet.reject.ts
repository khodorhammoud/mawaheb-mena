import { ActionFunctionArgs } from '@remix-run/node';
import { requireUserIsEmployerPublishedOrDeactivated } from '~/auth/auth.server';
import { updateTimesheetEntriesStatus } from '~/servers/timesheet.server';
import { TimesheetStatus } from '@mawaheb/db';

export async function action({ request }: ActionFunctionArgs) {
  await requireUserIsEmployerPublishedOrDeactivated(request);

  const formData = await request.formData();
  const date = formData.get('date') as string;
  const jobApplicationId = parseInt(formData.get('jobApplicationId') as string);

  await updateTimesheetEntriesStatus(jobApplicationId, new Date(date), TimesheetStatus.Rejected);

  return Response.json({ success: true });
}
