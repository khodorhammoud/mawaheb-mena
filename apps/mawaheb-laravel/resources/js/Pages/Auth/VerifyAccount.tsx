import { Head } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';

export default function VerifyAccount() {
    return (
        <PublicLayout>
            <Head title="Verify Account" />
            <div className="min-h-[70vh] flex items-center justify-center py-12 px-4">
                <div className="max-w-md w-full text-center">
                    <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold mb-4">Check Your Email</h1>
                    <p className="text-gray-600 mb-8">
                        We've sent a verification link to your email address. Please click the link to verify your account and continue.
                    </p>
                    <p className="text-sm text-gray-500">
                        Didn't receive the email? Check your spam folder or contact support.
                    </p>
                </div>
            </div>
        </PublicLayout>
    );
}
