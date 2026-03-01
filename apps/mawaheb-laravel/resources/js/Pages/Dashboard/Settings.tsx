import DashboardLayout from '@/Layouts/DashboardLayout';
import { useForm } from '@inertiajs/react';
import { useState } from 'react';
import { FaUser, FaLock, FaBell, FaDownload, FaTrash } from 'react-icons/fa';

interface UserSettings {
    first_name?: string;
    last_name?: string;
    email?: string;
    country?: string;
    address?: string;
    region?: string;
    phone?: string;
    website_url?: string;
    social_media_links?: Record<string, string>;
}

interface Props {
    settings: UserSettings;
    accountStatus: string;
    accountType: string;
}

function AccountTab({ settings }: { settings: UserSettings }) {
    const { data, setData, patch, processing, errors, recentlySuccessful } = useForm({
        first_name: settings.first_name || '',
        last_name: settings.last_name || '',
        email: settings.email || '',
        country: settings.country || '',
        address: settings.address || '',
        region: settings.region || '',
        phone: settings.phone || '',
        website_url: settings.website_url || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        patch('/settings/account');
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    <input type="text" value={data.first_name} onChange={(e) => setData('first_name', e.target.value)}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#27638a]" />
                    {errors.first_name && <p className="text-red-500 text-xs mt-1">{errors.first_name}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <input type="text" value={data.last_name} onChange={(e) => setData('last_name', e.target.value)}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#27638a]" />
                    {errors.last_name && <p className="text-red-500 text-xs mt-1">{errors.last_name}</p>}
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" value={data.email} onChange={(e) => setData('email', e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#27638a]" />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                    <input type="text" value={data.country} onChange={(e) => setData('country', e.target.value)}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#27638a]" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
                    <input type="text" value={data.region} onChange={(e) => setData('region', e.target.value)}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#27638a]" />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input type="text" value={data.address} onChange={(e) => setData('address', e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#27638a]" />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input type="tel" value={data.phone} onChange={(e) => setData('phone', e.target.value)}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#27638a]" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Website URL</label>
                    <input type="url" value={data.website_url} onChange={(e) => setData('website_url', e.target.value)}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#27638a]" />
                </div>
            </div>

            <div className="flex items-center gap-4">
                <button type="submit" disabled={processing}
                    className="bg-[#27638a] text-white px-8 py-3 rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-50">
                    {processing ? 'Saving...' : 'Save Changes'}
                </button>
                {recentlySuccessful && <span className="text-green-600 text-sm">Saved successfully!</span>}
            </div>
        </form>
    );
}

function PrivacyTab({ accountStatus }: { accountStatus: string }) {
    const passwordForm = useForm({
        current_password: '',
        new_password: '',
        confirm_password: '',
    });

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [feedback, setFeedback] = useState('');
    const [deactivating, setDeactivating] = useState(false);

    const isDeactivated = accountStatus === 'deactivated';

    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        passwordForm.post('/settings/password', {
            onSuccess: () => passwordForm.reset(),
        });
    };

    const handleDeactivate = () => {
        setDeactivating(true);
        const form = useForm({});
        // Use router directly for deactivation
        import('@inertiajs/react').then(({ router }) => {
            router.post('/settings/deactivate', {}, {
                onFinish: () => setDeactivating(false),
            });
        });
    };

    const handleDeleteAccount = () => {
        import('@inertiajs/react').then(({ router }) => {
            router.post('/settings/delete-account', { feedback });
        });
    };

    return (
        <div className="space-y-10">
            {/* Change Password */}
            <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><FaLock className="text-[#27638a]" /> Change Password</h3>
                <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                        <input type="password" value={passwordForm.data.current_password}
                            onChange={(e) => passwordForm.setData('current_password', e.target.value)}
                            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#27638a]" />
                        {passwordForm.errors.current_password && <p className="text-red-500 text-xs mt-1">{passwordForm.errors.current_password}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                        <input type="password" value={passwordForm.data.new_password}
                            onChange={(e) => passwordForm.setData('new_password', e.target.value)}
                            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#27638a]" />
                        {passwordForm.errors.new_password && <p className="text-red-500 text-xs mt-1">{passwordForm.errors.new_password}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                        <input type="password" value={passwordForm.data.confirm_password}
                            onChange={(e) => passwordForm.setData('confirm_password', e.target.value)}
                            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#27638a]" />
                        {passwordForm.errors.confirm_password && <p className="text-red-500 text-xs mt-1">{passwordForm.errors.confirm_password}</p>}
                    </div>
                    <button type="submit" disabled={passwordForm.processing}
                        className="bg-[#27638a] text-white px-8 py-3 rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-50">
                        {passwordForm.processing ? 'Updating...' : 'Update Password'}
                    </button>
                    {passwordForm.recentlySuccessful && <p className="text-green-600 text-sm">Password updated!</p>}
                </form>
            </div>

            {/* Export Data */}
            <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2"><FaDownload className="text-[#27638a]" /> Export Your Data</h3>
                <p className="text-gray-500 text-sm mb-4">Download a copy of all your data stored on our platform.</p>
                <a href="/settings/export-data" download
                    className="inline-flex items-center gap-2 border border-gray-300 px-6 py-3 rounded-xl text-sm hover:bg-gray-50 transition">
                    <FaDownload /> Download Data
                </a>
            </div>

            {/* Deactivate Account */}
            <div>
                <h3 className="text-lg font-semibold mb-2">Account Status</h3>
                <p className="text-gray-500 text-sm mb-4">
                    {isDeactivated ? 'Your account is currently deactivated. Reactivate to resume activity.' : 'Temporarily deactivate your account.'}
                </p>
                <button onClick={handleDeactivate} disabled={deactivating}
                    className={`px-6 py-3 rounded-xl text-sm font-semibold transition disabled:opacity-50 ${isDeactivated ? 'bg-green-600 text-white hover:opacity-90' : 'border border-orange-400 text-orange-600 hover:bg-orange-50'}`}>
                    {deactivating ? 'Processing...' : isDeactivated ? 'Reactivate Account' : 'Deactivate Account'}
                </button>
            </div>

            {/* Delete Account */}
            <div>
                <h3 className="text-lg font-semibold mb-2 text-red-600 flex items-center gap-2"><FaTrash /> Delete Account</h3>
                <p className="text-gray-500 text-sm mb-4">Permanently delete your account. This action cannot be undone.</p>
                {!showDeleteConfirm ? (
                    <button onClick={() => setShowDeleteConfirm(true)}
                        className="border border-red-400 text-red-600 px-6 py-3 rounded-xl text-sm hover:bg-red-50 transition">
                        Delete My Account
                    </button>
                ) : (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md">
                        <p className="text-red-700 font-semibold mb-3">Are you sure? This is permanent.</p>
                        <textarea value={feedback} onChange={(e) => setFeedback(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg p-3 text-sm resize-none h-20 mb-4"
                            placeholder="Tell us why you're leaving (optional)..." />
                        <div className="flex gap-3">
                            <button onClick={() => setShowDeleteConfirm(false)}
                                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                            <button onClick={handleDeleteAccount}
                                className="px-6 py-2 text-sm bg-red-600 text-white rounded-xl hover:opacity-90 transition">
                                Confirm Delete
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function NotificationsTab() {
    const { data, setData, patch, processing, recentlySuccessful } = useForm({
        email_notifications: true,
        job_alerts: true,
        application_updates: true,
        marketing_emails: false,
    });

    return (
        <div className="space-y-6 max-w-lg">
            <h3 className="text-lg font-semibold flex items-center gap-2"><FaBell className="text-[#27638a]" /> Notification Preferences</h3>
            {[
                { key: 'email_notifications', label: 'Email Notifications', desc: 'Receive notifications via email' },
                { key: 'job_alerts', label: 'Job Alerts', desc: 'Get notified about new job opportunities' },
                { key: 'application_updates', label: 'Application Updates', desc: 'Updates on your job applications' },
                { key: 'marketing_emails', label: 'Marketing Emails', desc: 'Promotional content and newsletters' },
            ].map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between py-4 border-b border-gray-100">
                    <div>
                        <p className="font-medium text-sm">{label}</p>
                        <p className="text-gray-500 text-xs">{desc}</p>
                    </div>
                    <button onClick={() => setData(key as any, !(data as any)[key])}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${(data as any)[key] ? 'bg-[#27638a]' : 'bg-gray-300'}`}>
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${(data as any)[key] ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                </div>
            ))}
            <button onClick={() => patch('/settings/notifications')} disabled={processing}
                className="bg-[#27638a] text-white px-8 py-3 rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-50">
                {processing ? 'Saving...' : 'Save Preferences'}
            </button>
            {recentlySuccessful && <p className="text-green-600 text-sm">Preferences saved!</p>}
        </div>
    );
}

export default function Settings({ settings, accountStatus, accountType }: Props) {
    const [activeTab, setActiveTab] = useState<'account' | 'privacy' | 'notifications'>('account');

    const tabs = [
        { key: 'account', label: 'Account', icon: FaUser },
        { key: 'privacy', label: 'Privacy', icon: FaLock },
        { key: 'notifications', label: 'Notifications', icon: FaBell },
    ];

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto py-8 px-4">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
                    <p className="text-gray-500 mt-1">Manage your account settings and preferences</p>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 mb-8 border-b border-gray-200">
                    {tabs.map(({ key, label, icon: Icon }) => (
                        <button key={key} onClick={() => setActiveTab(key as any)}
                            className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${activeTab === key
                                ? 'border-[#27638a] text-[#27638a]'
                                : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                            <Icon className="w-4 h-4" />
                            {label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div>
                    {activeTab === 'account' && <AccountTab settings={settings} />}
                    {activeTab === 'privacy' && <PrivacyTab accountStatus={accountStatus} />}
                    {activeTab === 'notifications' && <NotificationsTab />}
                </div>
            </div>
        </DashboardLayout>
    );
}
