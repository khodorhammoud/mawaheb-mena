import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { useLoaderData } from "@remix-run/react";
import { motion, AnimatePresence } from "framer-motion";

interface Testimonial {
  iconSVG?: string;
  comment: string;
  imageURL?: string;
  name: string;
  role: string;
}

interface LoaderData {
  testimonialsSection: Testimonial[];
}

interface TestimonialsProps {
  setShowFingerIcon: React.Dispatch<React.SetStateAction<boolean>>;
}

const Testimonials: React.FC<TestimonialsProps> = ({ setShowFingerIcon }) => {
  const { testimonialsSection } = useLoaderData<LoaderData>();

  // Local state to hide the finger icon after one swipe
  const [showFingerIconLocal, setShowFingerIconLocal] = useState(true);

  return (
    <div className="relative w-full max-w-5xl mx-auto text-center select-none overflow-hidden">
      {/* Finger Icon */}
      <AnimatePresence>
        {showFingerIconLocal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute z-10"
            style={{
              top: "310px",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          >
            <motion.div className="w-16 text-5xl bg-slate-100 rounded-2xl pl-4 pt-4 pr-2 text-white fill-white stroke-black">
              <div className="inline-block fingerAnimation bg-transparent">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="40"
                  height="40"
                  viewBox="0 0 42 42"
                  className=""
                >
                  <path d="M 13 2 C 11.355469 2 10 3.355469 10 5 L 10 16.8125 L 9.34375 16.125 L 9.09375 15.90625 C 7.941406 14.753906 6.058594 14.753906 4.90625 15.90625 C 3.753906 17.058594 3.753906 18.941406 4.90625 20.09375 L 4.90625 20.125 L 13.09375 28.21875 L 13.15625 28.25 L 13.1875 28.3125 C 14.535156 29.324219 16.253906 30 18.1875 30 L 19.90625 30 C 24.441406 30 28.09375 26.347656 28.09375 21.8125 L 28.09375 14 C 28.09375 12.355469 26.738281 11 25.09375 11 C 24.667969 11 24.273438 11.117188 23.90625 11.28125 C 23.578125 9.980469 22.394531 9 21 9 C 20.234375 9 19.53125 9.300781 19 9.78125 C 18.46875 9.300781 17.765625 9 17 9 C 16.648438 9 16.316406 9.074219 16 9.1875 L 16 5 C 16 3.355469 14.644531 2 13 2 Z" />
                </svg>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Swiper Slider */}
      <Swiper
        modules={[Pagination]}
        pagination={{ clickable: true, el: null }} // Hide pagination dots
        spaceBetween={50}
        slidesPerView={1}
        onSlideChange={() => {
          setShowFingerIcon(false); // Hide the global finger icon
          setShowFingerIconLocal(false); // Hide the local finger icon after swipe
        }}
      >
        {testimonialsSection.map((testimonial, index) => (
          <SwiperSlide key={index}>
            <div className="flex flex-col items-center justify-center">
              {/* Testimonial Icon */}
              <div
                className="w-28 h-28 text-black mb-6 flex items-center justify-center mx-auto"
                dangerouslySetInnerHTML={{
                  __html: testimonial.iconSVG || "",
                }}
              />

              {/* Testimonial Comment */}
              <p className="text-black font-light text-3xl tracking-wide mb-10 w-[80%] max-w-[800px] mx-auto">
                "{testimonial.comment}"
              </p>

              {/* User Info */}
              <div className="flex gap-8 w-[300px] md:w-[600px] lg:w-[700px] mx-auto items-center">
                <img
                  src={
                    testimonial.imageURL ||
                    "https://www.fivebranches.edu/wp-content/uploads/2021/08/default-image.jpg"
                  }
                  alt={testimonial.name}
                  className="w-32 h-32 rounded-full"
                />
                <div className="flex flex-col justify-center text-left">
                  <h3 className="text-2xl font-semibold">{testimonial.name}</h3>
                  <p className="text-black text-xl">{testimonial.role}</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="relative w-full">
                <div className="relative w-80 h-2 bg-gray-200 mt-10 rounded-sm mx-auto">
                  <div
                    className="absolute top-0 left-0 h-full bg-blue-500"
                    style={{
                      width: `${((index + 1) / testimonialsSection.length) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default Testimonials;
