import { Head, useForm } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Job, Skill, JobCategory } from '@/types';

interface Props { job: Job; allSkills: Skill[]; categories: JobCategory[] }

export default function EditJob({ job, allSkills, categories }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        title: job.title, description: job.description, project_type: job.project_type || 'short-term',
        experience_level: job.experience_level || 'mid_level', budget: job.budget?.toString() || '',
        working_hours_per_week: job.working_hours_per_week?.toString() || '', status: job.status,
        location_preference: job.location_preference || 'remote', skills: [] as any[],
    });

    return (
        <DashboardLayout>
            <Head title={`Edit: ${job.title}`} />
            <h1 className="text-2xl font-bold mb-6">Edit Job</h1>
            <form onSubmit={(e) => { e.preventDefault(); put(`/edit-job/${job.id}`); }} className="max-w-3xl space-y-6">
                <div className="bg-white rounded-xl border p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                        <input type="text" value={data.title} onChange={(e) => setData('title', e.target.value)} className="w-full border rounded-lg px-4 py-2.5" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea rows={6} value={data.description} onChange={(e) => setData('description', e.target.value)} className="w-full border rounded-lg px-4 py-2.5" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select value={data.status} onChange={(e) => setData('status', e.target.value)} className="w-full border rounded-lg px-4 py-2.5">
                                <option value="draft">Draft</option><option value="active">Active</option><option value="closed">Closed</option><option value="paused">Paused</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Budget ($)</label>
                            <input type="number" value={data.budget} onChange={(e) => setData('budget', e.target.value)} className="w-full border rounded-lg px-4 py-2.5" />
                        </div>
                    </div>
                </div>
                <button type="submit" disabled={processing} className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50">
                    {processing ? 'Saving...' : 'Save Changes'}
                </button>
            </form>
        </DashboardLayout>
    );
}
