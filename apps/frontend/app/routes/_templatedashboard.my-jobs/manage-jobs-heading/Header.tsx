import { Form } from "@remix-run/react";
import AppFormField from "../../../common/form-fields";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function Header({ setViewMode }) {
  const [isOpen, setIsOpen] = useState(false);

  // Effect to handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.matchMedia("(min-width: 1024px)").matches) {
        setIsOpen(false); // Close the menu on lg screens and larger
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Run on mount to check initial screen size

    // Cleanup listener on component unmount
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex items-center xl:gap-6 lg:gap-2 lg:justify-between relative">
      {/* Search */}
      <Form method="post" className="space-y-6 xl:-mt-10 lg:-mt-8 -mt-8">
        <input type="hidden" name="accountType" value="employer" />
        <AppFormField
          id="search"
          name="search"
          label="🔍 Hinted search text"
          className=""
        />
      </Form>

      {/* Buttons - Hidden on Medium screens */}
      <div className="lg:flex hidden ml-auto lg:ml-0 gap-1 xl:space-x-2 lg:space-x-1 xl:-mt-4 lg:-mt-2">
        <button className="bg-primaryColor text-white rounded-xl xl:px-4 md:px-2 md:py-2 hover:bg-primaryColor-dark transition duration-300 not-active-gradient text-sm xl:text-base">
          Active Jobs
        </button>
        <button className="bg-primaryColor text-white rounded-xl xl:px-4 md:px-2 md:py-2 hover:bg-primaryColor-dark transition duration-300 not-active-gradient text-sm xl:text-base">
          Drafted Jobs
        </button>
        <button className="bg-primaryColor text-white rounded-xl xl:px-4 md:px-2 md:py-2 hover:bg-primaryColor-dark transition duration-300 not-active-gradient text-sm xl:text-base">
          Paused Jobs
        </button>
        <button className="bg-primaryColor text-white rounded-xl xl:px-4 md:px-2 md:py-2 hover:bg-primaryColor-dark transition duration-300 not-active-gradient text-sm xl:text-base">
          Closed Jobs
        </button>
      </div>

      {/* 🍔 Burger Icon - Visible on mediums screens */}
      <div className="lg:hidden ml-auto md:-mt-[2px] md:mr-4 sm:-mt-2 -mt-10">
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          className="focus:outline-none"
          animate={{ rotate: isOpen ? -90 : 0 }}
          transition={{ duration: 0.2 }}
        >
          {isOpen ? (
            // Close Icon
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
                d="M6 18L18 6M6 6l12 12"
              ></motion.path>
            </motion.svg>
          ) : (
            // Hamburger Icon
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
                strokeWidth="1.8"
                d="M4 6h16M4 12h16m-7 6h7"
              ></motion.path>
            </motion.svg>
          )}
        </motion.button>
      </div>

      {/* 🍔 BUTTONS AND ICONS INSIDE BURGER MENU */}
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: isOpen ? 1 : 0, height: isOpen ? "auto" : 0 }}
        className="grid overflow-hidden absolute md:right-36 md:-top-3 z-20 max-w-fit sm:right-0 sm:top-12 right-0 top-3"
      >
        {/* Buttons */}
        <div className="grid sm:grid-cols-2 md:grid-cols-1 md:gap-2 gap-1 lg:hidden">
          <button
            className="bg-primaryColor text-white rounded-xl px-4 py-2 hover:bg-primaryColor-dark transition duration-300 not-active-gradient text-sm"
            onClick={() => setIsOpen(false)}
          >
            Active Jobs
          </button>
          <button
            className="bg-primaryColor text-white rounded-xl px-4 py-2 hover:bg-primaryColor-dark transition duration-300 not-active-gradient text-sm"
            onClick={() => setIsOpen(false)}
          >
            Drafted Jobs
          </button>
          <button
            className="bg-primaryColor text-white rounded-xl px-4 py-2 hover:bg-primaryColor-dark transition duration-300 not-active-gradient text-sm"
            onClick={() => setIsOpen(false)}
          >
            Paused Jobs
          </button>
          <button
            className="bg-primaryColor text-white rounded-xl px-4 py-2 hover:bg-primaryColor-dark transition duration-300 not-active-gradient text-sm"
            onClick={() => setIsOpen(false)}
          >
            Closed Jobs
          </button>
        </div>

        {/* Icons */}
        <div className="sm:flex sm:items-center grid-cols-3 justify-center gap-4 mt-4 md:hidden hidden">
          <a href="#" onClick={() => setViewMode("one")} className="icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-6"
              fill="#27638a"
            >
              <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2z" />
            </svg>
          </a>
          <a href="#" onClick={() => setViewMode("two")} className="icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-6 ml-1"
              fill="#27638a"
            >
              <path d="M8 15V1h6a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1zm6 1a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z" />
            </svg>
          </a>
          <a href="#" onClick={() => setViewMode("three")} className="icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-8 h-8"
              fill="#fff"
              strokeWidth="1.3"
              stroke="#27638a"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z"
              />
            </svg>
          </a>
        </div>
      </motion.div>

      {/* Icons inside the burger menu */}
      <div className="md:flex md:items-center gap-4 xl:-mt-2 lg:-mt-1 hidden">
        <a href="#" onClick={() => setViewMode("one")} className="icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-6"
            fill="#27638a"
          >
            <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2z" />
          </svg>
        </a>
        <a href="#" onClick={() => setViewMode("two")} className="icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-6 ml-1"
            fill="#27638a"
          >
            <path d="M8 15V1h6a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1zm6 1a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z" />
          </svg>
        </a>
        <a href="#" onClick={() => setViewMode("three")} className="icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-8 h-8"
            fill="#fff"
            strokeWidth="1.3"
            stroke="#27638a"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z"
            />
          </svg>
        </a>
      </div>
    </div>
  );
}
