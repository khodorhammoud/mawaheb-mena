import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import MainHeading from "~/common/main_heading";
import FeatureCard from "./card";
import "~/styles/wavy/wavy.css";

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
      { threshold: 0.6 }, // For the first line, triggers when 50% is visible
      { threshold: 0.9 }, // For the second line, triggers when 80% is visible (more centered)
      { threshold: 0.5 }, // For the third line, triggers when 50% is visible
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
    <section className="py-16 font-['Switzer-Variable']">
      <MainHeading title="HOW IT WORKS" />
      <div className="container mx-auto px-4">
        <div className="relative -mt-20">
          <div className="grid grid-cols-1 md:grid-cols-2 mx-40 gap-y-20 relative place-items-center mt-40">
            {features.map((feature, index) => (
              <div
                key={index}
                className="relative"
                ref={index === 0 ? ref1 : index === 1 ? ref2 : ref3}
                style={{
                  marginTop:
                    index < 2
                      ? index % 2 === 0
                        ? "-150px"
                        : "120px"
                      : index % 2 === 0
                        ? "-230px"
                        : "20px",
                }}
              >
                <FeatureCard
                  step={feature.step}
                  title={feature.title}
                  description={feature.description}
                  imageUrl={feature.imageUrl}
                />
                {index === 0 && (
                  <motion.svg
                    width="160"
                    height="1"
                    viewBox="0 0 160 1"
                    className="absolute top-60 left-[375px] transform translate-y-1/2 rotate-45 -z-10 animated-line-1"
                    initial="hidden"
                    animate={lineRevealed[0] ? "visible" : "hidden"}
                    variants={draw}
                  >
                    <motion.line
                      x1="0"
                      y1="1"
                      x2="160"
                      y2="1"
                      stroke="gray"
                      strokeWidth="2"
                    />
                  </motion.svg>
                )}
                {index === 1 && (
                  <motion.svg
                    width="200"
                    height="1"
                    viewBox="0 0 160 1"
                    className="absolute top-[515px] left-[-150px] transform translate-y-1/2 -z-10 animated-line-2"
                    initial="hidden"
                    animate={lineRevealed[1] ? "visible" : "hidden"}
                    variants={draw}
                  >
                    <motion.line
                      x1="0"
                      y1="1"
                      x2="160"
                      y2="1"
                      stroke="gray"
                      strokeWidth="2"
                    />
                  </motion.svg>
                )}
                {index === 2 && (
                  <motion.svg
                    width="1100"
                    height="1"
                    viewBox="0 0 10 1"
                    className="absolute top-[250px] left-[-150px] transform translate-y-1/2 -z-10 rotate-45 animated-line-3"
                    initial="hidden"
                    animate={lineRevealed[2] ? "visible" : "hidden"}
                    variants={draw}
                  >
                    <motion.line
                      x1="0"
                      y1="1"
                      x2="165"
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
