// Layout Component
import { useTranslation } from "react-i18next";
import { navigation } from "~/constants/navigation";
import { NavLink } from "@remix-run/react";
import React, { useState } from "react";
import { motion } from "framer-motion";
import clsx from "clsx";
import "~/styles/wavy/wavy.css";

export default function Layout() {
  const { t } = useTranslation();
  const menuNavigation = navigation(t); // this is the place where i link the buttons i have to their pages // (routes)
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="font-['Switzer-Regular'] bg-white border-b border-gray-300 pb-2 pt-2 fixed top-0 left-0 w-full z-[1000]">
      <div className="container flex lg:gap-24 md:gap-8 gap-2 items-center py-4">
        <div className="xl:text-2xl lg:text-lg md:text-base font-extrabold font-['BespokeSerif-Regular']">
          {t("siteTitle")}
        </div>

        {/* search box */}
        <div className="flex items-center">
          <input
            type="text"
            placeholder="hinted search text"
            className="border border-gray-300 p-2 rounded-[10px] focus:outline-none"
          />
          <button className="bg-primaryColor text-white px-2 py-1 rounded-[10px] ml-2">
            Search
          </button>
        </div>

        <button className="bg-primaryColor rounded-[10px] text-white px-1 md:px-2 lg:px-4 py-1 xl:px-6 xl:py-2 gradient-box not-active-gradient justify-end">
          Post Job
        </button>
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
          {menuNavigation.map((navItem) => (
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
