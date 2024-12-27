import Header from "./header";
import { Outlet, useLoaderData } from "@remix-run/react";
import Sidebar from "./Sidebar";
import { LoaderFunctionArgs } from "@remix-run/node";
import {
  getCurrentUserAccountType,
  getCurrentUser,
  getCurrentProfileInfo,
} from "~/servers/user.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const accountType = await getCurrentUserAccountType(request);
  const currentUser = await getCurrentUser(request);
  const profile = await getCurrentProfileInfo(request);

  return Response.json({
    accountType,
    currentUser,
    isOnboarded: profile?.account?.user?.isOnboarded,
    profile,
  });
}
export default function Layout() {
  const { isOnboarded } = useLoaderData<{
    isOnboarded: boolean;
  }>();
  return (
    <div>
      <Header />
      <div className="flex mt-[12px]">
        {isOnboarded ? (
          <>
            <Sidebar />
            <div className="container mt-10 p-5 lg:mr-8">
              <Outlet />
            </div>
          </>
        ) : (
          // Add 'w-full' to make the container take full width when no sidebar
          <div className="container w-full mt-10 p-5">
            <Outlet />
          </div>
        )}
      </div>
    </div>
  );
}
