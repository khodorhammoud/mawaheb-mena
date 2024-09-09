import { motion, useTransform, useMotionValue } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import ZoomingText from "./ZoomingText";

const Languages: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [isCentered, setIsCentered] = useState(false); // To track if the element is centered
  const [animationPhase, setAnimationPhase] = useState(0); // 0 = initial, 1 = fade, 2 = zoom

  const scrollY = useMotionValue(0);

  // Fading effect for the initial text
  const fadeOpacity = useTransform(scrollY, [0, 30], [1, 0]);

  // Zoom effect for the ZoomingText component
  const zoomScale = useTransform(scrollY, [30, 200], [1.5, 2]);
  const zoomOpacity = useTransform(scrollY, [30, 200], [0, 1]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
        if (!entry.isIntersecting) {
          setAnimationPhase(0); // Reset when out of view
          setIsCentered(false); // Reset centering state
        }
      },
      { threshold: 0.1 }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [ref]);

  useEffect(() => {
    const handleScroll = () => {
      if (ref.current && inView) {
        const scrollPosition = window.scrollY;
        const elementTop =
          ref.current.getBoundingClientRect().top + window.scrollY;
        const targetScroll =
          elementTop - window.innerHeight / 2 + ref.current.offsetHeight / 2;

        // Center the element if it's not centered yet
        if (!isCentered) {
          window.scrollTo({
            top: targetScroll,
            behavior: "smooth",
          });
          setIsCentered(true);
        }

        // Start animations only after centering is done
        if (isCentered && scrollPosition >= targetScroll) {
          scrollY.set(scrollPosition - targetScroll);

          // Trigger fade when centered
          if (scrollY.get() >= 100 && animationPhase === 0) {
            setAnimationPhase(1); // Move to zoom phase after fade-out
          }

          // Trigger zoom after fade
          if (scrollY.get() >= 200 && animationPhase === 1) {
            setAnimationPhase(2); // Continue normal scroll after zoom
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [inView, isCentered, animationPhase, scrollY]);

  useEffect(() => {
    // Ensure no horizontal scroll when zooming
    document.body.style.overflowX = "hidden";
    return () => {
      document.body.style.overflowX = "auto"; // Reset to default
    };
  }, []);

  return (
    <div
      style={{ overflow: "", position: "relative" }} // Ensure no overflow
    >
      <motion.div
        ref={ref}
        initial={{ opacity: 1, y: 0 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: -50 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center justify-center gap-8 text-3xl my-[200px] font-semibold font-['BespokeSerif-Variable']"
        style={{ minHeight: "calc(120vh - 300px)" }}
      >
        {/* Initial Text */}
        <motion.div
          initial={{ opacity: 1 }}
          style={{ opacity: fadeOpacity }}
          transition={{ duration: 0.5 }}
        >
          <p>Python / Java / C# / C++ / Ruby / PHP / React /</p>
          <p>Angular / Vue.js / Django / Ruby on Rails</p>
        </motion.div>

        {/* Zooming Text Component */}
        <motion.div
          style={{
            position: "absolute",
            scale: zoomScale,
            opacity: zoomOpacity,
          }}
          className="text-4xl font-['BespokeSerif-Variable']"
        >
          <ZoomingText scrollY={scrollY} />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Languages;
