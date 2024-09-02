import { motion } from "framer-motion";
import { useRef, useEffect, useState } from "react";

const Segments = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
        } else {
          setInView(false);
        }
      },
      {
        threshold: 0.2,
      }
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
    if (inView && ref.current) {
      const elementTop =
        ref.current.getBoundingClientRect().top + window.scrollY;
      const targetScroll =
        elementTop - window.innerHeight / 2 + ref.current.offsetHeight / 2;

      window.scrollTo({
        top: targetScroll,
        behavior: "smooth",
      });
    }
  }, [inView]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 50 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center gap-8 text-7xl my-[200px] font-semibold font-['BespokeSerif-Variable']"
      style={{ minHeight: "calc(120vh - 400px)" }}
    >
      <p>SEGMENTS THAT WE</p>
      <p>ARE HAPPY OF WORK</p>
    </motion.div>
  );
};

export default Segments;
