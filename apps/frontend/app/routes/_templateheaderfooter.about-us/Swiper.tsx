import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useLoaderData } from "@remix-run/react";

// Type for Image Data fetched from the loader
type ImageData = {
  imageURL: string;
};

interface LoaderData {
  imageSwiperSection: ImageData[];
}

const Swiper: React.FC = () => {
  // Fetch the imageSwiperSection from the loader
  const { imageSwiperSection } = useLoaderData<LoaderData>();

  const [initialXOffset, setInitialXOffset] = useState(1100); // To set initial offset

  useEffect(() => {
    const offset = 1100; // This offset will push the first image partially off-screen to the left
    setInitialXOffset(offset);
  }, []);

  return (
    <div className="overflow-hidden md:w-full md:h-screen flex items-center justify-center select-none mt-40">
      <motion.div
        className="flex cursor-grab"
        drag="x"
        dragConstraints={{
          left: -((imageSwiperSection.length - 1) * (480 + 16) - 1232), // Adjust drag constraints based on image count
          right: 1100, // Margin of the swiper to the left
        }}
        dragElastic={0.1}
        whileTap={{ cursor: "grabbing" }}
        initial={{ x: initialXOffset }}
      >
        {imageSwiperSection.map((image, index) => (
          <motion.div
            key={index}
            className="flex-none object-cover rounded-xl"
            style={{
              width: "480px",
              marginLeft: index === 0 ? `0px` : "2%", // The first image has no margin, the rest have a gap
            }}
          >
            <img
              src={image.imageURL}
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
