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
} from '@remix-run/react';
import { LinksFunction, LoaderFunctionArgs, MetaFunction, json } from '@remix-run/node';
import stylesheet from './tailwind.css?url';
import appStylesheet from './styles/app-global.css?url';
import i18nServer, { localeCookie } from '~/lib/i18n.server';
import { useChangeLanguage } from 'remix-i18next/react';
import { useTranslation } from 'react-i18next';
import { Toaster } from '~/components/ui/toaster';
import { UserProvider } from '~/context/UserContext';

export const handle = { i18n: ['translation'] };

function getPublicEnv() {
  return {
    BACKEND_URL: process.env.BACKEND_URL,
  };
}

export async function loader({ request }: LoaderFunctionArgs) {
  const locale = await i18nServer.getLocale(request);
  return Response.json(
    { locale, ENV: getPublicEnv() },
    { headers: { 'Set-Cookie': await localeCookie.serialize(locale) } }
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  const loaderData = useRouteLoaderData<typeof loader>('root');
  const { ENV } = useLoaderData<typeof loader>();
  return (
    // if loaderData is not null or empty, it will take the .locale property of the localeData
    // but if it is empty, "en" will be provided :)
    <html lang={loaderData?.locale ?? 'en'}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.ENV = ${JSON.stringify(ENV)};`,
          }}
        />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <Toaster />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export const links: LinksFunction = () => [
  { rel: 'stylesheet', as: 'style', href: stylesheet },
  { rel: 'stylesheet', href: appStylesheet }, // shall these href's stay like that ???
];

export const meta: MetaFunction = () => {
  const { t } = useTranslation();
  return [{ title: t('siteTitle') }];
};

export default function App() {
  const { locale } = useLoaderData<typeof loader>();
  useChangeLanguage(locale);
  const { ENV } = useLoaderData<typeof loader>();

  return (
    <UserProvider>
      <Outlet />
    </UserProvider>
  );
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
