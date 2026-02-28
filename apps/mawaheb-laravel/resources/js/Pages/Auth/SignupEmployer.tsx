import { Head, Link, useForm } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';

export default function SignupEmployer() {
    const { data, setData, post, processing, errors } = useForm({
        first_name: '', last_name: '', email: '', password: '', password_confirmation: '',
    });

    return (
        <PublicLayout>
            <Head title="Sign Up - Employer" />
            <div className="min-h-[70vh] flex items-center justify-center py-12 px-4">
                <div className="max-w-md w-full">
                    <h1 className="text-3xl font-bold text-center mb-2">Create Employer Account</h1>
                    <p className="text-gray-600 text-center mb-8">Start hiring top talent</p>
                    <form onSubmit={(e) => { e.preventDefault(); post('/signup-employer'); }} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                                <input type="text" value={data.first_name} onChange={(e) => setData('first_name', e.target.value)} className="w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500" />
                                {errors.first_name && <p className="text-red-500 text-sm mt-1">{errors.first_name}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                                <input type="text" value={data.last_name} onChange={(e) => setData('last_name', e.target.value)} className="w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500" />
                                {errors.last_name && <p className="text-red-500 text-sm mt-1">{errors.last_name}</p>}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} className="w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500" />
                            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <input type="password" value={data.password} onChange={(e) => setData('password', e.target.value)} className="w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500" />
                            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                            <input type="password" value={data.password_confirmation} onChange={(e) => setData('password_confirmation', e.target.value)} className="w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500" />
                        </div>
                        <button type="submit" disabled={processing} className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50">
                            {processing ? 'Creating Account...' : 'Create Account'}
                        </button>
                        <a href="/auth/google/employer" className="w-full flex items-center justify-center gap-2 border py-3 rounded-lg hover:bg-gray-50 transition mt-4">Google Sign Up</a>
                        <p className="text-center text-sm text-gray-600 mt-4">
                            Already have an account? <Link href="/login-employer" className="text-indigo-600 font-medium">Sign in</Link>
                        </p>
                    </form>
                </div>
            </div>
        </PublicLayout>
    );
}
