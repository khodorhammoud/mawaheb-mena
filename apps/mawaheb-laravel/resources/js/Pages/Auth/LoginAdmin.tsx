import { Head, useForm } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';

export default function LoginAdmin() {
    const { data, setData, post, processing, errors } = useForm({ email: '', password: '' });

    return (
        <PublicLayout>
            <Head title="Admin Login" />
            <div className="min-h-[70vh] flex items-center justify-center py-12 px-4">
                <div className="max-w-md w-full">
                    <h1 className="text-3xl font-bold text-center mb-8">Admin Login</h1>
                    <form onSubmit={(e) => { e.preventDefault(); post('/login'); }} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} className="w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500" autoFocus />
                            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <input type="password" value={data.password} onChange={(e) => setData('password', e.target.value)} className="w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500" />
                        </div>
                        <button type="submit" disabled={processing} className="w-full bg-gray-800 text-white py-3 rounded-lg font-semibold hover:bg-gray-900 transition disabled:opacity-50">
                            {processing ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>
                </div>
            </div>
        </PublicLayout>
    );
}
