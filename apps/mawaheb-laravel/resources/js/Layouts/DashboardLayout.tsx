import { Link, usePage, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import { PropsWithChildren, useState } from 'react';

export default function DashboardLayout({ children }: PropsWithChildren) {
    const { auth, flash } = usePage<PageProps>().props;
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const user = auth.user;
    const accountType = user?.account?.account_type;

    const handleLogout = () => {
        router.post('/auth/logout');
    };

    const freelancerNav = [
        { href: '/dashboard', label: 'Dashboard' },
        { href: '/browse-jobs', label: 'Browse Jobs' },
        { href: '/timesheets', label: 'Timesheets' },
        { href: '/notifications', label: 'Notifications' },
        { href: '/settings', label: 'Settings' },
    ];

    const employerNav = [
        { href: '/dashboard', label: 'Dashboard' },
        { href: '/manage-jobs', label: 'Manage Jobs' },
        { href: '/new-job', label: 'Post a Job' },
        { href: '/timesheets', label: 'Timesheets' },
        { href: '/notifications', label: 'Notifications' },
        { href: '/settings', label: 'Settings' },
    ];

    const adminNav = [
        { href: '/admin/dashboard', label: 'Admin Dashboard' },
        { href: '/admin/pending-accounts', label: 'Pending Accounts' },
        { href: '/admin/users', label: 'Users' },
        { href: '/settings', label: 'Settings' },
    ];

    const navItems = user?.role === 'admin' ? adminNav : accountType === 'employer' ? employerNav : freelancerNav;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Top bar */}
            <header className="bg-white shadow-sm border-b fixed top-0 left-0 right-0 z-30">
                <div className="flex items-center justify-between h-16 px-4 lg:px-8">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="lg:hidden p-2 rounded-md hover:bg-gray-100"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                        <Link href="/dashboard" className="text-xl font-bold text-indigo-600">
                            Mawaheb
                        </Link>
                    </div>

                    <div className="flex items-center gap-4">
                        <Link href="/notifications" className="p-2 rounded-full hover:bg-gray-100 relative">
                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                        </Link>
                        {user?.account?.slug && (
                            <Link href={`/account/${user.account.slug}`} className="text-sm text-gray-600 hover:text-gray-900">
                                {user.first_name} {user.last_name}
                            </Link>
                        )}
                        <button onClick={handleLogout} className="text-sm text-red-600 hover:text-red-800">
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            <div className="flex pt-16">
                {/* Sidebar */}
                <aside className={`fixed lg:static inset-y-0 left-0 z-20 w-64 bg-white border-r transform transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 pt-16 lg:pt-0`}>
                    <nav className="p-4 space-y-1">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="block px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition"
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>
                </aside>

                {/* Overlay */}
                {sidebarOpen && (
                    <div className="fixed inset-0 bg-black/20 z-10 lg:hidden" onClick={() => setSidebarOpen(false)} />
                )}

                {/* Main content */}
                <main className="flex-1 p-4 lg:p-8 min-h-[calc(100vh-4rem)]">
                    {flash?.success && (
                        <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
                            {flash.success}
                        </div>
                    )}
                    {flash?.error && (
                        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                            {flash.error}
                        </div>
                    )}
                    {children}
                </main>
            </div>
        </div>
    );
}
