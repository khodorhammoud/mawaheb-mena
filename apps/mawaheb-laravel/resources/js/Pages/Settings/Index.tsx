import { Head, useForm, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { useState } from 'react';

interface Props { user: any }

export default function SettingsIndex({ user }: Props) {
    const [tab, setTab] = useState<'password' | 'account'>('password');
    const passwordForm = useForm({ current_password: '', new_password: '', new_password_confirmation: '' });
    const deleteForm = useForm({ feedback: '' });

    return (
        <DashboardLayout>
            <Head title="Settings" />
            <h1 className="text-2xl font-bold mb-6">Settings</h1>
            <div className="flex gap-2 mb-6">
                <button onClick={() => setTab('password')} className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === 'password' ? 'bg-indigo-600 text-white' : 'bg-gray-100'}`}>Password</button>
                <button onClick={() => setTab('account')} className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === 'account' ? 'bg-indigo-600 text-white' : 'bg-gray-100'}`}>Account</button>
            </div>
            <div className="max-w-lg">
                {tab === 'password' && (
                    <form onSubmit={(e) => { e.preventDefault(); passwordForm.post('/settings/password'); }} className="bg-white rounded-xl border p-6 space-y-4">
                        <h2 className="text-lg font-semibold">Change Password</h2>
                        <div><label className="block text-sm font-medium mb-1">Current Password</label><input type="password" value={passwordForm.data.current_password} onChange={(e) => passwordForm.setData('current_password', e.target.value)} className="w-full border rounded-lg px-4 py-2.5" /></div>
                        <div><label className="block text-sm font-medium mb-1">New Password</label><input type="password" value={passwordForm.data.new_password} onChange={(e) => passwordForm.setData('new_password', e.target.value)} className="w-full border rounded-lg px-4 py-2.5" /></div>
                        <div><label className="block text-sm font-medium mb-1">Confirm New Password</label><input type="password" value={passwordForm.data.new_password_confirmation} onChange={(e) => passwordForm.setData('new_password_confirmation', e.target.value)} className="w-full border rounded-lg px-4 py-2.5" /></div>
                        {passwordForm.errors.current_password && <p className="text-red-500 text-sm">{passwordForm.errors.current_password}</p>}
                        <button type="submit" disabled={passwordForm.processing} className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg hover:bg-indigo-700 transition">Update Password</button>
                    </form>
                )}
                {tab === 'account' && (
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl border p-6">
                            <h2 className="text-lg font-semibold mb-4">Deactivate Account</h2>
                            <p className="text-sm text-gray-500 mb-4">Temporarily deactivate your account. You can reactivate it later.</p>
                            <button onClick={() => { if (confirm('Are you sure?')) router.post('/settings/deactivate'); }} className="bg-yellow-500 text-white px-6 py-2.5 rounded-lg hover:bg-yellow-600 transition">Deactivate</button>
                        </div>
                        <div className="bg-white rounded-xl border border-red-200 p-6">
                            <h2 className="text-lg font-semibold text-red-600 mb-4">Delete Account</h2>
                            <p className="text-sm text-gray-500 mb-4">Permanently delete your account and all associated data.</p>
                            <textarea rows={3} value={deleteForm.data.feedback} onChange={(e) => deleteForm.setData('feedback', e.target.value)} className="w-full border rounded-lg px-4 py-2.5 mb-4" placeholder="Optional: Tell us why you're leaving..." />
                            <button onClick={() => { if (confirm('This action cannot be undone. Are you sure?')) deleteForm.post('/settings/delete-account'); }} className="bg-red-600 text-white px-6 py-2.5 rounded-lg hover:bg-red-700 transition">Delete Account</button>
                        </div>
                        <div className="bg-white rounded-xl border p-6">
                            <h2 className="text-lg font-semibold mb-4">Export Data</h2>
                            <p className="text-sm text-gray-500 mb-4">Download a copy of all your data.</p>
                            <a href="/settings/export" className="bg-gray-600 text-white px-6 py-2.5 rounded-lg hover:bg-gray-700 transition inline-block">Export My Data</a>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
