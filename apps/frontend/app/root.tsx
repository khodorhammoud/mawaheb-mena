import {
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
	useRouteLoaderData,
	useLoaderData,
} from "@remix-run/react";
import {
	LinksFunction,
	LoaderFunctionArgs,
	MetaFunction,
} from "@remix-run/node";
import { json } from "@remix-run/node";
import stylesheet from "~/tailwind.css?url";
import appStylesheet from "~/styles/app-global.css?url";
import i18nServer, { localeCookie } from "~/lib/i18n.server";
import { useChangeLanguage } from "remix-i18next/react";
import { useTranslation } from "react-i18next";

export const handle = { i18n: ["translation"] };

export async function loader({ request }: LoaderFunctionArgs) {
	const locale = await i18nServer.getLocale(request);
	return json(
		{ locale },
		{ headers: { "Set-Cookie": await localeCookie.serialize(locale) } }
	);
}

export function Layout({ children }: { children: React.ReactNode }) {
	const loaderData = useRouteLoaderData<typeof loader>("root");
	return (
		<html lang={loaderData?.locale ?? "en"}>
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<Meta />
				<Links />
			</head>
			<body>
				{children}
				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	);
}

export const links: LinksFunction = () => [
	{ rel: "stylesheet", href: stylesheet },
	{ rel: "stylesheet", href: appStylesheet },
];

export const meta: MetaFunction = () => {
	const { t } = useTranslation();
	return [{ title: t("siteTitle") }];
};

export default function App() {
	const { locale } = useLoaderData<typeof loader>();
	useChangeLanguage(locale);
	return <Outlet />;
}
