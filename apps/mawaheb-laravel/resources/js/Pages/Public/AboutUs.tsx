import { Head, Link } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';

interface Achievement { title: string; count: number; desc: string }
interface MawahebTopic { id: string; topic: string }
interface MawahebDescription { id: string; description: string }
interface HowWeMakeDiff { id: string; title: string; description: string; belongingText: string }
interface TeamMember { name: string; position: string; role: string; imageURL: string }
interface WantToJoinUs { title: string; subHeadline?: { content: string }; emailbutton: string }

interface Props {
    achievements?: Achievement[];
    mawahebTopics?: MawahebTopic[];
    mawahebDescriptions?: MawahebDescription[];
    howWeMakeDiff?: HowWeMakeDiff[];
    teamMembers?: TeamMember[];
    teamSubHeadline?: string;
    wantToJoinUs?: WantToJoinUs;
}

function AnimatedCount({ count }: { count: number }) {
    const [currentValue, setCurrentValue] = useState(0);
    const [hasAnimated, setHasAnimated] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(([e]) => { if (e.isIntersecting && !hasAnimated) setHasAnimated(true); }, { threshold: 0 });
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [hasAnimated]);

    useEffect(() => {
        if (!hasAnimated) return;
        let current = 0;
        const steps = Math.ceil(count / 10);
        const duration = 12.5 * count / steps;
        const interval = setInterval(() => { current += 10; setCurrentValue(current > count ? count : current); if (current >= count) clearInterval(interval); }, duration);
        return () => clearInterval(interval);
    }, [hasAnimated, count]);

    return (
        <div ref={ref} className="relative h-16 overflow-hidden flex justify-end items-center text-7xl font-bold text-gray-800">
            <div className="flex items-center">
                <AnimatePresence>
                    <motion.div key={currentValue} initial={{ y: '100%', opacity: 0.5 }} animate={{ y: '0%', opacity: 1 }} exit={{ y: '-100%', opacity: 0.5 }}
                        transition={{ duration: 0.25 }} className="absolute left-0 right-14 text-right">{currentValue}</motion.div>
                </AnimatePresence>
                <p className="ml-20">+</p>
            </div>
        </div>
    );
}

function TopicSection() {
    const [nMove, setNMove] = useState(-28);
    useEffect(() => {
        const update = () => { const w = window.innerWidth; setNMove(w < 640 ? -11 : w < 768 ? -14 : w < 1024 ? -17 : w < 1280 ? -21 : -28); };
        update(); window.addEventListener('resize', update); return () => window.removeEventListener('resize', update);
    }, []);

    return (
        <div className="border-b pb-20 mb-20 border-slate-300">
            <div className="relative mt-36 xl:text-8xl lg:text-7xl md:text-6xl sm:text-5xl text-4xl xl:w-[900px] lg:w-[700px] md:w-[600px] sm:w-[400px] w-[300px] font-semibold">
                <div className="leading-[1.1]">
                    We <span className="relative z-10">C</span><span className="relative z-10">O</span>
                    <motion.div initial={{ width: 0 }} animate={{ width: ['0px', '350px', '250px', '262px'] }}
                        transition={{ duration: 1, ease: 'easeInOut', times: [0, 0.3, 0.6, 1], delay: 0.3 }}
                        className="absolute bg-[#27638a] translate-y-[-50%] z-20 h-[14px]"
                        style={{ left: '27.5%', top: '54.5px' }}
                    >
                        <div className="absolute bg-[#27638a] rounded-full w-[22px] h-[22px] -left-[10px] -top-[4px]" />
                        <div className="absolute bg-[#27638a] rounded-full w-[22px] h-[22px] -right-[10px] -top-[4px]" />
                    </motion.div>
                    <span className="relative z-10 inline-block">N</span>
                    {['N', 'E', 'C', 'T'].map((letter, i) => (
                        <motion.span key={i} initial={{ x: 0 }} animate={{ x: nMove }} transition={{ duration: 0.4, ease: 'easeInOut', delay: 0.6 }}
                            className="relative z-10 inline-block">{letter}</motion.span>
                    ))}
                </div>
                <span className="relative z-10 inline-block leading-[1.1]"> Talent To Drive Success</span>
            </div>
        </div>
    );
}

function MeetTheTeam({ members, subHeadline }: { members: TeamMember[]; subHeadline: string }) {
    const [hoveredMember, setHoveredMember] = useState<TeamMember | null>(null);
    if (!members.length) return null;

    return (
        <section className="py-16 bg-white mt-40">
            <div className="px-4 sm:px-6 lg:px-8">
                <h2 className="text-4xl leading-8 font-bold tracking-wide text-gray-900 sm:text-6xl">MEET THE TEAM</h2>
                <p className="mt-10 mb-10 max-w-xl md:text-lg text-base text-black">{subHeadline}</p>
                <div className="grid grid-cols-1 md:grid-cols-[70%,30%] items-center">
                    <ul className="mb-10">
                        {members.map((member, i) => (
                            <li key={i} className="flex lg:justify-between items-center cursor-pointer py-4 border-b-[2px] border-gray-300 hover:bg-gray-100"
                                onMouseEnter={() => setHoveredMember(member)}>
                                <span className={`xl:text-3xl lg:text-2xl md:text-xl sm:text-lg text-base my-2 md:mr-20 mr-10 font-normal ${hoveredMember === member ? 'text-[#27638a]' : 'text-gray-900'}`}>{member.name}</span>
                                <span className={`xl:text-lg lg:text-md md:text-base text-sm xl:mr-40 mr-0 ${hoveredMember === member ? 'text-[#27638a]' : 'text-black'}`}>{member.role}</span>
                            </li>
                        ))}
                    </ul>
                    <div>
                        {!hoveredMember ? (
                            <motion.div initial={{ opacity: 0, rotate: -3, filter: 'blur(10px)' }} animate={{ opacity: 1, rotate: -3, filter: 'blur(10px)' }}
                                className="h-80 w-[90%] rounded-xl shadow-2xl ml-[5%] md:w-full bg-[#27638a]" />
                        ) : (
                            <motion.img key={hoveredMember.name} src={hoveredMember.imageURL} alt={hoveredMember.name}
                                initial={{ opacity: 0, rotate: -3 }} animate={{ opacity: 1, rotate: -3 }} transition={{ duration: 0.5 }}
                                className="h-80 object-cover rounded-xl shadow-2xl ml-[5%] md:w-full sm:w-[60%] w-[90%]" />
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}

function JoinUsSection({ data }: { data?: WantToJoinUs }) {
    const [isHovered, setIsHovered] = useState(false);
    const title = data?.title || 'WANT TO JOIN US';
    const subHeadline = data?.subHeadline?.content || "We're on a mission to revolutionize the freelance industry. If you're ready to be part of an innovative team, we want to hear from you.";
    const emailButton = data?.emailbutton || 'apply@mawaheb.mena';

    return (
        <div className="min-h-[80vh] bg-gradient-to-r md:px-20 px-10 md:py-0 py-10 from-[#27638a] to-blue-200 flex items-center justify-center my-40 rounded-2xl">
            <div className="md:flex items-center justify-center container">
                <div className="md:w-1/2 md:pr-10 mb-10 md:mb-0">
                    <h1 className="text-6xl font-semibold text-white mb-12">{title}</h1>
                    <p className="text-lg text-white w-[95%]">{subHeadline}</p>
                </div>
                <div className="md:w-1/2 flex justify-center relative text-[#27638a]"
                    onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
                    <motion.a href="/contact-us"
                        className="w-56 h-56 bg-slate-100 text-[#27638a] rounded-full flex items-center justify-center text-lg font-bold shadow-lg relative overflow-hidden"
                        style={{ cursor: 'pointer', textDecoration: 'none', color: 'inherit' }}>
                        {emailButton}
                        {isHovered && (
                            <>
                                <motion.div className="absolute rounded-full z-10" style={{ width: 100, height: 100, bottom: 20, left: '50%', transform: 'translateX(-50%)', background: 'radial-gradient(circle,#27638A, rgba(255,255,255,0))', filter: 'blur(6px)' }}
                                    animate={{ x: [59, -30, 50, -20, 49], y: [-40, 9, 95, -40, -40], opacity: [0.9, 0.8, 0.9, 1.2, 0.6] }}
                                    transition={{ duration: 5, ease: 'easeInOut', repeat: Infinity, repeatType: 'reverse' }} />
                                <motion.div className="absolute rounded-full" style={{ width: 150, height: 150, bottom: 120, left: '20%', background: 'radial-gradient(circle, #27638A, rgba(255,255,255,0))', filter: 'blur(8px)' }}
                                    animate={{ x: [18, -40, -20, -40, -18], y: [128, -20, 19, -60, 68], opacity: [0.8, 1.2, 0.8, 0.5, 0.9] }}
                                    transition={{ duration: 5, ease: 'easeInOut', repeat: Infinity, repeatType: 'reverse' }} />
                            </>
                        )}
                        <motion.div className="absolute w-full h-full rounded-full" style={{ borderTop: '2px solid #27638a', borderBottom: '2px solid #27638a' }}
                            animate={{ rotate: [0, 360] }} transition={{ duration: 2, ease: 'linear', repeat: Infinity }} />
                    </motion.a>
                </div>
            </div>
        </div>
    );
}

export default function AboutUsPage({ achievements = [], mawahebTopics = [], mawahebDescriptions = [], howWeMakeDiff = [], teamMembers = [], teamSubHeadline = '', wantToJoinUs }: Props) {
    return (
        <PublicLayout>
            <Head title="About Us" />
            <div className="container" style={{ fontFamily: 'system-ui, sans-serif', lineHeight: '1.8' }}>
                <TopicSection />

                {/* More About Mawaheb */}
                {(mawahebTopics.length > 0 || mawahebDescriptions.length > 0) && (
                    <section className="grid grid-cols-2 mb-20">
                        <div><p className="text-gray-600 text-lg w-[90%] ml-2 tracking-wider">
                            {mawahebTopics.map((t, i) => <span key={t.id}>{t.topic}{i < mawahebTopics.length - 1 && <><br /><br /></>}</span>)}
                        </p></div>
                        <div><p className="text-2xl w-[90%] ml-6 text-black leading-relaxed">
                            {mawahebDescriptions.map((d) => <span key={d.id}>{d.description}<br /><br /></span>)}
                        </p></div>
                    </section>
                )}

                {/* How We Make a Difference */}
                {howWeMakeDiff.length > 0 && (
                    <section className="mb-40 mt-24">
                        <p className="!leading-normal xl:text-6xl lg:text-5xl md:text-4xl sm:text-3xl text-2xl font-bold lg:w-[650px] sm:w-[400px] w-[250px]">HERE&apos;S HOW WE MAKE A DIFFERENCE</p>
                        <div className="grid grid-cols-1 lg:grid-cols-[40%_60%] lg:mt-14 gap-8">
                            <div className="flex flex-col px-8 mt-10">
                                <div className="text-lg leading-normal" dangerouslySetInnerHTML={{ __html: howWeMakeDiff[0]?.belongingText || '' }} />
                            </div>
                            <Swiper slidesPerView={1} spaceBetween={30} breakpoints={{ 768: { slidesPerView: 1.2 }, 1024: { slidesPerView: 1.5 } }} className="w-full">
                                {howWeMakeDiff.map((box, i) => (
                                    <SwiperSlide key={box.id}>
                                        <div className="rounded-xl text-white p-10 min-h-[500px]" style={{ backgroundColor: '#27638a' }}>
                                            <div className="h-[20%] flex items-center gap-4 text-white w-full"><p className="text-4xl">{i + 1}</p></div>
                                            <div className="h-[65%]">
                                                <h3 className="text-4xl xl:text-5xl leading-snug my-4">{box.title}</h3>
                                                <p className="text-xl leading-relaxed mt-10">{box.description}</p>
                                            </div>
                                        </div>
                                    </SwiperSlide>
                                ))}
                            </Swiper>
                        </div>
                    </section>
                )}

                {/* Achievements */}
                {achievements.length > 0 && (
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
                )}

                <MeetTheTeam members={teamMembers} subHeadline={teamSubHeadline} />
                <JoinUsSection data={wantToJoinUs} />
            </div>
        </PublicLayout>
    );
}
