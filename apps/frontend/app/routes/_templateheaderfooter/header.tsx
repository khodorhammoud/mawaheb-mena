import { useTranslation } from "react-i18next";
import _navigation from "~/constants/navigation";
import { NavLink } from "@remix-run/react";
import React from "react";
import clsx from "clsx";
import "~/styles/wavy/wavy.css";
// the lines 4 and 5 are for importing the css animation stylings

export default function Layout() {
  const { t } = useTranslation();
  const navigation = _navigation(t);
  // this is same as: navigation = [ { label: ..... , href: ..... }, { label: ..... , href: ..... }, ..... ];
  return (
    <header className="font-['Switzer-Regular'] bg-white border-b  border-gray-300 pb-2 pt-2 fixed top-0 left-0 w-full z-50 ">
      <div className="container mx-auto flex gap-20 items-center py-4">
        <div className="text-2xl font-extrabold font-['BespokeSerif-Regular']">
          {t("siteTitle")}
        </div>
        <nav className="flex space-x-4">
          {/* <p>hiii</p> */}
          {/* the above comment was for testing which route is gonna appear 👍 */}
          {navigation.map(
            (navItem) =>
              !navItem.is_action && (
                // this navItem refers to every item in the navigation array exept the lastone, that has .is_action

                <NavLink
                  key={navItem.label}
                  to={navItem.href}
                  className={({ isActive }) =>
                    clsx(
                      "text-primaryColor px-6 py-2 rounded z-0 hover:bg-primaryColor gradient-box hover:text-white hover:rounded-[10px]",
                      {
                        "shadow bg-primaryColor text-white not-active-gradient":
                          isActive, // Active state classes
                        "bgOpacity not-active-gradient": !isActive, // Non-active state classes
                      }
                    )
                  }
                >
                  {navItem.label}
                </NavLink>

                // there was a ternary operator, and i switch it to clsx function
                // here is where i should add the button animations
              )
          )}
          {/* this is a loop, and every one iteration forms a button from the nav :
					( For Employers , For Freelancers , About Us , Contact Us )*/}
        </nav>
        {navigation.map(
          (navItem) =>
            navItem.is_action && (
              <NavLink
                to={navItem.href}
                className="bg-primaryColor rounded-[10px] text-white px-6 py-2  ml-auto  gradient-box"
              >
                {navItem.label}
              </NavLink>
            )
        )}
        {/* this down here is only for the Hire now button, that is the only one that has normally navLink with .is_action that is passed to its object ❤️ */}
        {/*  */}
      </div>
    </header>
  );
}

// className={({ isActive, isPending }) =>
// 	"text-primaryColor px-6 py-2 rounded hover:bg-primaryColor wave-effect hover:text-white hover:rounded-[10px] hover:" +
// 	(isPending
// ? " text-primaryColor"
// 		: isActive
// ? " shadow rounded-[10px] bg-primaryColor text-white"
// 			: "")
// }

// this code is for reserve
