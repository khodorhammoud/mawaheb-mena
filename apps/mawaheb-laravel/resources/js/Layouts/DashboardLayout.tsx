import { Link, usePage, router } from '@inertiajs/react';
import { ReactNode, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import {
    MdSpaceDashboard,
} from 'react-icons/md';
import {
    FaBriefcase,
    FaCog,
    FaFileAlt,
    FaChartLine,
    FaUser,
} from 'react-icons/fa';
import { BsBell, BsPersonCircle, BsClockHistory } from 'react-icons/bs';
import { PageProps } from '@/types';

interface NavItem { label: string; href: string; icon: React.ElementType }

const freelancerNav: NavItem[] = [
    { label: 'Dashboard', href: '/dashboard', icon: MdSpaceDashboard },
    { label: 'Browse Jobs', href: '/browse-jobs', icon: FaBriefcase },
    { label: 'Time Sheet', href: '/timesheets', icon: FaFileAlt },
    { label: 'Reports', href: '/reports', icon: FaChartLine },
    { label: 'Settings', href: '/settings', icon: FaCog },
];

const employerNav: NavItem[] = [
    { label: 'Dashboard', href: '/dashboard', icon: MdSpaceDashboard },
    { label: 'Manage Jobs', href: '/manage-jobs', icon: FaBriefcase },
    { label: 'Time Sheet', href: '/timesheets', icon: FaFileAlt },
    { label: 'Settings', href: '/settings', icon: FaCog },
];

const adminNav: NavItem[] = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: MdSpaceDashboard },
    { label: 'Pending Accounts', href: '/admin/accounts', icon: FaUser },
    { label: 'All Users', href: '/admin/users', icon: FaUser },
];

function Sidebar({ accountType, profile }: { accountType: string | null; profile: any }) {
    const { url } = usePage();
    let nav: NavItem[];
    if (accountType === 'employer') nav = employerNav;
    else if (accountType === 'admin') nav = adminNav;
    else nav = freelancerNav;

    const firstName = profile?.account?.user?.first_name || profile?.first_name || '';
    const lastName = profile?.account?.user?.last_name || profile?.last_name || '';
    const initials = firstName && lastName ? `${firstName[0]}${lastName[0]}` : null;

    return (
        <div className="md:w-64 w-36 h-full bg-white py-5 lg:px-2 mt-20">
            <div className="fixed">
                <div className="flex flex-col xl:ml-7 ml-5">
                    <div className="bg-gray-300 rounded-full w-20 h-20 flex items-center justify-center mb-2">
                        {initials ? (
                            <span className="text-xl font-bold">{initials.toUpperCase()}</span>
                        ) : (
                            <FaUser className="text-gray-500 md:text-4xl text-3xl" />
                        )}
                    </div>
                    <div className="flex flex-col gap-1 border-b border-gray-400 pb-8">
                        <h2 className="text-lg font-medium">{firstName} {lastName ? lastName[0].toUpperCase() + '.' : ''}</h2>
                        <p className="text-sm text-gray-500">{profile?.account?.country || profile?.country || ''}</p>
                        <p className="text-sm text-gray-500">{profile?.account?.website_url || ''}</p>
                    </div>
                </div>
                <nav className="mt-8">
                    {nav.map((item) => {
                        const isActive = url === item.href || url.startsWith(item.href + '/');
                        return (
                            <Link
                                key={item.label}
                                href={item.href}
                                className={clsx(
                                    'flex items-center mb-2 xl:px-4 px-2 md:py-2 py-1 rounded-xl md:text-base text-sm transition-all group hover:translate-x-2 hover:text-[#27638a]'
                                )}
                            >
                                <div className={clsx(
                                    'mr-2 md:py-2 py-2 md:px-4 px-3 rounded-xl transition-colors',
                                    isActive
                                        ? 'bg-blue-100 text-[#27638a] translate-x-2'
                                        : 'text-gray-600 group-hover:bg-[#27638a] group-hover:text-white'
                                )}>
                                    <item.icon className="text-xl" />
                                </div>
                                <span className={clsx(
                                    'transition-colors',
                                    isActive ? 'text-[#27638a] translate-x-2' : 'text-gray-700 group-hover:text-[#27638a]'
                                )}>
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </div>
    );
}

function NotificationDropdown({ notifications, onClose }: { notifications: any[]; onClose: () => void }) {
    const unread = notifications.filter((n) => !n.is_read);

    const getColor = (type: string) => {
        switch (type) {
            case 'message': return 'bg-blue-500';
            case 'alert': return 'bg-red-500';
            case 'reminder': return 'bg-green-500';
            case 'status_update': return 'bg-yellow-500';
            default: return 'bg-gray-500';
        }
    };

    return (
        <div className="absolute right-0 top-12 w-80 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b">
                <h3 className="font-semibold">Notifications</h3>
                {unread.length > 0 && (
                    <button onClick={() => router.post('/notifications/read-all')} className="text-xs text-[#27638a] hover:underline">
                        Mark all read
                    </button>
                )}
            </div>
            <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                    <p className="text-center text-gray-500 py-6 text-sm">No notifications</p>
                ) : (
                    notifications.slice(0, 10).map((n) => (
                        <div key={n.id} onClick={() => { router.get(`/notification/${n.id}`); onClose(); }}
                            className={`flex items-start gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer border-b last:border-0 ${!n.is_read ? 'bg-blue-50' : ''}`}>
                            <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${getColor(n.type)}`} />
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">{n.title}</p>
                                <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
            <div className="px-4 py-2 border-t">
                <Link href="/notifications" onClick={onClose} className="text-xs text-[#27638a] hover:underline">
                    View all notifications
                </Link>
            </div>
        </div>
    );
}

function DashboardHeader({ accountType, isOnboarded, accountStatus, notifications }: {
    accountType: string | null;
    isOnboarded: boolean;
    accountStatus: string | null;
    notifications: any[];
}) {
    const [showNotifications, setShowNotifications] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const notifRef = useRef<HTMLDivElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const unreadCount = notifications.filter((n) => !n.is_read).length;

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifications(false);
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowUserMenu(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleLogout = () => {
        router.post('/logout');
    };

    return (
        <header className="bg-white border-b border-gray-300 pb-1 pt-1 fixed top-0 left-0 w-full z-30">
            <div className="grid lg:grid-cols-[2fr,1fr] grid-cols-[9fr,4fr] md:gap-8 gap-2 items-center justify-around py-4">
                <div className="flex items-center">
                    <Link href="/" className="xl:text-2xl lg:text-lg md:text-base text-sm font-extrabold xl:mr-20 lg:mr-14 xl:ml-10 lg:ml-8 ml-4 md:mr-10 sm:mr-4 mr-2 whitespace-nowrap">
                        MAWAHEB MENA
                    </Link>
                </div>

                <div className="flex items-center lg:gap-6 gap-2 justify-end md:mr-10 sm:mr-4 mr-2">
                    {accountType === 'employer' && (
                        <Link href="/new-job"
                            className="bg-[#27638a] rounded-xl md:text-base text-sm text-white xl:px-6 py-2 px-4 w-fit whitespace-nowrap hover:opacity-90 transition">
                            Post Job
                        </Link>
                    )}

                    {isOnboarded && (
                        <div className="flex lg:gap-6 gap-1 items-center">
                            {/* Notification Bell */}
                            <div ref={notifRef} className="relative">
                                <button onClick={() => setShowNotifications(!showNotifications)}
                                    className="relative sm:h-9 sm:w-9 h-8 w-8 text-gray-600 hover:bg-[#E4E3E6] transition-all hover:rounded-full p-2 cursor-pointer flex items-center justify-center">
                                    <BsBell className="w-full h-full" />
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                                            {unreadCount > 9 ? '9+' : unreadCount}
                                        </span>
                                    )}
                                </button>
                                <AnimatePresence>
                                    {showNotifications && (
                                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                                            <NotificationDropdown notifications={notifications} onClose={() => setShowNotifications(false)} />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* User Menu */}
                            <div ref={menuRef} className="relative">
                                <button onClick={() => setShowUserMenu(!showUserMenu)}
                                    className="sm:h-9 sm:w-9 h-8 w-8 text-gray-600 hover:bg-[#E4E3E6] transition-all hover:rounded-full p-2 cursor-pointer flex items-center justify-center">
                                    <BsPersonCircle className="w-full h-full" />
                                </button>
                                <AnimatePresence>
                                    {showUserMenu && (
                                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                                            className="absolute right-0 top-12 w-48 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
                                            {accountStatus === 'published' && (
                                                <Link href="/settings" onClick={() => setShowUserMenu(false)}
                                                    className="block px-4 py-3 text-sm hover:bg-gray-50 transition">Profile Settings</Link>
                                            )}
                                            <div className="border-t" />
                                            <button onClick={handleLogout} className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-gray-50 transition">
                                                Logout
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    )}

                    {!isOnboarded && (
                        <div className="relative" ref={menuRef}>
                            <button onClick={() => setShowUserMenu(!showUserMenu)}
                                className="sm:h-9 sm:w-9 h-8 w-8 text-gray-600 hover:bg-[#E4E3E6] transition-all hover:rounded-full p-2 cursor-pointer flex items-center justify-center">
                                <BsPersonCircle className="w-full h-full" />
                            </button>
                            <AnimatePresence>
                                {showUserMenu && (
                                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                                        className="absolute right-0 top-12 w-48 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
                                        <button onClick={handleLogout} className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-gray-50 transition">
                                            Logout
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
    const { props } = usePage<PageProps>();
    const auth = (props as any).auth;
    const flash = (props as any).flash;

    const user = auth?.user;
    const accountType = user?.role === 'admin' ? 'admin' : user?.account?.account_type || null;
    const isOnboarded = Boolean(user?.is_onboarded);
    const accountStatus = user?.account?.account_status || null;
    const notifications = (props as any).notifications || [];

    const isPublishedOrDeactivated = accountStatus === 'published' || accountStatus === 'deactivated';
    const showSidebar = isOnboarded && isPublishedOrDeactivated;

    return (
        <div className="min-h-screen bg-gray-50 pt-[100px] mb-10">
            <DashboardHeader
                accountType={accountType}
                isOnboarded={isOnboarded}
                accountStatus={accountStatus}
                notifications={notifications}
            />

            {/* Flash messages */}
            {flash?.success && (
                <div className="fixed top-20 right-4 z-50 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-xl shadow-lg">
                    {flash.success}
                </div>
            )}
            {flash?.error && (
                <div className="fixed top-20 right-4 z-50 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl shadow-lg">
                    {flash.error}
                </div>
            )}

            <div className="flex">
                {showSidebar ? (
                    <>
                        <Sidebar accountType={accountType} profile={user} />
                        <div className="container flex-1">
                            {children}
                        </div>
                    </>
                ) : (
                    <div className="container w-full mt-10 p-5 mb-10">
                        {children}
                    </div>
                )}
            </div>
        </div>
    );
}
