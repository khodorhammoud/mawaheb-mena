import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLoaderData } from "@remix-run/react";
import "../../styles/wavy/wavy.css";

// Define the Achievement type matching the data structure from the CMS
type Achievement = {
  title: string;
  count: number;
  desc: string; // `desc` instead of `description` to match CMS field names
};

const TOTAL_DURATION = 1500; // 1.5 seconds total animation duration

const Achievements: React.FC = () => {
  // Fetch achievementSection from the loader data
  const { achievementSection } = useLoaderData<{
    achievementSection: Achievement[];
  }>();

  return (
    <div className="mx-4 flex flex-col mt-32">
      <h2 className="text-4xl font-bold mb-8 ml-2 font-['BespokeSerif-Regular']">
        ACHIEVEMENTS
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {achievementSection.map((achievement, index) => (
          <div
            key={index}
            className="bg-white border border-gray-200 shadow-xl p-6 flex flex-col rounded-xl"
          >
            <h3 className="text-lg font-bold mb-4">{achievement.title}</h3>
            <AnimatedCount count={achievement.count} />
            <p className="text-sm text-gray-600 mt-6 pt-3 border-t-[2px]">
              {achievement.desc}
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
  const [triggerBounce, setTriggerBounce] = useState<boolean>(false); // State to control the bounce effect
  const elementRef = useRef<HTMLDivElement | null>(null);

  // Set up intersection observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            setHasAnimated(true);
          }
        });
      },
      { threshold: 0 }
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

  // Calculate interval and control animation
  useEffect(() => {
    if (hasAnimated) {
      const totalSteps = Math.ceil(count / 10); // Total number of steps needed (increments of 10)
      const stepDuration = TOTAL_DURATION / totalSteps; // Duration per step to finish at the same time

      let currentNumber = 0;
      const interval = setInterval(() => {
        if (currentNumber < count) {
          currentNumber += 10; // Always increment by 10
          setCurrentValue(currentNumber > count ? count : currentNumber); // Ensure no overshoot
        } else {
          clearInterval(interval); // Stop animation when count is reached
          setTriggerBounce(true); // Trigger bounce effect after final number
        }
      }, stepDuration); // Adjust speed based on the total number of steps

      return () => clearInterval(interval);
    }
  }, [hasAnimated, count]);

  return (
    <div
      ref={elementRef}
      className="relative h-16 overflow-hidden flex justify-end items-center text-7xl font-bold text-gray-800"
    >
      <div className="flex items-center">
        <AnimatePresence>
          <motion.div
            key={currentValue}
            initial={{ y: "100%", opacity: 0.5 }} // Start from below
            animate={{ y: "0%", opacity: 1 }} // Move to center
            exit={{ y: "-100%", opacity: 0.5 }} // Move up and disappear
            transition={{ duration: 0.25, ease: "easeInOut" }} // Use a more flexible easing
            onAnimationComplete={() => {
              if (currentValue === count) {
                setTriggerBounce(true); // Trigger bounce after the final number has reached the center
              }
            }}
            className={`absolute left-0 right-14 text-right ${
              triggerBounce ? "bounce-center" : ""
            }`} // Apply bounce animation on final number
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
