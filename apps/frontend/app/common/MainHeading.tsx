import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

export default function MainHeading(props: {
  title: string;
  description?: string;
  className?: string;
  // measn that it is not needed to put description or a className
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState(0);

  const handleScroll = () => {
    if (containerRef.current) {
      const boundingRect = containerRef.current.getBoundingClientRect();
      const visibleHeight = window.innerHeight - boundingRect.top;
      setScrollPosition(visibleHeight);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Function to split the description into parts
  const splitDescription = (description: string, linesPerPart: number) => {
    const lines = description.split(".");
    const parts = [];
    for (let i = 0; i < lines.length; i += linesPerPart) {
      parts.push(lines.slice(i, i + linesPerPart).join("."));
      if (i < lines.length - 1) {
        parts[parts.length - 1] += ".";
      }
    }
    return parts;
  };

  const descriptionParts = props.description
    ? splitDescription(props.description, 1)
    : [];

  return (
    <div ref={containerRef} className="text-left mt-96">
      <motion.h1 className="text-6xl font-['BespokeSerif-Medium']">
        {props.title}
      </motion.h1>
      {descriptionParts.length > 0 && (
        <motion.div
          className="text-slate mt-24 text-3xl font-['Switzer-Regular'] leading-[75px] max-w-5xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: scrollPosition > 0 ? 1 : 0 }}
          transition={{ duration: 1 }}
          // style={{ display: "inline" }}
        >
          {descriptionParts.map((part, index) => {
            const startFadePosition = index * 200;
            const endFadePosition = startFadePosition + 400;
            const intensity =
              scrollPosition > startFadePosition
                ? Math.min(
                    1,
                    (scrollPosition - startFadePosition) /
                      (endFadePosition - startFadePosition)
                  )
                : 0;
            const color = `rgba(0, 0, 0, ${intensity})`;

            return (
              <motion.span
                key={index}
                style={{
                  color: color,
                  transition: "color 0.5s ease",
                  whiteSpace: "pre-wrap", // Keeps the text as is without breaking lines
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.3 }}
              >
                {part}
              </motion.span>
            );
          })}
        </motion.div>
        // this is for the lines appearing animation
      )}
    </div>
  );
}
