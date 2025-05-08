import Header from './header';
import Footer from './footer';
import { Outlet, useLoaderData } from '@remix-run/react';
import { useTranslation } from 'react-i18next';
import i18nServer from '~/lib/i18n.server';
import { LoaderFunctionArgs, json } from '@remix-run/node';

export async function loader({ request }: LoaderFunctionArgs) {
  const t = await i18nServer.getFixedT(request);
  return Response.json({ description: t('description') });
}
export default function Layout() {
  return (
    <div className="">
      <Header />
      <Outlet />
      <Footer />
    </div>
  );
}
