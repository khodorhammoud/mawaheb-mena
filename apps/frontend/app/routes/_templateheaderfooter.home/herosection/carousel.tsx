import React, { useState } from "react";
import { useSwipeable } from "react-swipeable";
import CarouselCard from "./carouselcard";

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

  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex < carouselData.length - 1 ? prevIndex + 1 : 0
    );
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex > 0 ? prevIndex - 1 : carouselData.length - 1
    );
  };

  const handlers = useSwipeable({
    onSwipedLeft: handleNext,
    onSwipedRight: handlePrev,
    trackMouse: true, // Allows swipe with mouse for desktop users
  });

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
      className="relative w-full h-screen mx-auto overflow-hidden mt-10"
    >
      <div className="h-full flex justify-center items-center relative">
        <div className="flex justify-center h-full transition-transform ease-in-out">
          {carouselData.map((item, index) => (
            <div
              key={index}
              className="flex-shrink-0 absolute"
              style={{
                ...getTransformStyle(index),
              }}
            >
              <div className="rounded-xl overflow-hidden shadow-lg">
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
