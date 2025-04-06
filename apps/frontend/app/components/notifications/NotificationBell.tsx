import { Bell } from 'lucide-react';
import { NotificationType } from '@mawaheb/db/src/types/enums';
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { Link } from '@remix-run/react';

interface Notification {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  createdAt: Date;
  isRead: boolean;
}

interface NotificationBellProps {
  notifications: Notification[];
  onNotificationClick: (notificationId: number) => void;
}

export function NotificationBell({ notifications, onNotificationClick }: NotificationBellProps) {
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getNotificationColor = (type: NotificationType) => {
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
    <Popover>
      <PopoverTrigger asChild>
        <div className="relative inline-block cursor-pointer">
          <Bell className="w-[38px] h-[38px] text-gray-600 hover:bg-[#E4E3E6] transition-all hover:rounded-full p-2" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="max-h-[400px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-500">No notifications</div>
          ) : (
            notifications.map(notification => (
              <div
                key={notification.id}
                className={`p-4 border-b last:border-b-0 cursor-pointer hover:bg-gray-50 ${
                  !notification.isRead ? 'bg-blue-50' : ''
                }`}
                onClick={() => onNotificationClick(notification.id)}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-2 h-2 rounded-full mt-2 ${getNotificationColor(notification.type)}`}
                  />
                  <div className="flex-1">
                    <h4 className="font-medium">{notification.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                    <p className="text-xs text-gray-400 mt-2">
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
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        {notifications.length > 0 && (
          <div className="p-2 border-t text-center">
            <Link to="/notifications" className="text-sm text-blue-600 hover:text-blue-800">
              View all notifications
            </Link>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
