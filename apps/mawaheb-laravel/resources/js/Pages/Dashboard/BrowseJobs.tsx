import DashboardLayout from '@/Layouts/DashboardLayout';
import { router } from '@inertiajs/react';
import { useState, useEffect, useCallback } from 'react';
import { AiFillStar } from 'react-icons/ai';
import { FaBriefcase, FaClock, FaMapMarkerAlt, FaDollarSign, FaTimes } from 'react-icons/fa';
import { BsSearch } from 'react-icons/bs';

interface Skill { name: string; isStarred?: boolean }

interface Job {
    id: number;
    title: string;
    description: string;
    budget?: number;
    working_hours_per_week?: number;
    location_preference?: string;
    project_type?: string;
    experience_level?: string;
    status?: string;
    expected_hourly_rate?: number;
    employer_id?: number;
    required_skills?: Skill[];
    created_at?: string;
}

interface Props {
    jobs: Job[];
    recommendedJobs: Job[];
    myJobs: Job[];
    totalCount: number;
    freelancerId?: number;
}

function SkillBadge({ name, isStarred }: { name: string; isStarred?: boolean }) {
    return (
        <span className="flex items-center gap-1 bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full">
            {isStarred && <AiFillStar className="text-yellow-400 w-3 h-3" />}
            {name}
        </span>
    );
}

function JobCard({ job, onSelect }: { job: Job; onSelect: (job: Job) => void }) {
    return (
        <div onClick={() => onSelect(job)}
            className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow cursor-pointer mb-4">
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base text-gray-900 truncate">{job.title}</h3>
                    <p className="text-gray-500 text-sm mt-1 line-clamp-2">{job.description}</p>
                </div>
            </div>

            <div className="flex flex-wrap gap-4 mt-3 text-xs text-gray-500">
                {job.budget && (
                    <span className="flex items-center gap-1"><FaDollarSign className="text-[#27638a]" />${job.budget}</span>
                )}
                {job.working_hours_per_week && (
                    <span className="flex items-center gap-1"><FaClock className="text-[#27638a]" />{job.working_hours_per_week}h/week</span>
                )}
                {job.location_preference && (
                    <span className="flex items-center gap-1"><FaMapMarkerAlt className="text-[#27638a]" />{job.location_preference}</span>
                )}
                {job.experience_level && (
                    <span className="capitalize bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{job.experience_level.replace('_', ' ')}</span>
                )}
                {job.project_type && (
                    <span className="capitalize bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full">{job.project_type}</span>
                )}
            </div>

            {job.required_skills && job.required_skills.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                    {job.required_skills.slice(0, 5).map((skill, i) => (
                        <SkillBadge key={i} name={skill.name} isStarred={skill.isStarred} />
                    ))}
                    {job.required_skills.length > 5 && (
                        <span className="text-xs text-gray-400 self-center">+{job.required_skills.length - 5} more</span>
                    )}
                </div>
            )}
        </div>
    );
}

function JobDetailPanel({ job, onClose }: { job: Job; onClose: () => void }) {
    const [applying, setApplying] = useState(false);
    const [applied, setApplied] = useState(false);

    const handleApply = () => {
        setApplying(true);
        router.post(`/jobs/${job.id}/apply`, {}, {
            onSuccess: () => { setApplied(true); setApplying(false); },
            onError: () => setApplying(false),
        });
    };

    return (
        <div className="fixed inset-y-0 right-0 w-full md:w-[600px] lg:w-[750px] bg-white shadow-2xl z-40 overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold truncate pr-4">{job.title}</h2>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
                    <FaTimes className="w-5 h-5" />
                </button>
            </div>

            <div className="p-6">
                <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-6">
                    {job.budget && <span className="flex items-center gap-1"><FaDollarSign className="text-[#27638a]" />${job.budget} budget</span>}
                    {job.expected_hourly_rate && <span className="flex items-center gap-1"><FaDollarSign className="text-[#27638a]" />${job.expected_hourly_rate}/hr</span>}
                    {job.working_hours_per_week && <span className="flex items-center gap-1"><FaClock className="text-[#27638a]" />{job.working_hours_per_week}h/week</span>}
                    {job.location_preference && <span className="flex items-center gap-1"><FaMapMarkerAlt className="text-[#27638a]" />{job.location_preference}</span>}
                    {job.experience_level && <span className="capitalize bg-blue-50 text-blue-700 px-3 py-1 rounded-full">{job.experience_level.replace('_', ' ')}</span>}
                    {job.project_type && <span className="capitalize bg-purple-50 text-purple-700 px-3 py-1 rounded-full">{job.project_type}</span>}
                </div>

                <div className="mb-6">
                    <h3 className="font-semibold text-base mb-2">Job Description</h3>
                    <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{job.description}</p>
                </div>

                {job.required_skills && job.required_skills.length > 0 && (
                    <div className="mb-6">
                        <h3 className="font-semibold text-base mb-3">Required Skills</h3>
                        <div className="flex flex-wrap gap-2">
                            {job.required_skills.map((skill, i) => (
                                <SkillBadge key={i} name={skill.name} isStarred={skill.isStarred} />
                            ))}
                        </div>
                    </div>
                )}

                <div className="mt-8">
                    {applied ? (
                        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm">
                            Application submitted successfully!
                        </div>
                    ) : (
                        <button onClick={handleApply} disabled={applying}
                            className="w-full bg-[#27638a] text-white py-3 rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-50">
                            {applying ? 'Applying...' : 'Apply Now'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

function FilterBar({ searchQuery, setSearchQuery, filters, setFilters }: {
    searchQuery: string;
    setSearchQuery: (v: string) => void;
    filters: any;
    setFilters: (f: any) => void;
}) {
    return (
        <div className="flex flex-wrap gap-3 mb-6">
            <div className="flex items-center border border-gray-300 rounded-xl px-3 py-2 bg-white flex-1 min-w-48">
                <BsSearch className="text-gray-400 mr-2" />
                <input
                    type="text"
                    placeholder="Search jobs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 outline-none text-sm"
                />
            </div>
            <select value={filters.experienceLevel || ''} onChange={(e) => setFilters({ ...filters, experienceLevel: e.target.value || null })}
                className="border border-gray-300 rounded-xl px-3 py-2 text-sm bg-white">
                <option value="">All Levels</option>
                <option value="junior">Junior</option>
                <option value="mid_level">Mid Level</option>
                <option value="senior_level">Senior Level</option>
            </select>
            <select value={filters.jobType || ''} onChange={(e) => setFilters({ ...filters, jobType: e.target.value || null })}
                className="border border-gray-300 rounded-xl px-3 py-2 text-sm bg-white">
                <option value="">All Types</option>
                <option value="one-time">One-time</option>
                <option value="ongoing">Ongoing</option>
            </select>
        </div>
    );
}

export default function BrowseJobs({ jobs, recommendedJobs, myJobs, totalCount, freelancerId }: Props) {
    const [activeTab, setActiveTab] = useState<'recommended' | 'all' | 'my'>('recommended');
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({ experienceLevel: null as string | null, jobType: null as string | null });
    const [allJobs, setAllJobs] = useState<Job[]>(jobs);
    const [loading, setLoading] = useState(false);

    const filterJobs = useCallback((jobList: Job[]) => {
        return jobList.filter((job) => {
            if (searchQuery && !job.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
                !job.description.toLowerCase().includes(searchQuery.toLowerCase())) return false;
            if (filters.experienceLevel && job.experience_level !== filters.experienceLevel) return false;
            if (filters.jobType && job.project_type !== filters.jobType) return false;
            return true;
        });
    }, [searchQuery, filters]);

    const displayJobs = activeTab === 'recommended' ? filterJobs(recommendedJobs)
        : activeTab === 'my' ? filterJobs(myJobs)
        : filterJobs(allJobs);

    const tabs = [
        { key: 'recommended', label: 'Recommended Jobs', count: recommendedJobs.length },
        { key: 'all', label: 'All Jobs', count: totalCount },
        { key: 'my', label: 'My Jobs', count: myJobs.length },
    ];

    return (
        <DashboardLayout>
            <div className="relative">
                {/* Job Detail Overlay */}
                {selectedJob && (
                    <>
                        <div className="fixed inset-0 bg-black/30 z-30" onClick={() => setSelectedJob(null)} />
                        <JobDetailPanel job={selectedJob} onClose={() => setSelectedJob(null)} />
                    </>
                )}

                {/* Tabs */}
                <div className="flex gap-1 mt-4 mb-6 border-b border-gray-200">
                    {tabs.map((tab) => (
                        <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
                            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${activeTab === tab.key
                                ? 'border-[#27638a] text-[#27638a]'
                                : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                            {tab.label}
                            <span className="ml-2 bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">{tab.count}</span>
                        </button>
                    ))}
                </div>

                <FilterBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} filters={filters} setFilters={setFilters} />

                {activeTab === 'all' && (
                    <p className="text-black text-sm mt-2 mb-6">
                        You have <span className="font-bold text-[#27638a] text-base">{displayJobs.length}</span> job{displayJobs.length !== 1 ? 's' : ''} matching this filter
                        {totalCount > 0 && <> out of <span className="font-bold text-[#27638a] text-base">{totalCount}</span> in total</>}.
                    </p>
                )}

                {loading ? (
                    <div className="text-center py-12 text-gray-500">Loading jobs...</div>
                ) : displayJobs.length === 0 ? (
                    <div className="text-center py-12">
                        <FaBriefcase className="text-gray-300 text-5xl mx-auto mb-4" />
                        <p className="text-gray-500 text-lg">No jobs found.</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 gap-x-10 max-w-6xl">
                        {displayJobs.map((job) => (
                            <JobCard key={job.id} job={job} onSelect={setSelectedJob} />
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
