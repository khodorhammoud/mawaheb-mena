import Header from './header';
import { Outlet, useLoaderData } from '@remix-run/react';
import Sidebar from './Sidebar';
import { LoaderFunctionArgs } from '@remix-run/node';
import {
  getCurrentUserAccountType,
  getCurrentUser,
  getCurrentProfileInfo,
} from '~/servers/user.server';
import { AccountStatus } from '~/types/enums';

export async function loader({ request }: LoaderFunctionArgs) {
  const accountType = await getCurrentUserAccountType(request);
  const currentUser = await getCurrentUser(request);
  const profile = await getCurrentProfileInfo(request);
  const is_published_or_deactivated =
    profile.account.accountStatus === AccountStatus.Published ||
    profile.account.accountStatus === AccountStatus.Deactivated;

  return Response.json({
    accountType,
    currentUser,
    isOnboarded: profile?.account?.user?.isOnboarded,
    profile,
    is_published_or_deactivated,
  });
}
export default function Layout() {
  const { isOnboarded, is_published_or_deactivated } = useLoaderData<{
    isOnboarded: boolean;
    is_published_or_deactivated: boolean;
  }>();
  return (
    <div>
      <Header />
      <div className="flex mt-[100px] mb-10">
        {isOnboarded && is_published_or_deactivated ? (
          <>
            <Sidebar />
            <div className="container">
              <Outlet />
            </div>
          </>
        ) : (
          // Add 'w-full' to make the container take full width when no sidebar
          <div className="container w-full mt-10 p-5 mb-10">
            <Outlet />
          </div>
        )}
      </div>
    </div>
  );
}
