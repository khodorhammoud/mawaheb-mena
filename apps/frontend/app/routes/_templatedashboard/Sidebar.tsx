import { sidebarEmployerNav, sidebarEmployeeNav } from "~/constants/navigation";
import { useTranslation } from "react-i18next";
import { NavLink, useLocation } from "@remix-run/react";
import clsx from "clsx";

export default function Sidebar({ accountType }) {
  const { t } = useTranslation();
  const location = useLocation(); // Get the current location
  let menuNavigation;

  switch (accountType) {
    case "employer":
      menuNavigation = sidebarEmployerNav(t);
      break;
    case "employee":
      menuNavigation = sidebarEmployeeNav(t);
      break;
    default:
      menuNavigation = sidebarEmployerNav(t);
      break;
  }

  return (
    <div className="w-64 bg-gray-100 h-screen p-5">
      <div className="flex flex-col items-center">
        <div className="bg-gray-300 rounded-full w-24 h-24 flex items-center justify-center mb-4">
          <span className="text-xl font-bold">AM</span>
        </div>
        <div className="text-center">
          <h2 className="text-lg font-medium">Ahmad M.</h2>
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
