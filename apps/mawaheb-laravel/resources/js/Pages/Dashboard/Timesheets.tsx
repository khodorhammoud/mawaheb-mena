import DashboardLayout from '@/Layouts/DashboardLayout';
import { Link, router } from '@inertiajs/react';
import { useState, useEffect, useMemo } from 'react';
import { format, addWeeks, subWeeks, startOfWeek, addDays } from 'date-fns';
import { FaChevronLeft, FaChevronRight, FaCheck, FaTimes, FaClock } from 'react-icons/fa';
import { AiFillStar } from 'react-icons/ai';

interface Skill { name: string; isStarred?: boolean }

interface TimesheetEntry {
    id: number;
    date: string;
    hours: number;
    description: string;
    start_hour?: number;
    start_meridiem?: 'AM' | 'PM';
    end_hour?: number;
    end_meridiem?: 'AM' | 'PM';
    entry_status?: string;
    reviewer_note?: string;
}

interface JobForList {
    job_app_id: number;
    job_id: number;
    title?: string;
    description?: string;
    company_name?: string;
    employer_first_name?: string;
    employer_last_name?: string;
    status: string;
    budget?: number;
    experience_level?: string;
    skills?: Skill[];
}

interface EmployerJob {
    job_id: number;
    title: string;
    description: string;
    budget: number;
    experience_level: string;
    job_application_id: number;
    freelancer_id: number;
    freelancer_first_name: string;
    freelancer_last_name: string;
    status: string;
    skills?: Skill[];
}

interface TimesheetData {
    job_application_id: number;
    job_title: string;
    employer_name: string;
    project_id: string;
    entries: TimesheetEntry[];
    submitted_dates: string[];
    week_status?: string | null;
    week_id?: number | null;
}

interface EmployerTimesheetData extends TimesheetData {
    freelancer_name: string;
    has_previous_week: boolean;
    has_next_week: boolean;
    week_submission_date?: string | null;
}

type Props =
    | { mode: 'list'; jobs: JobForList[]; freelancer_id: number | null }
    | { mode: 'employer'; jobs: EmployerJob[] }
    | { mode: 'timesheet'; data: TimesheetData }
    | { mode: 'employer-timesheet'; data: EmployerTimesheetData };

function SkillBadge({ name, isStarred }: { name: string; isStarred?: boolean }) {
    return (
        <span className="flex items-center gap-1 bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full">
            {isStarred && <AiFillStar className="text-yellow-400 w-3 h-3" />}
            {name}
        </span>
    );
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function TimesheetCalendar({ data, isEmployer = false }: { data: TimesheetData | EmployerTimesheetData; isEmployer?: boolean }) {
    const [weekStart, setWeekStart] = useState(() => {
        const now = new Date();
        const d = now.getDay();
        const diff = d === 0 ? -6 : 1 - d;
        const start = new Date(now);
        start.setDate(now.getDate() + diff);
        start.setHours(0, 0, 0, 0);
        return start;
    });

    const [editingEntry, setEditingEntry] = useState<{ date: string; entry?: TimesheetEntry } | null>(null);
    const [formData, setFormData] = useState({ startHour: '9', startMeridiem: 'AM', endHour: '5', endMeridiem: 'PM', description: '' });
    const [submitting, setSubmitting] = useState(false);
    const [localEntries, setLocalEntries] = useState<TimesheetEntry[]>(data.entries);
    const [submittedDates, setSubmittedDates] = useState<string[]>(data.submitted_dates);
    const [weekStatus, setWeekStatus] = useState(data.week_status || null);

    const weekDays = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(weekStart);
        d.setDate(weekStart.getDate() + i);
        return d;
    });

    const toYMD = (d: Date) => {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    };

    const todayYMD = toYMD(new Date());

    const entriesByDate = useMemo(() => {
        const map: Record<string, TimesheetEntry[]> = {};
        for (const entry of localEntries) {
            if (!map[entry.date]) map[entry.date] = [];
            map[entry.date].push(entry);
        }
        return map;
    }, [localEntries]);

    const isSubmitted = (dateStr: string) => submittedDates.includes(dateStr);
    const isFuture = (dateStr: string) => dateStr > todayYMD;

    const handleSaveEntry = () => {
        if (!editingEntry) return;
        setSubmitting(true);
        const payload = {
            job_application_id: data.job_application_id,
            date: editingEntry.date,
            start_hour: formData.startHour,
            start_meridiem: formData.startMeridiem,
            end_hour: formData.endHour,
            end_meridiem: formData.endMeridiem,
            description: formData.description,
            ...(editingEntry.entry ? { entry_id: editingEntry.entry.id, intent: 'UPDATE_ENTRY' } : { intent: 'CREATE_ENTRY' }),
        };
        router.post('/timesheets', payload, {
            onSuccess: () => { setSubmitting(false); setEditingEntry(null); },
            onError: () => setSubmitting(false),
        });
    };

    const handleSubmitWeek = () => {
        setSubmitting(true);
        router.post('/timesheets', {
            intent: 'SUBMIT_WEEK',
            job_application_id: data.job_application_id,
            week_start: toYMD(weekStart),
        }, {
            onSuccess: () => { setSubmitting(false); setWeekStatus('submitted'); },
            onError: () => setSubmitting(false),
        });
    };

    const handleApproveWeek = (weekId: number) => {
        router.post('/timesheets/approve', { week_id: weekId });
    };

    const handleRejectWeek = (weekId: number, note: string) => {
        router.post('/timesheets/reject', { week_id: weekId, note });
    };

    const weekEntries = weekDays.flatMap((d) => entriesByDate[toYMD(d)] || []);
    const totalHours = weekEntries.reduce((sum, e) => sum + (e.hours || 0), 0);
    const canSubmit = weekEntries.length > 0 && weekStatus !== 'submitted' && weekStatus !== 'approved';

    const statusColors: Record<string, string> = {
        submitted: 'bg-yellow-100 text-yellow-700 border-yellow-300',
        approved: 'bg-green-100 text-green-700 border-green-300',
        rejected: 'bg-red-100 text-red-700 border-red-300',
        resubmitted: 'bg-blue-100 text-blue-700 border-blue-300',
    };

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-semibold">{data.job_title}</h2>
                    <p className="text-gray-500 text-sm">{data.employer_name} · {data.project_id}</p>
                    {isEmployer && (data as EmployerTimesheetData).freelancer_name && (
                        <p className="text-gray-500 text-sm">Freelancer: {(data as EmployerTimesheetData).freelancer_name}</p>
                    )}
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => setWeekStart(subWeeks(weekStart, 1))} className="p-2 hover:bg-gray-100 rounded-lg transition">
                        <FaChevronLeft />
                    </button>
                    <span className="text-sm font-medium">
                        {format(weekStart, 'MMM d')} – {format(addDays(weekStart, 6), 'MMM d, yyyy')}
                    </span>
                    <button onClick={() => setWeekStart(addWeeks(weekStart, 1))} className="p-2 hover:bg-gray-100 rounded-lg transition">
                        <FaChevronRight />
                    </button>
                </div>
            </div>

            {/* Week Status */}
            {weekStatus && (
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-sm mb-4 ${statusColors[weekStatus] || 'bg-gray-100 text-gray-600 border-gray-300'}`}>
                    <FaClock className="w-3 h-3" />
                    Week status: <span className="font-semibold capitalize">{weekStatus}</span>
                </div>
            )}

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2 mb-6">
                {weekDays.map((day, i) => {
                    const dateStr = toYMD(day);
                    const dayEntries = entriesByDate[dateStr] || [];
                    const submitted = isSubmitted(dateStr);
                    const future = isFuture(dateStr);
                    const dayHours = dayEntries.reduce((s, e) => s + (e.hours || 0), 0);

                    return (
                        <div key={i} className={`border rounded-xl p-3 min-h-[120px] flex flex-col ${submitted ? 'bg-green-50 border-green-200' : future ? 'bg-gray-50 border-gray-100 opacity-60' : 'bg-white border-gray-200 hover:border-[#27638a] transition'}`}>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-semibold text-gray-500">{DAYS[i]}</span>
                                <span className="text-xs text-gray-400">{format(day, 'MMM d')}</span>
                            </div>
                            {dayHours > 0 && (
                                <div className="text-sm font-bold text-[#27638a] mb-1">{dayHours.toFixed(1)}h</div>
                            )}
                            <div className="flex-1 space-y-1">
                                {dayEntries.map((entry, j) => (
                                    <div key={j} onClick={() => !submitted && !isEmployer && setEditingEntry({ date: dateStr, entry })}
                                        className={`text-xs p-1 rounded bg-blue-50 text-blue-700 truncate ${!submitted && !isEmployer ? 'cursor-pointer hover:bg-blue-100' : ''}`}>
                                        {entry.start_hour}{entry.start_meridiem} - {entry.end_hour}{entry.end_meridiem}
                                    </div>
                                ))}
                            </div>
                            {!submitted && !future && !isEmployer && (
                                <button onClick={() => { setEditingEntry({ date: dateStr }); setFormData({ startHour: '9', startMeridiem: 'AM', endHour: '5', endMeridiem: 'PM', description: '' }); }}
                                    className="mt-2 text-xs text-[#27638a] hover:underline">+ Add entry</button>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Summary */}
            <div className="flex items-center justify-between bg-gray-50 rounded-xl p-4 mb-6">
                <div>
                    <span className="text-sm text-gray-500">Total hours this week: </span>
                    <span className="font-bold text-[#27638a] text-lg">{totalHours.toFixed(1)}h</span>
                </div>
                {!isEmployer && canSubmit && (
                    <button onClick={handleSubmitWeek} disabled={submitting}
                        className="bg-[#27638a] text-white px-6 py-2 rounded-xl text-sm font-semibold hover:opacity-90 transition disabled:opacity-50">
                        {submitting ? 'Submitting...' : 'Submit Week'}
                    </button>
                )}
                {isEmployer && weekStatus === 'submitted' && data.week_id && (
                    <div className="flex gap-3">
                        <button onClick={() => handleApproveWeek(data.week_id!)}
                            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-xl text-sm hover:opacity-90 transition">
                            <FaCheck /> Approve
                        </button>
                        <button onClick={() => { const note = prompt('Rejection reason:'); if (note) handleRejectWeek(data.week_id!, note); }}
                            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-xl text-sm hover:opacity-90 transition">
                            <FaTimes /> Reject
                        </button>
                    </div>
                )}
            </div>

            {/* Entry Edit Dialog */}
            {editingEntry && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md">
                        <h3 className="text-lg font-semibold mb-4">{editingEntry.entry ? 'Edit Entry' : 'Add Entry'} — {editingEntry.date}</h3>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="text-xs text-gray-500 mb-1 block">Start Time</label>
                                <div className="flex gap-2">
                                    <select value={formData.startHour} onChange={(e) => setFormData({ ...formData, startHour: e.target.value })}
                                        className="flex-1 border border-gray-300 rounded-lg px-2 py-2 text-sm">
                                        {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => <option key={h}>{h}</option>)}
                                    </select>
                                    <select value={formData.startMeridiem} onChange={(e) => setFormData({ ...formData, startMeridiem: e.target.value as 'AM' | 'PM' })}
                                        className="border border-gray-300 rounded-lg px-2 py-2 text-sm">
                                        <option>AM</option><option>PM</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 mb-1 block">End Time</label>
                                <div className="flex gap-2">
                                    <select value={formData.endHour} onChange={(e) => setFormData({ ...formData, endHour: e.target.value })}
                                        className="flex-1 border border-gray-300 rounded-lg px-2 py-2 text-sm">
                                        {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => <option key={h}>{h}</option>)}
                                    </select>
                                    <select value={formData.endMeridiem} onChange={(e) => setFormData({ ...formData, endMeridiem: e.target.value as 'AM' | 'PM' })}
                                        className="border border-gray-300 rounded-lg px-2 py-2 text-sm">
                                        <option>AM</option><option>PM</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="mb-4">
                            <label className="text-xs text-gray-500 mb-1 block">Description</label>
                            <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full border border-gray-300 rounded-lg p-3 text-sm resize-none h-20 focus:outline-none focus:ring-2 focus:ring-[#27638a]"
                                placeholder="What did you work on?" />
                        </div>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setEditingEntry(null)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                            <button onClick={handleSaveEntry} disabled={submitting}
                                className="px-6 py-2 text-sm bg-[#27638a] text-white rounded-xl disabled:opacity-50">
                                {submitting ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function Timesheets(props: Props) {
    return (
        <DashboardLayout>
            <div className="space-y-6 p-4">
                {props.mode === 'list' && (
                    <>
                        <h2 className="text-xl font-semibold">Active Jobs</h2>
                        {props.jobs.length === 0 ? (
                            <p className="text-sm text-gray-600">No active jobs for this freelancer.</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {props.jobs.map((j) => (
                                    <div key={j.job_app_id} className="lg:grid xl:p-6 p-4 bg-white border rounded-xl shadow-xl gap-4 mb-10">
                                        <div className="text-xl lg:text-lg">{j.title ?? 'Untitled job'}</div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <div className="text-sm lg:text-xs text-gray-500">{j.company_name}</div>
                                            {j.employer_first_name && j.employer_last_name && (
                                                <>
                                                    <span className="text-gray-300">•</span>
                                                    <div className="text-sm lg:text-xs text-gray-600 font-medium">{j.employer_first_name} {j.employer_last_name}</div>
                                                </>
                                            )}
                                        </div>
                                        <div className="flex xl:gap-10 lg:gap-8 gap-6 mt-4">
                                            <div>
                                                <p className="text-base lg:text-sm leading-tight">${j.budget ?? 0}</p>
                                                <p className="text-gray-400 text-xs">Fixed price</p>
                                            </div>
                                            <div>
                                                <p className="text-base lg:text-sm leading-tight">{j.experience_level ?? 'N/A'}</p>
                                                <p className="text-gray-400 text-xs">Experience level</p>
                                            </div>
                                        </div>
                                        <p className="text-sm lg:text-xs text-gray-600 mt-4 line-clamp-3">{j.description}</p>
                                        {j.skills && j.skills.length > 0 && (
                                            <div className="lg:mt-8 mt-4 flex flex-wrap gap-2">
                                                {j.skills.slice(0, 6).map((s, i) => <SkillBadge key={i} name={s.name} isStarred={s.isStarred} />)}
                                            </div>
                                        )}
                                        <div className="mt-6">
                                            <Link href={`/timesheets?jobAppId=${j.job_app_id}`}
                                                className="text-xs border border-gray-300 text-[#27638a] bg-white rounded-[10px] py-2 px-3 w-fit whitespace-nowrap hover:text-white hover:bg-[#27638a] transition mt-4 inline-block">
                                                Open timesheet →
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {props.mode === 'employer' && (
                    <>
                        <h2 className="text-xl font-semibold">Active jobs + Freelancers chosen:</h2>
                        {props.jobs.length === 0 ? (
                            <p className="text-sm text-gray-600">No active jobs with approved freelancers.</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {props.jobs.map((j) => (
                                    <div key={j.job_id} className="lg:grid xl:p-6 p-4 bg-white border rounded-xl shadow-xl gap-4 mb-10">
                                        <div className="text-xl lg:text-lg">{j.title}</div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <div className="text-sm lg:text-xs text-gray-600 font-medium">{j.freelancer_first_name} {j.freelancer_last_name}</div>
                                        </div>
                                        <div className="flex xl:gap-10 lg:gap-8 gap-6 mt-4">
                                            <div>
                                                <p className="text-base lg:text-sm leading-tight">${j.budget ?? 0}</p>
                                                <p className="text-gray-400 text-xs">Fixed price</p>
                                            </div>
                                            <div>
                                                <p className="text-base lg:text-sm leading-tight">{j.experience_level ?? 'N/A'}</p>
                                                <p className="text-gray-400 text-xs">Experience level</p>
                                            </div>
                                        </div>
                                        <p className="text-sm lg:text-xs text-gray-600 mt-4 line-clamp-3">{j.description}</p>
                                        {j.skills && j.skills.length > 0 && (
                                            <div className="lg:mt-8 mt-4 flex flex-wrap gap-2">
                                                {j.skills.slice(0, 6).map((s, i) => <SkillBadge key={i} name={s.name} isStarred={s.isStarred} />)}
                                            </div>
                                        )}
                                        <div className="mt-6">
                                            <Link href={`/timesheets?jobAppId=${j.job_application_id}`}
                                                className="text-xs border border-gray-300 text-[#27638a] bg-white rounded-[10px] py-2 px-3 w-fit whitespace-nowrap hover:text-white hover:bg-[#27638a] transition mt-4 inline-block">
                                                View timesheet →
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {props.mode === 'timesheet' && (
                    <TimesheetCalendar data={props.data} isEmployer={false} />
                )}

                {props.mode === 'employer-timesheet' && (
                    <TimesheetCalendar data={props.data} isEmployer={true} />
                )}
            </div>
        </DashboardLayout>
    );
}
