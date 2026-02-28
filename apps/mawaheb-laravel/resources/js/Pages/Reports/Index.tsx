import { Head } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';

export default function ReportsIndex() {
    return (
        <DashboardLayout>
            <Head title="Reports" />
            <h1 className="text-2xl font-bold mb-6">Reports</h1>
            <div className="bg-white rounded-xl border p-12 text-center text-gray-500">
                <p className="text-lg mb-2">Reports coming soon</p>
                <p className="text-sm">Analytics and reporting features will be available here.</p>
            </div>
        </DashboardLayout>
    );
}
