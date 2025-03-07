import { motion } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { useLoaderData } from "@remix-run/react"; // Import to access loader data

// Define the type for PostHowItWorksItem
interface PostHowItWorksItem {
  content: string;
}

interface LoaderData {
  postHowItWorks: PostHowItWorksItem;
}

const Segments = () => {
  // Access the loader data
  const { postHowItWorks } = useLoaderData<LoaderData>();

  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
      },
      {
        threshold: 0.1, // what it trake for segments section to appear :)
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
      animate={inView ? { opacity: 1, y: 50 } : { opacity: 0, y: 0 }} // the speed of popping from segments to languaged is detected here, to make it faster, make second y=50 :)
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center gap-8 mt-[200px] lg:text-7xl text-5xl font-semibold font-['BespokeSerif-Variable'] lg:w-[850px] mx-auto"
      style={{ minHeight: "calc(120vh - 400px)" }}
    >
      {/* Use the content from PostHowItWorks */}
      {/* First Line Centered */}
      <p className="text-center">{postHowItWorks.content.split("\n")[0]}</p>

      {/* Second Line Centered */}
      <p className="text-center">{postHowItWorks.content.split("\n")[1]}</p>
    </motion.div>
  );
};

export default Segments;
