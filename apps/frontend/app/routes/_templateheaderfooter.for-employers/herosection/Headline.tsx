// Headline Component
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function Headline() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Set a timeout to hide the SVG after the animation ends (2.8 seconds)
    const timeoutId = setTimeout(() => {
      setIsVisible(false); // Update state to hide the SVG
    }, 2400); // Match the duration of the animation (2.8 seconds)

    return () => clearTimeout(timeoutId); // Cleanup timeout on unmount
  }, []);

  return (
    <section className="text-center py-16 bg-white mt-28 relative z-50">
      <div className="container mx-auto px-4 relative">
        <h1 className="text-4xl md:text-6xl font-extrabold font-['BespokeSerif-Regular'] leading-relaxed relative">
          <div className="leading-relaxed">
            Your{' '}
            <span className="">
              {isVisible && (
                <svg // top-[-120px] right-[340px]
                  className="absolute top-[-120px] right-[370px] z-[0] transition-opacity duration-500  ease-out"
                  width="180"
                  height="120"
                  viewBox="0 0 180 180"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* ✅ Curve line with fade out */}
                  <path
                    id="swingPath"
                    d="M0 200 Q30 90 100 100 T210 40"
                    stroke="#ddd"
                    strokeWidth="2"
                    fill="none"
                  >
                    {/* ✅ Line disappears earlier */}
                    <animate
                      attributeName="opacity"
                      from="1"
                      to="0"
                      begin="2.6s"
                      dur="0.2s"
                      fill="freeze"
                    />
                  </path>

                  <circle r="8" fill="black" opacity="0">
                    {/* ✅ Ball appears */}
                    <animate
                      attributeName="opacity"
                      from="0"
                      to="1"
                      begin="0s"
                      dur="0.2s"
                      fill="freeze"
                    />
                    {/* ✅ Smooth motion with fix for jump */}
                    <animateMotion
                      begin="0s"
                      dur="2.6s"
                      repeatCount="1"
                      keyTimes="0; 0.5; 1"
                      keyPoints="1; 0.5; 0"
                      calcMode="spline"
                      keySplines="0.3 0.5 0.4 0.6; 0.2 0.1 0.3 1"
                      rotate="auto"
                      fill="freeze"
                    >
                      <mpath href="#swingPath" />
                    </animateMotion>

                    {/* ✅ Ball disappears cleanly */}
                    <animate
                      attributeName="opacity"
                      from="1"
                      to="0"
                      begin="2.6s"
                      dur="0.2s"
                      fill="freeze"
                    />
                  </circle>
                </svg>
              )}
              <span className="text-black z-[5000] bg-gray-200 rotation-animation inline-block px-6 md:px-8 rounded-[14px] relative mb-2">
                Gateway
              </span>
            </span>{' '}
            to{' '}
          </div>
          <div className="mt-2">Digital Excellence</div>
        </h1>

        <motion.div
          initial={{ y: '100vh' }}
          animate={{ y: 0 }}
          transition={{ type: 'spring', stiffness: 70, damping: 20 }}
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
