import Headline from "./headline";
import Carousel from "./carousel";
import { motion } from "framer-motion";

export default function HeroSection() {
  return (
    <div>
      {/* Display <Headline /> normally */}
      <Headline />

      {/* Animate the <Carousel /> from the bottom to its place */}
      <motion.div
        initial={{ y: "100vh" }} // Start from the bottom of the page
        animate={{ y: 0 }} // Animate to its normal position
        transition={{ type: "spring", stiffness: 70, damping: 30 }} // Customize the animation
      >
        {/* this is the animation that occurs to the second part of headline and the carousel to fit their correct places */}
        <Carousel />
      </motion.div>
    </div>
  );
}
