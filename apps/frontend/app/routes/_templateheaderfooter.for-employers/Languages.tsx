import { motion, useTransform, useMotionValue } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { useLoaderData } from "@remix-run/react"; // Import to access loader data
import ZoomingText from "./ZoomingText";

// Define the type for PreWhatTheySayAboutUs
interface PreWhatTheySayAboutUs {
  content: string;
}

interface LoaderData {
  preWhatTheySayAboutUs: PreWhatTheySayAboutUs;
}

const Languages: React.FC = () => {
  // Access the loader data
  const { preWhatTheySayAboutUs } = useLoaderData<LoaderData>();

  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [isCentered, setIsCentered] = useState(false); // To track if the element is centered
  const [animationPhase, setAnimationPhase] = useState(0); // 0 = initial, 1 = fade, 2 = zoom

  const scrollY = useMotionValue(0);

  // Fading effect for the initial text
  const fadeOpacity = useTransform(scrollY, [0, 30], [1, 0]);

  // Zoom effect for the ZoomingText component
  const zoomScale = useTransform(scrollY, [30, 200], [0, 1]);
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
      { threshold: 0 } // the speen of dispearance of what-they-say-about-us section
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
    <div style={{ overflow: "", position: "relative" }}>
      <motion.div
        ref={ref}
        initial={{ opacity: 1, y: 0 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: -50 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center justify-center gap-8 lg:text-3xl text-2xl my-48 font-semibold font-['BespokeSerif-Variable'] lg:w-[650px] mx-auto"
        style={{ minHeight: "calc(120vh - 100px)" }} // the lower the number in the right is, the more hight the wtsau section is :)
      >
        {/* Use content from PreWhatTheySayAboutUs */}
        <motion.div initial={{ opacity: 1 }} style={{ opacity: fadeOpacity }}>
          {/* Use the content from PostHowItWorks */}
          {/* First Line Centered */}
          <p className="text-center">
            {preWhatTheySayAboutUs.content.split("\n")[0]}
          </p>

          {/* Second Line Centered */}
          {/* i can delete that */}
          <p className="text-center">
            {preWhatTheySayAboutUs.content.split("\n")[1]}
          </p>
        </motion.div>

        {/* Zooming Text Component */}
        <motion.div
          style={{
            position: "absolute",
            scale: zoomScale,
            opacity: zoomOpacity,
          }}
          className="text-4xl font-['BespokeSerif-Variable']" // edit this value if you need to
        >
          <ZoomingText scrollY={scrollY} />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Languages;
