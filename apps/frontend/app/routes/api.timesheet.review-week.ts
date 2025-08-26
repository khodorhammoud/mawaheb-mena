/**
 * API Endpoint: Review Timesheet Week (Fix Entries)
 *
 * PURPOSE:
 * - Allows employers to review individual timesheet entries and accept/reject them
 * - Changes week status to 'rejected' when any entry is rejected
 * - Sends notifications to freelancer about which entries need fixing
 * - Preserves approved entries while allowing rejected ones to be fixed
 *
 * WORKFLOW:
 * 1. Validates that the current user is an employer
 * 2. Verifies the employer owns the job
 * 3. Updates individual entry statuses (accepted/rejected)
 * 4. Sets week status to 'rejected' if any entries are rejected
 * 5. Sends notifications to freelancer with details
 *
 * USED BY:
 * - EmployerTimesheet component when "Fix Entries" button is clicked
 * - Enables the review workflow where freelancers can fix rejected entries
 */

import { json, type ActionFunctionArgs } from '@remix-run/node';
import { getCurrentUser, getUserAccountType, getEmployerIdFromUserId } from '~/servers/user.server';
import { reviewTimesheetWeek } from '~/servers/timesheet.server';
import { AccountType } from '@mawaheb/db/enums';

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== 'POST') {
    return json({ success: false, error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) return json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const accountType = await getUserAccountType(currentUser.id);
    if (accountType !== AccountType.Employer) {
      return json(
        { success: false, error: 'Only employers can review timesheets' },
        { status: 403 }
      );
    }

    const employerId = await getEmployerIdFromUserId(currentUser.id);
    if (!employerId) return json({ success: false, error: 'Employer not found' }, { status: 404 });

    const form = await request.formData();
    const weekId = Number(form.get('weekId'));
    const jobApplicationId = Number(form.get('jobApplicationId'));
    const decisionsStr = String(form.get('decisions') || '[]');

    if (!weekId || !jobApplicationId) {
      return json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    let decisions: Array<{ entryId: number; status: 'accepted' | 'rejected'; note?: string }>;
    try {
      decisions = JSON.parse(decisionsStr);
    } catch {
      return json({ success: false, error: 'Invalid decisions payload' }, { status: 400 });
    }

    const result = await reviewTimesheetWeek({
      weekId,
      employerId,
      jobApplicationId,
      decisions,
      currentUserId: currentUser.id,
    });

    return json({ success: true, data: result });
  } catch (error) {
    console.error('Error reviewing timesheet week:', error);
    return json({ success: false, error: 'Failed to review timesheet week' }, { status: 500 });
  }
}
