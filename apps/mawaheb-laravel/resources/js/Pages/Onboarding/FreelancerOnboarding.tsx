import { Head, useForm, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Freelancer, Account, Skill, Language } from '@/types';
import { useState } from 'react';

interface Props { freelancer: Freelancer; account: Account; user: any; allSkills: Skill[]; allLanguages: Language[] }

export default function FreelancerOnboarding({ freelancer, account, user, allSkills, allLanguages }: Props) {
    const [step, setStep] = useState(0);
    const steps = ['Bio', 'About', 'Skills', 'Experience', 'Portfolio', 'Availability'];

    const bioForm = useForm({ first_name: user?.first_name || '', last_name: user?.last_name || '', address: account?.address || '', country: account?.country || '', website: account?.website_url || '', social_media_links: account?.social_media_links || {} });
    const aboutForm = useForm({ about: freelancer?.about || '' });
    const rateForm = useForm({ hourly_rate: freelancer?.hourly_rate?.toString() || '' });

    return (
        <DashboardLayout>
            <Head title="Complete Your Profile" />
            <h1 className="text-2xl font-bold mb-6">Complete Your Profile</h1>

            <div className="flex gap-2 mb-8 overflow-x-auto">
                {steps.map((s, i) => (
                    <button key={s} onClick={() => setStep(i)} className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${i === step ? 'bg-indigo-600 text-white' : i < step ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {s}
                    </button>
                ))}
            </div>

            <div className="max-w-2xl">
                {step === 0 && (
                    <form onSubmit={(e) => { e.preventDefault(); bioForm.post('/freelancer/bio', { onSuccess: () => setStep(1) }); }} className="bg-white rounded-xl border p-6 space-y-4">
                        <h2 className="text-lg font-semibold">Personal Information</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="block text-sm font-medium mb-1">First Name</label><input type="text" value={bioForm.data.first_name} onChange={(e) => bioForm.setData('first_name', e.target.value)} className="w-full border rounded-lg px-4 py-2.5" /></div>
                            <div><label className="block text-sm font-medium mb-1">Last Name</label><input type="text" value={bioForm.data.last_name} onChange={(e) => bioForm.setData('last_name', e.target.value)} className="w-full border rounded-lg px-4 py-2.5" /></div>
                        </div>
                        <div><label className="block text-sm font-medium mb-1">Country</label><input type="text" value={bioForm.data.country} onChange={(e) => bioForm.setData('country', e.target.value)} className="w-full border rounded-lg px-4 py-2.5" /></div>
                        <div><label className="block text-sm font-medium mb-1">Address</label><input type="text" value={bioForm.data.address} onChange={(e) => bioForm.setData('address', e.target.value)} className="w-full border rounded-lg px-4 py-2.5" /></div>
                        <button type="submit" disabled={bioForm.processing} className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg hover:bg-indigo-700 transition">Save & Continue</button>
                    </form>
                )}

                {step === 1 && (
                    <form onSubmit={(e) => { e.preventDefault(); aboutForm.post('/freelancer/about', { onSuccess: () => setStep(2) }); }} className="bg-white rounded-xl border p-6 space-y-4">
                        <h2 className="text-lg font-semibold">About You</h2>
                        <textarea rows={6} value={aboutForm.data.about} onChange={(e) => aboutForm.setData('about', e.target.value)} className="w-full border rounded-lg px-4 py-2.5" placeholder="Tell us about yourself..." />
                        <button type="submit" disabled={aboutForm.processing} className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg hover:bg-indigo-700 transition">Save & Continue</button>
                    </form>
                )}

                {step === 2 && (
                    <div className="bg-white rounded-xl border p-6 space-y-4">
                        <h2 className="text-lg font-semibold">Your Skills</h2>
                        <p className="text-sm text-gray-500">Select skills from the list and set your experience level.</p>
                        <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto">
                            {allSkills.map((skill) => (
                                <button key={skill.id} className="px-3 py-1.5 border rounded-full text-sm hover:bg-indigo-50 hover:border-indigo-300 transition">{skill.label}</button>
                            ))}
                        </div>
                        <button onClick={() => setStep(3)} className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg hover:bg-indigo-700 transition">Continue</button>
                    </div>
                )}

                {step === 3 && (
                    <form onSubmit={(e) => { e.preventDefault(); rateForm.post('/freelancer/hourly-rate', { onSuccess: () => setStep(4) }); }} className="bg-white rounded-xl border p-6 space-y-4">
                        <h2 className="text-lg font-semibold">Experience & Rate</h2>
                        <div><label className="block text-sm font-medium mb-1">Hourly Rate ($)</label><input type="number" value={rateForm.data.hourly_rate} onChange={(e) => rateForm.setData('hourly_rate', e.target.value)} className="w-full border rounded-lg px-4 py-2.5" /></div>
                        <button type="submit" disabled={rateForm.processing} className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg hover:bg-indigo-700 transition">Save & Continue</button>
                    </form>
                )}

                {step === 4 && (
                    <div className="bg-white rounded-xl border p-6 space-y-4">
                        <h2 className="text-lg font-semibold">Portfolio</h2>
                        <p className="text-sm text-gray-500">Add your projects and work samples.</p>
                        <button onClick={() => setStep(5)} className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg hover:bg-indigo-700 transition">Continue</button>
                    </div>
                )}

                {step === 5 && (
                    <div className="bg-white rounded-xl border p-6 space-y-4">
                        <h2 className="text-lg font-semibold">Almost Done!</h2>
                        <p className="text-gray-600">Your profile is ready. Click below to complete onboarding.</p>
                        <button onClick={() => router.post('/freelancer/complete-onboarding')} className="bg-green-600 text-white px-6 py-2.5 rounded-lg hover:bg-green-700 transition">Complete Onboarding</button>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
