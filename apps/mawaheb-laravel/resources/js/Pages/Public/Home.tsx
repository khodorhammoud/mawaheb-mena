import { Head, Link } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';

export default function Home() {
    return (
        <PublicLayout>
            <Head title="Home" />

            {/* Hero Section */}
            <section className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl md:text-6xl font-bold mb-6">
                        Connect with Top Talent in MENA
                    </h1>
                    <p className="text-xl md:text-2xl text-indigo-100 mb-10 max-w-3xl mx-auto">
                        Mawaheb bridges the gap between skilled freelancers and forward-thinking employers across the Middle East and North Africa.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/signup-freelancer"
                            className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition text-lg"
                        >
                            Find Work
                        </Link>
                        <Link
                            href="/signup-employer"
                            className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition text-lg"
                        >
                            Hire Talent
                        </Link>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { step: '1', title: 'Create Your Profile', desc: 'Sign up and build your professional profile showcasing your skills and experience.' },
                            { step: '2', title: 'Find Opportunities', desc: 'Browse jobs that match your expertise or get personalized recommendations.' },
                            { step: '3', title: 'Start Working', desc: 'Apply, get hired, and manage your projects with built-in timesheets and communication.' },
                        ].map((item) => (
                            <div key={item.step} className="text-center p-6">
                                <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                                    {item.step}
                                </div>
                                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                                <p className="text-gray-600">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
                    <p className="text-gray-600 mb-8 text-lg">
                        Join thousands of professionals already using Mawaheb to grow their careers and businesses.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/for-freelancers" className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition">
                            I'm a Freelancer
                        </Link>
                        <Link href="/for-employers" className="bg-gray-800 text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-900 transition">
                            I'm an Employer
                        </Link>
                    </div>
                </div>
            </section>
        </PublicLayout>
    );
}
