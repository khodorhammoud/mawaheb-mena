import { Head, Link, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Job, JobApplication } from '@/types';

interface Props { job: Job; hasApplied: boolean; application: JobApplication | null }

export default function JobDetail({ job, hasApplied, application }: Props) {
    return (
        <DashboardLayout>
            <Head title={job.title} />
            <div className="max-w-4xl">
                <Link href="/browse-jobs" className="text-indigo-600 text-sm mb-4 inline-block">&larr; Back to Jobs</Link>
                <div className="bg-white rounded-xl border p-8">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h1 className="text-2xl font-bold">{job.title}</h1>
                            <p className="text-gray-500 mt-1">{job.employer?.company_name}</p>
                        </div>
                        {!hasApplied ? (
                            <button onClick={() => router.post(`/jobs/${job.id}/apply`)} className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg hover:bg-indigo-700 transition">Apply Now</button>
                        ) : (
                            <span className={`px-4 py-2 rounded-lg text-sm font-medium ${application?.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                {application?.status || 'Applied'}
                            </span>
                        )}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        {job.budget && <div className="bg-gray-50 p-3 rounded-lg"><p className="text-xs text-gray-500">Budget</p><p className="font-semibold">${job.budget}</p></div>}
                        {job.project_type && <div className="bg-gray-50 p-3 rounded-lg"><p className="text-xs text-gray-500">Type</p><p className="font-semibold capitalize">{job.project_type.replace(/-/g, ' ')}</p></div>}
                        {job.experience_level && <div className="bg-gray-50 p-3 rounded-lg"><p className="text-xs text-gray-500">Level</p><p className="font-semibold capitalize">{job.experience_level.replace(/_/g, ' ')}</p></div>}
                        {job.working_hours_per_week && <div className="bg-gray-50 p-3 rounded-lg"><p className="text-xs text-gray-500">Hours/Week</p><p className="font-semibold">{job.working_hours_per_week}</p></div>}
                    </div>
                    {job.skills && job.skills.length > 0 && (
                        <div className="mb-6">
                            <h3 className="font-semibold mb-2">Required Skills</h3>
                            <div className="flex flex-wrap gap-2">{job.skills.map((s) => <span key={s.id} className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm">{s.label}</span>)}</div>
                        </div>
                    )}
                    <div>
                        <h3 className="font-semibold mb-2">Description</h3>
                        <div className="prose max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: job.description }} />
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
