import { Head } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { TimesheetEntry, TimesheetWeek, JobApplication } from '@/types';

interface Props {
    approvedApplications?: JobApplication[];
    entries?: TimesheetEntry[];
    weekSubmissions?: TimesheetWeek[];
    submissions?: any;
    selectedJobApplicationId?: number;
    accountType: string;
}

export default function TimesheetsIndex({ approvedApplications, entries, weekSubmissions, submissions, accountType }: Props) {
    return (
        <DashboardLayout>
            <Head title="Timesheets" />
            <h1 className="text-2xl font-bold mb-6">Timesheets</h1>

            {accountType === 'freelancer' ? (
                <div>
                    {(!approvedApplications || approvedApplications.length === 0) ? (
                        <div className="bg-white rounded-xl border p-12 text-center text-gray-500">
                            No approved job applications yet. Timesheets will be available once you have an approved application.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="bg-white rounded-xl border p-6">
                                <h2 className="font-semibold mb-3">Select a Project</h2>
                                {approvedApplications.map((app) => (
                                    <a key={app.id} href={`/timesheets?job_application_id=${app.id}`} className="block p-3 border rounded-lg mb-2 hover:bg-gray-50 transition">
                                        {app.job?.title} - {app.job?.employer?.company_name}
                                    </a>
                                ))}
                            </div>
                            {entries && entries.length > 0 && (
                                <div className="bg-white rounded-xl border p-6">
                                    <h2 className="font-semibold mb-3">Time Entries</h2>
                                    <div className="space-y-2">
                                        {entries.map((entry) => (
                                            <div key={entry.id} className="flex items-center justify-between p-3 border rounded-lg">
                                                <div>
                                                    <p className="font-medium">{entry.date}</p>
                                                    <p className="text-sm text-gray-500">{entry.description}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-semibold">{entry.hours.toFixed(1)}h</p>
                                                    <p className="text-xs text-gray-400">{entry.startHour}{entry.startMeridiem} - {entry.endHour}{entry.endMeridiem}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            ) : (
                <div>
                    {(!submissions?.data || submissions.data.length === 0) ? (
                        <div className="bg-white rounded-xl border p-12 text-center text-gray-500">No timesheet submissions to review.</div>
                    ) : (
                        <div className="space-y-4">
                            {submissions.data.map((sub: any) => (
                                <div key={sub.id} className="bg-white rounded-xl border p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-semibold">{sub.freelancer?.account?.user?.first_name} {sub.freelancer?.account?.user?.last_name}</p>
                                            <p className="text-sm text-gray-500">{sub.week_start} - {sub.week_end} ({sub.total_hours}h)</p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${sub.status === 'approved' ? 'bg-green-100 text-green-700' : sub.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{sub.status}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </DashboardLayout>
    );
}
