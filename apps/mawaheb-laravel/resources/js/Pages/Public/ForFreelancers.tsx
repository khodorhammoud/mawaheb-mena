import { Head, Link } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { SkillBadgeList } from '@/Components/common/SkillBadge';
import MainHeading from '@/Components/common/MainHeading';
import { FaEarthAmericas, FaBrain, FaPalette } from 'react-icons/fa6';

interface Job { id: string; jobTitle: string; priceAmout: number; postedFrom: number; priceType: string; levelRequired: string; jobDesc: string; jobSkills: { name: string; isStarred: boolean }[] }
interface Achievement { title: string; count: number; desc: string }
interface HowItWorksItem { stepNb: number; title: string; description: string; imageURL?: string }
interface WhyWorkWithUsItem { title: string; description: string }

interface Props {
    jobs?: Job[];
    achievements?: Achievement[];
    howItWorksItems?: HowItWorksItem[];
    whyWorkWithUs?: WhyWorkWithUsItem[];
    postHowItWorks?: { content: string };
}

function Topic() {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const isHovering = hoveredIndex !== null;
    const textColorClass = isHovering ? 'text-white' : 'text-black';

    const gifs = [
        'https://www.w3schools.com/html/mov_bbb.mp4',
        'https://www.w3schools.com/html/mov_bbb.mp4',
        'https://www.w3schools.com/html/mov_bbb.mp4',
    ];

    return (
        <div className="relative mt-20 pb-12 pt-20 text-center overflow-hidden">
            <AnimatePresence>
                {hoveredIndex !== null && (
                    <motion.video key={hoveredIndex} src={gifs[hoveredIndex]} autoPlay loop muted
                        className="absolute inset-0 w-full h-full object-fill"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}
                    />
                )}
            </AnimatePresence>
            <div className={`relative z-10 max-w-xl mx-auto ${textColorClass}`}>
                <h2 className="font-bold text-md mb-1">EXPLORE TALENT HUB</h2>
                <h1 className="text-5xl leading-snug font-semibold">
                    Where The{' '}
                    <span className="inline">
                        <em onMouseEnter={() => setHoveredIndex(0)} onMouseLeave={() => setHoveredIndex(null)}
                            className={`cursor-pointer border-b-4 not-italic ${isHovering ? 'border-white text-white' : 'border-[#27638a] text-[#27638a]'}`}>Realms</em>
                        <span className={`mx-3 px-4 rounded-[25px] ${isHovering ? 'bg-white pb-2' : ''}`}>
                            <FaEarthAmericas className="text-4xl text-[#27638a] inline" />
                        </span>
                    </span>
                    Of{' '}
                    <span className="inline">
                        <em onMouseEnter={() => setHoveredIndex(1)} onMouseLeave={() => setHoveredIndex(null)}
                            className={`cursor-pointer border-b-4 not-italic ${isHovering ? 'border-white text-white' : 'border-[#27638a] text-[#27638a]'}`}>Skill</em>
                        <span className={`mx-3 px-4 rounded-[25px] ${isHovering ? 'bg-white pb-2' : ''}`}>
                            <FaBrain className="text-4xl text-[#27638a] inline" />
                        </span>
                    </span>
                    And{' '}
                    <span className="inline">
                        <em onMouseEnter={() => setHoveredIndex(2)} onMouseLeave={() => setHoveredIndex(null)}
                            className={`cursor-pointer border-b-4 not-italic ${isHovering ? 'border-white text-white' : 'border-[#27638a] text-[#27638a]'}`}>Creativity</em>
                        <span className={`mx-3 px-4 rounded-[25px] ${isHovering ? 'bg-white pb-2' : ''}`}>
                            <FaPalette className="text-4xl text-[#27638a] inline" />
                        </span>
                    </span>
                    Converge To Craft Jobs Your Clients Adore
                </h1>
                <Link href="/signup-freelancer" className="inline-block bg-[#27638a] text-white py-2 px-4 mt-4 rounded-xl hover:opacity-90 transition">
                    Join our team
                </Link>
            </div>
        </div>
    );
}

function JobsSection({ jobs }: { jobs: Job[] }) {
    if (!jobs.length) return null;
    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 p-6 mt-16">
                {jobs.map((job) => (
                    <div key={job.id} className="bg-white border border-gray-200 rounded-xl shadow-xl p-6 flex flex-col">
                        <h3 className="text-xl font-semibold mb-2">{job.jobTitle}</h3>
                        <div className="flex flex-row">
                            <p className="text-sm text-gray-400">{job.priceType} -&nbsp;</p>
                            <p className="text-sm text-gray-400 mb-4">Posted {job.postedFrom} hours ago</p>
                        </div>
                        <div className="flex flex-row gap-24 mt-2 mb-6">
                            <div><p className="text-md text-gray-800">${job.priceAmout}</p><p className="text-sm text-gray-400">{job.priceType}</p></div>
                            <div><p className="text-md text-black">Entry</p><p className="text-sm text-gray-400">{job.levelRequired}</p></div>
                        </div>
                        <div className="leading-tight mb-4">{job.jobDesc}</div>
                        {job.jobSkills.length > 0 && (
                            <div className="mb-4">
                                <SkillBadgeList skills={job.jobSkills.map((s, i) => ({ name: s.name, isStarred: i === 0 || s.isStarred }))} />
                            </div>
                        )}
                        <button className="mt-auto bg-white text-[#27638a] border-2 text-sm font-medium px-5 py-2 rounded-xl hover:bg-[#27638a] hover:text-white transition max-w-fit">
                            See more
                        </button>
                    </div>
                ))}
            </div>
            <div className="text-center flex justify-center gap-3 items-center mt-5">
                <p className="text-lg font-semibold">Want to browse more jobs?</p>
                <Link href="/signup-freelancer" className="text-white bg-[#27638a] rounded-xl px-5 py-2 text-sm hover:opacity-90 transition">Sign Up</Link>
            </div>
        </div>
    );
}

function AnimatedCount({ count }: { count: number }) {
    const [currentValue, setCurrentValue] = useState(0);
    const [hasAnimated, setHasAnimated] = useState(false);
    const elementRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting && !hasAnimated) setHasAnimated(true);
        }, { threshold: 0 });
        if (elementRef.current) observer.observe(elementRef.current);
        return () => observer.disconnect();
    }, [hasAnimated]);

    useEffect(() => {
        if (!hasAnimated) return;
        const totalDuration = 12.5 * count;
        const totalSteps = Math.ceil(count / 10);
        const stepDuration = totalDuration / totalSteps;
        let current = 0;
        const interval = setInterval(() => {
            current += 10;
            setCurrentValue(current > count ? count : current);
            if (current >= count) clearInterval(interval);
        }, stepDuration);
        return () => clearInterval(interval);
    }, [hasAnimated, count]);

    return (
        <div ref={elementRef} className="relative h-16 overflow-hidden flex justify-end items-center text-7xl font-bold text-gray-800">
            <div className="flex items-center">
                <AnimatePresence>
                    <motion.div key={currentValue} initial={{ y: '100%', opacity: 0.5 }} animate={{ y: '0%', opacity: 1 }} exit={{ y: '-100%', opacity: 0.5 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }} className="absolute left-0 right-14 text-right"
                    >
                        {currentValue}
                    </motion.div>
                </AnimatePresence>
                <p className="ml-20">+</p>
            </div>
        </div>
    );
}

function AchievementsSection({ achievements }: { achievements: Achievement[] }) {
    if (!achievements.length) return null;
    return (
        <div className="mx-4 flex flex-col mt-32">
            <h2 className="text-4xl font-bold mb-8 ml-2">ACHIEVEMENTS</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {achievements.map((a, i) => (
                    <div key={i} className="bg-white border border-gray-200 shadow-xl p-6 flex flex-col rounded-xl">
                        <h3 className="text-lg font-bold mb-4">{a.title}</h3>
                        <AnimatedCount count={a.count} />
                        <p className="text-sm text-gray-600 mt-6 pt-3 border-t-[2px]">{a.desc}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

function HowItWorksSection({ items }: { items: HowItWorksItem[] }) {
    if (!items.length) return null;
    return (
        <section className="mb-28">
            <MainHeading title="HOW IT WORKS" />
            <div className="xl:px-6">
                <div className="relative">
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-x-20 gap-y-20 mt-20 xl:mx-48">
                        {items.map((item, index) => (
                            <motion.div key={index} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.2 }}
                                className={`relative ${index === 0 ? 'xl:-mt-12' : index === 1 ? 'xl:mt-40' : index === 2 ? 'xl:-mt-64' : 'xl:mt-10'}`}
                            >
                                <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                                    {item.imageURL && <img src={item.imageURL} alt={item.title} className="w-full h-48 object-cover" />}
                                    <div className="p-6">
                                        <p className="text-sm text-gray-400 mb-2">Step {item.stepNb < 10 ? `0${item.stepNb}` : item.stepNb}</p>
                                        <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                                        <p className="text-gray-600">{item.description}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

export default function ForFreelancersPage({ jobs = [], achievements = [], howItWorksItems = [], whyWorkWithUs = [], postHowItWorks }: Props) {
    const defaultWhyWorkWithUs = whyWorkWithUs.length ? whyWorkWithUs[0] : { title: 'WHY WORK WITH US', description: 'Join a thriving community of MENA freelancers. Access exciting projects, fair compensation, and professional growth opportunities.' };

    return (
        <PublicLayout>
            <Head title="For Freelancers" />
            <div className="container" style={{ fontFamily: 'system-ui, sans-serif' }}>
                <div className="-mx-4"><Topic /></div>
                <JobsSection jobs={jobs} />
                <div className="-mb-52"><AchievementsSection achievements={achievements} /></div>
                <HowItWorksSection items={howItWorksItems} />
                {postHowItWorks?.content && (
                    <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                        className="flex flex-col items-center justify-center gap-8 mt-[200px] lg:text-7xl text-5xl font-semibold lg:w-[850px] mx-auto" style={{ minHeight: 'calc(120vh - 400px)' }}
                    >
                        {postHowItWorks.content.split('\n').filter((l) => l.trim()).map((line, i) => <p className="text-center" key={i}>{line}</p>)}
                    </motion.div>
                )}
                <MainHeading title={defaultWhyWorkWithUs.title} description={defaultWhyWorkWithUs.description} />
                <div className="mb-20" />
            </div>
        </PublicLayout>
    );
}
