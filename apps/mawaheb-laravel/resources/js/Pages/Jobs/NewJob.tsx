import { Head, useForm } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Skill, JobCategory } from '@/types';

interface Props { allSkills: Skill[]; categories: JobCategory[] }

export default function NewJob({ allSkills, categories }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        title: '', description: '', job_category_id: '', working_hours_per_week: '',
        location_preference: 'remote', project_type: 'short-term', budget: '',
        expected_hourly_rate: '', experience_level: 'mid_level', status: 'draft', skills: [] as { skill_id: number; is_starred: boolean }[],
    });

    return (
        <DashboardLayout>
            <Head title="Post a Job" />
            <h1 className="text-2xl font-bold mb-6">Post a New Job</h1>
            <form onSubmit={(e) => { e.preventDefault(); post('/new-job'); }} className="max-w-3xl space-y-6">
                <div className="bg-white rounded-xl border p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                        <input type="text" value={data.title} onChange={(e) => setData('title', e.target.value)} className="w-full border rounded-lg px-4 py-2.5" />
                        {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea rows={6} value={data.description} onChange={(e) => setData('description', e.target.value)} className="w-full border rounded-lg px-4 py-2.5" />
                        {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Project Type</label>
                            <select value={data.project_type} onChange={(e) => setData('project_type', e.target.value)} className="w-full border rounded-lg px-4 py-2.5">
                                <option value="short-term">Short Term</option>
                                <option value="long-term">Long Term</option>
                                <option value="per-project-basis">Per Project</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Experience Level</label>
                            <select value={data.experience_level} onChange={(e) => setData('experience_level', e.target.value)} className="w-full border rounded-lg px-4 py-2.5">
                                <option value="entry_level">Entry Level</option>
                                <option value="mid_level">Mid Level</option>
                                <option value="senior_level">Senior Level</option>
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Budget ($)</label>
                            <input type="number" value={data.budget} onChange={(e) => setData('budget', e.target.value)} className="w-full border rounded-lg px-4 py-2.5" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Hours/Week</label>
                            <input type="number" value={data.working_hours_per_week} onChange={(e) => setData('working_hours_per_week', e.target.value)} className="w-full border rounded-lg px-4 py-2.5" />
                        </div>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button type="submit" disabled={processing} className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50">
                        {processing ? 'Creating...' : 'Create Job'}
                    </button>
                    <button type="button" onClick={() => { setData('status', 'active'); }} className="border px-6 py-2.5 rounded-lg hover:bg-gray-50 transition">
                        Save & Publish
                    </button>
                </div>
            </form>
        </DashboardLayout>
    );
}
