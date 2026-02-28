import { Head, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { PaginatedData } from '@/types';

interface PendingAccount { id: number; slug: string; account_type: string; account_status: string; user: { first_name: string; last_name: string; email: string } }
interface Props { accounts: PaginatedData<PendingAccount> }

export default function PendingAccounts({ accounts }: Props) {
    return (
        <DashboardLayout>
            <Head title="Pending Accounts" />
            <h1 className="text-2xl font-bold mb-6">Pending Accounts</h1>
            {accounts.data.length === 0 ? (
                <div className="bg-white rounded-xl border p-12 text-center text-gray-500">No pending accounts.</div>
            ) : (
                <div className="bg-white rounded-xl border overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50"><tr>
                            <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Name</th>
                            <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Email</th>
                            <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Type</th>
                            <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr></thead>
                        <tbody className="divide-y">
                            {accounts.data.map((acc) => (
                                <tr key={acc.id}>
                                    <td className="px-6 py-4 font-medium">{acc.user.first_name} {acc.user.last_name}</td>
                                    <td className="px-6 py-4 text-gray-500">{acc.user.email}</td>
                                    <td className="px-6 py-4"><span className="px-2 py-1 bg-gray-100 rounded text-sm capitalize">{acc.account_type}</span></td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        <button onClick={() => router.post(`/admin/accounts/${acc.id}/approve`)} className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700">Approve</button>
                                        <button onClick={() => router.post(`/admin/accounts/${acc.id}/reject`)} className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700">Reject</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </DashboardLayout>
    );
}
