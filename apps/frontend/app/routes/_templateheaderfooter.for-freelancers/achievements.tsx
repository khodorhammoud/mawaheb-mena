import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "~/styles/wavy/wavy.css";

type Achievement = {
  title: string;
  count: number;
  description: string;
};

const achievements: Achievement[] = [
  {
    title: "Open Jobs Opportunities",
    count: 100,
    description:
      "Our platform currently offers a multitude of open job opportunities, connecting freelancers with diverse jobs and clients seeking their expertise.",
  },
  {
    title: "Jobs are done",
    count: 40,
    description:
      "Our platform has facilitated over 40 successful jobs, delivering exceptional results for clients and freelancers alike.",
  },
  {
    title: "Jobs posted",
    count: 50,
    description:
      "Over 200 jobs were posted via our platform, providing ample opportunities for freelancers to find work.",
  },
];

const Achievements: React.FC = () => {
  return (
    <div className="mx-4 flex flex-col mt-32">
      <h2 className="text-4xl font-bold mb-8 ml-2 font-['BespokeSerif-Regular']">
        ACHIEVEMENTS
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {achievements.map((achievement, index) => (
          <div
            key={index}
            className="bg-white border border-gray-200 shadow-xl p-6 flex flex-col rounded-xl"
          >
            <h3 className="text-lg font-bold mb-4">{achievement.title}</h3>
            <AnimatedCount count={achievement.count} />
            <p className="text-sm text-gray-600 mt-6 pt-3 border-t-[2px]">
              {achievement.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

interface AnimatedCountProps {
  count: number;
}

const AnimatedCount: React.FC<AnimatedCountProps> = ({ count }) => {
  const [currentValue, setCurrentValue] = useState<number>(0);
  const [hasAnimated, setHasAnimated] = useState<boolean>(false);
  const elementRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            setHasAnimated(true);
          }
        });
      },
      { threshold: 0.3 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
    };
  }, [hasAnimated]);

  useEffect(() => {
    if (hasAnimated) {
      let currentNumber = 0;

      const interval = setInterval(() => {
        if (currentNumber < count) {
          currentNumber += 10;
          setCurrentValue(currentNumber);
        } else {
          clearInterval(interval);
        }
      }, 300); // Faster animation

      return () => clearInterval(interval);
    }
  }, [hasAnimated, count]);

  return (
    <div
      ref={elementRef}
      className="relative h-16 overflow-hidden flex justify-end items-center text-7xl font-bold text-gray-800 ml-20"
    >
      <div className="flex items-center">
        <AnimatePresence>
          <motion.div
            key={currentValue}
            initial={{ y: "100%" }} // Start from below
            animate={{ y: "0%" }} // Move to center
            exit={{ y: "-100%" }} // Move straight up and fade out
            transition={{ duration: 0.2, ease: "easeInOut" }} // Smooth transition
            className="absolute left-0 right-14 text-right"
          >
            {currentValue}
          </motion.div>
        </AnimatePresence>
        <p className="ml-20">+</p>
      </div>
    </div>
  );
};

export default Achievements;
