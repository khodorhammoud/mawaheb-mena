import { Head, Link } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Job, PaginatedData } from '@/types';

interface Props { jobs: PaginatedData<Job> }

export default function ManageJobs({ jobs }: Props) {
    return (
        <DashboardLayout>
            <Head title="Manage Jobs" />
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Manage Jobs</h1>
                <Link href="/new-job" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 transition">Post New Job</Link>
            </div>
            <div className="space-y-4">
                {jobs.data.length === 0 ? (
                    <div className="bg-white rounded-xl border p-12 text-center text-gray-500">No jobs yet. Post your first job!</div>
                ) : jobs.data.map((job) => (
                    <div key={job.id} className="bg-white rounded-xl border p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <Link href={`/jobs/${job.id}`} className="font-semibold text-lg hover:text-indigo-600">{job.title}</Link>
                                <div className="flex gap-4 mt-2 text-sm text-gray-500">
                                    <span>{job.applications?.length ?? 0} applicants</span>
                                    {job.budget && <span>${job.budget}</span>}
                                    <span>{job.project_type?.replace(/-/g, ' ')}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${job.status === 'active' ? 'bg-green-100 text-green-700' : job.status === 'draft' ? 'bg-gray-100 text-gray-700' : 'bg-yellow-100 text-yellow-700'}`}>{job.status}</span>
                                <Link href={`/edit-job/${job.id}`} className="text-indigo-600 text-sm hover:text-indigo-800">Edit</Link>
                                <Link href={`/jobs/${job.id}/applicants`} className="text-indigo-600 text-sm hover:text-indigo-800">Applicants</Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </DashboardLayout>
    );
}
