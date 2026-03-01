import { Head, useForm } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';

export default function LoginAdmin() {
    const form = useForm({ email: '', password: '', accountType: 'admin' });
    const submit = (e: React.FormEvent) => { e.preventDefault(); form.post('/login'); };

    return (
        <PublicLayout>
            <Head title="Admin Login" />
            <div className="container">
                <div className="flex justify-center mt-32 mb-36">
                    <div className="w-full max-w-md bg-white p-8 rounded-xl border">
                        <h1 className="text-4xl mb-8 font-semibold text-center">Admin Login</h1>
                        {form.errors.email && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"><strong>Error! </strong><span>{form.errors.email}</span></div>}
                        <form onSubmit={submit} className="space-y-6">
                            <input type="hidden" name="accountType" value="admin" />
                            <div><label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label><input type="email" value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-[#27638a]" /></div>
                            <div><label className="block text-sm font-medium text-gray-700 mb-1">Password</label><input type="password" value={form.data.password} onChange={(e) => form.setData('password', e.target.value)} className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-[#27638a]" /></div>
                            <button type="submit" disabled={form.processing} className="w-full py-3 text-lg font-semibold text-white bg-[#27638a] rounded-xl hover:opacity-90 transition">Continue</button>
                        </form>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
