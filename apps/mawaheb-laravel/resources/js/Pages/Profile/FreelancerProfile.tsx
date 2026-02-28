import { Head, useForm } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import { Freelancer, Account, Skill, Review } from '@/types';

interface Props {
    freelancer: Freelancer;
    account: Account;
    user: any;
    skills: Skill[];
    reviews: Review[];
    averageRating: number;
    canReview: boolean;
}

export default function FreelancerProfile({ freelancer, account, user, skills, reviews, averageRating, canReview }: Props) {
    const reviewForm = useForm({ rating: 5, comment: '' });

    return (
        <PublicLayout>
            <Head title={`${user.first_name} ${user.last_name}`} />
            <div className="max-w-4xl mx-auto px-4 py-12">
                <div className="bg-white rounded-xl border p-8 mb-6">
                    <div className="flex items-start gap-6">
                        <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center text-2xl font-bold text-indigo-600">
                            {user.first_name?.[0]}{user.last_name?.[0]}
                        </div>
                        <div className="flex-1">
                            <h1 className="text-2xl font-bold">{user.first_name} {user.last_name}</h1>
                            <p className="text-gray-500">{account.country}</p>
                            {averageRating > 0 && <p className="text-yellow-500 mt-1">{'★'.repeat(Math.round(averageRating))} ({averageRating.toFixed(1)})</p>}
                            {freelancer.hourly_rate && <p className="text-lg font-semibold text-green-600 mt-2">${freelancer.hourly_rate}/hr</p>}
                        </div>
                    </div>
                    {freelancer.about && <p className="mt-6 text-gray-700 leading-relaxed">{freelancer.about}</p>}
                </div>

                {skills.length > 0 && (
                    <div className="bg-white rounded-xl border p-6 mb-6">
                        <h2 className="text-lg font-semibold mb-3">Skills</h2>
                        <div className="flex flex-wrap gap-2">
                            {skills.map((s) => <span key={s.id} className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm">{s.label}</span>)}
                        </div>
                    </div>
                )}

                <div className="bg-white rounded-xl border p-6 mb-6">
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

                {canReview && (
                    <form onSubmit={(e) => { e.preventDefault(); reviewForm.post(`/profile/${account.slug}/review`); }} className="bg-white rounded-xl border p-6">
                        <h2 className="text-lg font-semibold mb-4">Leave a Review</h2>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">Rating</label>
                            <select value={reviewForm.data.rating} onChange={(e) => reviewForm.setData('rating', parseInt(e.target.value))} className="border rounded-lg px-4 py-2">
                                {[5, 4, 3, 2, 1].map((v) => <option key={v} value={v}>{v} Star{v > 1 ? 's' : ''}</option>)}
                            </select>
                        </div>
                        <textarea rows={3} value={reviewForm.data.comment} onChange={(e) => reviewForm.setData('comment', e.target.value)} className="w-full border rounded-lg px-4 py-2.5 mb-4" placeholder="Write your review..." />
                        <button type="submit" disabled={reviewForm.processing} className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg hover:bg-indigo-700 transition">Submit Review</button>
                    </form>
                )}
            </div>
        </PublicLayout>
    );
}
