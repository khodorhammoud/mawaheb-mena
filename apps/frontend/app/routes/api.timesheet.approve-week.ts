/**
 * API Endpoint: Approve Timesheet Week
 *
 * PURPOSE:
 * - Allows employers to approve an entire week of timesheet entries
 * - Changes week status from 'submitted' to 'approved'
 * - Locks all day entries in the week to prevent further editing
 * - Sends notifications to both employer and freelancer
 *
 * WORKFLOW:
 * 1. Validates that the current user is an employer
 * 2. Verifies the employer owns the job
 * 3. Approves the week and all its day entries
 * 4. Sends confirmation notifications
 *
 * USED BY:
 * - EmployerTimesheet component when "Approve Week" button is clicked
 */

import { json, type ActionFunctionArgs } from '@remix-run/node';
import { getCurrentUser, getUserAccountType, getEmployerIdFromUserId } from '~/servers/user.server';
import { approveTimesheetWeek } from '~/servers/timesheet.server';
import { AccountType } from '@mawaheb/db/enums';

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== 'POST') {
    return json({ success: false, error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const accountType = await getUserAccountType(currentUser.id);
    if (accountType !== AccountType.Employer) {
      return json(
        { success: false, error: 'Only employers can approve timesheets' },
        { status: 403 }
      );
    }

    const employerId = await getEmployerIdFromUserId(currentUser.id);
    if (!employerId) {
      return json({ success: false, error: 'Employer not found' }, { status: 404 });
    }

    const formData = await request.formData();
    const weekId = Number(formData.get('weekId'));
    const jobApplicationId = Number(formData.get('jobApplicationId'));

    if (!weekId || !jobApplicationId) {
      return json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const result = await approveTimesheetWeek(weekId, employerId, currentUser.id);

    return json({ success: true, data: result });
  } catch (error) {
    console.error('Error approving timesheet week:', error);
    return json({ success: false, error: 'Failed to approve timesheet week' }, { status: 500 });
  }
}
