import { Head } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import { Employer, Account, Job, Review } from '@/types';

interface Props {
    employer: Employer;
    account: Account;
    user: any;
    jobs: Job[];
    reviews: Review[];
    averageRating: number;
}

export default function EmployerProfile({ employer, account, user, jobs, reviews, averageRating }: Props) {
    return (
        <PublicLayout>
            <Head title={employer.company_name || `${user.first_name} ${user.last_name}`} />
            <div className="max-w-4xl mx-auto px-4 py-12">
                <div className="bg-white rounded-xl border p-8 mb-6">
                    <div className="flex items-start gap-6">
                        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-2xl font-bold text-emerald-600">
                            {(employer.company_name || user.first_name)?.[0]}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">{employer.company_name || `${user.first_name} ${user.last_name}`}</h1>
                            <p className="text-gray-500">{account.country}</p>
                            {averageRating > 0 && <p className="text-yellow-500 mt-1">{'★'.repeat(Math.round(averageRating))} ({averageRating.toFixed(1)})</p>}
                        </div>
                    </div>
                    {employer.about && <p className="mt-6 text-gray-700 leading-relaxed">{employer.about}</p>}
                </div>

                {jobs.length > 0 && (
                    <div className="bg-white rounded-xl border p-6 mb-6">
                        <h2 className="text-lg font-semibold mb-4">Posted Jobs ({jobs.length})</h2>
                        <div className="space-y-3">
                            {jobs.map((j) => (
                                <a key={j.id} href={`/jobs/${j.id}`} className="block p-4 border rounded-lg hover:bg-gray-50 transition">
                                    <p className="font-medium">{j.title}</p>
                                    <p className="text-sm text-gray-500 mt-1">{j.project_type} &middot; {j.experience_level}</p>
                                </a>
                            ))}
                        </div>
                    </div>
                )}

                <div className="bg-white rounded-xl border p-6">
                    <h2 className="text-lg font-semibold mb-4">Reviews ({reviews.length})</h2>
                    {reviews.length === 0 ? <p className="text-gray-500">No reviews yet.</p> : (
                        <div className="space-y-4">
                            {reviews.map((r) => (
                                <div key={r.id} className="border-b pb-4 last:border-0">
                                    <div className="flex items-center justify-between">
                                        <p className="font-medium">{r.reviewer_name || 'Anonymous'}</p>
                                        <span className="text-yellow-500">{'★'.repeat(r.rating)}</span>
                                    </div>
                                    {r.comment && <p className="text-gray-600 mt-1">{r.comment}</p>}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </PublicLayout>
    );
}
