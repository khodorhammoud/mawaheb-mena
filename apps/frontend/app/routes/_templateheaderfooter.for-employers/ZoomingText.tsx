import {
  motion,
  useTransform,
  MotionValue,
  AnimatePresence,
} from "framer-motion";
import { useEffect, useState } from "react";
import Testimonials from "./Testimonials";

interface ZoomingTextProps {
  scrollY: MotionValue<number>;
  fingerIconPosition?: {
    top?: string;
    left?: string;
    right?: string;
    bottom?: string;
  };
}

const ZoomingText: React.FC<ZoomingTextProps> = ({
  scrollY,
  fingerIconPosition,
}) => {
  const [showFingerIcon, setShowFingerIcon] = useState<boolean>(false);

  // Responsive position values
  const [positionYP1Value, setPositionYP1Value] = useState("40vh");
  const [positionYP2Value, setPositionYP2Value] = useState("40vh");

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1200) {
        setPositionYP1Value("40vh");
        setPositionYP2Value("30vh");
      } else if (window.innerWidth > 800) {
        setPositionYP1Value("30vh");
        setPositionYP2Value("20vh");
      } else {
        setPositionYP1Value("20vh");
        setPositionYP2Value("10vh");
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Scale and position transformations
  const zoomScaleP1 = useTransform(scrollY, [30, 200], [0.6, 1]);
  const positionYP1 = useTransform(
    scrollY,
    [30, 200],
    [positionYP1Value, "5vh"]
  );

  const zoomScaleP2 = useTransform(scrollY, [30, 200], [0.6, 1]);
  const positionYP2 = useTransform(
    scrollY,
    [30, 200],
    [positionYP2Value, "-5vh"]
  );

  // Testimonials opacity and scale
  const zoomScaleTestimonials = useTransform(scrollY, [30, 200], [0.4, 0.6]);
  const opacityTestimonials = useTransform(scrollY, [150, 200], [0, 1]);

  return (
    <div className="flex flex-col items-center justify-between overflow-visible min-h-screen">
      {/* Finger Icon */}
      <AnimatePresence>
        {showFingerIcon && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute z-10"
            style={{
              top: fingerIconPosition?.top || "910px",
              left: fingerIconPosition?.left || "50%",
              transform: "translate(-50%, -50%)",
            }}
          >
            <motion.div className="text-4xl bg-slate-100 rounded-2xl p-2 text-white fill-white stroke-black">
              <div className="inline-block fingerAnimation">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="30"
                  height="30"
                  viewBox="0 0 42 42"
                  className=""
                >
                  <path d="M 13 2 C 11.355469 2 10 3.355469 10 5 L 10 16.8125 L 9.34375 16.125 L 9.09375 15.90625 C 7.941406 14.753906 6.058594 14.753906 4.90625 15.90625 C 3.753906 17.058594 3.753906 18.941406 4.90625 20.09375 L 13.09375 28.21875 C 14.535156 29.324219 16.253906 30 18.1875 30 L 19.90625 30 C 24.441406 30 28.09375 26.347656 28.09375 21.8125 L 28.09375 14 C 28.09375 12.355469 26.738281 11 25.09375 11 C 24.667969 11 24.273438 11.117188 23.90625 11.28125 C 23.578125 9.980469 22.394531 9 21 9 C 20.234375 9 19.53125 9.300781 19 9.78125 C 18.46875 9.300781 17.765625 9 17 9 C 16.648438 9 16.316406 9.074219 16 9.1875 L 16 5 C 16 3.355469 14.644531 2 13 2 Z" />
                </svg>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5 }}
      >
        {/* WHAT THEY SAY */}
        <motion.p
          style={{ scale: zoomScaleP1, y: positionYP1 }}
          className="text-center text-4xl font-bold mt-[70vh] 2xl:mt-[40vh]"
        >
          WHAT THEY SAY
        </motion.p>

        {/* Testimonials */}
        <motion.div
          style={{ scale: zoomScaleTestimonials, opacity: opacityTestimonials }}
        >
          <Testimonials setShowFingerIcon={setShowFingerIcon} />
        </motion.div>

        {/* ABOUT US */}
        <motion.p
          style={{ scale: zoomScaleP2, y: positionYP2 }}
          className="text-center text-4xl font-bold 2xl:mt-[5vh]"
        >
          ABOUT US
        </motion.p>
      </motion.div>
    </div>
  );
};

export default ZoomingText;
