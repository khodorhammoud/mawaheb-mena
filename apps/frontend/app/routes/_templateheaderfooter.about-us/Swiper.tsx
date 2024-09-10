import React, { useEffect, useState } from "react";
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
  const [initialXOffset, setInitialXOffset] = useState(1100); //a //to make the swiper have the 100% alignment, keep -> (a=b=c)

  useEffect(() => {
    const imageWidth = 480;
    const containerWidth = window.innerWidth;
    const offset = 1100; // This offset will push the first image partially off-screen to the left //b
    setInitialXOffset(offset);
  }, []);

  return (
    <div className="overflow-hidden md:w-full md:h-screen flex items-center justify-center select-none mt-40">
      <motion.div
        className="flex cursor-grab"
        drag="x"
        dragConstraints={{
          left: -((images.length - 1) * (480 + 16) - 1232), // the big nb is the margin of the swiper to the right
          right: 1100, // the big nb is the margin of the swiper to the left //c
        }}
        dragElastic={0.1}
        whileTap={{ cursor: "grabbing" }}
        initial={{ x: initialXOffset }}
      >
        {images.map((image, index) => (
          <motion.div
            key={index}
            className="flex-none object-cover rounded-xl"
            style={{
              width: "480px",
              marginLeft: index === 0 ? `0px` : "2%", // The first image has no margin, the rest have a 16px gap
            }}
          >
            <img
              src={image.src}
              alt={`Slide ${index + 1}`}
              className="md:w-full md:h-[450px] sm:w-[460px] sm:h-[460px] w-[280px] h-[300px] rounded-xl select-none pointer-events-none"
              draggable="false"
            />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default Swiper;
