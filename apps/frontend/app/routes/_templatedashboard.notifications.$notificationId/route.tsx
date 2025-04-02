import { LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData, useNavigate } from '@remix-run/react';
import { requireUserSession } from '~/auth/auth.server';
import { getNotifications, markNotificationAsRead } from '~/servers/notifications.server';
import { Button } from '~/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { NotificationType } from '~/types/enums';
import { useEffect } from 'react';

export async function loader({ request, params }: LoaderFunctionArgs) {
  try {
    const userId = await requireUserSession(request);

    // Safely extract the notificationId and make sure it exists
    if (!params.notificationId) {
      throw new Response('Notification ID is required', { status: 400 });
    }

    // Parse the notificationId as a number
    const notificationId = parseInt(params.notificationId, 10);

    if (isNaN(notificationId)) {
      throw new Response('Invalid notification ID', { status: 400 });
    }

    // Check if userId exists
    if (!userId) {
      throw new Response('User ID is invalid', { status: 401 });
    }

    // Get notifications for the user
    const notifications = await getNotifications(userId);

    // Find the specific notification
    const notification = notifications.find(n => n.id === notificationId);

    if (!notification) {
      throw new Response('Notification not found', { status: 404 });
    }

    // Mark notification as read if it's not already read
    if (!notification.isRead) {
      await markNotificationAsRead(notification.id, userId);
    }

    return { notification };
  } catch (error) {
    throw error;
  }
}

export default function NotificationView() {
  const { notification } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  // Safety check to ensure notification exists
  if (!notification) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
            ← Back
          </Button>
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <h1 className="text-2xl font-bold mb-2">Notification not found</h1>
            <p className="text-gray-600 mb-4">
              This notification may have been deleted or is not available.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case NotificationType.Message:
        return 'bg-blue-500';
      case NotificationType.Alert:
        return 'bg-red-500';
      case NotificationType.Reminder:
        return 'bg-green-500';
      case NotificationType.StatusUpdate:
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          ← Back
        </Button>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-start gap-3">
            <div
              className={`w-2 h-2 rounded-full mt-2 ${getNotificationColor(notification.type)}`}
            />
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-2">{notification.title}</h1>
              <p className="text-gray-600 mb-4">{notification.message}</p>
              <p className="text-sm text-gray-400">
                {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
              </p>

              {notification.payload && Object.keys(notification.payload).length > 0 && (
                <div className="mt-6">
                  <h2 className="text-lg font-semibold mb-2">Additional Information</h2>
                  <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto">
                    {JSON.stringify(notification.payload, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
