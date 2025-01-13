import { useState } from "react";
import { useSwipeable } from "react-swipeable";
import { motion, AnimatePresence } from "framer-motion";
import CarouselCard from "./CarouselCard";

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
    const spacing = 80; // Space between items in pixels
    const downwardOffset = 60; // Pixels to move the left and right cards downward
    let opacity = 1; // Set the same opacity for all visible cards
    let zIndex = 1; // Same z-index for all visible cards

    let transform = "";

    switch (relativeIndex) {
      case 0:
        transform = `translateX(0) scale(${scale}) rotate(0deg) translateY(0)`;
        break;
      case 1:
        transform = `translateX(calc(100% + ${spacing}px)) scale(${scale}) rotate(15deg) translateY(${downwardOffset}px)`;
        break;
      case carouselData.length - 1:
        transform = `translateX(calc(-100% - ${spacing}px)) scale(${scale}) rotate(-15deg) translateY(${downwardOffset}px)`;
        break;
      default:
        transform = `translateX(calc(200% + ${spacing * 2}px)) scale(0) rotate(0deg) translateY(0)`;
        opacity = 0;
        zIndex = 0;
    }

    return {
      transform,
      zIndex,
      opacity,
      transition: "transform 0.7s ease, opacity 0.7s ease",
    };
  };

  return (
    <div
      {...handlers}
      className="relative w-full h-screen mx-auto mt-10 select-none"
    >
      {/* Animated Finger Icon for Swiping Instruction */}
      <AnimatePresence>
        {showFingerIcon && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute top-[210px] left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10"
          >
            <motion.div className="text-4xl bg-slate-200 rounded-3xl scroll-pb-10 pl-4 pt-3 pr-2 fixed-background bg-opacity-70">
              <div className="inline-block fingerAnimation">
                {" "}
                {/* Apply rotation here */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  x="0px"
                  y="0px"
                  width="40"
                  height="40"
                  viewBox="0 0 42 42"
                >
                  <path d="M 13 2 C 11.355469 2 10 3.355469 10 5 L 10 16.8125 L 9.34375 16.125 L 9.09375 15.90625 C 7.941406 14.753906 6.058594 14.753906 4.90625 15.90625 C 3.753906 17.058594 3.753906 18.941406 4.90625 20.09375 L 4.90625 20.125 L 13.09375 28.21875 L 13.15625 28.25 L 13.1875 28.3125 C 14.535156 29.324219 16.253906 30 18.1875 30 L 19.90625 30 C 24.441406 30 28.09375 26.347656 28.09375 21.8125 L 28.09375 14 C 28.09375 12.355469 26.738281 11 25.09375 11 C 24.667969 11 24.273438 11.117188 23.90625 11.28125 C 23.578125 9.980469 22.394531 9 21 9 C 20.234375 9 19.53125 9.300781 19 9.78125 C 18.46875 9.300781 17.765625 9 17 9 C 16.648438 9 16.316406 9.074219 16 9.1875 L 16 5 C 16 3.355469 14.644531 2 13 2 Z M 13 4 C 13.554688 4 14 4.445313 14 5 L 14 16 L 16 16 L 16 12 C 16 11.445313 16.445313 11 17 11 C 17.554688 11 18 11.445313 18 12 L 18 16 L 20 16 L 20 12 C 20 11.445313 20.445313 11 21 11 C 21.554688 11 22 11.445313 22 12 L 22 16 L 24.09375 16 L 24.09375 14 C 24.09375 13.445313 24.539063 13 25.09375 13 C 25.648438 13 26.09375 13.445313 26.09375 14 L 26.09375 21.8125 C 26.09375 25.277344 23.371094 28 19.90625 28 L 18.1875 28 C 16.722656 28 15.457031 27.476563 14.40625 26.6875 L 6.3125 18.6875 C 5.867188 18.242188 5.867188 17.757813 6.3125 17.3125 C 6.757813 16.867188 7.242188 16.867188 7.6875 17.3125 L 12 21.625 L 12 5 C 12 4.445313 12.445313 4 13 4 Z "></path>
                </svg>
              </div>
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
