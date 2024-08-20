// Layout Component
import { useTranslation } from "react-i18next";
import _navigation from "~/constants/navigation";
import { NavLink, useMatches } from "@remix-run/react";
import { useState } from "react";
import { motion } from "framer-motion";
import clsx from "clsx";
import "~/styles/wavy/wavy.css";

export default function Layout() {
  const { t } = useTranslation();
  const navigation = _navigation(t);
  const [isOpen, setIsOpen] = useState(false);
  const parentMatch = useMatches()[2]
  return (
    <header className="font-['Switzer-Regular'] bg-white border-b border-gray-300 pb-2 pt-2 fixed top-0 left-0 w-full z-[1000]">
      <div className="container flex lg:gap-24 md:gap-8 gap-2 items-center py-4">
        <div className="xl:text-2xl lg:text-lg md:text-base font-extrabold font-['BespokeSerif-Regular']">
          {t("siteTitle")}
        </div>

        {/* Regular Navigation - Hidden on small screens */}
        <nav className="hidden md:flex xl:space-x-4 space-x-2 md:text-sm xl:text-base">
          {navigation.map(
            (navItem) =>
              !navItem.is_action && (
                <NavLink
                  key={navItem.label}
                  to={navItem.href}
                  className={({ isActive }) =>{
                    if(parentMatch.pathname === "/" && navItem.href === "/for-employers")
                      isActive =true;
                    return clsx(
                      "text-primaryColor px-1 md:px-2 lg:px-4 py-1 xl:px-6 xl:py-2 rounded hover:bg-primaryColor gradient-box hover:text-white hover:rounded-[10px]",
                      {
                        "bg-primaryColor text-white not-active-gradient":
                          isActive,
                        "not-active-gradient": !isActive,
                      }
                    )
                  }
                  }
                >
                  {navItem.label}
                </NavLink>
              )
          )}
        </nav>

        {/* Burger Icon - Visible on small screens */}
        <div className="md:hidden ml-auto">
          <motion.button
            onClick={() => setIsOpen(!isOpen)}
            className="focus:outline-none"
            animate={{ rotate: isOpen ? -90 : 0 }} // Reversed rotation
            transition={{ duration: 0.2 }} // Duration of the rotation
          >
            {isOpen ? (
              <motion.svg
                className="w-6 h-6 text-black"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <motion.path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                ></motion.path>
              </motion.svg>
            ) : (
              <motion.svg
                className="w-6 h-6 text-primaryColor"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <motion.path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16m-7 6h7"
                ></motion.path>
              </motion.svg>
            )}
          </motion.button>
        </div>

        {/* Action Buttons - Hidden on small screens */}
        <nav className="hidden md:flex xl:space-x-4 space-x-2 md:text-sm xl:text-base ml-auto">
          {navigation.map(
            (navItem) => {
              if(
                // we're only showing the action buttons in this section
                !navItem.is_action || 
                // if we're on the for-freelancers page, we want to show the signup-freelancer button
                ( parentMatch.pathname === "/for-freelancers" && navItem.href !== "/signup-freelancer") ||
                // if we're on the for-employers page, we want to show the signup-employer button
                ( parentMatch.pathname === "/for-employers" && navItem.href !== "/signup-employer") ||
                // if we're on any other page, we want to show the signup-employer button
                ( parentMatch.pathname !== "/for-freelancers" && navItem.href === "/signup-freelancer")
              ) return <></>;
              return (
              <NavLink
                  key={navItem.label}
                  to={navItem.href}
                  className="bg-primaryColor rounded-[10px] text-white px-1 md:px-2 lg:px-4 py-1 xl:px-6 xl:py-2 gradient-box not-active-gradient justify-end"
                >
                  {navItem.label}
                </NavLink>
              )
            }
          )}
        </nav>
      </div>

      {/* Mobile Menu - Framer Motion */}
      <motion.nav
        initial={{ height: 0 }} // Initial height is 0 for the collapsed state
        animate={{ height: isOpen ? "auto" : 0 }} // Animate height based on the menu state
        className="overflow-hidden md:hidden backdrop-blur-md"
        style={{ backgroundColor: "rgba(255, 255, 255, 0.8)" }} // Explicitly set background with 0.8 opacity
      >
        <motion.div
          initial={{ opacity: 0 }} // Initial opacity is 0 for fade-in effect
          animate={{ opacity: isOpen ? 1 : 0 }} // Animate opacity based on the menu state
          className="flex flex-col space-y-2 px-4 py-2"
        >
          {navigation.map((navItem) => (
            <NavLink
              key={navItem.label}
              to={navItem.href}
              className={({ isActive }) =>
                clsx(
                  "inline-block w-max px-6 py-2 rounded transition-colors duration-300", // Inline block with max width to fit content
                  {
                    "text-white bg-primaryColor": isActive, // Active link style
                    "text-primaryColor bg-white": !isActive, // Inactive links with white background
                  },
                  "not-active-gradient gradient-box hover:text-white hover:bg-primaryColor"
                )
              }
              onClick={() => setIsOpen(false)} // Close the menu when a link is clicked
            >
              {navItem.label}
            </NavLink>
          ))}
        </motion.div>
      </motion.nav>
    </header>
  );
}
