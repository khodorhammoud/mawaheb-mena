import { Head, Link } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { SkillBadgeList } from '@/Components/common/SkillBadge';
import MainHeading from '@/Components/common/MainHeading';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

interface Feature { title: string; description: string }
interface Testimonial { iconSVG?: string; comment: string; imageURL?: string; name: string; role: string }
interface WhyWorkWithUsItem { title: string; description: string }

interface Props {
    features?: Feature[];
    testimonials?: Testimonial[];
    whyWorkWithUs?: WhyWorkWithUsItem[];
    postHowItWorks?: { content: string };
    preWhatTheySayAboutUs?: { content: string };
}

const carouselData = [
    {
        image: 'https://www.fivebranches.edu/wp-content/uploads/2021/08/default-image.jpg',
        name: 'Khodor Hammoud', role: 'JavaScript Developer', hourlyRate: '$20/hour',
        skills: [{ name: 'Responsive design', isStarred: true }, { name: 'HTML5', isStarred: true }, { name: 'Node.js', isStarred: false }, { name: 'Agile', isStarred: false }, { name: 'Debugging', isStarred: false }],
    },
    {
        image: 'https://www.fivebranches.edu/wp-content/uploads/2021/08/default-image.jpg',
        name: 'Wassim Taleb', role: 'Frontend Developer', hourlyRate: '$25/hour',
        skills: [{ name: 'React', isStarred: true }, { name: 'CSS3', isStarred: true }, { name: 'TypeScript', isStarred: true }, { name: 'Testing', isStarred: false }, { name: 'Performance', isStarred: false }],
    },
    {
        image: 'https://www.fivebranches.edu/wp-content/uploads/2021/08/default-image.jpg',
        name: 'Ahmad Khoder', role: 'JavaScript Developer', hourlyRate: '$20/hour',
        skills: [{ name: 'Responsive design', isStarred: true }, { name: 'HTML5', isStarred: true }, { name: 'Node.js', isStarred: false }, { name: 'Agile', isStarred: false }, { name: 'Debugging', isStarred: true }],
    },
    {
        image: 'https://www.fivebranches.edu/wp-content/uploads/2021/08/default-image.jpg',
        name: 'Rawad', role: 'JavaScript Developer', hourlyRate: '$20/hour',
        skills: [{ name: 'Responsive design', isStarred: false }, { name: 'HTML5', isStarred: false }, { name: 'Node.js', isStarred: false }, { name: 'Agile', isStarred: false }, { name: 'Debugging', isStarred: false }],
    },
    {
        image: 'https://www.fivebranches.edu/wp-content/uploads/2021/08/default-image.jpg',
        name: 'Mohamad', role: 'JavaScript Developer', hourlyRate: '$20/hour',
        skills: [{ name: 'Responsive design', isStarred: true }, { name: 'HTML5', isStarred: false }, { name: 'Node.js', isStarred: true }, { name: 'Agile', isStarred: false }, { name: 'Debugging', isStarred: false }],
    },
];

function CarouselCard({ image, name, role, hourlyRate, skills }: typeof carouselData[0]) {
    return (
        <div className="max-w-96 min-w-96 rounded-xl overflow-hidden shadow-sm border-2 border-slate-300 h-auto bg-slate-100">
            <img className="w-full h-52 object-cover" src={image} alt={name} />
            <div className="pt-6 pl-4 min-h-64">
                <a href="#" className="text-xl">{name}</a>
                <p className="text-l text-gray-600">{role}</p>
                <p className="my-6 text-gray-600">{hourlyRate}</p>
                <SkillBadgeList skills={skills} />
            </div>
        </div>
    );
}

function Headline() {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timeout = setTimeout(() => setIsVisible(false), 2400);
        return () => clearTimeout(timeout);
    }, []);

    return (
        <section className="text-center py-16 bg-white mt-28 relative z-50">
            <div className="container mx-auto px-4 relative">
                <h1 className="text-4xl md:text-6xl font-extrabold leading-relaxed relative">
                    <div className="leading-relaxed">
                        Your{' '}
                        <span>
                            {isVisible && (
                                <svg
                                    className="absolute top-[-120px] right-[370px] z-[0] transition-opacity duration-500 ease-out"
                                    width="180" height="120" viewBox="0 0 180 180" fill="none"
                                >
                                    <path id="swingPath" d="M0 200 Q30 90 100 100 T210 40" stroke="#ddd" strokeWidth="2" fill="none">
                                        <animate attributeName="opacity" from="1" to="0" begin="2.6s" dur="0.2s" fill="freeze" />
                                    </path>
                                    <circle r="8" fill="black" opacity="0">
                                        <animate attributeName="opacity" from="0" to="1" begin="0s" dur="0.2s" fill="freeze" />
                                        <animateMotion begin="0s" dur="2.6s" repeatCount="1" keyTimes="0; 0.5; 1" keyPoints="1; 0.5; 0" calcMode="spline" keySplines="0.3 0.5 0.4 0.6; 0.2 0.1 0.3 1" rotate="auto" fill="freeze">
                                            <mpath href="#swingPath" />
                                        </animateMotion>
                                        <animate attributeName="opacity" from="1" to="0" begin="2.6s" dur="0.2s" fill="freeze" />
                                    </circle>
                                </svg>
                            )}
                            <span className="text-black z-[5000] bg-gray-200 inline-block px-6 md:px-8 rounded-[14px] relative mb-2" style={{ animation: 'rotateIn 0.8s ease-out' }}>
                                Gateway
                            </span>
                        </span>{' '}
                        to{' '}
                    </div>
                    <div className="mt-2">Digital Excellence</div>
                </h1>
                <motion.div initial={{ y: '100vh' }} animate={{ y: 0 }} transition={{ type: 'spring', stiffness: 70, damping: 20 }}>
                    <p className="pt-7 text-lg mt-4 text-black">
                        Mawaheb MENA a platform where you can find top talent,<br />
                        drive innovation, and achieve your business goals.
                    </p>
                </motion.div>
            </div>
        </section>
    );
}

function HeroCarousel() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showFingerIcon, setShowFingerIcon] = useState(true);

    const handleNext = () => { setCurrentIndex((prev) => (prev < carouselData.length - 1 ? prev + 1 : 0)); setShowFingerIcon(false); };
    const handlePrev = () => { setCurrentIndex((prev) => (prev > 0 ? prev - 1 : carouselData.length - 1)); setShowFingerIcon(false); };

    const getTransformStyle = (index: number) => {
        const relativeIndex = (index - currentIndex + carouselData.length) % carouselData.length;
        const spacing = 80;
        const downwardOffset = 60;
        let transform = '', opacity = 1, zIndex = 1;

        switch (relativeIndex) {
            case 0: transform = `translateX(0) scale(1) rotate(0deg) translateY(0)`; break;
            case 1: transform = `translateX(calc(100% + ${spacing}px)) scale(1) rotate(15deg) translateY(${downwardOffset}px)`; break;
            case carouselData.length - 1: transform = `translateX(calc(-100% - ${spacing}px)) scale(1) rotate(-15deg) translateY(${downwardOffset}px)`; break;
            default: transform = `translateX(calc(200% + ${spacing * 2}px)) scale(0) rotate(0deg) translateY(0)`; opacity = 0; zIndex = 0;
        }
        return { transform, zIndex, opacity, transition: 'transform 0.7s ease, opacity 0.7s ease' };
    };

    return (
        <div
            className="relative w-full h-screen mx-auto mt-10 select-none overflow-x-hidden cursor-grab"
            onPointerDown={(e) => {
                const startX = e.clientX;
                const onUp = (ev: PointerEvent) => {
                    const diff = ev.clientX - startX;
                    if (diff < -50) handleNext();
                    else if (diff > 50) handlePrev();
                    window.removeEventListener('pointerup', onUp);
                };
                window.addEventListener('pointerup', onUp);
            }}
        >
            <AnimatePresence>
                {showFingerIcon && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="absolute top-[210px] left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10"
                    >
                        <motion.div className="text-4xl bg-slate-200 rounded-3xl pl-4 pt-3 pr-2 bg-opacity-70">
                            <div className="inline-block" style={{ animation: 'fingerSwipe 1.5s ease-in-out infinite' }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 42 42">
                                    <path d="M 13 2 C 11.355469 2 10 3.355469 10 5 L 10 16.8125 L 9.34375 16.125 L 9.09375 15.90625 C 7.941406 14.753906 6.058594 14.753906 4.90625 15.90625 C 3.753906 17.058594 3.753906 18.941406 4.90625 20.09375 L 4.90625 20.125 L 13.09375 28.21875 L 13.15625 28.25 L 13.1875 28.3125 C 14.535156 29.324219 16.253906 30 18.1875 30 L 19.90625 30 C 24.441406 30 28.09375 26.347656 28.09375 21.8125 L 28.09375 14 C 28.09375 12.355469 26.738281 11 25.09375 11 C 24.667969 11 24.273438 11.117188 23.90625 11.28125 C 23.578125 9.980469 22.394531 9 21 9 C 20.234375 9 19.53125 9.300781 19 9.78125 C 18.46875 9.300781 17.765625 9 17 9 C 16.648438 9 16.316406 9.074219 16 9.1875 L 16 5 C 16 3.355469 14.644531 2 13 2 Z" />
                                </svg>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="h-full flex justify-center items-center relative">
                <div className="flex justify-center h-full transition-transform ease-in-out select-none">
                    {carouselData.map((item, index) => (
                        <div key={index} className="flex-shrink-0 absolute" style={getTransformStyle(index)}>
                            <div className="rounded-xl overflow-hidden shadow-lg pointer-events-none">
                                <CarouselCard {...item} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function FeaturesSection({ features }: { features: Feature[] }) {
    const featureIcons = [
        <svg key="1" fill="#27638a" stroke="#27638a" width="90" height="90" viewBox="0 0 24 24"><path d="M20 7h-4V4c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v3H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zM10 4h4v3h-4V4z"/></svg>,
        <svg key="2" fill="#27638a" stroke="#27638a" width="90" height="90" viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>,
        <svg key="3" fill="#27638a" stroke="#27638a" width="90" height="90" viewBox="0 0 24 24"><path d="M21 10.12h-6.78l2.74-2.82c-2.73-2.7-7.15-2.8-9.88-.1-2.73 2.71-2.73 7.08 0 9.79s7.15 2.71 9.88 0C18.32 15.65 19 14.08 19 12.1h2c0 1.98-.88 4.55-2.64 6.29-3.51 3.48-9.21 3.48-12.72 0-3.5-3.47-3.5-9.11 0-12.58 3.51-3.47 9.14-3.49 12.65-.04L21 3v7.12z"/></svg>,
        <svg key="4" fill="#27638a" stroke="#27638a" width="90" height="90" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>,
    ];

    return (
        <section className="py-24 mt-[-100px] relative" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
            <div className="flex items-center justify-center mx-10 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-16">
                    {features.map((feature, index) => (
                        <motion.div key={index} className="bg-white shadow-lg rounded-[10px] border-2 border-slate-300 z-10 xl:w-[270px]"
                            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.15 }}
                        >
                            <div className="flex items-center justify-center p-4 relative">
                                <div className="absolute -top-14 left-4">{featureIcons[index] || featureIcons[0]}</div>
                            </div>
                            <div className="p-4">
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
    const lines = content.split('\n').filter((l) => l.trim() !== '');

    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center gap-8 mt-[200px] lg:text-7xl text-5xl font-semibold lg:w-[850px] mx-auto"
            style={{ minHeight: 'calc(120vh - 400px)' }}
        >
            {lines.map((line, i) => (
                <p className="text-center" key={i}>{line}</p>
            ))}
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
                    {testimonials.map((testimonial, index) => (
                        <SwiperSlide key={index}>
                            <div className="flex flex-col items-center justify-center">
                                {testimonial.iconSVG && (
                                    <div className="w-28 h-28 text-black mb-6 flex items-center justify-center mx-auto"
                                        dangerouslySetInnerHTML={{ __html: testimonial.iconSVG }}
                                    />
                                )}
                                <p className="text-black font-light text-3xl tracking-wide mb-10 w-[80%] max-w-[800px] mx-auto">
                                    &ldquo;{testimonial.comment}&rdquo;
                                </p>
                                <div className="flex gap-8 w-[300px] md:w-[600px] lg:w-[700px] mx-auto items-center">
                                    <img
                                        src={testimonial.imageURL || 'https://www.fivebranches.edu/wp-content/uploads/2021/08/default-image.jpg'}
                                        alt={testimonial.name}
                                        className="w-32 h-32 rounded-full object-cover"
                                    />
                                    <div className="flex flex-col justify-center text-left">
                                        <h3 className="text-2xl font-semibold">{testimonial.name}</h3>
                                        <p className="text-black text-xl">{testimonial.role}</p>
                                    </div>
                                </div>
                                <div className="relative w-full">
                                    <div className="relative w-80 h-2 bg-gray-200 mt-10 rounded-sm mx-auto">
                                        <div className="absolute top-0 left-0 h-full bg-blue-500"
                                            style={{ width: `${((index + 1) / testimonials.length) * 100}%` }}
                                        />
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

export default function HomePage({ features = [], testimonials = [], whyWorkWithUs = [], postHowItWorks, preWhatTheySayAboutUs }: Props) {
    const defaultFeatures: Feature[] = features.length ? features : [
        { title: 'Tailored Software Solutions', description: 'We provide customized software solutions designed to meet your unique business needs and drive digital transformation.' },
        { title: 'Expert Freelancer Matching', description: 'Our AI-powered platform matches you with the most qualified freelancers from the MENA region for your specific project requirements.' },
        { title: 'AI-Powered Matchmaking', description: 'Leverage advanced algorithms that analyze skills, experience, and project needs to find the perfect talent match.' },
        { title: 'Comprehensive Crew Formation', description: 'Build complete development teams with complementary skills, managed and coordinated through our platform.' },
    ];

    const defaultWhyWorkWithUs = whyWorkWithUs.length ? whyWorkWithUs[0] : { title: 'WHY WORK WITH US', description: 'We connect businesses with exceptional freelance talent from across the MENA region. Our platform ensures quality, reliability, and seamless collaboration for every project.' };

    return (
        <PublicLayout>
            <Head title="Home" />
            <div style={{ fontFamily: 'system-ui, sans-serif', lineHeight: '1.8' }}>
                <Headline />
                <motion.div initial={{ y: '100vh' }} animate={{ y: 0 }} transition={{ type: 'spring', stiffness: 70, damping: 30 }}>
                    <HeroCarousel />
                </motion.div>
                <div className="container">
                    <FeaturesSection features={defaultFeatures} />
                    {postHowItWorks?.content && <SegmentsSection content={postHowItWorks.content} />}
                    {!postHowItWorks?.content && (
                        <SegmentsSection content={"SEGMENTS THAT\nWE ARE HAPPY\nTO WORK WITH"} />
                    )}
                    <TestimonialsSection testimonials={testimonials} />
                    <MainHeading title={defaultWhyWorkWithUs.title} description={defaultWhyWorkWithUs.description} />
                </div>
            </div>
        </PublicLayout>
    );
}
