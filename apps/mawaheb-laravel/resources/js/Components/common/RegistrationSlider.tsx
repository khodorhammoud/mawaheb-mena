import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaArrowLeft, FaArrowRight, FaStar } from 'react-icons/fa';

export type RegistrationSlideData = {
    image: string;
    quote: string;
    name: string;
    title: string;
    rating: number;
};

export default function RegistrationSlider({ slides }: { slides: RegistrationSlideData[] }) {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [direction, setDirection] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);

    const variants = {
        enter: (dir: number) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 1 }),
        center: { x: 0, opacity: 1 },
        exit: (dir: number) => ({ x: dir < 0 ? '100%' : '-100%', opacity: 1 }),
    };

    useEffect(() => {
        if (!isAutoPlaying) return;
        const timer = setInterval(() => {
            setDirection(1);
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [slides.length, isAutoPlaying]);

    const handleManualNavigation = (cb: () => void) => {
        setIsAutoPlaying(false);
        cb();
        setTimeout(() => setIsAutoPlaying(true), 5000);
    };

    const nextSlide = () => handleManualNavigation(() => {
        setDirection(1);
        setCurrentSlide((prev) => (prev + 1) % slides.length);
    });

    const prevSlide = () => handleManualNavigation(() => {
        setDirection(-1);
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    });

    return (
        <div className="absolute inset-0 flex flex-col justify-end h-full">
            <AnimatePresence initial={false} custom={direction} mode="popLayout">
                <motion.div
                    className="absolute inset-0 bg-cover bg-center z-0 h-full"
                    style={{ backgroundImage: `url(${slides[currentSlide].image})` }}
                    key={currentSlide}
                    custom={direction}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ x: { type: 'spring', stiffness: 100, damping: 20 }, opacity: { duration: 0.2 } }}
                />
            </AnimatePresence>
            <div className="sticky bottom-0 w-full p-6 text-white flex justify-between items-end mb-4 z-10">
                <div>
                    <p className="text-xl -mr-20 mb-10">{slides[currentSlide].quote}</p>
                    <p className="text-lg font-semibold mb-10">{slides[currentSlide].name}</p>
                    <p className="text-sm text-gray-400 font-semibold mb-2">{slides[currentSlide].title}</p>
                </div>
                <div className="flex flex-col items-center">
                    <div className="flex ml-4">
                        {[...Array(5)].map((_, i) => (
                            <FaStar
                                key={i}
                                className={`text-md ${i < slides[currentSlide].rating ? 'text-white' : 'text-gray-400'}`}
                            />
                        ))}
                    </div>
                    <div className="text-gray-300 flex space-x-4 mt-8">
                        <button onClick={prevSlide} className="p-2 border-2 rounded-full"><FaArrowLeft size={20} /></button>
                        <button onClick={nextSlide} className="p-2 border-2 rounded-full"><FaArrowRight size={20} /></button>
                    </div>
                </div>
            </div>
        </div>
    );
}
