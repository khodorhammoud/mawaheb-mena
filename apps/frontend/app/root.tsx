import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteLoaderData,
  useLoaderData,
  isRouteErrorResponse,
  useRouteError,
} from "@remix-run/react";
import {
  LinksFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import stylesheet from "./tailwind.css?url";
import appStylesheet from "./styles/app-global.css?url";
import i18nServer, { localeCookie } from "~/lib/i18n.server";
import { useChangeLanguage } from "remix-i18next/react";
import { useTranslation } from "react-i18next";

export const handle = { i18n: ["translation"] };

export async function loader({ request }: LoaderFunctionArgs) {
  // const locale = await i18nServer.getLocale(request);
  // return Response.json(
  //   { locale },
  //   { headers: { "Set-Cookie": await localeCookie.serialize(locale) } }
  // );
  return {};
}

export function Layout({ children }: { children: React.ReactNode }) {
  const loaderData = useRouteLoaderData<typeof loader>("root");
  return (
    // if loaderData is not null or empty, it will take the .locale property of the localeData
    // but if it is empty, "en" will be provided :)
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
  { rel: "stylesheet", as: "style", href: stylesheet },
  { rel: "stylesheet", href: appStylesheet }, // shall these href's stay like that ???
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

/* export function ErrorBoundary() {
  const error = useRouteError();

  console.log("error", error);

  // Handle 404s specifically
  if (isRouteErrorResponse(error) && error.status === 404) {
    return (
      <html>
        <head>
          <title>Page Not Found</title>
        </head>
        <body>
          <div className="flex flex-col items-center justify-center min-h-screen">
            <h1 className="text-2xl font-bold">404 - Page Not Found</h1>
            <p>Sorry, we couldn't find what you were looking for.</p>
            <a href="/" className="mt-4 text-blue-600 hover:underline">
              Return to Home
            </a>
          </div>
        </body>
      </html>
    );
  }

  // Handle other errors
  return (
    <html>
      <head>
        <title>Error</title>
      </head>
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen">
          <h1>Something went wrong</h1>
        </div>
      </body>
    </html>
  );
} */
