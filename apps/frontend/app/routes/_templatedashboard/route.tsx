import Header from "./header";
import { Outlet } from "@remix-run/react";
import Sidebar from "./Sidebar";
import { LoaderFunctionArgs } from "@remix-run/node";
import {
  getCurrentUserAccountType,
  getCurrentUser,
} from "~/servers/user.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const accountType = await getCurrentUserAccountType(request);
  const currentUser = await getCurrentUser(request);
  return Response.json({ accountType, currentUser });
}
export default function Layout() {
  return (
    <div>
      <Header />
      <div className="flex mt-[12px]">
        <Sidebar />
        <div className="mt-[91px] p-5">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
