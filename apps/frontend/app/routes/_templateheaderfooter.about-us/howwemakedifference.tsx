import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface ValueBox {
  id: number;
  title: string;
  description: string;
  icon: string;
  belongingtxt: string;
}

const valueBoxes: ValueBox[] = [
  {
    id: 1,
    title: "Pursuing Excellence",
    description:
      "We relentlessly pursue excellence in all aspects of our work, striving to deliver exceptional quality and value to our clients and freelancers alike.",
    icon: "star-icon",
    belongingtxt: `At Mawaheb MENA, actions speak louder than words. Our values are the
    cornerstone of our identity, shaping every interaction and decision
    we make. They guide us as we strive to make a meaningful impact in
    the freelance community.
    <br />
    <br />
    We believe in ...`,
  },
  {
    id: 2,
    title: "Upholding Integrity",
    description:
      "We conduct ourselves with unwavering honesty, transparency, and accountability, fostering trust and reliability in all our relationships.",
    icon: "integrity-icon",
    belongingtxt: `We are bosses bro hahahahhahahah, lets talk now about what is happening in GAZA, where people are starving. There is no food, no supplies, no water, even the houses are damaged and destroyed!
    <br />
    <br />
    We love to ...`,
  },
  {
    id: 3,
    title: "Pursuing Excellence",
    description:
      "We relentlessly pursue excellence in all aspects of our work, striving to deliver exceptional quality and value to our clients and freelancers alike.",
    icon: "star-icon",
    belongingtxt: `At Mawaheb MENA, actions speak louder than words. Our values are the
    cornerstone of our identity, shaping every interaction and decision
    we make. They guide us as we strive to make a meaningful impact in
    the freelance community.
    <br />
    <br />
    We believe in ...`,
  },
  {
    id: 4,
    title: "Upholding Integrity",
    description:
      "We conduct ourselves with unwavering honesty, transparency, and accountability, fostering trust and reliability in all our relationships.",
    icon: "integrity-icon",
    belongingtxt: `We are bosses bro hahahahhahahah, lets talk now about what is happening in GAZA, where people are starving. There is no food, no supplies, no water, even the houses are damaged and destroyed!
    <br />
    <br />
    We love to ...`,
  },
];

const lightenColor = (color: string, percent: number) => {
  const num = parseInt(color.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = ((num >> 8) & 0x00ff) + amt;
  const B = (num & 0x0000ff) + amt;

  return (
    "#" +
    (
      0x1000000 +
      (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 1 ? 0 : B) : 255)
    )
      .toString(16)
      .slice(1)
  );
};

const HowWeMakeDifference: React.FC = () => {
  const [initialXOffset, setInitialXOffset] = useState(800);
  const primaryColor = "#27638a"; // Your primary color

  useEffect(() => {
    const offset = 800; // Adjust as needed to position the first box
    setInitialXOffset(offset);
  }, []);

  return (
    <section className="font-['Switzer-Regular'] mb-40 mt-24">
      <div>
        <p className="text-6xl leading-relaxed font-['BespokeSerif-Regular'] font-bold md:w-[650px] sm:w-[450px] w-[250px] mt-0">
          HERE'S HOW WE MAKE A DIFFERENCE
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2">
        <p className="text-lg mt-20 mb-20 md:w-[80%] sm:w-[90%] leading-normal">
          At Mawaheb MENA, actions speak louder than words. Our values are the
          cornerstone of our identity, shaping every interaction and decision we
          make. They guide us as we strive to make a meaningful impact in the
          freelance community.
          <br />
          <br />
          We believe in ...
        </p>

        <div className="overflow-hidden lg:-ml-10 md:w-full md:h-screen flex items-center justify-center select-none -mt-12 sm:-mt-12  md:-mt-12 lg:-mt-12 xl:mt-0">
          <motion.div
            className="flex cursor-grab"
            drag="x"
            dragConstraints={{
              left: -((valueBoxes.length - 1) * (480 + 16) - 900),
              right: 800,
            }}
            dragElastic={0.1}
            whileTap={{ cursor: "grabbing" }}
            initial={{ x: initialXOffset }}
          >
            {valueBoxes.map((box, index) => (
              <motion.div
                key={box.id}
                className={`flex-none rounded-xl text-white p-10 mr-10 lg:mr-0 xl:h-[525px] xl:w-[483px] lg:h-[420px] lg:w-[425px] md:h-[420px] md:w-[360px] h-[400px] w-[300px]`}
                style={{
                  backgroundColor: lightenColor(primaryColor, index * 10),
                  marginLeft: index === 0 ? "-250px" : "1%",
                }}
              >
                <div className="h-[20%] flex items-center">
                  <p className="xl:text-4xl lg:text-3xl md:text-2xl text-xl -mt-10">
                    {box.id}
                  </p>
                  <i className={`text-4xl ${box.icon}`}></i>
                </div>
                <div className="h-[65%]">
                  <h3 className="xl:text-5xl lg:text-4xl md:text-3xl text-2xl xl:leading-snug md:leading-snug leading-tight my-4 w-[200px]">
                    {box.title}
                  </h3>
                  <p className="xl:text-xl md:text-lg text-base xl:leading-relaxed lg:leading-normal md:leading-snug leading-tight mt-10">
                    {box.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HowWeMakeDifference;
