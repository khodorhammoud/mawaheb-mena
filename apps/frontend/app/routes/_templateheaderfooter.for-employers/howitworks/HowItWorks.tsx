import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import MainHeading from "../../../common/MainHeading";
import FeatureCard from "./Card";
import "../../../styles/wavy/wavy.css";
import { useLoaderData } from "@remix-run/react";

export default function HowItWorks() {
  const [lineRevealed, setLineRevealed] = useState<boolean[]>([]); // Dynamic line reveal state
  const featureRefs = useRef<HTMLDivElement[]>([]); // Create refs for all feature items

  const pageData = useLoaderData<{
    howItWorksItems: any[];
  }>();

  useEffect(() => {
    // Initialize the revealed state
    setLineRevealed(Array(pageData.howItWorksItems.length).fill(false));

    // Set up the IntersectionObserver
    const observerOptions = { threshold: 0.5 };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const index = featureRefs.current.indexOf(
          entry.target as HTMLDivElement
        );
        if (index >= 0) {
          setLineRevealed((prev) => {
            const updated = [...prev];
            updated[index] = entry.isIntersecting;
            return updated;
          });
        }
      });
    }, observerOptions);

    // Observe each feature card
    featureRefs.current.forEach((ref) => ref && observer.observe(ref));

    return () => {
      featureRefs.current.forEach((ref) => ref && observer.unobserve(ref));
    };
  }, [pageData.howItWorksItems]);

  const draw = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: { duration: 1, delay: 0.5 },
    },
  };

  return (
    <section className="font-['Switzer-Variable'] sm:overflow-hidden mb-28">
      <MainHeading title="HOW IT WORKS" />
      <div className="xl:px-6 lg:mt-0">
        <div className="relative xl:-mt-20 lg:-mt-20">
          <div className="sm:grid sm:grid-cols-1 sm:place-items-center flex flex-col w-36 sm:w-auto gap-y-10 relative mt-20 xl:grid-cols-2 xl:gap-x-20 xl:mx-48 xl:gap-y-20 lg:mt-28 lg:grid-cols-2 lg:gap-y-14">
            {pageData.howItWorksItems &&
              pageData.howItWorksItems.map((feature, index) => (
                <div
                  key={index}
                  ref={(el) => (featureRefs.current[index] = el)} // Assign ref dynamically
                  className={`relative ${
                    index === 0
                      ? "lg:-mt-20 xl:-mt-12"
                      : index === 1
                        ? "lg:mt-32 xl:mt-40"
                        : index === 2
                          ? "lg:-mt-60 xl:-mt-64 lg:ml-[0px] md:ml-[400px]"
                          : "lg:mt-20 xl:mt-10"
                  }`}
                >
                  <FeatureCard
                    step={`Step ${feature.stepNb < 10 ? `0${feature.stepNb}` : feature.stepNb}`}
                    title={feature.title}
                    description={feature.description}
                    imageUrl={
                      feature.imageURL || "https://default-image-url.com"
                    }
                  />
                  {index === 0 && (
                    <motion.svg
                      width="350"
                      height="1"
                      viewBox="0 0 260 1"
                      className="block rotate-90 transform absolute left-[25px] lg:top-60 xl:left-[275px] lg:left-[318px] lg:translate-y-1/2 lg:rotate-45 -z-10 md:animated-line-1"
                      initial="hidden"
                      animate={lineRevealed[index] ? "visible" : "hidden"}
                      variants={draw}
                    >
                      <motion.line
                        x1="0"
                        y1="1"
                        x2="350"
                        y2="1"
                        stroke="gray"
                        strokeWidth="2"
                      />
                    </motion.svg>
                  )}
                  {index === 1 && (
                    <motion.svg
                      width="240"
                      height="1"
                      viewBox="0 0 200 1"
                      className="block rotate-90 absolute transform left-[80px] lg:top-[515px] xl:left-[-190px] lg:left-[-240px] lg:translate-y-1/2 -z-10 lg:animated-line-2 lg:rotate-0"
                      initial="hidden"
                      animate={lineRevealed[index] ? "visible" : "hidden"} // Dynamic line reveal
                      variants={draw}
                    >
                      <motion.line
                        x1="0"
                        y1="1"
                        x2="240"
                        y2="1"
                        stroke="gray"
                        strokeWidth="2"
                      />
                    </motion.svg>
                  )}
                  {index === 2 && (
                    <motion.svg
                      width="800"
                      height="1"
                      viewBox="0 0 5 1"
                      className="block rotate-90 absolute transform left-[-200px] md:block md:rotate-90 md:relative md:transform md:left-[-200px] lg:absolute lg:top-[180px] xl:left-[-100px] lg:left-[-50px] lg:transform lg:translate-y-1/2 -z-10 lg:rotate-45 lg:animated-line-3"
                      initial="hidden"
                      animate={lineRevealed[index] ? "visible" : "hidden"} // Dynamic line reveal
                      variants={draw}
                    >
                      <motion.line
                        x1="0"
                        y1="1"
                        x2="875"
                        y2="1"
                        stroke="gray"
                        strokeWidth="2"
                      />
                    </motion.svg>
                  )}
                </div>
              ))}
          </div>
        </div>
      </div>
    </section>
  );
}
