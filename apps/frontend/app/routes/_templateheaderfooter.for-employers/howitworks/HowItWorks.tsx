import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import MainHeading from "~/common/MainHeading"; //"~/  common/MainHeading";
import FeatureCard from "./Card";
import "~/styles/wavy/wavy.css";
import { GET_HOW_IT_WORKS_QUERY } from "../../../../../shared/cms-queries";
import { fetchCMSData } from "~/api/fetch-cms-data.server";

export default function FeaturesSection() {
  const [features, setFeatures] = useState([]); // Dynamic features array
  const [lineRevealed, setLineRevealed] = useState([]); // Dynamic line reveal state

  const featureRefs = useRef([]); // Create refs for all feature items

  // Fetch the HowItWorks data using the GET_HOW_IT_WORKS_QUERY
  useEffect(() => {
    async function fetchHowItWorks() {
      try {
        const response = await fetch(
          `${process.env.CMS_BASE_URL}/api/graphql`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              query: GET_HOW_IT_WORKS_QUERY,
            }),
          }
        );

        const data = await fetchCMSData(GET_HOW_IT_WORKS_QUERY);
        if (data) {
          const sortedData = data.howItWorksItems.sort(
            (a, b) => parseInt(a.stepNb) - parseInt(b.stepNb)
          );
          setFeatures(sortedData);
          setLineRevealed(Array(sortedData.length).fill(false)); // Initialize lineRevealed based on features count
        }
      } catch (error) {
        console.error("Error fetching HowItWorks data:", error);
      }
    }
  }, []);

  // Create IntersectionObserver to handle line reveal
  useEffect(() => {
    const observerOptions = { threshold: 0.5 }; // Adjust threshold if necessary

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const index = featureRefs.current.indexOf(entry.target);
        if (entry.isIntersecting) {
          setLineRevealed((prev) => {
            const updated = [...prev];
            updated[index] = true;
            return updated;
          });
        } else {
          setLineRevealed((prev) => {
            const updated = [...prev];
            updated[index] = false;
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
  }, [features]); // Re-run observer setup when features change

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
            {features.map((feature, index) => (
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
                  imageUrl={feature.imageURL || "https://default-image-url.com"}
                />
                {index === 0 && (
                  <motion.svg
                    width="350"
                    height="1"
                    viewBox="0 0 260 1"
                    className="block rotate-90 transform absolute left-[25px] lg:top-60 xl:left-[275px] lg:left-[318px] lg:translate-y-1/2 lg:rotate-45 -z-10 md:animated-line-1"
                    initial="hidden"
                    animate={lineRevealed[index] ? "visible" : "hidden"} // Dynamic line reveal
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
