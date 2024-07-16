import { useTranslation } from "react-i18next";
import _navigation from "~/constants/navigation";
import { NavLink } from "@remix-run/react";

export default function Layout() {
	const { t } = useTranslation();
	const navigation = _navigation(t);
	return (
		<header className="bg-white border-b border-gray-200">
			<div className="container mx-auto flex justify-between items-center py-4">
				<div className="text-2xl font-bold">{t("siteTitle")}</div>
				<nav className="flex space-x-4">
					{navigation.map(
						(navItem) =>
							!navItem.is_action && (
								<NavLink
									key={navItem.label}
									to={navItem.href}
									className={({ isActive, isPending }) =>
										"text-blue-800 px-4 py-2 rounded hover:bg-blue-50" +
										(isPending
											? " text-primaryColor"
											: isActive
												? " shadow rounded-[10px] bg-primaryColor text-white"
												: "")
									}
								>
									{navItem.label}
								</NavLink>
							)
					)}
				</nav>
				{navigation.map(
					(navItem) =>
						navItem.is_action && (
							<NavLink
								to={navItem.href}
								className="bg-primaryColor text-white px-4 py-2 rounded hover:bg-blue-700"
							>
								{navItem.label}
							</NavLink>
						)
				)}
			</div>
		</header>
	);
}
