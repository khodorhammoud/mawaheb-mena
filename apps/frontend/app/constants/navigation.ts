// this contains all the Navigations :)
// this is the navigation of our home Pages 😎

import { TFunction } from "i18next";
import { FaBriefcase, FaCog, FaFileAlt } from "react-icons/fa";
import { AiOutlineLayout } from "react-icons/ai";

// this is the main navigation
export const navigation = function (t: TFunction) {
  return [
    {
      label: t("navigationForEmployersLable"),
      href: "/for-employers",
    },
    {
      label: t("navigationForFreelancersLable"),
      href: "/for-freelancers",
    },
    {
      label: t("navigationAboutUsLable"),
      href: "/about-us",
    },
    {
      label: t("navigationContactUsLable"),
      href: "/contact-us",
    },
    {
      label: t("navigationHireNowLable"),
      href: "/signup-employer",
      is_action: true,
    },
    {
      label: t("navigationJoinOurTeamLable"),
      href: "/signup-freelancer",
      is_action: true,
    },
  ];
};

// this is for the left navigation on the onBoarding state :)
export const sidebarEmployerNav = function (t: TFunction) {
  return [
    {
      label: t("dashboardEmployerDashboardLable"),
      href: "/dashboard",
      icon: AiOutlineLayout, // Dashboard icon
    },
    {
      label: t("dashboardEmployerManageJobsLable"),
      href: "/manage-jobs",
      icon: FaBriefcase, // Manage Jobs icon
    },
    {
      label: t("dashboardEmployerTimeSheetLable"),
      href: "/timesheet",
      icon: FaFileAlt, // Time Sheet icon
    },
    {
      label: t("dashboardEmployerSettingsLable"),
      href: "/settings",
      icon: FaCog, // Settings icon
    },
  ];
};

export const sidebarFreelancerNav = function (t: TFunction) {
  return [
    {
      label: t("dashboardFreelancerDashboardLable"),
      href: "/dashboard",
    },
    {
      label: t("dashboardFreelancerBrowseJobsLable"),
      href: "/browse-jobs",
    },
    {
      label: t("dashboardFreelancerTimeSheetLable"),
      href: "/timesheet",
    },
    {
      label: t("dashboardFreelancerReportsLable"),
      href: "/reports",
    },
    {
      label: t("dashboardFreelancerSettingsLable"),
      href: "/settings",
    },
  ];
};
