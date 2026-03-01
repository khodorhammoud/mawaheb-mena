import DashboardLayout from '@/Layouts/DashboardLayout';
import { Link } from '@inertiajs/react';
import { formatDistanceToNow, parseISO } from 'date-fns';

interface Notification {
    id: number;
    type: string;
    title: string;
    message: string;
    is_read: boolean;
    created_at: string;
    payload?: Record<string, any>;
}

interface Props {
    notification: Notification;
}

export default function NotificationDetail({ notification }: Props) {
    const formatDate = (dateStr: string) => {
        try {
            const date = parseISO(dateStr);
            return formatDistanceToNow(date, { addSuffix: true });
        } catch {
            return 'Unknown time';
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'message': return 'bg-blue-100 text-blue-700';
            case 'alert': return 'bg-red-100 text-red-700';
            case 'reminder': return 'bg-green-100 text-green-700';
            case 'status_update': return 'bg-yellow-100 text-yellow-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <DashboardLayout>
            <div className="container mx-auto px-4 py-8 max-w-2xl">
                <Link href="/notifications" className="text-red-600 hover:underline text-sm mb-6 inline-block">
                    ← Back to Notifications
                </Link>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                    <div className="flex items-start justify-between mb-6">
                        <h1 className="text-2xl font-bold text-gray-900">{notification.title}</h1>
                        <span className={`text-xs px-3 py-1 rounded-full capitalize ${getTypeColor(notification.type)}`}>
                            {notification.type.replace('_', ' ')}
                        </span>
                    </div>

                    <p className="text-gray-700 leading-relaxed mb-6">{notification.message}</p>

                    <p className="text-sm text-gray-400">{formatDate(notification.created_at)}</p>

                    {notification.payload && Object.keys(notification.payload).length > 0 && (
                        <div className="mt-6 bg-gray-50 rounded-lg p-4">
                            <h3 className="text-sm font-semibold text-gray-600 mb-2">Additional Details</h3>
                            <pre className="text-xs text-gray-500 overflow-x-auto">
                                {JSON.stringify(notification.payload, null, 2)}
                            </pre>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
