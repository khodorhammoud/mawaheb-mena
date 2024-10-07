import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";

// code of the animation of the word is till the line 74 (or till line 114)
const Topic: React.FC = () => {
  const [lineWidth, setLineWidth] = useState(400); // Base width for large screens
  const [expandedRight1Width, setExpandedRight1Width] = useState(420); // Width after first expansion
  const [expandedLeft1Width, setExpandedLeft1Width] = useState(330); // Width after contraction
  const [finalLineWidth, setFinalLineWidth] = useState(345); // Final width after all adjustments
  const [lineTop, setLineTop] = useState(144); // Initial vertical position of the line
  const [nMoveDistance, setNMoveDistance] = useState(-40); // Initial movement distance for "NECTED" portion
  const [circleSize, setCircleSize] = useState(6); // Initial size of the circles
  const [lineHeight, setLineHeight] = useState(10); // Initial height of the line
  const [circleTop, setCircleTop] = useState(-3); // Initial top position for the circles

  const updateDimensions = () => {
    const width = window.innerWidth;

    if (width < 640) {
      setLineWidth(378);
      setLineTop(29.5);
      setNMoveDistance(-11);
      setCircleSize(8);
      setLineHeight(4);
      setCircleTop(-2);
      setExpandedRight1Width(132);
      setExpandedLeft1Width(82);
      setFinalLineWidth(90);
    } else if (width < 768) {
      setLineWidth(496);
      setLineTop(39.5);
      setNMoveDistance(-14);
      setCircleSize(12);
      setLineHeight(7);
      setCircleTop(-2.4);
      setExpandedRight1Width(170);
      setExpandedLeft1Width(115);
      setFinalLineWidth(126);
      //done
    } else if (width < 1024) {
      setLineWidth(608);
      setLineTop(49);
      setNMoveDistance(-17);
      setCircleSize(16);
      setLineHeight(8);
      setCircleTop(-4);
      setExpandedRight1Width(235);
      setExpandedLeft1Width(150);
      setFinalLineWidth(163);
      //done
    } else if (width < 1280) {
      setLineWidth(728);
      setLineTop(59);
      setNMoveDistance(-21);
      setCircleSize(18);
      setLineHeight(10);
      setCircleTop(-3.5);
      setExpandedRight1Width(280);
      setExpandedLeft1Width(180);
      setFinalLineWidth(196);
      //done
    } else {
      setLineWidth(970);
      setLineTop(73.5);
      setNMoveDistance(-28);
      setCircleSize(22);
      setLineHeight(14);
      setCircleTop(-4);
      setExpandedRight1Width(350);
      setExpandedLeft1Width(250);
      setFinalLineWidth(262);
      //done
    }
  };

  useEffect(() => {
    updateDimensions();
    window.addEventListener("resize", updateDimensions);

    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  const lineVariants = {
    visible: {
      width: [
        `0px`,
        `${expandedRight1Width}px`,
        `${expandedLeft1Width}px`,
        `${finalLineWidth}px`,
      ],
      transition: {
        duration: 1,
        ease: "easeInOut",
        times: [0, 0.3, 0.6, 0.9, 1],
        delay: 0.3,
      },
    },
  };

  const circleVariants = {
    hidden: { scale: 0 },
    visible: {
      scale: 1,
      transition: { duration: 0.2, ease: "easeInOut" },
    },
  };

  const nAndRightVariants = {
    hidden: { x: 0 },
    closer: {
      x: nMoveDistance,
      transition: { duration: 0.4, ease: "easeInOut", delay: 0.6 },
    },
  };

  return (
    <div className="border-b-[1px] pb-20 mb-28 border-slate-300">
      <div className="relative mt-36 xl:text-8xl lg:text-7xl md:text-6xl sm:text-5xl text-4xl xl:w-[900px] lg:w-[700px] md:w-[600px] sm:w-[400px] w-[300px] font-['BespokeSerif-Regular'] font-semibold">
        <div className="xl:leading-normal leading-relaxed">
          We <span className="relative z-10">C</span>
          <span className="relative z-10">O</span>
          {/* Animated line */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={lineVariants}
            className="absolute bg-primaryColor translate-y-[-50%] z-20"
            style={{
              left: `${lineWidth * 0.275}px`,
              top: `${lineTop}px`,
              height: `${lineHeight}px`,
            }}
          >
            {/* Circle at the start of the line */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={circleVariants}
              className="absolute bg-primaryColor rounded-full ml-1"
              style={{
                left: "-10px",
                top: `${circleTop}px`,
                height: `${circleSize}px`,
                width: `${circleSize}px`,
              }}
            />
            {/* Circle at the end of the line */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={circleVariants}
              className="absolute bg-primaryColor rounded-full mr-1"
              style={{
                right: "-10px",
                top: `${circleTop}px`,
                height: `${circleSize}px`,
                width: `${circleSize}px`,
              }}
            />
            {/* completing the word CONNECTED */}
          </motion.div>
          <span className="relative z-10 inline-block">N</span>
          <motion.span
            initial="hidden"
            animate="closer"
            variants={nAndRightVariants}
            className="relative z-10 inline-block"
          >
            N
          </motion.span>
          <motion.span
            initial="hidden"
            animate="closer"
            variants={nAndRightVariants}
            className="relative z-10 inline-block"
          >
            E
          </motion.span>
          <motion.span
            initial="hidden"
            animate="closer"
            variants={nAndRightVariants}
            className="relative z-10 inline-block"
          >
            C
          </motion.span>
          <motion.span
            initial="hidden"
            animate="closer"
            variants={nAndRightVariants}
            className="relative z-10 inline-block"
          >
            T
          </motion.span>
        </div>
        <span className="relative z-10 inline-block xl:leading-normal leading-relaxed">
          {" "}
          Talent To Drive Success
        </span>
      </div>
    </div>
  );
};

export default Topic;
