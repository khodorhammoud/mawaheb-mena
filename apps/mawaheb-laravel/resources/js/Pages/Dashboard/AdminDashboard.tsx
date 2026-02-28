import { Head, Link } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';

interface Props { stats?: Record<string, number> }

export default function AdminDashboard({ stats = {} }: Props) {
    return (
        <DashboardLayout>
            <Head title="Admin Dashboard" />
            <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8">
                {Object.entries(stats).map(([key, value]) => (
                    <div key={key} className="bg-white p-6 rounded-xl border">
                        <p className="text-sm text-gray-500 capitalize">{key.replace(/_/g, ' ')}</p>
                        <p className="text-3xl font-bold mt-1">{value}</p>
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Link href="/admin/pending-accounts" className="bg-white p-6 rounded-xl border hover:shadow-md transition">
                    <h3 className="font-semibold">Pending Accounts</h3>
                    <p className="text-sm text-gray-600 mt-1">Review and approve new account registrations.</p>
                </Link>
                <Link href="/admin/users" className="bg-white p-6 rounded-xl border hover:shadow-md transition">
                    <h3 className="font-semibold">Manage Users</h3>
                    <p className="text-sm text-gray-600 mt-1">View and manage all platform users.</p>
                </Link>
            </div>
        </DashboardLayout>
    );
}
