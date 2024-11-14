import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLoaderData } from "@remix-run/react";

// Type for the fetched data
interface HowWeMakeDiff {
  id: string;
  title: string;
  description: string;
  iconSVG: string;
  belongingText: string;
}

interface LoaderData {
  howWeMakeDiffSection: HowWeMakeDiff[];
}

const HowWeMakeDifference: React.FC = () => {
  const { howWeMakeDiffSection } = useLoaderData<LoaderData>(); // Fetch data from the loader
  const [activeIndex, setActiveIndex] = useState(0); // Track active swiper
  const primaryColor = "#27638a"; // Your primary color
  const [initialOffsetX, setInitialOffsetX] = useState(0); // Store the initial offset
  const [boxWidth, setBoxWidth] = useState(400); // Store the box width

  // Helper function to lighten colors
  const lightenColor = (color: string, percent: number) => {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = ((num >> 8) & 0x00ff) + amt;
    const B = (num & 0x0000ff) + amt;

    return (
      "#" +
      (
        0x1000000 +
        (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
        (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
        (B < 255 ? (B < 1 ? 0 : B) : 255)
      )
        .toString(16)
        .slice(1)
    );
  };

  // Calculate the initial offset to center the first box and dynamically adjust the box width
  useEffect(() => {
    const updateDimensions = () => {
      const viewportWidth = window.innerWidth;
      let newBoxWidth;
      let additionalMargin = 0; // Variable to push content to the right

      if (viewportWidth >= 1500) {
        newBoxWidth = 550;
        additionalMargin = 380;
      } else if (viewportWidth >= 1400) {
        newBoxWidth = 500;
        additionalMargin = 323;
      } else if (viewportWidth >= 1350) {
        newBoxWidth = 360;
        additionalMargin = 40;
      } else if (viewportWidth >= 1300) {
        newBoxWidth = 340;
        additionalMargin = 30;
      } else if (viewportWidth >= 1250) {
        newBoxWidth = 320;
        additionalMargin = 20;
      } else if (viewportWidth >= 1170) {
        newBoxWidth = 310;
        additionalMargin = 15;
      } else if (viewportWidth >= 1150) {
        newBoxWidth = 290;
        additionalMargin = 10;
      } else if (viewportWidth >= 1024) {
        newBoxWidth = 260;
        additionalMargin = 5;
      } else if (viewportWidth >= 924) {
        newBoxWidth = 400;
        additionalMargin = 250;
      } else if (viewportWidth >= 824) {
        newBoxWidth = 400;
        additionalMargin = 350;
      } else if (viewportWidth >= 724) {
        newBoxWidth = 400;
        additionalMargin = 420;
      } else if (viewportWidth >= 624) {
        newBoxWidth = 320;
        additionalMargin = 350;
      } else if (viewportWidth >= 524) {
        newBoxWidth = 300;
        additionalMargin = 370;
      } else if (viewportWidth >= 424) {
        newBoxWidth = 250;
        additionalMargin = 380;
      } else if (viewportWidth <= 350) {
        newBoxWidth = 150;
        additionalMargin = 400;
      }

      const offsetX = viewportWidth / 2 - newBoxWidth / 2 + additionalMargin;
      setInitialOffsetX(offsetX); // Set the initial offset to position the first box in the center with right margin
      setBoxWidth(newBoxWidth); // Set the dynamic box width
    };

    updateDimensions(); // Initial setting of dimensions

    // Add event listener for resizing
    window.addEventListener("resize", updateDimensions);

    return () => {
      window.removeEventListener("resize", updateDimensions);
    };
  }, []);

  // Handle swipe direction
  const handleSwipe = (direction: string) => {
    if (direction === "left" && activeIndex < howWeMakeDiffSection.length - 1) {
      setActiveIndex((prevIndex) => prevIndex + 1);
    } else if (direction === "right" && activeIndex > 0) {
      setActiveIndex((prevIndex) => prevIndex - 1);
    }
  };

  return (
    <section className="font-['Switzer-Regular'] mb-40 mt-24">
      <div>
        <p className="text-6xl leading-relaxed font-['BespokeSerif-Regular'] font-bold md:w-[650px] sm:w-[450px] w-[250px]">
          HERE'S HOW WE MAKE A DIFFERENCE
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 mt-14">
        <p
          className="text-lg mt-20 mb-20 md:w-[80%] sm:w-[90%] leading-normal"
          dangerouslySetInnerHTML={{
            __html:
              howWeMakeDiffSection?.[activeIndex]?.belongingText ||
              "Default text goes here.",
          }}
        ></p>

        {/* Right-half swiper container */}
        <div className="relative w-full h-auto flex justify-center items-center overflow-hidden">
          <motion.div
            className="flex"
            initial={{ x: initialOffsetX }} // Set the initial offset
            animate={{ x: initialOffsetX - activeIndex * boxWidth }} // Adjust based on activeIndex and boxWidth
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            drag="x"
            dragConstraints={{
              left:
                initialOffsetX - (howWeMakeDiffSection.length - 1) * boxWidth,
              right: initialOffsetX,
            }} // Restrict dragging to available swipes
            onDragEnd={(_, info) => {
              // Detect swipe direction
              if (info.offset.x < -50) {
                handleSwipe("left");
              } else if (info.offset.x > 50) {
                handleSwipe("right");
              }
            }}
          >
            {howWeMakeDiffSection.map((box, index) => (
              <motion.div
                key={box.id}
                className={`flex-none rounded-xl text-white p-10 mr-10 h-[600px]`}
                style={{
                  width: `${boxWidth}px`,
                  backgroundColor: lightenColor(
                    primaryColor,
                    index * 10 // Increase lightening percentage for each subsequent box
                  ),
                }}
              >
                <div className="h-[20%] flex items-center">
                  {/* Use index + 1 instead of box.id */}
                  <p className="text-4xl xl:-mt-10 lg:-mt-5">{index + 1}</p>
                  <i className={`text-4xl ${box.iconSVG}`}></i>
                </div>
                <div className="h-[65%]">
                  <h3 className="text-4xl xl:text-5xl lg:text-4xl md:text-3xl leading-snug my-4 w-[200px]">
                    {box.title}
                  </h3>
                  <p className="text-xl leading-relaxed mt-10">
                    {box.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HowWeMakeDifference;
