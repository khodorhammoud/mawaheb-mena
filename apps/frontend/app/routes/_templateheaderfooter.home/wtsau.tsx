import { motion, useTransform, MotionValue } from "framer-motion";
import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import Testimonials from "./testimonials";

// Define props interface
interface WtsauProps {
  scrollY: MotionValue<number>;
}

const Wtsau: React.FC<WtsauProps> = ({ scrollY }) => {
  const [showFingerIcon, setShowFingerIcon] = useState<boolean>(true);

  // Transformations for different scales
  const zoomScaleP = useTransform(scrollY, [30, 200], [0.5, 1]);
  const zoomScaleTestimonials = useTransform(scrollY, [30, 200], [0.1, 0.3]);

  // Handle swipe or scroll event to hide the finger icon
  const handleInteraction = () => {
    setShowFingerIcon(false);
  };

  return (
    <div
      className="flex flex-col items-center justify-between"
      onScroll={handleInteraction}
    >
      {/* Animated Finger Icon for Scrolling Instruction */}
      <AnimatePresence>
        {showFingerIcon && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute top-[355px] left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10"
          >
            <motion.div className="text-4xl bg-slate-100 rounded-2xl scroll-pb-6 pl-2 pt-1 pr-1 fixed-background bg-opacity-70">
              <div className="inline-block fingerAnimation">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  x="0px"
                  y="0px"
                  width="30"
                  height="30"
                  viewBox="0 0 42 42"
                >
                  <path d="M 13 2 C 11.355469 2 10 3.355469 10 5 L 10 16.8125 L 9.34375 16.125 L 9.09375 15.90625 C 7.941406 14.753906 6.058594 14.753906 4.90625 15.90625 C 3.753906 17.058594 3.753906 18.941406 4.90625 20.09375 L 4.90625 20.125 L 13.09375 28.21875 L 13.15625 28.25 L 13.1875 28.3125 C 14.535156 29.324219 16.253906 30 18.1875 30 L 19.90625 30 C 24.441406 30 28.09375 26.347656 28.09375 21.8125 L 28.09375 14 C 28.09375 12.355469 26.738281 11 25.09375 11 C 24.667969 11 24.273438 11.117188 23.90625 11.28125 C 23.578125 9.980469 22.394531 9 21 9 C 20.234375 9 19.53125 9.300781 19 9.78125 C 18.46875 9.300781 17.765625 9 17 9 C 16.648438 9 16.316406 9.074219 16 9.1875 L 16 5 C 16 3.355469 14.644531 2 13 2 Z M 13 4 C 13.554688 4 14 4.445313 14 5 L 14 16 L 16 16 L 16 12 C 16 11.445313 16.445313 11 17 11 C 17.554688 11 18 11.445313 18 12 L 18 16 L 20 16 L 20 12 C 20 11.445313 20.445313 11 21 11 C 21.554688 11 22 11.445313 22 12 L 22 16 L 24.09375 16 L 24.09375 14 C 24.09375 13.445313 24.539063 13 25.09375 13 C 25.648438 13 26.09375 13.445313 26.09375 14 L 26.09375 21.8125 C 26.09375 25.277344 23.371094 28 19.90625 28 L 18.1875 28 C 16.722656 28 15.457031 27.476563 14.40625 26.6875 L 6.3125 18.6875 C 5.867188 18.242188 5.867188 17.757813 6.3125 17.3125 C 6.757813 16.867188 7.242188 16.867188 7.6875 17.3125 L 12 21.625 L 12 5 C 12 4.445313 12.445313 4 13 4 Z "></path>
                </svg>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5 }}
        className="flex flex-col items-center"
      >
        {/* Zoom for "WHAT THEY SAY" */}
        <motion.p
          style={{
            scale: zoomScaleP,
            marginBottom: "", // Ensure space below the text
            transformOrigin: "center", // Scaling occurs from the center
          }}
          className="text-center mt-60 select-none"
        >
          WHAT THEY SAY
        </motion.p>

        {/* Zoom for Testimonials component */}
        <motion.div
          style={{
            scale: zoomScaleTestimonials,
            width: "100%", // Ensures testimonials take up full width
            display: "flex",
            justifyContent: "center",
          }}
          className="text-center"
        >
          <Testimonials onSwipe={handleInteraction} />
        </motion.div>

        {/* Zoom for "ABOUT US" */}
        <motion.p
          style={{
            scale: zoomScaleP,
            marginTop: "", // Ensure space above the text
            transformOrigin: "center", // Scaling occurs from the center
          }}
          className="text-center mt-52 select-none"
        >
          ABOUT US
        </motion.p>
      </motion.div>
    </div>
  );
};

export default Wtsau;
