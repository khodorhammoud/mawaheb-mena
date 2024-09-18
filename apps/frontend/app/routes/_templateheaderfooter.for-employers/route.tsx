// that route.tsx calls home :)

import { json, LoaderFunctionArgs } from "@remix-run/node";
import Home from "./Home";
import { fetchCMSData } from "~/api/fetch-cms-data.server";

export async function loader({ request }: LoaderFunctionArgs) {
  return json({ description: t("description") });
}

export default function Layout() {
  return (
    <div
      className="container"
      style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}
    >
      <Home />
    </div>
  );
}
