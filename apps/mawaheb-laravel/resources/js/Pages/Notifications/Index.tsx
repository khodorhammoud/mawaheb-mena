import { Head, Link, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Notification, PaginatedData } from '@/types';

interface Props { notifications: PaginatedData<Notification> }

export default function NotificationsIndex({ notifications }: Props) {
    return (
        <DashboardLayout>
            <Head title="Notifications" />
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Notifications</h1>
                <button onClick={() => router.post('/notifications/read-all')} className="text-indigo-600 text-sm hover:text-indigo-800">Mark all as read</button>
            </div>
            <div className="space-y-2">
                {notifications.data.length === 0 ? (
                    <div className="bg-white rounded-xl border p-12 text-center text-gray-500">No notifications.</div>
                ) : notifications.data.map((n) => (
                    <Link key={n.id} href={`/notification/${n.id}`} className={`block bg-white rounded-xl border p-4 hover:shadow-sm transition ${!n.is_read ? 'border-l-4 border-l-indigo-500' : ''}`}>
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="font-medium">{n.title}</p>
                                <p className="text-sm text-gray-600 mt-1">{n.message}</p>
                            </div>
                            <span className="text-xs text-gray-400 whitespace-nowrap ml-4">{new Date(n.created_at).toLocaleDateString()}</span>
                        </div>
                    </Link>
                ))}
            </div>
        </DashboardLayout>
    );
}
