import { useTranslation } from "react-i18next";
import { navigation } from "~/constants/navigation";
import { NavLink } from "@remix-run/react";
import { useState } from "react";
import { motion } from "framer-motion";
import clsx from "clsx";
import "~/styles/wavy/wavy.css";
import { Link, useLoaderData } from "@remix-run/react";
import AppFormField from "~/common/form-fields";
import { BsSearch, BsBell, BsPersonCircle } from "react-icons/bs";

export default function Layout() {
  const { t } = useTranslation();
  const menuNavigation = navigation(t); // this is the place where i link the buttons i have to their pages // (routes)
  const [isOpen, setIsOpen] = useState(false);
  const isOnboarded = useLoaderData();

  return (
    <header className="font-['Switzer-Regular'] bg-white border-b border-gray-300 pb-1 pt-1 fixed top-0 left-0 w-full z-30">
      <div className="grid lg:grid-cols-[2fr,1fr] grid-cols-[9fr,4fr] md:gap-8 gap-2 items-center justify-around py-4">
        <div className="flex items-center">
          <div className="xl:text-2xl lg:text-lg md:text-base text-sm font-extrabold font-['BespokeSerif-Regular'] xl:mr-20 lg:mr-14 xl:ml-10 lg:ml-8 ml-4 md:mr-10 sm:mr-4 mr-2 whitespace-nowrap">
            {t("siteTitle")}
          </div>
          <div className="sm:w-[40%] w-full">
            <AppFormField
              id="email"
              name="email"
              label={
                <div className="flex items-center justify-center">
                  <BsSearch />{" "}
                  <div className="md:block ml-4 hidden">Hinted search text</div>
                </div>
              }
            />
          </div>
        </div>

        <div className="flex items-center lg:gap-6 gap-2 justify-end md:mr-10 sm:ml-2 sm:mr-4 mr-2">
          <Link
            to="/new-job"
            // className="absolute bg-primaryColor rounded-[10px] text-white px-1 md:px-2 lg:px-4 py-1 xl:px-6 xl:py-2 gradient-box not-active-gradient w-fit right-10 -top-5"
            className="bg-primaryColor rounded-[10px] md:text-base text-sm text-white xl:px-6 py-2 px-4 gradient-box not-active-gradient w-fit whitespace-nowrap"
          >
            Post Job
          </Link>

          {/* Conditionally Render Icons if NOT Onboarded */}
          {!isOnboarded && (
            <div className="flex lg:gap-6 gap-1">
              <BsBell className="sm:h-9 sm:w-9 h-8 w-8 text-gray-600 hover:bg-[#E4E3E6] transition-all hover:rounded-full p-2" />

              {/* Profile Icon */}
              <BsPersonCircle className="sm:h-9 sm:w-9 h-8 w-8 text-gray-600 hover:bg-[#E4E3E6] transition-all hover:rounded-full p-2" />
            </div>
          )}
        </div>
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
