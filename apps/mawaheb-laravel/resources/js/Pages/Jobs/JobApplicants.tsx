import { Head, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Job, JobApplication } from '@/types';

interface Props { job: Job; applications: JobApplication[] }

export default function JobApplicants({ job, applications }: Props) {
    const updateStatus = (appId: number, status: string) => {
        router.put(`/applications/${appId}/status`, { status });
    };

    return (
        <DashboardLayout>
            <Head title={`Applicants: ${job.title}`} />
            <h1 className="text-2xl font-bold mb-2">Applicants for: {job.title}</h1>
            <p className="text-gray-500 mb-6">{applications.length} applicant(s)</p>
            <div className="space-y-4">
                {applications.map((app) => (
                    <div key={app.id} className="bg-white rounded-xl border p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-semibold">{app.freelancer?.account?.user?.first_name} {app.freelancer?.account?.user?.last_name}</p>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {app.freelancer?.skills?.slice(0, 5).map((s) => <span key={s.id} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">{s.label}</span>)}
                                </div>
                            </div>
                            <div className="flex gap-2">
                                {['shortlisted', 'approved', 'rejected'].map((status) => (
                                    <button key={status} onClick={() => updateStatus(app.id, status)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${app.status === status ? 'bg-indigo-600 text-white' : 'border hover:bg-gray-50'}`}>
                                        {status}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </DashboardLayout>
    );
}
