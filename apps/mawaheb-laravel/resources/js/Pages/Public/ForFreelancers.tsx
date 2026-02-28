import { Head, Link } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';

export default function ForFreelancers({ cmsContent }: { cmsContent?: any }) {
    return (
        <PublicLayout>
            <Head title="For Freelancers" />
            <section className="bg-gradient-to-br from-indigo-600 to-blue-700 text-white py-24">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">Build Your Career with Mawaheb</h1>
                    <p className="text-xl text-indigo-100 mb-10 max-w-3xl mx-auto">
                        Showcase your skills, get matched with the right opportunities, and grow your professional network across the MENA region.
                    </p>
                    <Link href="/signup-freelancer" className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition text-lg">
                        Join Now
                    </Link>
                </div>
            </section>

            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center mb-12">What You Get</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { title: 'Skillfolio', desc: 'AI-powered skill assessment that maps your expertise to industry standards.' },
                            { title: 'Smart Job Matching', desc: 'Get personalized job recommendations based on your skills and preferences.' },
                            { title: 'Time Tracking', desc: 'Built-in timesheet management for seamless project tracking and billing.' },
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
