import DashboardLayout from '@/Layouts/DashboardLayout';
import { Link, router } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import { AiFillStar, AiOutlineStar } from 'react-icons/ai';
import { FaDollarSign, FaStar, FaUser, FaPlus, FaEdit, FaVideo, FaTrash } from 'react-icons/fa';
import { SlBadge } from 'react-icons/sl';
import { MdLanguage } from 'react-icons/md';

interface Skill { name: string; isStarred?: boolean }
interface Language { name: string; level?: string }
interface PortfolioItem { title: string; description?: string; url?: string; image?: string }
interface WorkHistoryItem { title: string; company?: string; startDate?: string; endDate?: string; description?: string }
interface Certificate { title: string; issuer?: string; date?: string; url?: string }
interface Education { degree: string; institution?: string; startDate?: string; endDate?: string }

interface Profile {
    id: number;
    first_name?: string;
    last_name?: string;
    profile_picture?: string;
    about?: string;
    hourly_rate?: number;
    years_of_experience?: number;
    video_link?: string;
    portfolio?: PortfolioItem[];
    work_history?: WorkHistoryItem[];
    certificates?: Certificate[];
    educations?: Education[];
    languages?: Language[];
    skills?: Skill[];
    account?: { country?: string; website_url?: string; account_status?: string };
}

interface Review { rating: number; comment?: string }

interface Props {
    profile: Profile;
    canEdit: boolean;
    overallRating?: number;
    reviewCount?: number;
    myReview?: Review | null;
}

function StarRating({ rating, onRate }: { rating: number; onRate?: (r: number) => void }) {
    const [hover, setHover] = useState(0);
    return (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} type="button"
                    onClick={() => onRate?.(star)}
                    onMouseEnter={() => onRate && setHover(star)}
                    onMouseLeave={() => onRate && setHover(0)}
                    className={`text-2xl transition-transform ${onRate ? 'hover:scale-110 cursor-pointer' : 'cursor-default'} ${star <= (hover || rating) ? 'text-yellow-400' : 'text-gray-300'}`}>
                    <FaStar className="w-5 h-5" />
                </button>
            ))}
        </div>
    );
}

function ReviewDialog({ profile, existingReview, onClose }: { profile: Profile; existingReview: Review | null; onClose: () => void }) {
    const [rating, setRating] = useState(existingReview?.rating || 0);
    const [comment, setComment] = useState(existingReview?.comment || '');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        router.post(`/api/freelancers/${profile.id}/review`, { rating, comment }, {
            onFinish: () => { setSubmitting(false); onClose(); }
        });
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
                <h3 className="text-lg font-semibold mb-4">{existingReview ? 'Edit your review' : 'Leave a review'}</h3>
                <div className="flex justify-center bg-gray-100 rounded-xl py-4 mb-4">
                    <StarRating rating={rating} onRate={setRating} />
                </div>
                <form onSubmit={handleSubmit}>
                    <textarea
                        className="w-full border border-gray-300 rounded-lg p-3 text-sm resize-none h-24 focus:outline-none focus:ring-2 focus:ring-[#27638a]"
                        placeholder="Write your feedback..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                    />
                    <div className="flex justify-end gap-3 mt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                        <button type="submit" disabled={rating === 0 || submitting}
                            className="px-6 py-2 text-sm bg-[#27638a] text-white rounded-xl disabled:opacity-50">
                            {submitting ? 'Submitting...' : existingReview ? 'Update Review' : 'Submit Review'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function SectionCard({ title, children, onEdit, editable }: { title: string; children: ReactNode; onEdit?: () => void; editable?: boolean }) {
    return (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
                {editable && onEdit && (
                    <button onClick={onEdit} className="text-[#27638a] hover:bg-blue-50 p-2 rounded-lg transition">
                        <FaEdit className="w-4 h-4" />
                    </button>
                )}
            </div>
            {children}
        </div>
    );
}

import { ReactNode } from 'react';

export default function FreelancerDashboard({ profile, canEdit, overallRating = 0, reviewCount = 0, myReview }: Props) {
    const [showReviewDialog, setShowReviewDialog] = useState(false);

    const safeArray = (data: any): any[] => {
        if (Array.isArray(data)) return data;
        try { return JSON.parse(data ?? '[]'); } catch { return []; }
    };

    const portfolio = safeArray(profile.portfolio);
    const workHistory = safeArray(profile.work_history || (profile as any).workHistory);
    const certificates = safeArray(profile.certificates);
    const educations = safeArray(profile.educations);
    const languages = safeArray(profile.languages);
    const skills = safeArray(profile.skills);

    const firstName = profile.first_name || '';
    const lastName = profile.last_name || '';
    const initials = firstName && lastName ? `${firstName[0]}${lastName[0]}` : null;

    return (
        <DashboardLayout>
            <div className="relative w-full max-w-7xl mx-auto pr-4 md:pr-10">
                {/* Cover Banner */}
                <div className="h-32 sm:h-36 md:h-40 w-full my-4 rounded-xl border-2 relative"
                    style={{ background: 'linear-gradient(to right, #27638a 0%, white 75%)' }}>

                    {/* Rating Section */}
                    <div className="absolute sm:top-20 top-14 right-4 flex flex-col sm:flex-row items-start sm:items-center gap-2">
                        {!canEdit && (
                            <button onClick={() => setShowReviewDialog(true)}
                                className={`flex items-center xl:text-xl lg:text-lg text-sm px-3 py-1 rounded-lg border ${myReview ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                                <AiFillStar className={`xl:h-6 xl:w-6 lg:h-5 lg:w-5 h-4 w-4 mr-1 ${myReview ? 'text-yellow-500' : 'text-gray-400'}`} />
                                <span className="font-semibold">{myReview?.rating || '0'}/5</span>
                                <span className="text-gray-500 xl:text-base md:text-sm text-xs ml-2">
                                    {myReview ? '(Your Review)' : '(Click to Review)'}
                                </span>
                            </button>
                        )}
                        {!canEdit && <span className="text-gray-400 hidden sm:block">|</span>}
                        <div className="flex items-center xl:text-xl lg:text-lg text-sm">
                            <AiFillStar className="text-yellow-500 xl:h-6 xl:w-6 lg:h-5 lg:w-5 h-4 w-4 mr-1" />
                            <span className="font-semibold">{overallRating}/5</span>
                            <span className="text-gray-500 xl:text-base md:text-sm text-xs ml-2">({reviewCount} employer reviews)</span>
                        </div>
                    </div>
                </div>

                {/* Profile Heading */}
                <div className="mb-10 flex items-start font-['Switzer-Regular'] relative -mt-14 z-10">
                    {/* Avatar */}
                    <div className="flex-shrink-0 mr-6">
                        {profile.profile_picture ? (
                            <img src={profile.profile_picture} alt="Profile" className="w-24 h-24 rounded-full border-4 border-white shadow-md object-cover" />
                        ) : (
                            <div className="w-24 h-24 rounded-full border-4 border-white shadow-md bg-gray-300 flex items-center justify-center">
                                {initials ? <span className="text-2xl font-bold">{initials.toUpperCase()}</span> : <FaUser className="text-gray-500 text-3xl" />}
                            </div>
                        )}
                    </div>

                    {/* Bio */}
                    <div className="flex-1 pt-16">
                        <h1 className="text-2xl font-bold">{firstName} {lastName}</h1>
                        <p className="text-gray-500 text-sm">{profile.account?.country || ''}</p>

                        {/* Skills */}
                        {skills.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3">
                                {skills.slice(0, 6).map((skill: Skill, i: number) => (
                                    <span key={i} className="flex items-center gap-1 bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full">
                                        {skill.isStarred && <AiFillStar className="text-yellow-400 w-3 h-3" />}
                                        {skill.name}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Languages */}
                        {languages.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                                {languages.map((lang: Language, i: number) => (
                                    <span key={i} className="flex items-center gap-1 text-xs text-gray-500">
                                        <MdLanguage className="w-3 h-3" />
                                        {lang.name}{lang.level ? ` (${lang.level})` : ''}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Sections Grid */}
                <div className="flex flex-col gap-6">
                    {/* Row 1: Hourly Rate + Experience */}
                    <div className="flex flex-wrap gap-6 w-full justify-between">
                        <div className="w-full md:w-[48%] flex-shrink-0">
                            <SectionCard title="Hourly Rate" editable={canEdit}>
                                <div className="flex items-center gap-2">
                                    <FaDollarSign className="text-[#27638a] text-2xl" />
                                    <span className="text-3xl font-bold">{profile.hourly_rate || 0}</span>
                                    <span className="text-gray-500">/hr</span>
                                </div>
                                {canEdit && (
                                    <input type="range" min={10} max={100} value={profile.hourly_rate || 10}
                                        onChange={(e) => router.patch('/profile/hourly-rate', { hourly_rate: e.target.value })}
                                        className="w-full mt-3 accent-[#27638a]" />
                                )}
                            </SectionCard>
                        </div>
                        <div className="w-full md:w-[48%] flex-shrink-0">
                            <SectionCard title="Experience" editable={canEdit}>
                                <div className="flex items-center gap-2">
                                    <SlBadge className="text-[#27638a] text-2xl" />
                                    <span className="text-3xl font-bold">{profile.years_of_experience || 0}</span>
                                    <span className="text-gray-500">years</span>
                                </div>
                            </SectionCard>
                        </div>
                    </div>

                    {/* Row 2: Video + About */}
                    <div className="flex flex-wrap gap-6 w-full justify-between">
                        <div className="w-full md:w-[48%] flex-shrink-0">
                            <SectionCard title="Introductory Video" editable={canEdit}>
                                {profile.video_link ? (
                                    <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                                        <iframe src={profile.video_link} className="w-full h-full" allowFullScreen title="Intro video" />
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-32 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                                        <FaVideo className="text-gray-400 text-3xl mb-2" />
                                        <p className="text-gray-400 text-sm">No video added</p>
                                    </div>
                                )}
                            </SectionCard>
                        </div>
                        <div className="w-full md:w-[48%] flex-shrink-0">
                            <SectionCard title="About" editable={canEdit}>
                                {profile.about ? (
                                    <div className="text-gray-700 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: profile.about }} />
                                ) : (
                                    <p className="text-gray-400 text-sm italic">No bio added yet.</p>
                                )}
                            </SectionCard>
                        </div>
                    </div>

                    {/* Portfolio */}
                    <div className="w-full">
                        <SectionCard title="Portfolio" editable={canEdit}>
                            {portfolio.length === 0 ? (
                                <p className="text-gray-400 text-sm italic">No portfolio items added.</p>
                            ) : (
                                <div className="grid sm:grid-cols-2 gap-4">
                                    {portfolio.map((item: PortfolioItem, i: number) => (
                                        <div key={i} className="border border-gray-200 rounded-lg p-4">
                                            {item.image && <img src={item.image} alt={item.title} className="w-full h-32 object-cover rounded-lg mb-3" />}
                                            <h4 className="font-semibold text-sm">{item.title}</h4>
                                            {item.description && <p className="text-gray-500 text-xs mt-1 line-clamp-2">{item.description}</p>}
                                            {item.url && <a href={item.url} target="_blank" rel="noreferrer" className="text-[#27638a] text-xs mt-2 block hover:underline">View project →</a>}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </SectionCard>
                    </div>

                    {/* Work History */}
                    <div className="w-full">
                        <SectionCard title="Work History" editable={canEdit}>
                            {workHistory.length === 0 ? (
                                <p className="text-gray-400 text-sm italic">No work history added.</p>
                            ) : (
                                <div className="space-y-4">
                                    {workHistory.map((item: WorkHistoryItem, i: number) => (
                                        <div key={i} className="border-l-2 border-[#27638a] pl-4">
                                            <h4 className="font-semibold text-sm">{item.title}</h4>
                                            {item.company && <p className="text-gray-500 text-xs">{item.company}</p>}
                                            {(item.startDate || item.endDate) && (
                                                <p className="text-gray-400 text-xs">{item.startDate} – {item.endDate || 'Present'}</p>
                                            )}
                                            {item.description && <p className="text-gray-600 text-xs mt-1">{item.description}</p>}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </SectionCard>
                    </div>

                    {/* Certificates */}
                    <div className="w-full">
                        <SectionCard title="Certificates" editable={canEdit}>
                            {certificates.length === 0 ? (
                                <p className="text-gray-400 text-sm italic">No certificates added.</p>
                            ) : (
                                <div className="grid sm:grid-cols-2 gap-4">
                                    {certificates.map((cert: Certificate, i: number) => (
                                        <div key={i} className="border border-gray-200 rounded-lg p-4">
                                            <h4 className="font-semibold text-sm">{cert.title}</h4>
                                            {cert.issuer && <p className="text-gray-500 text-xs">{cert.issuer}</p>}
                                            {cert.date && <p className="text-gray-400 text-xs">{cert.date}</p>}
                                            {cert.url && <a href={cert.url} target="_blank" rel="noreferrer" className="text-[#27638a] text-xs mt-1 block hover:underline">View certificate →</a>}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </SectionCard>
                    </div>

                    {/* Education */}
                    <div className="w-full">
                        <SectionCard title="Education" editable={canEdit}>
                            {educations.length === 0 ? (
                                <p className="text-gray-400 text-sm italic">No education added.</p>
                            ) : (
                                <div className="space-y-4">
                                    {educations.map((edu: Education, i: number) => (
                                        <div key={i} className="border-l-2 border-[#27638a] pl-4">
                                            <h4 className="font-semibold text-sm">{edu.degree}</h4>
                                            {edu.institution && <p className="text-gray-500 text-xs">{edu.institution}</p>}
                                            {(edu.startDate || edu.endDate) && (
                                                <p className="text-gray-400 text-xs">{edu.startDate} – {edu.endDate || 'Present'}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </SectionCard>
                    </div>
                </div>
            </div>

            {showReviewDialog && (
                <ReviewDialog profile={profile} existingReview={myReview || null} onClose={() => setShowReviewDialog(false)} />
            )}
        </DashboardLayout>
    );
}
