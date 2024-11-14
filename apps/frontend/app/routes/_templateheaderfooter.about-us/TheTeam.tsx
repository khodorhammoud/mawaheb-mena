import React, { useState } from "react";
import { motion } from "framer-motion";
import { useLoaderData } from "@remix-run/react";

// Interface for the dynamic team members fetched from CMS
interface TeamMember {
  name: string;
  position: string;
  role: string;
  imageURL: string;
}

interface LoaderData {
  meetTheTeamSection: {
    subHeadline: {
      content: string;
    };
    members: TeamMember[];
  }[];
}

const MeetTheTeam: React.FC = () => {
  // Fetch data using the useLoaderData hook
  const { meetTheTeamSection } = useLoaderData<LoaderData>();

  // Safety check: Make sure meetTheTeamSections is not empty
  if (!meetTheTeamSection || meetTheTeamSection.length === 0) {
    return <p>No team data available.</p>; // Show fallback message if no data is available
  }

  // Extract the subheadline and team members from the loader data
  const subHeadline = meetTheTeamSection[0]?.subHeadline?.content || "";
  const teamMembers = meetTheTeamSection[0]?.members || [];

  const [hoveredMember, setHoveredMember] = useState<TeamMember | null>(null);

  return (
    <section className="py-16 bg-white mt-40">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="">
          <h2 className="text-4xl leading-8 font-bold tracking-wide text-gray-900 sm:text-6xl font-['BespokeSerif-Regular']">
            MEET THE TEAM
          </h2>
          <p className="mt-10 mb-10 max-w-xl md:text-lg text-base text-black">
            {subHeadline}
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
            {!hoveredMember ? (
              // Blue blurred box (default state when no member is hovered)
              <motion.div
                initial={{
                  opacity: 0,
                  rotate: -3,
                  backgroundColor: "#27638a",
                  filter: "blur(10px)",
                }}
                animate={{
                  opacity: 1,
                  rotate: -3,
                  backgroundColor: "#27638a",
                  filter: "blur(10px)",
                }}
                exit={{
                  opacity: 0,
                  rotate: -3,
                }}
                transition={{ duration: 0.5 }}
                className="h-80 w-[90%] object-cover rounded-xl shadow-2xl ml-[5%] md:w-[100%] sm:w-[60%] bg-[#27638a]"
              />
            ) : (
              // Image of the hovered team member
              <motion.img
                key={hoveredMember.name}
                src={hoveredMember.imageURL}
                alt={hoveredMember.name}
                initial={{
                  opacity: 0,
                  rotate: -3,
                }}
                animate={{
                  opacity: 1,
                  rotate: -3,
                }}
                exit={{
                  opacity: 0, // Fade-out effect
                  rotate: -3,
                }}
                transition={{ duration: 0.5 }}
                className="h-80 object-cover rounded-xl shadow-2xl ml-[5%] md:w-[100%] sm:w-[60%] w-[90%]"
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default MeetTheTeam;
