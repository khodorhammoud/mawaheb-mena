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
			href: "/home",
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
			href: "/hire-now",
			is_action: true,
		},
	];
};

export default navigation;
