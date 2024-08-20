import React, { useState } from "react";
import { useSwipeable } from "react-swipeable";
import { motion, AnimatePresence } from "framer-motion";
import CarouselCard from "./carouselcard";

// the name of the carousel is an anchor, and the anchor is implemmented in the carouselCard.tsx 💖

const carouselData = [
  {
    image:
      "https://www.fivebranches.edu/wp-content/uploads/2021/08/default-image.jpg",
    name: "Khodor Hammoud",
    role: "JavaScript Developer",
    hourlyRate: "$20/hour",
    skills: ["Responsive design", "HTML5", "Node.js", "Agile", "Debugging"],
  },
  {
    image:
      "https://www.fivebranches.edu/wp-content/uploads/2021/08/default-image.jpg",
    name: "Wassim Taleb",
    role: "Frontend Developer",
    hourlyRate: "$25/hour",
    skills: ["React", "CSS3", "TypeScript", "Testing", "Performance"],
  },
  {
    image:
      "https://www.fivebranches.edu/wp-content/uploads/2021/08/default-image.jpg",
    name: "Ahmad Khoder",
    role: "JavaScript Developer",
    hourlyRate: "$20/hour",
    skills: ["Responsive design", "HTML5", "Node.js", "Agile", "Debugging"],
  },
  {
    image:
      "https://www.fivebranches.edu/wp-content/uploads/2021/08/default-image.jpg",
    name: "Rawad",
    role: "JavaScript Developer",
    hourlyRate: "$20/hour",
    skills: ["Responsive design", "HTML5", "Node.js", "Agile", "Debugging"],
  },
  {
    image:
      "https://www.fivebranches.edu/wp-content/uploads/2021/08/default-image.jpg",
    name: "Mohamad",
    role: "JavaScript Developer",
    hourlyRate: "$20/hour",
    skills: ["Responsive design", "HTML5", "Node.js", "Agile", "Debugging"],
  },
  // Add more objects as needed
];

const Carousel = () => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [showFingerIcon, setShowFingerIcon] = useState<boolean>(true);

  // Function to handle the next slide
  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex < carouselData.length - 1 ? prevIndex + 1 : 0
    );
    setShowFingerIcon(false); // Hide the icon after the first swipe
  };

  // Function to handle the previous slide
  const handlePrev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex > 0 ? prevIndex - 1 : carouselData.length - 1
    );
    setShowFingerIcon(false); // Hide the icon after the first swipe
  };

  // Handling swipe gestures using react-swipeable
  const handlers = useSwipeable({
    onSwipedLeft: handleNext,
    onSwipedRight: handlePrev,
    trackMouse: true, // Allows swipe with mouse for desktop users
  });

  // Calculate the transformation style for each carousel item
  const getTransformStyle = (index: number) => {
    const relativeIndex =
      (index - currentIndex + carouselData.length) % carouselData.length;
    const scale = 1; // Set the same scale for all visible cards
    const opacity = 1; // Set the same opacity for all visible cards
    const spacing = 80; // Space between items in pixels
    const zIndex = 1; // Same z-index for all visible cards
    const downwardOffset = 60; // Pixels to move the left and right cards downward

    if (relativeIndex === 0) {
      return {
        transform: `translateX(0) scale(${scale}) rotate(0deg) translateY(0)`,
        zIndex: zIndex,
        opacity: opacity,
        transition: "transform 0.7s ease, opacity 0.7s ease",
      };
    } else if (relativeIndex === 1) {
      return {
        transform: `translateX(calc(100% + ${spacing}px)) scale(${scale}) rotate(15deg) translateY(${downwardOffset}px)`,
        zIndex: zIndex,
        opacity: opacity,
        transition: "transform 0.7s ease, opacity 0.7s ease",
      };
    } else if (relativeIndex === carouselData.length - 1) {
      return {
        transform: `translateX(calc(-100% - ${spacing}px)) scale(${scale}) rotate(-15deg) translateY(${downwardOffset}px)`,
        zIndex: zIndex,
        opacity: opacity,
        transition: "transform 0.7s ease, opacity 0.7s ease",
      };
    } else {
      return {
        transform: `translateX(calc(200% + ${spacing * 2}px)) scale(0) rotate(0deg) translateY(0)`,
        opacity: 0,
        zIndex: 0,
        transition: "transform 0.7s ease, opacity 0.7s ease",
      };
    }
  };

  return (
    <div
      {...handlers}
      className="relative w-full h-screen mx-auto overflow-hidden mt-10 select-none"
    >
      {/* Animated Finger Icon for Swiping Instruction */}
      <AnimatePresence>
        {showFingerIcon && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10"
          >
            <motion.div
              animate={{ rotate: [0, 30, 0] }} // Rotation animation from top to right
              transition={{ repeat: Infinity, duration: 1 }} // Infinite loop
              className="text-4xl"
            >
              👆 {/* You can replace this emoji with an SVG or an icon */}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="h-full flex justify-center items-center relative">
        <div className="flex justify-center h-full transition-transform ease-in-out select-none">
          {carouselData.map((item, index) => (
            <div
              key={index}
              className="flex-shrink-0 absolute"
              style={{
                ...getTransformStyle(index),
              }}
            >
              <div className="rounded-xl overflow-hidden shadow-lg pointer-events-none">
                <CarouselCard
                  image={item.image}
                  name={item.name}
                  role={item.role}
                  hourlyRate={item.hourlyRate}
                  skills={item.skills}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Carousel;
