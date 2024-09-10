import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEarthAmericas,
  faBrain,
  faPalette,
} from "@fortawesome/free-solid-svg-icons";

const Topic = () => {
  // State to manage which <em> element is hovered
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Array of video paths corresponding to each <em> element
  const gifs = [
    "https://www.w3schools.com/html/mov_bbb.mp4",
    "https://www.w3schools.com/html/mov_bbb.mp4",
    "https://www.w3schools.com/html/mov_bbb.mp4",
  ];

  // Determine the text color based on hover state
  const textColorClass = hoveredIndex !== null ? "text-white " : "text-black";

  const isHovering =
    hoveredIndex === 0 || hoveredIndex === 1 || hoveredIndex === 2;
  return (
    <div className="relative mt-20 pb-12 pt-20 text-center overflow-hidden">
      {/* Animation of fading in and out */}
      <AnimatePresence>
        {hoveredIndex !== null && (
          <motion.video
            key={hoveredIndex} // Ensure a new video element is created for each hover
            src={gifs[hoveredIndex]}
            autoPlay
            loop
            muted
            className="absolute inset-0 w-full h-full object-fill"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }} // Duration of the fade in/out animation
          />
        )}
      </AnimatePresence>
      <div className={`relative z-10 max-w-xl mx-auto ${textColorClass}`}>
        <h2 className="font-['BespokeSerif-Light'] font-bold text-md mb-1">
          EXPLORE TALENT HUB
        </h2>
        <h1 className="font-['Switzer-Regular'] text-5xl leading-snug font-semibold">
          Where The{" "}
          <div className="inline">
            {/* Hovering code ⬇️ */}
            <em
              onMouseEnter={() => setHoveredIndex(0)}
              onMouseLeave={() => setHoveredIndex(null)}
              className={`cursor-pointer border-b-4 ${
                isHovering ? "border-white" : "border-primaryColor"
              } ${isHovering ? "text-white" : "text-primaryColor"}`}
            >
              Realms
            </em>
            {/* icon 1 ⬇️ */}
            <span
              className={`mx-3 px-4 rounded-[25px] ${
                isHovering ? "bg-white pb-2" : ""
              }`}
            >
              <FontAwesomeIcon
                className="text-4xl text-primaryColor"
                icon={faEarthAmericas}
              />
            </span>
          </div>
          Of {/* Hovering code ⬇️ */}
          <div className="inline">
            <em
              onMouseEnter={() => setHoveredIndex(1)}
              onMouseLeave={() => setHoveredIndex(null)}
              className={`cursor-pointer border-b-4 ${
                isHovering ? "border-white" : "border-primaryColor"
              } ${isHovering ? "text-white" : "text-primaryColor"}`}
            >
              Skill
            </em>
            {/* icon 2 ⬇️ */}
            <span
              className={`mx-3 px-4 rounded-[25px] ${
                isHovering ? "bg-white pb-2" : ""
              }`}
            >
              <FontAwesomeIcon
                className="text-4xl text-primaryColor"
                icon={faBrain}
              />
            </span>
          </div>
          And {/* Hovering code ⬇️ */}
          <div className="inline">
            <em
              onMouseEnter={() => setHoveredIndex(2)}
              onMouseLeave={() => setHoveredIndex(null)}
              className={`cursor-pointer border-b-4 ${
                isHovering ? "border-white" : "border-primaryColor"
              } ${isHovering ? "text-white" : "text-primaryColor"}`}
            >
              Creativity
            </em>
            {/* icon 3 ⬇️ */}
            <span
              className={`mx-3 px-4 rounded-[25px] ${
                isHovering ? "bg-white pb-2" : ""
              }`}
            >
              <FontAwesomeIcon
                className="text-4xl text-primaryColor"
                icon={faPalette}
              />
            </span>
          </div>
          Converge To Craft Jobs Your Clients Adore
        </h1>
        <button className="gradient-box hover:text-white hover:rounded-[10px] bg-primaryColor text-white not-active-gradient pt-2 pb-3 px-4 mt-4">
          Join our team
        </button>
      </div>
    </div>
  );
};

export default Topic;
