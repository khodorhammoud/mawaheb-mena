import React from "react";
import { motion } from "framer-motion";

type ImageData = {
  src: string;
};

const images: ImageData[] = [
  {
    src: "https://www.fivebranches.edu/wp-content/uploads/2021/08/default-image.jpg",
  },
  {
    src: "https://www.fivebranches.edu/wp-content/uploads/2021/08/default-image.jpg",
  },
  {
    src: "https://www.fivebranches.edu/wp-content/uploads/2021/08/default-image.jpg",
  },
  {
    src: "https://www.fivebranches.edu/wp-content/uploads/2021/08/default-image.jpg",
  },
  {
    src: "https://www.fivebranches.edu/wp-content/uploads/2021/08/default-image.jpg",
  },
];

const Swiper: React.FC = () => {
  // Calculate the initial offset to center the first image
  const imageWidth = 480;
  const gap = 16; // Assuming mx-4 is equivalent to 16px
  const containerWidth = window.innerWidth;
  const initialXOffset = (containerWidth - imageWidth) / 2 - gap; // Offset to center the first image

  return (
    <div className="overflow-hidden w-full h-screen flex items-center justify-center select-none">
      <motion.div
        className="flex cursor-grab"
        drag="x"
        dragConstraints={{
          left: -((images.length - 1) * (imageWidth + gap) - 1232), // the big nb is the margin of the swiper to the right
          right: 1000, // the big nb is the margin of the swiper to the left
        }}
        dragElastic={0.1}
        whileTap={{ cursor: "grabbing" }}
        initial={{ x: initialXOffset }} // Center the first image
      >
        {images.map((image, index) => (
          <motion.div
            key={index}
            className="ml-96 flex-none object-cover rounded-xl"
            style={{
              width: `${imageWidth}px`,
              marginLeft: index === 0 ? `${gap}px` : "2%",
            }} // Set a gap for the first image
          >
            <img
              src={image.src}
              alt={`Slide ${index + 1}`}
              className="w-full h-[450px] rounded-xl select-none pointer-events-none"
              draggable="false"
            />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default Swiper;
