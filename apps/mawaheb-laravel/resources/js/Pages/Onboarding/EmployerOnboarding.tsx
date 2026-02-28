import { Head, useForm, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Employer, Account, Industry, Language } from '@/types';
import { useState } from 'react';

interface Props { employer: Employer; account: Account; user: any; allIndustries: Industry[]; allLanguages: Language[] }

export default function EmployerOnboarding({ employer, account, user, allIndustries, allLanguages }: Props) {
    const [step, setStep] = useState(0);
    const steps = ['Bio', 'About', 'Industries', 'Budget'];

    const bioForm = useForm({ first_name: user?.first_name || '', last_name: user?.last_name || '', address: account?.address || '', country: account?.country || '', website: account?.website_url || '', social_media_links: {} });
    const aboutForm = useForm({ about: employer?.about || '', company_name: employer?.company_name || '', company_email: employer?.company_email || '' });

    return (
        <DashboardLayout>
            <Head title="Complete Your Profile" />
            <h1 className="text-2xl font-bold mb-6">Complete Your Employer Profile</h1>
            <div className="flex gap-2 mb-8">
                {steps.map((s, i) => (
                    <button key={s} onClick={() => setStep(i)} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${i === step ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'}`}>{s}</button>
                ))}
            </div>
            <div className="max-w-2xl">
                {step === 0 && (
                    <form onSubmit={(e) => { e.preventDefault(); bioForm.post('/employer/bio', { onSuccess: () => setStep(1) }); }} className="bg-white rounded-xl border p-6 space-y-4">
                        <h2 className="text-lg font-semibold">Personal Information</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="block text-sm font-medium mb-1">First Name</label><input type="text" value={bioForm.data.first_name} onChange={(e) => bioForm.setData('first_name', e.target.value)} className="w-full border rounded-lg px-4 py-2.5" /></div>
                            <div><label className="block text-sm font-medium mb-1">Last Name</label><input type="text" value={bioForm.data.last_name} onChange={(e) => bioForm.setData('last_name', e.target.value)} className="w-full border rounded-lg px-4 py-2.5" /></div>
                        </div>
                        <button type="submit" className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg hover:bg-indigo-700 transition">Save & Continue</button>
                    </form>
                )}
                {step === 1 && (
                    <form onSubmit={(e) => { e.preventDefault(); aboutForm.post('/employer/about', { onSuccess: () => setStep(2) }); }} className="bg-white rounded-xl border p-6 space-y-4">
                        <h2 className="text-lg font-semibold">About Your Company</h2>
                        <div><label className="block text-sm font-medium mb-1">Company Name</label><input type="text" value={aboutForm.data.company_name} onChange={(e) => aboutForm.setData('company_name', e.target.value)} className="w-full border rounded-lg px-4 py-2.5" /></div>
                        <div><label className="block text-sm font-medium mb-1">About</label><textarea rows={4} value={aboutForm.data.about} onChange={(e) => aboutForm.setData('about', e.target.value)} className="w-full border rounded-lg px-4 py-2.5" /></div>
                        <button type="submit" className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg hover:bg-indigo-700 transition">Save & Continue</button>
                    </form>
                )}
                {step === 2 && <div className="bg-white rounded-xl border p-6"><h2 className="text-lg font-semibold mb-4">Industries</h2><p className="text-gray-500 mb-4">Select your industry sectors.</p><button onClick={() => setStep(3)} className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg">Continue</button></div>}
                {step === 3 && <div className="bg-white rounded-xl border p-6"><h2 className="text-lg font-semibold mb-4">Almost Done!</h2><button onClick={() => router.post('/employer/complete-onboarding')} className="bg-green-600 text-white px-6 py-2.5 rounded-lg hover:bg-green-700 transition">Complete Onboarding</button></div>}
            </div>
        </DashboardLayout>
    );
}
