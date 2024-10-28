import Header from "./header";
import { Outlet, useLoaderData } from "@remix-run/react";
import Sidebar from "./Sidebar";
import { LoaderFunctionArgs, json } from "@remix-run/node";
import {
  getCurrentUserAccountType,
  getCurrentUser,
} from "~/servers/user.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const accountType = getCurrentUserAccountType(request);
  const currentUser = await getCurrentUser(request);
  return json({ accountType, currentUser });
}
export default function Layout() {
  const { accountType } = useLoaderData<{ accountType: string }>();
  return (
    <div>
      <Header />
      {/* <div className="mt-[100px]"> */}
      <div className="flex mt-[12px]">
        <Sidebar accountType={accountType} />
        <Outlet />
        {/* </div> */}
      </div>
    </div>
  );
}
