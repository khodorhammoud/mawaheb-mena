import { useState } from "react";
import { motion } from "framer-motion";

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
  const variants = {
    enter: (direction) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction) => ({
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  };

  const nextSlide = () => {
    setDirection(1);
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setDirection(-1);
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };
  return (
    <div className="absolute inset-0 flex flex-col justify-center items-center">
      <motion.div
        className="max-w-md text-center p-4"
        key={currentSlide}
        custom={direction}
        variants={variants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{
          x: { type: "spring", stiffness: 300, damping: 30 },
          opacity: { duration: 0.2 },
        }}
      >
        <img
          src={slides[currentSlide].image}
          alt="Testimonial"
          className="mb-4 rounded-full w-48 h-48 mx-auto object-cover"
        />
        <p className="text-lg text-gray-800 font-medium mb-2">
          {slides[currentSlide].quote}
        </p>
        <p className="text-sm text-gray-500">{slides[currentSlide].name}</p>
        <p className="text-sm text-gray-400">{slides[currentSlide].title}</p>
        <div className="flex justify-center mt-2">
          <div className="text-blue-600 bg-gray-200 px-2 py-1 rounded-full text-xs">
            {slides[currentSlide].rating}
          </div>
        </div>
      </motion.div>
      <div className="flex mt-4">
        <button
          onClick={prevSlide}
          className="mx-2 px-2 py-1 bg-gray-300 rounded-md hover:bg-gray-400"
        >
          Previous
        </button>
        <button
          onClick={nextSlide}
          className="mx-2 px-2 py-1 bg-gray-300 rounded-md hover:bg-gray-400"
        >
          Next
        </button>
      </div>
    </div>
  );
}
