import { Head, Link } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Freelancer, JobApplication } from '@/types';

interface Props {
    freelancer: Freelancer;
    applications: JobApplication[];
    stats: { total_applications: number; approved_applications: number; pending_applications: number };
}

export default function FreelancerDashboard({ freelancer, applications, stats }: Props) {
    return (
        <DashboardLayout>
            <Head title="Dashboard" />
            <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {[
                    { label: 'Total Applications', value: stats.total_applications, color: 'bg-blue-50 text-blue-700' },
                    { label: 'Approved', value: stats.approved_applications, color: 'bg-green-50 text-green-700' },
                    { label: 'Pending', value: stats.pending_applications, color: 'bg-yellow-50 text-yellow-700' },
                ].map((stat) => (
                    <div key={stat.label} className={`p-6 rounded-xl ${stat.color}`}>
                        <p className="text-sm font-medium opacity-75">{stat.label}</p>
                        <p className="text-3xl font-bold mt-1">{stat.value}</p>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-xl border p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">Recent Applications</h2>
                    <Link href="/browse-jobs" className="text-indigo-600 text-sm hover:text-indigo-800">Browse Jobs</Link>
                </div>
                {applications.length === 0 ? (
                    <p className="text-gray-500 py-8 text-center">No applications yet. Start browsing jobs!</p>
                ) : (
                    <div className="space-y-3">
                        {applications.map((app) => (
                            <div key={app.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                                <div>
                                    <Link href={`/jobs/${app.job_id}`} className="font-medium hover:text-indigo-600">{app.job?.title}</Link>
                                    <p className="text-sm text-gray-500">{app.job?.employer?.company_name}</p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                    app.status === 'approved' ? 'bg-green-100 text-green-700' :
                                    app.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                    app.status === 'shortlisted' ? 'bg-blue-100 text-blue-700' :
                                    'bg-yellow-100 text-yellow-700'
                                }`}>
                                    {app.status}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Link href="/skillfolio" className="bg-white rounded-xl border p-6 hover:shadow-md transition">
                    <h3 className="font-semibold mb-2">Skillfolio</h3>
                    <p className="text-sm text-gray-600">View your AI-powered skill assessment and career readiness score.</p>
                </Link>
                <Link href="/timesheets" className="bg-white rounded-xl border p-6 hover:shadow-md transition">
                    <h3 className="font-semibold mb-2">Timesheets</h3>
                    <p className="text-sm text-gray-600">Track and submit your work hours for active projects.</p>
                </Link>
            </div>
        </DashboardLayout>
    );
}
