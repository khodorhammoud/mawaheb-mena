import { Head, Link } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';

export default function ForEmployers({ cmsContent }: { cmsContent?: any }) {
    return (
        <PublicLayout>
            <Head title="For Employers" />
            <section className="bg-gradient-to-br from-gray-800 to-gray-900 text-white py-24">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">Find the Perfect Freelancer</h1>
                    <p className="text-xl text-gray-300 mb-10 max-w-3xl mx-auto">
                        Access a curated pool of talented professionals across the MENA region. Post jobs, review applications, and manage projects seamlessly.
                    </p>
                    <Link href="/signup-employer" className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition text-lg">
                        Get Started
                    </Link>
                </div>
            </section>

            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center mb-12">Why Choose Mawaheb</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { title: 'Verified Talent', desc: 'Every freelancer goes through a verification process to ensure quality.' },
                            { title: 'Smart Matching', desc: 'Our recommendation engine finds the best candidates for your projects.' },
                            { title: 'Built-in Timesheets', desc: 'Track work hours, approve timesheets, and manage payments efficiently.' },
                        ].map((item) => (
                            <div key={item.title} className="p-6 border rounded-xl hover:shadow-lg transition">
                                <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                                <p className="text-gray-600">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </PublicLayout>
    );
}
