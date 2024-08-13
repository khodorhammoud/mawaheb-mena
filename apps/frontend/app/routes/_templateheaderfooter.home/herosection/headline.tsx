// i shall work here, sice that is an end point
import { motion } from "framer-motion";
export default function Headline() {
  return (
    <section className="text-center py-16 bg-white mt-28">
      <div className="container mx-auto px-4">
        <h1 className="text-6xl font-extrabold font-['BespokeSerif-Regular'] leading-relaxed ">
          <div className="leading-relaxed">
            Your{" "}
            <span className="bg-black rotation-animation inline-block px-8  rounded-[14px]">
              <span className="text-white inline-block -rotate-3 ">
                Gateway
              </span>
            </span>{" "}
            to{" "}
          </div>
          <div>Digital Excellence</div>
        </h1>
        <motion.div
          initial={{ y: "100vh" }} // Start from the bottom of the page
          animate={{ y: 0 }} // Animate to its normal position
          transition={{ type: "spring", stiffness: 70, damping: 20 }} // Customize the animation
        >
          <p className="pt-7 text-lg mt-4 text-black font-['Switzer-Regular']">
            Mawaheb MENA a platform where you can find top talent,
            <br />
            drive innovation, and achieve your business goals.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
