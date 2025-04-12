import Header from './header';
import { Outlet, useLoaderData } from '@remix-run/react';
import Sidebar from './Sidebar';
import { LoaderFunctionArgs, json } from '@remix-run/node';
import {
  getCurrentUserAccountType,
  getCurrentUser,
  getCurrentProfileInfo,
} from '~/servers/user.server';
import { AccountStatus } from '@mawaheb/db';
import { requireUserSession } from '~/auth/auth.server';
import { getNotifications } from '~/servers/notifications.server';
import type { User, Employer, Freelancer } from '@mawaheb/db';

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const userId = await requireUserSession(request);
    if (!userId) {
      return json({
        accountType: null,
        currentUser: null,
        isOnboarded: false,
        profile: null,
        is_published_or_deactivated: false,
        accountStatus: null,
        notifications: [],
      });
    }

    const [accountType, currentUser, profile, notifications] = await Promise.all([
      getCurrentUserAccountType(request),
      getCurrentUser(request),
      getCurrentProfileInfo(request),
      getNotifications(userId),
    ]);

    // Ensure isOnboarded is a boolean
    const isOnboarded = Boolean(currentUser?.isOnboarded);

    // Get account status from profile
    const profileStatus = profile?.account?.accountStatus || AccountStatus.Draft;
    const is_published_or_deactivated = Boolean(
      profileStatus === AccountStatus.Published || profileStatus === AccountStatus.Deactivated
    );

    return json({
      accountType: accountType || null,
      currentUser: currentUser || null,
      isOnboarded,
      profile: profile || null,
      is_published_or_deactivated,
      accountStatus: profileStatus,
      notifications: notifications || [], // Ensure notifications is always an array
    });
  } catch (error) {
    console.error('Loader error:', error);
    return json({
      accountType: null,
      currentUser: null,
      isOnboarded: false,
      profile: null,
      is_published_or_deactivated: false,
      accountStatus: AccountStatus.Draft,
      notifications: [],
    });
  }
}

interface LoaderData {
  isOnboarded: boolean;
  is_published_or_deactivated: boolean;
  notifications: any[];
  accountType: string | null;
  profile: any | null;
  currentUser: any | null;
  accountStatus: string | null;
}

export default function Layout() {
  const { isOnboarded, is_published_or_deactivated } = useLoaderData<LoaderData>();

  return (
    <div className="min-h-screen bg-background">
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
          <div className="container w-full mt-10 p-5 mb-10">
            <Outlet />
          </div>
        )}
      </div>
    </div>
  );
}
