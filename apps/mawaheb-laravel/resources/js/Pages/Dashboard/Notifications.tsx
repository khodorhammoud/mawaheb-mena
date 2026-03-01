import DashboardLayout from '@/Layouts/DashboardLayout';
import { router } from '@inertiajs/react';
import { useState } from 'react';
import { formatDistanceToNow, parseISO } from 'date-fns';

interface Notification {
    id: number;
    type: string;
    title: string;
    message: string;
    is_read: boolean;
    severity?: string;
    created_at: string;
    read_at?: string | null;
    payload?: Record<string, any>;
}

interface Props {
    notifications: Notification[];
}

export default function Notifications({ notifications: rawNotifications }: Props) {
    const [filter, setFilter] = useState<'all' | 'unread'>('all');
    const [submitting, setSubmitting] = useState(false);

    const notifications = [...rawNotifications].sort((a, b) => {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return dateB - dateA;
    });

    const unreadNotifications = notifications.filter((n) => !n.is_read);
    const hasUnread = unreadNotifications.length > 0;

    const filteredNotifications = filter === 'all' ? notifications : unreadNotifications;

    const getNotificationColor = (type: string) => {
        switch (type) {
            case 'message': return 'bg-blue-500';
            case 'alert': return 'bg-red-500';
            case 'reminder': return 'bg-green-500';
            case 'status_update': return 'bg-yellow-500';
            default: return 'bg-gray-500';
        }
    };

    const handleMarkAllRead = () => {
        setSubmitting(true);
        router.post('/notifications/read-all', {}, {
            onFinish: () => setSubmitting(false),
        });
    };

    const viewNotification = (id: number) => {
        router.get(`/notification/${id}`);
    };

    const formatDate = (dateStr: string) => {
        try {
            const date = typeof dateStr === 'string' ? parseISO(dateStr) : new Date(dateStr);
            if (isNaN(date.getTime())) return 'Invalid date';
            return formatDistanceToNow(date, { addSuffix: true, includeSeconds: false });
        } catch {
            return 'Unknown time';
        }
    };

    return (
        <DashboardLayout>
            <div className="container mx-auto px-2 py-8">
                <button onClick={() => window.history.go(-1)} className="mb-6 text-base text-red-600 hover:underline">
                    ← Back
                </button>

                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Notifications</h1>
                    {hasUnread && (
                        <button onClick={handleMarkAllRead} disabled={submitting}
                            className="border border-gray-300 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 transition disabled:opacity-50">
                            Mark all as read
                        </button>
                    )}
                </div>

                {/* Filter Tabs */}
                <div className="flex space-x-4 mb-6">
                    <button onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-md font-medium text-sm ${filter === 'all' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>
                        All
                    </button>
                    <button onClick={() => setFilter('unread')}
                        className={`px-4 py-2 rounded-md font-medium text-sm ${filter === 'unread' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>
                        Unread {unreadNotifications.length > 0 && <span className="ml-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">{unreadNotifications.length}</span>}
                    </button>
                </div>

                {notifications.length === 0 ? (
                    <div className="bg-white p-8 rounded-lg shadow text-center">
                        <p className="text-gray-500">You don't have any notifications yet.</p>
                    </div>
                ) : filteredNotifications.length === 0 ? (
                    <div className="bg-white p-8 rounded-lg shadow text-center">
                        <p className="text-gray-500">No unread notifications.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredNotifications.map((notification) => (
                            <div key={notification.id}
                                onClick={() => viewNotification(notification.id)}
                                className={`bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer ${!notification.is_read ? 'border-l-4 border-blue-500' : ''}`}>
                                <div className="flex items-start gap-3">
                                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${getNotificationColor(notification.type)}`} />
                                    <div className="flex-1">
                                        <h4 className="font-medium text-base">{notification.title}</h4>
                                        <p className="text-gray-600 mt-1 text-sm line-clamp-2">{notification.message}</p>
                                        <div className="flex justify-between items-center mt-2">
                                            <p className="text-xs text-gray-400">{formatDate(notification.created_at)}</p>
                                            <div className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full capitalize">
                                                {notification.type.replace('_', ' ')}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
