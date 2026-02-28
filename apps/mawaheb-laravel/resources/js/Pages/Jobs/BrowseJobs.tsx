import { Head, Link, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Job, Skill, JobCategory, PaginatedData, JobApplication } from '@/types';
import { useState } from 'react';

interface Props {
    jobs: PaginatedData<Job>;
    recommendedJobs: Job[];
    myJobs: JobApplication[];
    allSkills: Skill[];
    categories: JobCategory[];
    filters: Record<string, any>;
}

export default function BrowseJobs({ jobs, recommendedJobs, myJobs, allSkills, categories, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [tab, setTab] = useState<'all' | 'recommended' | 'applied'>('all');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/browse-jobs', { search }, { preserveState: true });
    };

    const displayJobs = tab === 'recommended' ? recommendedJobs : tab === 'applied' ? myJobs.map(a => a.job!).filter(Boolean) : jobs.data;

    return (
        <DashboardLayout>
            <Head title="Browse Jobs" />
            <h1 className="text-2xl font-bold mb-6">Browse Jobs</h1>

            <div className="flex gap-4 mb-6">
                {(['all', 'recommended', 'applied'] as const).map((t) => (
                    <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${tab === t ? 'bg-indigo-600 text-white' : 'bg-white border text-gray-700 hover:bg-gray-50'}`}>
                        {t === 'all' ? 'All Jobs' : t === 'recommended' ? `Recommended (${recommendedJobs.length})` : `Applied (${myJobs.length})`}
                    </button>
                ))}
            </div>

            <form onSubmit={handleSearch} className="mb-6 flex gap-3">
                <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search jobs..." className="flex-1 border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500" />
                <button type="submit" className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg hover:bg-indigo-700 transition">Search</button>
            </form>

            <div className="space-y-4">
                {displayJobs.length === 0 ? (
                    <div className="bg-white rounded-xl border p-12 text-center text-gray-500">No jobs found.</div>
                ) : displayJobs.map((job) => (
                    <Link key={job.id} href={`/jobs/${job.id}`} className="block bg-white rounded-xl border p-6 hover:shadow-md transition">
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="font-semibold text-lg">{job.title}</h3>
                                <p className="text-sm text-gray-500 mt-1">{job.employer?.company_name}</p>
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {job.skills?.slice(0, 5).map((s) => (
                                        <span key={s.id} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">{s.label}</span>
                                    ))}
                                </div>
                            </div>
                            <div className="text-right">
                                {job.budget && <p className="font-semibold text-green-600">${job.budget}</p>}
                                {job.match_score !== undefined && <p className="text-sm text-indigo-600 font-medium">{job.match_score}% match</p>}
                                <p className="text-xs text-gray-400 mt-1">{job.project_type}</p>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {tab === 'all' && jobs.last_page > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                    {Array.from({ length: jobs.last_page }, (_, i) => i + 1).map((page) => (
                        <Link key={page} href={`/browse-jobs?page=${page}&search=${filters.search || ''}`} className={`px-3 py-1 rounded ${page === jobs.current_page ? 'bg-indigo-600 text-white' : 'bg-white border hover:bg-gray-50'}`}>
                            {page}
                        </Link>
                    ))}
                </div>
            )}
        </DashboardLayout>
    );
}
