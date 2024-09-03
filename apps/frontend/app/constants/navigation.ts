// this is the navigation of our home Pages 😎

import { TFunction } from "i18next";

/* For Employers
For Freelancers
About Us
Contact Us
Hire Now */
const navigation = function (t: TFunction) {
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

export default navigation;
