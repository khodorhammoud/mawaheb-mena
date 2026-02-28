import { Head, Link } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Employer, Job } from '@/types';

interface Props {
    employer: Employer;
    jobs: Job[];
    stats: { total_jobs: number; active_jobs: number; total_applicants: number };
}

export default function EmployerDashboard({ employer, jobs, stats }: Props) {
    return (
        <DashboardLayout>
            <Head title="Dashboard" />
            <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {[
                    { label: 'Total Jobs', value: stats.total_jobs, color: 'bg-blue-50 text-blue-700' },
                    { label: 'Active Jobs', value: stats.active_jobs, color: 'bg-green-50 text-green-700' },
                    { label: 'Total Applicants', value: stats.total_applicants, color: 'bg-purple-50 text-purple-700' },
                ].map((stat) => (
                    <div key={stat.label} className={`p-6 rounded-xl ${stat.color}`}>
                        <p className="text-sm font-medium opacity-75">{stat.label}</p>
                        <p className="text-3xl font-bold mt-1">{stat.value}</p>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-xl border p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">Recent Jobs</h2>
                    <Link href="/new-job" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 transition">Post a Job</Link>
                </div>
                {jobs.length === 0 ? (
                    <p className="text-gray-500 py-8 text-center">No jobs posted yet.</p>
                ) : (
                    <div className="space-y-3">
                        {jobs.map((job) => (
                            <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                                <div>
                                    <Link href={`/jobs/${job.id}`} className="font-medium hover:text-indigo-600">{job.title}</Link>
                                    <p className="text-sm text-gray-500">{job.applications?.length ?? 0} applicants</p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                    job.status === 'active' ? 'bg-green-100 text-green-700' :
                                    job.status === 'draft' ? 'bg-gray-100 text-gray-700' :
                                    'bg-yellow-100 text-yellow-700'
                                }`}>
                                    {job.status}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
