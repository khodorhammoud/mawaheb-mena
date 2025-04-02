import { ActionFunctionArgs, json } from '@remix-run/node';
import { requireUserSession } from '~/auth/auth.server';
import { createNotification } from '~/servers/notifications.server';
import { NotificationType } from '~/types/enums';

export async function action({ request }: ActionFunctionArgs) {
  try {
    const session = await requireUserSession(request);
    const userId = session.user.id;

    if (!userId) {
      return json({ success: false, error: 'User not authenticated' }, { status: 401 });
    }

    // Create a test notification
    const notification = await createNotification({
      userId,
      type: NotificationType.Message,
      title: 'Test Notification',
      message: 'This is a test notification to debug the notification system.',
      payload: { testId: Date.now() },
    });

    return json({
      success: true,
      notification,
      message: 'Test notification created successfully',
    });
  } catch (error) {
    console.error('Error creating test notification:', error);
    return json({ success: false, error: 'Failed to create test notification' }, { status: 500 });
  }
}

// GET requests will return instructions
export async function loader() {
  return json({
    message: 'Use POST to create a test notification',
    usage: 'Send a POST request to this endpoint to create a test notification',
  });
}
