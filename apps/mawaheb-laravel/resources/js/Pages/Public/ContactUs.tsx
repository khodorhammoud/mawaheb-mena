import { Head, useForm } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';

interface Props {
    contactUsForm?: { title?: string; description?: string }[];
    locations?: { title?: string; address?: string; phone?: string; email?: string }[];
}

export default function ContactUsPage({ contactUsForm = [], locations = [] }: Props) {
    const form = useForm({ name: '', email: '', subject: '', message: '' });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/contact-us');
    };

    return (
        <PublicLayout>
            <Head title="Contact Us" />
            <div className="container" style={{ fontFamily: 'system-ui, sans-serif', lineHeight: '1.8' }}>
                {/* Form Section */}
                <div className="mt-36 mb-20">
                    <h1 className="text-6xl font-semibold mb-6">CONTACT US</h1>
                    <p className="text-lg text-gray-600 mb-12 max-w-2xl">
                        {contactUsForm[0]?.description || "Have a question or want to work together? We'd love to hear from you. Send us a message and we'll respond as soon as possible."}
                    </p>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                        <form onSubmit={submit} className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                                    <input type="text" value={form.data.name} onChange={(e) => form.setData('name', e.target.value)}
                                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-[#27638a] transition" placeholder="Your name" />
                                    {form.errors.name && <p className="text-red-500 text-sm mt-1">{form.errors.name}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                    <input type="email" value={form.data.email} onChange={(e) => form.setData('email', e.target.value)}
                                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-[#27638a] transition" placeholder="Your email" />
                                    {form.errors.email && <p className="text-red-500 text-sm mt-1">{form.errors.email}</p>}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                                <input type="text" value={form.data.subject} onChange={(e) => form.setData('subject', e.target.value)}
                                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-[#27638a] transition" placeholder="Subject" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                                <textarea rows={6} value={form.data.message} onChange={(e) => form.setData('message', e.target.value)}
                                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-[#27638a] transition" placeholder="Your message" />
                                {form.errors.message && <p className="text-red-500 text-sm mt-1">{form.errors.message}</p>}
                            </div>
                            <button type="submit" disabled={form.processing}
                                className="bg-[#27638a] text-white px-8 py-3 rounded-xl hover:opacity-90 transition font-medium">
                                Send Message
                            </button>
                        </form>

                        {/* Location Section */}
                        <div className="space-y-8">
                            {locations.length > 0 ? locations.map((loc, i) => (
                                <div key={i} className="bg-gray-50 rounded-xl p-8">
                                    <h3 className="text-xl font-semibold mb-4">{loc.title || 'Our Office'}</h3>
                                    {loc.address && <p className="text-gray-600 mb-2">{loc.address}</p>}
                                    {loc.phone && <p className="text-gray-600 mb-2">Phone: {loc.phone}</p>}
                                    {loc.email && <p className="text-gray-600">Email: {loc.email}</p>}
                                </div>
                            )) : (
                                <div className="bg-gray-50 rounded-xl p-8">
                                    <h3 className="text-xl font-semibold mb-4">Our Office</h3>
                                    <p className="text-gray-600 mb-2">MENA Region</p>
                                    <p className="text-gray-600 mb-2">Email: info@mawaheb.mena</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
