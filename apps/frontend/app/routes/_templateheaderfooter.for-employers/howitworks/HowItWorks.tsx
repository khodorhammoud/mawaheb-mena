import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import MainHeading from "../../../common/MainHeading";
import FeatureCard from "./Card";
import "../../../styles/wavy/wavy.css";

const features = [
  {
    step: "Step 01",
    title: "Get in Touch",
    description:
      "Start by reaching out to our team to begin the process. Whether you have a clear vision or need guidance, we're here to assist you every step of the way.",
    imageUrl:
      "https://www.fivebranches.edu/wp-content/uploads/2021/08/default-image.jpg",
  },
  {
    step: "Step 02",
    title: "Define Your Vision",
    description:
      "Let's delve into the specifics of your jobs. Share your objectives, requirements, and any preferences you have regarding the skill set or experience of the freelancer you're looking for.",
    imageUrl:
      "https://www.fivebranches.edu/wp-content/uploads/2021/08/default-image.jpg",
  },
  {
    step: "Step 03",
    title: "AI-Powered Matchmaking",
    description:
      "Our cutting-edge AI matching tool will analyze your job details and match you with the most suitable freelancer from our talented pool. With precision and efficiency, we ensure you're paired with the perfect match.",
    imageUrl:
      "https://www.fivebranches.edu/wp-content/uploads/2021/08/default-image.jpg",
  },
  {
    step: "Step 04",
    title: "Unlock Success",
    description:
      "Once the match is made, you're on your way to success. Leverage the expertise of your matched freelancer as they bring your jobs to life. From development to delivery, we're dedicated to ensuring your satisfaction and the success of your jobs.",
    imageUrl:
      "https://www.fivebranches.edu/wp-content/uploads/2021/08/default-image.jpg",
  },
];

export default function FeaturesSection() {
  const [lineRevealed, setLineRevealed] = useState([false, false, false]);

  const ref1 = useRef(null);
  const ref2 = useRef(null);
  const ref3 = useRef(null);

  useEffect(() => {
    const observerOptions = [
      { threshold: 0.8 },
      { threshold: 1 },
      { threshold: 0.4 },
    ];

    const observer1 = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        setLineRevealed((prev) => {
          const updatedState = [...prev];
          if (entry.isIntersecting) {
            updatedState[0] = true;
          } else if (entry.boundingClientRect.top >= 0) {
            updatedState[0] = false;
          }
          return updatedState;
        });
      });
    }, observerOptions[0]);

    const observer2 = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        setLineRevealed((prev) => {
          const updatedState = [...prev];
          if (entry.isIntersecting) {
            updatedState[1] = true;
          } else if (entry.boundingClientRect.top >= 0) {
            updatedState[1] = false;
          }
          return updatedState;
        });
      });
    }, observerOptions[1]);

    const observer3 = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        setLineRevealed((prev) => {
          const updatedState = [...prev];
          if (entry.isIntersecting) {
            updatedState[2] = true;
          } else if (entry.boundingClientRect.top >= 0) {
            updatedState[2] = false;
          }
          return updatedState;
        });
      });
    }, observerOptions[2]);

    if (ref1.current) observer1.observe(ref1.current);
    if (ref2.current) observer2.observe(ref2.current);
    if (ref3.current) observer3.observe(ref3.current);

    return () => {
      observer1.disconnect();
      observer2.disconnect();
      observer3.disconnect();
    };
  }, []);

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
      {/* The overflow-hidden on the section will help prevent unwanted scrolling */}
      <MainHeading title="HOW IT WORKS" />
      <div className="xl:px-6 lg:mt-0">
        <div className="relative xl:-mt-20 lg:-mt-20">
          <div className="sm:grid sm:grid-cols-1 sm:place-items-center flex flex-col w-36 sm:w-auto gap-y-10 relative mt-20 xl:grid-cols-2 xl:gap-x-20 xl:mx-48 xl:gap-y-20 lg:mt-28 lg:grid-cols-2 lg:gap-y-14">
            {features.map((feature, index) => (
              <div
                key={index}
                ref={index === 0 ? ref1 : index === 1 ? ref2 : ref3}
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
                  step={feature.step}
                  title={feature.title}
                  description={feature.description}
                  imageUrl={feature.imageUrl}
                />
                {index === 0 && (
                  <motion.svg
                    width="350"
                    height="1"
                    viewBox="0 0 260 1"
                    className="block rotate-90 transform absolute left-[25px] lg:top-60 xl:left-[275px] lg:left-[318px] lg:translate-y-1/2 lg:rotate-45 -z-10 md:animated-line-1"
                    initial="hidden"
                    animate={lineRevealed[0] ? "visible" : "hidden"}
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
                    className="block rotate-90 absolute transform left-[80px] lg:top-[515px] xl:left-[-150px] lg:left-[-240px] lg:translate-y-1/2 -z-10 lg:animated-line-2 lg:rotate-0"
                    initial="hidden"
                    animate={lineRevealed[1] ? "visible" : "hidden"}
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
                    // this have a special dealing, sice step 3 is not aligned as the others at md screens, so to make its line responsive at md, i make it md:relative not md:absolutr 👍⭐
                    initial="hidden"
                    animate={lineRevealed[2] ? "visible" : "hidden"}
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
