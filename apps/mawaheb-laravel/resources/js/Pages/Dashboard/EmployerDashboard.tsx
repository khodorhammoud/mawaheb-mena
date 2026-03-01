import DashboardLayout from '@/Layouts/DashboardLayout';
import { Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/useToast';

interface JobStats {
    active: number;
    drafted: number;
    closed: number;
    paused: number;
    total: number;
}

interface ApplicantStats {
    total: number;
    shortlisted: number;
    interviewed: number;
}

interface Props {
    firstName: string;
    accountStatus: string;
    jobStats: JobStats;
    applicantStats: ApplicantStats;
    jobAddedSuccess?: boolean;
}

export default function EmployerDashboard({ firstName, accountStatus, jobStats, applicantStats, jobAddedSuccess }: Props) {
    const [showSuccessToast, setShowSuccessToast] = useState(jobAddedSuccess || false);

    useEffect(() => {
        if (jobAddedSuccess) {
            setShowSuccessToast(true);
            const timer = setTimeout(() => setShowSuccessToast(false), 4000);
            return () => clearTimeout(timer);
        }
    }, [jobAddedSuccess]);

    const isDeactivated = accountStatus === 'deactivated';

    const jobData = [
        { title: 'Active Jobs', count: jobStats.active, color: jobStats.active > 0 ? 'text-green-700' : 'text-red-600' },
        { title: 'Drafted Jobs', count: jobStats.drafted, color: jobStats.drafted > 0 ? 'text-green-700' : 'text-red-600' },
        { title: 'Closed Jobs', count: jobStats.closed, color: jobStats.closed > 0 ? 'text-green-700' : 'text-red-600' },
        { title: 'Paused Jobs', count: jobStats.paused, color: jobStats.paused > 0 ? 'text-green-700' : 'text-red-600' },
    ];

    return (
        <DashboardLayout>
            {showSuccessToast && (
                <div className="fixed top-24 right-4 z-50 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-xl shadow-lg">
                    Job added successfully! Your job posting has been created.
                </div>
            )}

            <div className="flex">
                <div className="flex-1 pl-6">
                    <div className="min-h-screen flex flex-col">
                        {jobStats.total === 0 && (
                            <>
                                <h1 className="text-2xl ml-6">
                                    Welcome, <span className="text-[#27638a] font-bold">{firstName}!</span>
                                </h1>
                                <p className="text-2xl ml-6">Good to hear from you. Are you hiring?</p>
                                <div className="flex justify-start ml-6 mt-4">
                                    {isDeactivated ? (
                                        <button
                                            onClick={() => alert("You can't create a new job while your account is deactivated")}
                                            className="bg-[#27638a] text-white rounded-md px-4 py-2 opacity-60 cursor-not-allowed"
                                        >
                                            Create New Job
                                        </button>
                                    ) : (
                                        <Link href="/new-job"
                                            className="bg-[#27638a] text-white rounded-md px-4 py-2 hover:opacity-90 transition w-auto mr-4">
                                            Create New Job
                                        </Link>
                                    )}
                                </div>
                            </>
                        )}

                        <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 xl:gap-12 gap-4 my-8">
                            {/* Job Postings */}
                            <div className="bg-white">
                                <h1 className="xl:text-2xl md:text-xl text-lg font-semibold mb-6">Job Postings</h1>
                                <div className="bg-gray-100 rounded-2xl p-8 space-y-10">
                                    {jobData.map((job, i) => (
                                        <div key={i}>
                                            <h2 className="xl:text-lg text-base font-semibold text-gray-800">{job.title}</h2>
                                            <div className="flex items-center gap-10">
                                                <p className="xl:text-3xl md:text-2xl text-xl font-bold text-black">{job.count}</p>
                                                <div className={`md:text-sm text-xs mt-1 ${job.color}`}>
                                                    +0 from last month
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Applicants Summary */}
                            <div className="bg-white">
                                <h1 className="xl:text-2xl md:text-xl text-lg font-semibold mb-6">Applicants Summary</h1>
                                <div className="md:grid md:grid-cols-3">
                                    <div className="flex flex-col gap-4">
                                        <div className="flex flex-col justify-center xl:p-6 p-4 bg-gray-100 rounded-xl xl:h-[212px] lg:h-[196px]">
                                            <p className="xl:text-3xl md:text-2xl text-xl font-bold text-black">{applicantStats.interviewed}</p>
                                            <h2 className="xl:text-lg md:text-base text-sm font-medium text-gray-800">Interviewed</h2>
                                        </div>
                                        <div className="flex flex-col justify-center xl:p-6 p-4 bg-gray-100 rounded-xl xl:h-[212px] lg:h-[196px]">
                                            <p className="xl:text-3xl md:text-2xl text-xl font-bold text-black">{applicantStats.shortlisted}</p>
                                            <h2 className="xl:text-lg md:text-base text-sm font-medium text-gray-800">Shortlisted</h2>
                                        </div>
                                    </div>
                                    <div className="md:col-span-2 flex flex-col justify-center xl:p-6 p-4 bg-gray-100 rounded-xl h-full md:ml-3 md:mt-0 mt-4 xl:h-[440px] lg:h-[408px]">
                                        <p className="xl:text-3xl md:text-2xl text-xl font-bold text-black">{applicantStats.total}</p>
                                        <h2 className="xl:text-lg md:text-base text-sm font-medium text-gray-800">Total Applicants</h2>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
