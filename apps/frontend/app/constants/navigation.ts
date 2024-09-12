// this is the navigation of our home Pages 😎

import { TFunction } from "i18next";

/* For Employers
For Freelancers
About Us
Contact Us
Hire Now */
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



export const sidebarEmployerNav = function (t: TFunction) {
  return [
    {
      label: t("dashboardEmployerDashboardLable"),
      href: "/for-employers",
    },
    {
      label: t("dashboardEmployerManageJobsLable"),
      href: "/for-freelancers",
    },
    {
      label: t("dashboardEmployerTimeSheetLable"),
      href: "/for-freelancers",
    },
    {
      label: t("dashboardEmployerSettingsLable"),
      href: "/for-freelancers",
    },
  ];
};

export const sidebarEmployeeNav = function (t: TFunction) {
  return [
    {
      label: t("dashboardEmployeeDashboardLable"),
      href: "/for-employers",
    },
    {
      label: t("dashboardEmployeeBrowseJobsLable"),
      href: "/for-employers",
    },
    {
      label: t("dashboardEmployeeTimeSheetLable"),
      href: "/for-freelancers",
    },
    {
      label: t("dashboardEmployeeReportsLable"),
      href: "/for-freelancers",
    },
    {
      label: t("dashboardEmployeeSettingsLable"),
      href: "/for-freelancers",
    },
  ];
};

