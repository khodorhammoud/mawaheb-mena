import { useEffect, useState, useRef } from "react";
import "~/styles/wavy/wavy.css";

type Achievement = {
  title: string;
  count: string;
  description: string;
};

const achievements: Achievement[] = [
  {
    title: "Open Jobs Opportunities",
    count: "100",
    description:
      "Our platform currently offers a multitude of open job opportunities, connecting freelancers with diverse jobs and clients seeking their expertise.",
  },
  {
    title: "Jobs are done",
    count: "40",
    description:
      "Our platform has facilitated over 40 successful jobs, delivering exceptional results for clients and freelancers alike.",
  },
  {
    title: "Jobs posted",
    count: "50",
    description:
      "Over 200 jobs were posted via our platform, providing ample opportunities for freelancers to find work.",
  },
];

const Achievements = () => {
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
            <AnimatedCount count={parseInt(achievement.count)} />
            <p className="text-sm text-gray-600 mt-6 pt-3 border-t-[2px]">
              {achievement.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

const AnimatedCount: React.FC<{ count: number }> = ({ count }) => {
  const [animatedCount, setAnimatedCount] = useState(0);
  const elementRef = useRef<HTMLDivElement | null>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            setHasAnimated(true);
          }
        });
      },
      { threshold: 0.5 }
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
      const start = 0;
      const end = count;
      const duration = 8000; // 8 seconds
      const stepTime = Math.abs(Math.floor(duration / end));

      let current = start;
      const step = () => {
        current += 5;
        setAnimatedCount(current);
        if (current < end) {
          setTimeout(step, stepTime);
        }
      };

      step();
    }
  }, [hasAnimated, count]);

  return (
    <div
      ref={elementRef}
      className="relative h-16 flex items-end justify-end text-5xl font-extrabold text-gray-800 mb-2 self-end"
    >
      {animatedCount}+ {/* Add the + sign next to the animated number */}
    </div>
  );
};

export default Achievements;
