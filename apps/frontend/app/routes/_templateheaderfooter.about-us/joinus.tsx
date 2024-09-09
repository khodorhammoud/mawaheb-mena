import React, { useState } from "react";
import { motion } from "framer-motion";

const JoinUs: React.FC = () => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="min-h-[80vh] bg-gradient-to-r px-10 from-primaryColor to-blue-200 flex items-center justify-center font-['Switzer-Regular'] my-40">
      {/* Left section: Title and Paragraph */}
      <div className="w-1/2 pr-10">
        <h1 className="text-6xl font-semibold text-white font-['BespokeSerif-Regular'] mb-12">
          WANT TO JOIN US
        </h1>
        <p className="text-lg text-white font-sans w-[95%]">
          We're on a mission to revolutionize the freelance industry. If you're
          ready to be part of an innovative team that's making a real impact, we
          want to hear from you. Let's create change together.
        </p>
      </div>

      {/* Right section: Circular Button with Hover Animation */}
      <div
        className="w-1/2 flex justify-center relative text-primaryColor"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Button */}
        <motion.a
          href="/contact-us"
          className="w-56 h-56 bg-slate-100 text-primaryColor rounded-full flex items-center justify-center text-lg font-bold shadow-lg relative overflow-hidden"
          style={{
            cursor: "pointer",
            textDecoration: "none",
            color: "inherit",
          }}
          transition={{ duration: 0.3 }}
        >
          apply@mawaheb.mena
          {/* Conditionally render the bubbles and animation on hover */}
          {isHovered && (
            <>
              {/* First Blue and White Bubble */}
              <motion.div
                className="absolute rounded-full z-10"
                style={{
                  width: "100px",
                  height: "100px",
                  bottom: "20px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  background:
                    "radial-gradient(circle,#27638A, rgba(255,255,255,0))", // Light blue to white
                  filter: "blur(6px)", // Slight blur
                }}
                animate={{
                  x: [59, -30, 50, -20, 49], // Moving left and right
                  y: [-40, 9, 95, -40, -40], // Moves up and down
                  opacity: [0.9, 0.8, 0.9, 1.2, 0.6], // Varying opacity
                }}
                transition={{
                  duration: 5, // Duration of the animation cycle
                  ease: "easeInOut", // Smooth easing
                  repeat: Infinity, // Infinite loop
                  repeatType: "reverse", // Reverse after each cycle
                }}
              />
              {/* Second Blue and White Bubble */}
              <motion.div
                className="absolute rounded-full"
                style={{
                  width: "150px",
                  height: "150px",
                  bottom: "120px",
                  left: "20%",
                  transform: "translateX(-50%)",
                  background:
                    "radial-gradient(circle, #27638A, rgba(255,255,255,0))", // Another light blue to white gradient
                  filter: "blur(8px)", // Slight blur
                }}
                animate={{
                  x: [18, -40, -20, -40, -18], // Moving right and left (opposite)
                  y: [128, -20, 19, -60, 68], // Moves down and up (opposite)
                  opacity: [0.8, 1.2, 0.8, 0.5, 0.9], // Varying opacity
                }}
                transition={{
                  duration: 5, // Duration of the animation cycle
                  ease: "easeInOut", // Smooth easing
                  repeat: Infinity, // Infinite loop
                  repeatType: "reverse", // Reverse after each cycle
                }}
              />
            </>
          )}
          {/* Continuous border rotation animation */}
          <motion.div
            className="absolute w-full h-full rounded-full"
            style={{
              borderTop: "2px solid #27638a", // Top border
              borderBottom: "2px solid #27638a", // Bottom border
            }}
            animate={{
              rotate: [0, 360], // Rotate around the button
            }}
            transition={{
              duration: 2, // Duration of one full rotation
              ease: "linear", // Keep the speed constant
              repeat: Infinity, // Infinite loop
            }}
          />
        </motion.a>
      </div>
    </div>
  );
};

export default JoinUs;
