import { LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData, useNavigate } from '@remix-run/react';
import { requireUserSession } from '~/auth/auth.server';
import { getNotifications, markAllNotificationsAsRead } from '~/servers/notifications.server';
import { Button } from '~/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { NotificationType } from '~/types/enums';
import { useFetcher } from '@remix-run/react';

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const userId = await requireUserSession(request);

    if (!userId) {
      throw new Response('User ID is invalid', { status: 401 });
    }

    const notifications = await getNotifications(userId);

    return { notifications };
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
  const fetcher = useFetcher();

  const unreadNotifications = notifications.filter(n => !n.isRead);
  const hasUnreadNotifications = unreadNotifications.length > 0;

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

  return (
    <div className="container mx-auto px-4 py-8">
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

      {notifications.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <p className="text-gray-500">You don't have any notifications yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map(notification => (
            <div
              key={notification.id}
              className={`bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer ${
                !notification.isRead ? 'border-l-4 border-blue-500' : ''
              }`}
              onClick={() => navigate(`/notifications/${notification.id}`)}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-2 h-2 rounded-full mt-2 ${getNotificationColor(notification.type)}`}
                />
                <div className="flex-1">
                  <h4 className="font-medium">{notification.title}</h4>
                  <p className="text-gray-600 mt-1">{notification.message}</p>
                  <p className="text-sm text-gray-400 mt-2">
                    {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
