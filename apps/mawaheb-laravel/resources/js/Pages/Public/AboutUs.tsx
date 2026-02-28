import { Head } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';

export default function AboutUs({ cmsContent }: { cmsContent?: any }) {
    return (
        <PublicLayout>
            <Head title="About Us" />
            <section className="py-24 bg-white">
                <div className="max-w-4xl mx-auto px-4">
                    <h1 className="text-4xl font-bold text-center mb-8">About Mawaheb</h1>
                    <p className="text-lg text-gray-600 text-center mb-12">
                        Mawaheb is a platform dedicated to connecting talented freelancers with employers across the MENA region, fostering economic growth and professional development.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div>
                            <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
                            <p className="text-gray-600">
                                To empower professionals in the MENA region by providing a trusted platform that connects talent with opportunity, enabling meaningful work relationships.
                            </p>
                        </div>
                        <div>
                            <h2 className="text-2xl font-semibold mb-4">Our Vision</h2>
                            <p className="text-gray-600">
                                To become the leading talent marketplace in the MENA region, recognized for quality, trust, and innovation in connecting freelancers with employers.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </PublicLayout>
    );
}
