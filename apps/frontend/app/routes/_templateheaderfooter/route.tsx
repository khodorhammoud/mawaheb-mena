// this is a font if i needed it at anytime ❤️
// fontFamily: "system-ui, sans-serif"
// font-['Switzer-Regular']
// font-['BespokeSerif-Regular']
// font-['Switzer-Regular']

import Header from "./header";
import Footer from "./footer";
import { Outlet, useLoaderData } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import i18nServer from "~/lib/i18n.server";
import { LoaderFunctionArgs, json } from "@remix-run/node";

export async function loader({ request }: LoaderFunctionArgs) {
  const t = await i18nServer.getFixedT(request);
  return json({ description: t("description") });
}
export default function Layout() {
  return (
    <div>
      {/* <p>yahh</p> */}
      {/* the above comment was for testing which route is gonna appear 👍 */}
      <Header />
      <Outlet />
      {/* outlet is the content of the page, and the header and the footer are passed to all the page due to the naming 😎 */}
      <Footer />
    </div>
  );
}
