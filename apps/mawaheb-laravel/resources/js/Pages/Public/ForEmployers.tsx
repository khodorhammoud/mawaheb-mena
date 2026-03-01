import { Head } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import { motion } from 'framer-motion';
import { SkillBadgeList } from '@/Components/common/SkillBadge';
import MainHeading from '@/Components/common/MainHeading';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import { useState, useEffect } from 'react';
import 'swiper/css';
import 'swiper/css/pagination';

interface Feature { title: string; description: string }
interface Testimonial { iconSVG?: string; comment: string; imageURL?: string; name: string; role: string }
interface WhyWorkWithUsItem { title: string; description: string }
interface HowItWorksItem { stepNb: number; title: string; description: string; imageURL?: string }

interface Props {
    features?: Feature[];
    testimonials?: Testimonial[];
    whyWorkWithUs?: WhyWorkWithUsItem[];
    howItWorksItems?: HowItWorksItem[];
    postHowItWorks?: { content: string };
    preWhatTheySayAboutUs?: { content: string };
}

const carouselData = [
    { image: 'https://www.fivebranches.edu/wp-content/uploads/2021/08/default-image.jpg', name: 'Khodor Hammoud', role: 'JavaScript Developer', hourlyRate: '$20/hour', skills: [{ name: 'Responsive design', isStarred: true }, { name: 'HTML5', isStarred: true }, { name: 'Node.js', isStarred: false }] },
    { image: 'https://www.fivebranches.edu/wp-content/uploads/2021/08/default-image.jpg', name: 'Wassim Taleb', role: 'Frontend Developer', hourlyRate: '$25/hour', skills: [{ name: 'React', isStarred: true }, { name: 'CSS3', isStarred: true }, { name: 'TypeScript', isStarred: true }] },
    { image: 'https://www.fivebranches.edu/wp-content/uploads/2021/08/default-image.jpg', name: 'Ahmad Khoder', role: 'JavaScript Developer', hourlyRate: '$20/hour', skills: [{ name: 'Responsive design', isStarred: true }, { name: 'HTML5', isStarred: true }, { name: 'Debugging', isStarred: true }] },
];

function Headline() {
    const [isVisible, setIsVisible] = useState(true);
    useEffect(() => { const t = setTimeout(() => setIsVisible(false), 2400); return () => clearTimeout(t); }, []);

    return (
        <section className="text-center py-16 bg-white mt-28 relative z-50">
            <div className="container mx-auto px-4 relative">
                <h1 className="text-4xl md:text-6xl font-extrabold leading-relaxed relative">
                    <div className="leading-relaxed">
                        Your{' '}
                        <span className="text-black z-[5000] bg-gray-200 inline-block px-6 md:px-8 rounded-[14px] relative mb-2" style={{ animation: 'rotateIn 0.8s ease-out' }}>Gateway</span>{' '}
                        to{' '}
                    </div>
                    <div className="mt-2">Digital Excellence</div>
                </h1>
                <motion.div initial={{ y: '100vh' }} animate={{ y: 0 }} transition={{ type: 'spring', stiffness: 70, damping: 20 }}>
                    <p className="pt-7 text-lg mt-4 text-black">
                        Mawaheb MENA a platform where you can find top talent,<br />drive innovation, and achieve your business goals.
                    </p>
                </motion.div>
            </div>
        </section>
    );
}

function HeroCarousel() {
    const [currentIndex, setCurrentIndex] = useState(0);

    const getTransformStyle = (index: number) => {
        const rel = (index - currentIndex + carouselData.length) % carouselData.length;
        const spacing = 80, offset = 60;
        let transform = '', opacity = 1, zIndex = 1;
        switch (rel) {
            case 0: transform = `translateX(0) scale(1) rotate(0deg) translateY(0)`; break;
            case 1: transform = `translateX(calc(100% + ${spacing}px)) scale(1) rotate(15deg) translateY(${offset}px)`; break;
            case carouselData.length - 1: transform = `translateX(calc(-100% - ${spacing}px)) scale(1) rotate(-15deg) translateY(${offset}px)`; break;
            default: transform = `translateX(200%) scale(0)`; opacity = 0; zIndex = 0;
        }
        return { transform, zIndex, opacity, transition: 'transform 0.7s ease, opacity 0.7s ease' };
    };

    return (
        <div className="relative w-full h-screen mx-auto mt-10 select-none overflow-x-hidden cursor-grab"
            onPointerDown={(e) => { const sx = e.clientX; const up = (ev: PointerEvent) => { const d = ev.clientX - sx; if (d < -50) setCurrentIndex((p) => (p + 1) % carouselData.length); else if (d > 50) setCurrentIndex((p) => (p - 1 + carouselData.length) % carouselData.length); window.removeEventListener('pointerup', up); }; window.addEventListener('pointerup', up); }}
        >
            <div className="h-full flex justify-center items-center relative">
                {carouselData.map((item, index) => (
                    <div key={index} className="flex-shrink-0 absolute" style={getTransformStyle(index)}>
                        <div className="rounded-xl overflow-hidden shadow-lg pointer-events-none">
                            <div className="max-w-96 min-w-96 rounded-xl overflow-hidden shadow-sm border-2 border-slate-300 h-auto bg-slate-100">
                                <img className="w-full h-52 object-cover" src={item.image} alt={item.name} />
                                <div className="pt-6 pl-4 min-h-64">
                                    <a href="#" className="text-xl">{item.name}</a>
                                    <p className="text-l text-gray-600">{item.role}</p>
                                    <p className="my-6 text-gray-600">{item.hourlyRate}</p>
                                    <SkillBadgeList skills={item.skills} />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function FeaturesSection({ features }: { features: Feature[] }) {
    return (
        <section className="py-24 mt-[-100px] relative" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
            <div className="flex items-center justify-center mx-10 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-16">
                    {features.map((feature, index) => (
                        <motion.div key={index} className="bg-white shadow-lg rounded-[10px] border-2 border-slate-300 z-10 xl:w-[270px]"
                            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.15 }}
                        >
                            <div className="p-4 pt-16">
                                <h3 className="font-bold text-2xl tracking-wider pb-8">{feature.title}</h3>
                                <p className="text-gray-700 text-base mt-2 pb-8">{feature.description}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

function SegmentsSection({ content }: { content: string }) {
    const lines = content.split('\n').filter((l) => l.trim());
    return (
        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center gap-8 mt-[200px] lg:text-7xl text-5xl font-semibold lg:w-[850px] mx-auto"
            style={{ minHeight: 'calc(120vh - 400px)' }}
        >
            {lines.map((line, i) => <p className="text-center" key={i}>{line}</p>)}
        </motion.div>
    );
}

function TestimonialsSection({ testimonials }: { testimonials: Testimonial[] }) {
    if (!testimonials.length) return null;
    return (
        <div className="my-32">
            <h2 className="text-center text-5xl font-bold mb-16">WHAT THEY SAY ABOUT US</h2>
            <div className="relative w-full max-w-5xl mx-auto text-center select-none overflow-hidden">
                <Swiper modules={[Pagination]} pagination={{ clickable: true }} spaceBetween={50} slidesPerView={1}>
                    {testimonials.map((t, i) => (
                        <SwiperSlide key={i}>
                            <div className="flex flex-col items-center justify-center">
                                {t.iconSVG && <div className="w-28 h-28 text-black mb-6 flex items-center justify-center mx-auto" dangerouslySetInnerHTML={{ __html: t.iconSVG }} />}
                                <p className="text-black font-light text-3xl tracking-wide mb-10 w-[80%] max-w-[800px] mx-auto">&ldquo;{t.comment}&rdquo;</p>
                                <div className="flex gap-8 w-[300px] md:w-[600px] lg:w-[700px] mx-auto items-center">
                                    <img src={t.imageURL || 'https://www.fivebranches.edu/wp-content/uploads/2021/08/default-image.jpg'} alt={t.name} className="w-32 h-32 rounded-full object-cover" />
                                    <div className="flex flex-col justify-center text-left">
                                        <h3 className="text-2xl font-semibold">{t.name}</h3>
                                        <p className="text-black text-xl">{t.role}</p>
                                    </div>
                                </div>
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
        </div>
    );
}

export default function ForEmployersPage({ features = [], testimonials = [], whyWorkWithUs = [], howItWorksItems = [], postHowItWorks, preWhatTheySayAboutUs }: Props) {
    const defaultFeatures: Feature[] = features.length ? features : [
        { title: 'Tailored Software Solutions', description: 'We provide customized software solutions designed to meet your unique business needs and drive digital transformation.' },
        { title: 'Expert Freelancer Matching', description: 'Our AI-powered platform matches you with the most qualified freelancers from the MENA region.' },
        { title: 'AI-Powered Matchmaking', description: 'Leverage advanced algorithms that analyze skills, experience, and project needs to find the perfect talent match.' },
        { title: 'Comprehensive Crew Formation', description: 'Build complete development teams with complementary skills, managed through our platform.' },
    ];

    const defaultWhyWorkWithUs = whyWorkWithUs.length ? whyWorkWithUs[0] : { title: 'WHY WORK WITH US', description: 'We connect businesses with exceptional freelance talent from across the MENA region.' };

    return (
        <PublicLayout>
            <Head title="For Employers" />
            <div style={{ fontFamily: 'system-ui, sans-serif', lineHeight: '1.8' }}>
                <Headline />
                <motion.div initial={{ y: '100vh' }} animate={{ y: 0 }} transition={{ type: 'spring', stiffness: 70, damping: 30 }}>
                    <HeroCarousel />
                </motion.div>
                <div className="container">
                    <FeaturesSection features={defaultFeatures} />
                    <SegmentsSection content={postHowItWorks?.content || "SEGMENTS THAT\nWE ARE HAPPY\nTO WORK WITH"} />
                    <TestimonialsSection testimonials={testimonials} />
                    <MainHeading title={defaultWhyWorkWithUs.title} description={defaultWhyWorkWithUs.description} />
                </div>
            </div>
        </PublicLayout>
    );
}
