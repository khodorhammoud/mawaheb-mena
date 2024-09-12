import Header from "./header";
import { Outlet, useLoaderData } from "@remix-run/react";
// import Sidebar from "./Sidebar";
// import { LoaderFunctionArgs, json } from "@remix-run/node";
// import { getCurrentUserAccountType } from "~/servers/user.server";

// export async function loader({ request }: LoaderFunctionArgs) {
//   const accountType = getCurrentUserAccountType(request);
//   return json({ accountType });
// }
export default function Layout() {
  return (
    <div>
      <Header />
      <div className="mt-[100px]">
        <Outlet />
      </div>
    </div>
  );
}
