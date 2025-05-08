import { LoaderFunctionArgs, json } from '@remix-run/node';
import { useLoaderData, useNavigate, useParams } from '@remix-run/react';
import { requireUserSession } from '~/auth/auth.server';
import { getNotificationById, markNotificationAsRead } from '~/servers/notifications.server';
import { Button } from '~/components/ui/button';
import { formatDistanceToNow, parseISO } from 'date-fns';
// import { NotificationType } from '@mawaheb/db/enums';
import { NotificationType } from '@mawaheb/db/enums';
import { useEffect, useState } from 'react';

export async function loader({ request, params }: LoaderFunctionArgs) {
  try {
    const userId = await requireUserSession(request);

    // Safely extract the notificationId and make sure it exists
    if (!params.notificationId) {
      throw json({ error: 'Notification ID is required' }, { status: 400 });
    }

    // Parse the notificationId as a number
    const notificationId = parseInt(params.notificationId, 10);

    if (isNaN(notificationId)) {
      throw json({ error: 'Invalid notification ID' }, { status: 400 });
    }

    // Check if userId exists
    if (!userId) {
      throw json({ error: 'User ID is invalid' }, { status: 401 });
    }

    // Get the specific notification by ID
    const notification = await getNotificationById(notificationId, userId);

    if (!notification) {
      throw json({ error: 'Notification not found' }, { status: 404 });
    }

    // Mark notification as read if it's not already read
    if (!notification.isRead) {
      await markNotificationAsRead(notification.id, userId);
      // Update the notification object to reflect the change
      notification.isRead = true;
      notification.readAt = new Date();
    }

    return json({ notification });
  } catch (error) {
    throw error;
  }
}

export default function SingleNotificationView() {
  const params = useParams();
  const data = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const [initialReferrer, setInitialReferrer] = useState<string | null>(null);

  // Explicit check for notification existence
  const notification = data?.notification;

  // Store the referrer on mount
  useEffect(() => {
    const referrer = document.referrer;
    if (referrer) {
      try {
        const url = new URL(referrer);
        // Only store if it's not the same notification page
        if (!url.pathname.includes(`/notification/${params.notificationId}`)) {
          setInitialReferrer(referrer);
        }
      } catch (e) {
        // Ignore parsing errors
      }
    }
  }, [params.notificationId]);

  // Go back to the source page if possible
  const handleBackClick = () => {
    window.history.go(-1);
  };

  // Skip everything if there's no notification
  if (!notification) {
    return (
      <div className="container mx-auto px-2 py-8">
        <div className="max-w-3xl mx-auto">
          <Button
            variant="ghost"
            onClick={handleBackClick}
            className="mb-6 text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
          >
            ← Back to Notifications
          </Button>

          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <h1 className="text-2xl font-bold mb-4">Notification Not Found</h1>
            <p className="text-gray-600 mb-6">
              The notification you are looking for could not be found or has been deleted.
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
    <div className="container mx-auto px-2 py-8">
      <Button variant="ghost" onClick={handleBackClick} className="mb-6 text-base text-red-600">
        ← Go Back
      </Button>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Single Notification</h1>
      </div>

      <div
        className={`bg-white p-4 rounded-lg shadow ${
          !notification.isRead ? 'border-l-4 border-blue-500' : ''
        }`}
      >
        <div className="flex items-start gap-3">
          <div className={`w-2 h-2 rounded-full mt-2 ${getNotificationColor(notification.type)}`} />
          <div className="flex-1">
            <h4 className="font-medium text-lg">{notification.title}</h4>
            <p className="text-gray-600 mt-1">{notification.message}</p>
            <p className="text-sm text-gray-400 mt-2">
              {(() => {
                try {
                  let date;

                  // Handle different date formats
                  if (typeof notification.createdAt === 'string') {
                    // If it's a string, parse it
                    date = parseISO(notification.createdAt);
                  } else {
                    // Try to create a Date from whatever we have
                    date = new Date(notification.createdAt);
                  }

                  // Check if the date is valid
                  if (isNaN(date.getTime())) {
                    return 'Invalid date';
                  }

                  // Adjust for timezone difference (subtract 3 hours)
                  const adjustedDate = new Date(date.getTime() - 3 * 60 * 60 * 1000);

                  // Format the date correctly with the adjusted timestamp
                  return formatDistanceToNow(adjustedDate, {
                    addSuffix: true,
                    includeSeconds: false,
                  });
                } catch (e) {
                  return 'Unknown time';
                }
              })()}
            </p>

            {notification.payload && Object.keys(notification.payload).length > 0 && (
              <div className="mt-6 pt-4 border-t border-gray-200">
                <h5 className="text-md font-medium">Additional Information</h5>
                <div className="bg-gray-50 p-4 rounded-lg overflow-x-auto border border-gray-200">
                  <pre className="text-sm text-gray-700">
                    {JSON.stringify(notification.payload, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            <div className="mt-4 flex justify-end">
              <div className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full">
                {notification.type}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-between items-center">
        {!notification.isRead && (
          <div className="text-xs text-gray-500">
            This notification was automatically marked as read.
          </div>
        )}
      </div>
    </div>
  );
}
