import { Head, Link } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Notification } from '@/types';

interface Props { notification: Notification }

export default function NotificationShow({ notification }: Props) {
    return (
        <DashboardLayout>
            <Head title={notification.title} />
            <Link href="/notifications" className="text-indigo-600 text-sm mb-4 inline-block">&larr; Back</Link>
            <div className="bg-white rounded-xl border p-6 max-w-2xl">
                <h1 className="text-xl font-bold mb-2">{notification.title}</h1>
                <p className="text-xs text-gray-400 mb-4">{new Date(notification.created_at).toLocaleString()}</p>
                <p className="text-gray-700">{notification.message}</p>
            </div>
        </DashboardLayout>
    );
}
