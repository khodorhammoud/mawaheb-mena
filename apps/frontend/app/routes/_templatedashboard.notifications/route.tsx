import { LoaderFunctionArgs } from '@remix-run/node';
import {
  useLoaderData,
  useNavigate,
  useSubmit,
  useFetcher,
  useRevalidator,
  useLocation,
} from '@remix-run/react';
import { requireUserSession } from '~/auth/auth.server';
import { getNotifications, markAllNotificationsAsRead } from '~/servers/notifications.server';
import { Button } from '~/components/ui/button';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { NotificationType } from '@mawaheb/db/src/types/enums';
import { useEffect, useState } from 'react';

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const userId = await requireUserSession(request);

    if (!userId) {
      throw new Response('User ID is invalid', { status: 401 });
    }

    // Force fresh data on each load
    const url = new URL(request.url);
    const forceRefresh = url.searchParams.get('refresh');

    const notifications = await getNotifications(userId);

    return {
      notifications,
      timestamp: Date.now(), // Add timestamp to force fresh data
    };
  } catch (error) {
    throw error;
  }
}

export async function action({ request }: LoaderFunctionArgs) {
  try {
    const userId = await requireUserSession(request);

    if (!userId) {
      throw new Response('User ID is invalid', { status: 401 });
    }

    const formData = await request.formData();
    const intent = formData.get('intent');

    if (intent === 'markAllRead') {
      await markAllNotificationsAsRead(userId);
    }

    return null;
  } catch (error) {
    throw error;
  }
}

export default function Notifications() {
  const { notifications } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const location = useLocation();
  const fetcher = useFetcher();
  const revalidator = useRevalidator();
  const submit = useSubmit();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  // Get the referrer to handle back navigation properly
  const [hasInitialized, setHasInitialized] = useState(false);
  const [previousPath, setPreviousPath] = useState<string | null>(null);

  useEffect(() => {
    // Store the previous path on mount if it doesn't come from a notification detail
    if (!hasInitialized) {
      const referrer = document.referrer;
      // Only set previous path if it's not from notification detail
      if (referrer && !referrer.includes('/notification/')) {
        // Extract pathname from referrer
        try {
          const url = new URL(referrer);
          setPreviousPath(url.pathname + url.search);
        } catch (e) {
          // If parsing fails, don't set a previous path
        }
      }
      setHasInitialized(true);
    }

    // Reload data when component mounts to ensure fresh data
    revalidator.revalidate();
  }, []);

  // Handle back button click
  const handleBackClick = () => {
    if (previousPath) {
      // Navigate to stored previous path if available
      window.location.href = previousPath;
    } else {
      // Default fallback - go to dashboard
      window.location.href = '/dashboard';
    }
  };

  const unreadNotifications = notifications.filter(n => !n.isRead);
  const hasUnreadNotifications = unreadNotifications.length > 0;

  // Filter notifications based on current filter
  const filteredNotifications =
    filter === 'all' ? notifications : notifications.filter(n => !n.isRead);

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

  const handleMarkAllRead = () => {
    fetcher.submit({ intent: 'markAllRead' }, { method: 'post' });
  };

  const viewNotification = (notificationId: number) => {
    // Navigate to the notification detail page using window.location for consistency
    window.location.href = `/notification/${notificationId}`;
  };

  return (
    <div className="container mx-auto px-2 py-8">
      <Button variant="ghost" onClick={handleBackClick} className="mb-6 text-base text-red-600">
        ← Back
      </Button>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Notifications</h1>
        {hasUnreadNotifications && (
          <Button
            variant="outline"
            onClick={handleMarkAllRead}
            disabled={fetcher.state === 'submitting'}
          >
            Mark all as read
          </Button>
        )}
      </div>

      {/* Filter tabs - Add filters based on the requirements */}
      <div className="flex space-x-4 mb-6">
        <button
          className={`px-4 py-2 rounded-md font-medium ${
            filter === 'all' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
          }`}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        <button
          className={`px-4 py-2 rounded-md font-medium ${
            filter === 'unread' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
          }`}
          onClick={() => setFilter('unread')}
        >
          Unread
        </button>
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <p className="text-gray-500">You don't have any notifications yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredNotifications.map(notification => (
            <div
              key={notification.id}
              className={`bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer ${
                !notification.isRead ? 'border-l-4 border-blue-500' : ''
              }`}
              onClick={() => {
                viewNotification(notification.id);
              }}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-2 h-2 rounded-full mt-2 ${getNotificationColor(notification.type)}`}
                />
                <div className="flex-1">
                  <h4 className="font-medium text-base">{notification.title}</h4>
                  <p className="text-gray-600 mt-1 text-sm line-clamp-2">{notification.message}</p>
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-xs text-gray-400">
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
                          console.error('Date formatting error:', e);
                          return 'Unknown time';
                        }
                      })()}
                    </p>

                    <div className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                      {notification.type}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
