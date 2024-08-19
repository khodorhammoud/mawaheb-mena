// Headline Component
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function Headline() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Set a timeout to hide the SVG after the animation ends (2.8 seconds)
    const timeoutId = setTimeout(() => {
      setIsVisible(false); // Update state to hide the SVG
    }, 2800); // Match the duration of the animation (2.8 seconds)

    return () => clearTimeout(timeoutId); // Cleanup timeout on unmount
  }, []);

  return (
    <section className="text-center py-16 bg-white mt-28 relative z-50">
      <div className="container mx-auto px-4 relative">
        <h1 className="text-4xl md:text-6xl font-extrabold font-['BespokeSerif-Regular'] leading-relaxed relative">
          <div className="leading-relaxed">
            Your{" "}
            <span className="bg-black rotation-animation inline-block px-6 md:px-8 rounded-[14px] relative z-[100]">
              {isVisible && (
                <svg
                  className="absolute top-[-110px] -right-28 z-[1000] transition-opacity duration-500 ease-out"
                  width="180"
                  height="110"
                  viewBox="0 0 200 200"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    id="swingPath"
                    d="M0 200 Q30 90 100 100 T200 40"
                    stroke="#ddd"
                    strokeWidth="2"
                    fill="none"
                  />
                  <circle r="10" fill="black" opacity="0">
                    {/* Make the ball appear right before the animation starts */}
                    <animate
                      attributeName="opacity"
                      from="0"
                      to="1"
                      begin="0.1s" // Start the appearance right before the motion
                      dur="0.1s" // Short duration to make it appear
                      fill="freeze" // Stay visible after appearing
                    />
                    <animateMotion
                      begin="0.1s" // Start the motion after the ball becomes visible
                      dur="2.8s" // Set the duration to 2.8 seconds
                      repeatCount="1" // Make the animation run only once
                      keyPoints="1;0" // Reverse the direction of the animation
                      rotate="auto"
                      keyTimes="0;1"
                      calcMode="linear"
                    >
                      <mpath href="#swingPath" />
                    </animateMotion>
                    {/* Hide the ball right after the animation ends */}
                    <animate
                      attributeName="opacity"
                      from="1"
                      to="0"
                      begin="2.9s" // Start just after the motion animation ends
                      dur="0.1s" // Short duration to make it disappear
                      fill="freeze" // Stay hidden after disappearing
                    />
                  </circle>
                </svg>
              )}
              <span className="text-white inline-block -rotate-3">Gateway</span>
            </span>{" "}
            to{" "}
          </div>
          <div className="mt-2">Digital Excellence</div>
        </h1>

        <motion.div
          initial={{ y: "100vh" }}
          animate={{ y: 0 }}
          transition={{ type: "spring", stiffness: 70, damping: 20 }}
        >
          <p className="pt-7 text-lg mt-4 text-black font-['Switzer-Regular']">
            Mawaheb MENA a platform where you can find top talent,
            <br />
            drive innovation, and achieve your business goals.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
