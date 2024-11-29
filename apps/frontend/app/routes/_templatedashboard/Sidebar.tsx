import {
  sidebarEmployerNav,
  sidebarFreelancerNav,
} from "~/constants/navigation";
import { useTranslation } from "react-i18next";
import { NavLink, useLoaderData, useLocation } from "@remix-run/react";
import clsx from "clsx";
import { AccountType } from "~/types/enums";

export default function Sidebar() {
  const { accountType } = useLoaderData<{ accountType: string }>();
  const { t } = useTranslation();
  const location = useLocation(); // Get the current location
  let menuNavigation;
  switch (accountType) {
    case AccountType.Freelancer:
      menuNavigation = sidebarFreelancerNav(t);
      break;
    case AccountType.Employer:
    default:
      menuNavigation = sidebarEmployerNav(t);
      break;
  }

  return (
    <div className="w-64 bg-gray-100 h-screen p-5 mt-20">
      <div className="flex flex-col items-center">
        <div className="bg-gray-300 rounded-full w-24 h-24 flex items-center justify-center mb-4">
          <span className="text-xl font-bold">AM</span>
        </div>
        <div className="text-center">
          {/* <h2 className="text-lg font-medium">
            {currentUser.firstName + " " + currentUser.lastName}
          </h2> */}
          <p>hiiio</p>
          {/* this code up is to prevent errors */}
          <p className="text-sm text-gray-500">Add Title</p>
          <p className="text-sm text-gray-500">Add Location</p>
        </div>
      </div>

      <nav className="mt-8">
        {menuNavigation.map((navItem, index) => (
          <NavLink
            key={navItem.label}
            to={navItem.href}
            className={({ isActive }) =>
              clsx(
                "flex items-center mb-4 text-primaryColor hover:bg-primaryColor gradient-box hover:text-white",
                {
                  "bg-primaryColor text-white not-active-gradient": isActive,
                  "not-active-gradient": !isActive,
                  // Highlight the first item if no other item is active
                  "bg-primaryColor text-white":
                    index === 0 && location.pathname === "/dashboard",
                }
              )
            }
          >
            {navItem.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
