import React, { useState, useEffect } from "react";
import { motion, useMotionValue } from "framer-motion";
import { useLoaderData } from "@remix-run/react"; // Import useLoaderData to fetch data from the loader

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
  const { testimonialsSection } = useLoaderData<LoaderData>(); // Fetch the testimonials from the loader
  const [currentIndex, setCurrentIndex] = useState(0);
  const x = useMotionValue(0);
  const [maxScroll, setMaxScroll] = useState(0);

  useEffect(() => {
    const updateMaxScroll = () => {
      const containerWidth =
        document.querySelector(".testimonial-container")?.clientWidth || 0;
      const totalWidth =
        (testimonialsSection.length - 1) * (containerWidth + 400);
      setMaxScroll(totalWidth);
    };

    updateMaxScroll();
    window.addEventListener("resize", updateMaxScroll);

    return () => {
      window.removeEventListener("resize", updateMaxScroll);
    };
  }, [testimonialsSection.length]); // Update maxScroll when testimonialsSection length changes

  const handleDragStart = () => {
    setShowFingerIcon(false);
  };

  const handleDragEnd = (event: any, info: any) => {
    const dragDistance = info.offset.x;

    if (dragDistance < -150 && currentIndex < testimonialsSection.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else if (dragDistance > 150 && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }

    x.set(-currentIndex * (maxScroll / (testimonialsSection.length - 1)));
  };

  return (
    <div className="relative w-full max-w-5xl mx-auto text-center select-none">
      <motion.div
        className="flex testimonial-container"
        drag="x"
        style={{ x }}
        onDragStart={handleDragStart}
        dragConstraints={{
          left: -maxScroll,
          right: 0,
        }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {testimonialsSection.map((testimonial, index) => (
          <div
            key={index}
            className="min-w-full flex-shrink-0 p-4"
            style={{ marginRight: "400px" }}
          >
            <div className="w-28 h-28 text-black mb-16 flex items-center justify-center mx-auto">
              <div
                dangerouslySetInnerHTML={{ __html: testimonial.iconSVG || "" }}
              />
            </div>
            <p className="text-black font-light text-3xl tracking-wide mb-20 w-[800px] mx-auto h-28">
              {testimonial.comment}
            </p>
            <div className="flex gap-8 w-[300px] md:w-[600px] lg:w-[700px] mx-auto h-40">
              <img
                src={
                  testimonial.imageURL ||
                  "https://www.fivebranches.edu/wp-content/uploads/2021/08/default-image.jpg"
                }
                alt={testimonial.name}
                className="w-32 h-32 rounded-full"
              />
              <div className="flex flex-col justify-center">
                <h3 className="text-2xl font-semibold text-left">
                  {testimonial.name}
                </h3>
                <p className="text-black text-2xl font-normal">
                  {testimonial.role}
                </p>
              </div>
            </div>
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
        ))}
      </motion.div>
    </div>
  );
};

export default Testimonials;
