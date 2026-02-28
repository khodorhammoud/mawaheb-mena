import { Head, useForm } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';

interface Props { identification: any; accountType: string }

export default function IdentificationIndex({ identification, accountType }: Props) {
    const form = useForm<{ id_type: string; id_number: string; id_front: File | null; id_back: File | null; trade_license: File | null }>({
        id_type: identification?.id_type || 'national_id',
        id_number: identification?.id_number || '',
        id_front: null,
        id_back: null,
        trade_license: null,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/identification', { forceFormData: true });
    };

    return (
        <DashboardLayout>
            <Head title="Identification" />
            <h1 className="text-2xl font-bold mb-6">Identification Documents</h1>
            {identification?.status === 'pending' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-yellow-800">Your documents are under review.</div>
            )}
            {identification?.status === 'approved' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-green-800">Your identity has been verified.</div>
            )}
            <form onSubmit={submit} className="bg-white rounded-xl border p-6 max-w-lg space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">ID Type</label>
                    <select value={form.data.id_type} onChange={(e) => form.setData('id_type', e.target.value)} className="w-full border rounded-lg px-4 py-2.5">
                        <option value="national_id">National ID</option>
                        <option value="passport">Passport</option>
                        <option value="drivers_license">Driver's License</option>
                    </select>
                </div>
                <div><label className="block text-sm font-medium mb-1">ID Number</label><input type="text" value={form.data.id_number} onChange={(e) => form.setData('id_number', e.target.value)} className="w-full border rounded-lg px-4 py-2.5" /></div>
                <div><label className="block text-sm font-medium mb-1">ID Front</label><input type="file" accept="image/*,.pdf" onChange={(e) => form.setData('id_front', e.target.files?.[0] || null)} className="w-full" /></div>
                <div><label className="block text-sm font-medium mb-1">ID Back</label><input type="file" accept="image/*,.pdf" onChange={(e) => form.setData('id_back', e.target.files?.[0] || null)} className="w-full" /></div>
                {accountType === 'employer' && (
                    <div><label className="block text-sm font-medium mb-1">Trade License</label><input type="file" accept="image/*,.pdf" onChange={(e) => form.setData('trade_license', e.target.files?.[0] || null)} className="w-full" /></div>
                )}
                <button type="submit" disabled={form.processing} className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg hover:bg-indigo-700 transition">Submit Documents</button>
            </form>
        </DashboardLayout>
    );
}
