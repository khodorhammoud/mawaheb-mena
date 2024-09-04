import React, { useState } from "react";
import { motion } from "framer-motion";

interface TeamMember {
  name: string;
  role: string;
  imageSrc: string;
}

const teamMembers: TeamMember[] = [
  {
    name: "Samir Awarkeh (Founder)",
    role: "Executive Creative Director",
    imageSrc:
      "https://www.fivebranches.edu/wp-content/uploads/2021/08/default-image.jpg", // Replace with the correct image path
  },
  {
    name: "Ibrahim Ammar (Founder)",
    role: "Managing Director & CTO",
    imageSrc:
      "https://www.fivebranches.edu/wp-content/uploads/2021/08/default-image.jpg", // Replace with the correct image path
  },
  {
    name: "Khodor Hammoud (Founder)",
    role: "Operations Director",
    imageSrc:
      "https://www.fivebranches.edu/wp-content/uploads/2021/08/default-image.jpg", // Replace with the correct image path
  },
];

const MeetTheTeam: React.FC = () => {
  const [hoveredMember, setHoveredMember] = useState<TeamMember | null>(
    teamMembers[0]
  );

  return (
    <section className="py-16 bg-white mt-40">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="">
          <h2 className="text-4xl leading-8 font-bold tracking-wide text-gray-900 sm:text-6xl font-['BespokeSerif-Regular']">
            MEET THE TEAM
          </h2>
          <p className="mt-10 mb-10 max-w-xl md:text-lg text-base text-black">
            At Mawaheb MENA, our team is the heart and soul of our organization.
            Comprised of passionate individuals with diverse backgrounds and
            expertise, we're united by our shared commitment to empowering
            freelancers and driving success for our clients.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[70%,30%] items-center">
          <div>
            <ul className="mb-10">
              {teamMembers.map((member, index) => (
                <li
                  key={index}
                  className="flex lg:justify-between items-center cursor-pointer py-4 border-b-[2px] border-gray-300 hover:bg-gray-100"
                  onMouseEnter={() => setHoveredMember(member)}
                >
                  <span
                    className={`xl:text-3xl lg:text-2xl md:text-xl sm:text-lg text-base my-2 md:mr-20 mr-10 font-normal ${
                      hoveredMember === member
                        ? "text-[#27638a]"
                        : "text-gray-900"
                    }`}
                  >
                    {member.name}
                  </span>
                  <span
                    className={`xl:text-lg lg:text-md md:text-base text-sm xl:mr-40 mr-0 ${
                      hoveredMember === member ? "text-[#27638a]" : "text-black"
                    }`}
                  >
                    {member.role}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            {hoveredMember && (
              <motion.img
                key={hoveredMember.name}
                src={hoveredMember.imageSrc}
                alt={hoveredMember.name}
                initial={{
                  opacity: 0,
                  rotate: -3,
                  backgroundColor: "#27638a",
                }}
                animate={{
                  opacity: 1,
                  rotate: -3,
                  backgroundColor: "#27638a",
                }}
                exit={{
                  opacity: 0,
                  rotate: -3,
                  backgroundColor: "#27638a",
                }}
                transition={{ duration: 0.5 }}
                className="h-80 object-cover rounded-xl shadow-2xl ml-[5%] md:w-[100%] sm:w-[60%] w-[90%] "
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default MeetTheTeam;
