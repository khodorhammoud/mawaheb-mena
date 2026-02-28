import { Head, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { PaginatedData } from '@/types';
import { useState } from 'react';

interface UserRow { id: number; first_name: string; last_name: string; email: string; role: string; is_verified: boolean; account?: { account_type: string; account_status: string } }
interface Props { users: PaginatedData<UserRow>; search?: string }

export default function UsersPage({ users, search }: Props) {
    const [query, setQuery] = useState(search || '');

    return (
        <DashboardLayout>
            <Head title="Users" />
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">All Users</h1>
                <form onSubmit={(e) => { e.preventDefault(); router.get('/admin/users', { search: query }); }} className="flex gap-2">
                    <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search users..." className="border rounded-lg px-4 py-2" />
                    <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg">Search</button>
                </form>
            </div>
            <div className="bg-white rounded-xl border overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50"><tr>
                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Name</th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Email</th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Role</th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Type</th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Verified</th>
                    </tr></thead>
                    <tbody className="divide-y">
                        {users.data.map((u) => (
                            <tr key={u.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium">{u.first_name} {u.last_name}</td>
                                <td className="px-6 py-4 text-gray-500">{u.email}</td>
                                <td className="px-6 py-4 capitalize">{u.role}</td>
                                <td className="px-6 py-4 capitalize">{u.account?.account_type || '-'}</td>
                                <td className="px-6 py-4"><span className={`px-2 py-1 rounded text-xs font-medium ${u.account?.account_status === 'published' ? 'bg-green-100 text-green-700' : u.account?.account_status === 'suspended' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>{u.account?.account_status || '-'}</span></td>
                                <td className="px-6 py-4">{u.is_verified ? <span className="text-green-600">Yes</span> : <span className="text-gray-400">No</span>}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {users.last_page > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                    {Array.from({ length: users.last_page }, (_, i) => (
                        <button key={i + 1} onClick={() => router.get('/admin/users', { page: i + 1, search: query })} className={`px-3 py-1 rounded ${users.current_page === i + 1 ? 'bg-indigo-600 text-white' : 'bg-gray-100'}`}>{i + 1}</button>
                    ))}
                </div>
            )}
        </DashboardLayout>
    );
}
