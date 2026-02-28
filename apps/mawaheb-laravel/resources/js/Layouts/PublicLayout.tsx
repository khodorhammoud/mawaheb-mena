import { Link, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import { PropsWithChildren } from 'react';

export default function PublicLayout({ children }: PropsWithChildren) {
    const { auth } = usePage<PageProps>().props;

    return (
        <div className="min-h-screen flex flex-col">
            <header className="bg-white shadow-sm border-b">
                <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <Link href="/" className="text-2xl font-bold text-indigo-600">
                        Mawaheb
                    </Link>

                    <div className="hidden md:flex items-center gap-6">
                        <Link href="/for-employers" className="text-gray-600 hover:text-gray-900 transition">
                            For Employers
                        </Link>
                        <Link href="/for-freelancers" className="text-gray-600 hover:text-gray-900 transition">
                            For Freelancers
                        </Link>
                        <Link href="/about-us" className="text-gray-600 hover:text-gray-900 transition">
                            About Us
                        </Link>
                        <Link href="/contact-us" className="text-gray-600 hover:text-gray-900 transition">
                            Contact
                        </Link>
                    </div>

                    <div className="flex items-center gap-3">
                        {auth.user ? (
                            <Link
                                href="/dashboard"
                                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href="/login-freelancer"
                                    className="text-gray-600 hover:text-gray-900 transition"
                                >
                                    Log In
                                </Link>
                                <Link
                                    href="/signup-freelancer"
                                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
                                >
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>
                </nav>
            </header>

            <main className="flex-1">{children}</main>

            <footer className="bg-gray-900 text-gray-300 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div>
                            <h3 className="text-white text-lg font-semibold mb-4">Mawaheb</h3>
                            <p className="text-sm">Connecting talent with opportunity across the MENA region.</p>
                        </div>
                        <div>
                            <h4 className="text-white font-medium mb-3">For Employers</h4>
                            <ul className="space-y-2 text-sm">
                                <li><Link href="/for-employers" className="hover:text-white transition">How It Works</Link></li>
                                <li><Link href="/signup-employer" className="hover:text-white transition">Post a Job</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-medium mb-3">For Freelancers</h4>
                            <ul className="space-y-2 text-sm">
                                <li><Link href="/for-freelancers" className="hover:text-white transition">Find Work</Link></li>
                                <li><Link href="/signup-freelancer" className="hover:text-white transition">Create Profile</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-medium mb-3">Company</h4>
                            <ul className="space-y-2 text-sm">
                                <li><Link href="/about-us" className="hover:text-white transition">About Us</Link></li>
                                <li><Link href="/contact-us" className="hover:text-white transition">Contact</Link></li>
                            </ul>
                        </div>
                    </div>
                    <div className="mt-8 pt-8 border-t border-gray-700 text-sm text-center">
                        &copy; {new Date().getFullYear()} Mawaheb. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
}
