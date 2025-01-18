import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaArrowLeft, FaArrowRight, FaStar } from "react-icons/fa";

export type registrationSlideData = {
  image: string;
  quote: string;
  name: string;
  title: string;
  rating: number;
};

export default function RegistrationSlider(props: {
  slides: registrationSlideData[];
}) {
  const slides: registrationSlideData[] | null = props.slides;
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? "100%" : "-100%",
      opacity: 1,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? "100%" : "-100%",
      opacity: 1,
      // position: 'absolute',
    }),
  };

  // Auto-scroll effect
  useEffect(() => {
    if (!isAutoPlaying) return;

    const timer = setInterval(() => {
      setDirection(1);
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [slides.length, isAutoPlaying]);

  const handleManualNavigation = (callback: () => void) => {
    setIsAutoPlaying(false);
    callback();
    // Resume auto-play after 5 seconds of inactivity
    setTimeout(() => setIsAutoPlaying(true), 5000);
  };

  const nextSlide = () => {
    handleManualNavigation(() => {
      setDirection(1);
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    });
  };

  const prevSlide = () => {
    handleManualNavigation(() => {
      setDirection(-1);
      setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    });
  };

  return (
    <div className="absolute inset-0 flex flex-col justify-end h-[900px]">
      {/* Background Image */}
      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        <motion.div
          className="absolute inset-0 bg-cover bg-center z-0 h-full"
          style={{
            backgroundImage: `url(${slides[currentSlide].image})`,
          }}
          key={currentSlide}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 100, damping: 20 },
            opacity: { duration: 0.2 },
          }}
        />
      </AnimatePresence>
      <div className="sticky bottom-0 w-full p-6 text-white flex justify-between items-end mb-4">
        {/* Quote and Name */}
        <div>
          <p className="text-xl -mr-20 mb-10">{slides[currentSlide].quote}</p>
          <p className="text-lg font-semibold mb-10">
            {slides[currentSlide].name}
          </p>
          <p className="text-sm text-gray-400 font-semibold mb-2">
            {slides[currentSlide].title}
          </p>
        </div>

        <div className="flex flex-col items-center">
          {/* Stars ⭐⭐⭐⭐⭐*/}
          <div className="flex ml-4">
            {[...Array(5)].map((_, index) => (
              <FaStar
                key={index}
                className={`text-md ${
                  index < slides[currentSlide].rating
                    ? "text-white"
                    : "text-gray-400"
                }`}
              />
            ))}
          </div>
          {/* Navigation Icons ⬅️➡️ */}
          <div className="flex space-x-4 mt-8">
            <button
              onClick={prevSlide}
              className="text-white p-2 border-2 rounded-full"
            >
              <FaArrowLeft size={24} />
            </button>
            <button
              onClick={nextSlide}
              className="text-white p-2 border-2 rounded-full"
            >
              <FaArrowRight size={24} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
