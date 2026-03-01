import { Head, useForm, Link } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import RegistrationSlider, { RegistrationSlideData } from '@/Components/common/RegistrationSlider';

const slides: RegistrationSlideData[] = [
    { image: 'https://img.freepik.com/premium-photo/young-adult-arabian-sales-agent-formal-attire-holding-laptop-slightly-smiling-modern_868783-106989.jpg?semt=ais_hybrid', quote: 'Mawaheb MENA has been a game-changer for our company. The platform provided us with access to a pool of highly skilled freelancers who delivered exceptional results.', name: 'Ahmad Ramal', title: 'CEO, Waxy', rating: 4 },
    { image: 'https://img.freepik.com/premium-photo/young-adult-arabian-sales-agent-formal-attire-holding-laptop-slightly-smiling-modern_868783-106989.jpg?semt=ais_hybrid', quote: 'The quality of talent we found through Mawaheb exceeded our expectations. Highly recommended for any business looking for top-tier freelancers.', name: 'Sara Khalil', title: 'CTO, TechVentures', rating: 5 },
];

export default function LoginEmployer() {
    const form = useForm({ email: '', password: '', accountType: 'employer' });
    const submit = (e: React.FormEvent) => { e.preventDefault(); form.post('/login'); };

    return (
        <PublicLayout>
            <Head title="Log In - Employer" />
            <div className="container">
                <div className="flex w-full mt-20 mb-36 max-w-screen-2xl mx-auto min-h-[600px]">
                    <div className="w-1/2 bg-white flex flex-col justify-center items-center">
                        <div className="flex flex-col items-center w-full max-w-2xl mx-auto bg-white pl-2 pr-12 mt-20">
                            <h1 className="text-6xl mb-8 self-start font-semibold">Log In</h1>
                            {form.errors.email && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 w-full"><strong>Error! </strong><span>{form.errors.email}</span></div>}
                            <form onSubmit={submit} className="w-full space-y-6">
                                <input type="hidden" name="accountType" value="employer" />
                                <div><label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label><input type="email" value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-[#27638a]" /></div>
                                <div><label className="block text-sm font-medium text-gray-700 mb-1">Password</label><input type="password" value={form.data.password} onChange={(e) => form.setData('password', e.target.value)} className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-[#27638a]" /></div>
                                <div className="text-right"><a href="/" className="text-sm font-medium text-[#27638a] underline hover:no-underline">Forgot Password?</a></div>
                                <button type="submit" disabled={form.processing} className="w-full py-3 text-lg font-semibold text-white bg-[#27638a] rounded-xl hover:opacity-90 transition">Continue</button>
                            </form>
                            <div className="relative flex items-center justify-center mt-6 mb-2 w-full"><div className="flex-grow border border-gray-200" /><span className="px-2 text-gray-500">or</span><div className="flex-grow border border-gray-200" /></div>
                            <a href="/auth/google/employer" className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-xl py-3 hover:bg-gray-50 transition mt-2">
                                <svg width="20" height="20" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                                Continue with Google
                            </a>
                            <div className="text-center mt-8"><p className="text-sm text-gray-600">Don&apos;t have an account? <Link href="/signup-employer" className="text-[#27638a] font-medium hover:underline">SignUp</Link></p></div>
                        </div>
                    </div>
                    <div className="w-1/2 bg-gray-50 flex flex-col justify-center relative"><div className="relative overflow-hidden h-full w-full flex items-center"><RegistrationSlider slides={slides} /></div></div>
                </div>
            </div>
        </PublicLayout>
    );
}
