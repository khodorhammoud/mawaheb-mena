import UserProfile from '~/common/UserProfile';
import { useLoaderData } from '@remix-run/react';
import { FaDollarSign } from 'react-icons/fa';
import { SlBadge } from 'react-icons/sl';
import { AccountType, AccountStatus } from '@mawaheb/db/enums';

export default function Dashboard() {
  const { accountOnboarded, accountType, isOwner, currentProfile, accountStatus } = useLoaderData<{
    accountOnboarded: boolean;
    accountType: AccountType;
    isOwner: boolean;
    currentProfile: any;
    accountStatus: AccountStatus;
  }>();

  if (!currentProfile || Object.keys(currentProfile).length === 0) {
    return <p>Loading...</p>; // ✅ Prevents rendering before data is ready
  }

  const canEdit = accountType === AccountType.Freelancer && isOwner;

  const safeParseArray = (data: any): any[] => {
    try {
      return Array.isArray(data) ? data : JSON.parse(data ?? '[]');
    } catch {
      return [];
    }
  };

  const normalizedProfile = {
    ...currentProfile,
    portfolio: safeParseArray(currentProfile.portfolio),
    workHistory: safeParseArray(currentProfile.workHistory),
    certificates: safeParseArray(currentProfile.certificates),
    educations: safeParseArray(currentProfile.educations),
    languages: safeParseArray(currentProfile.languages),
    skills: safeParseArray(currentProfile.skills),
  };

  // console.log(
  //   "🔥 FRONTEND: Normalized Profile in Dashboard:",
  //   normalizedProfile
  // );

  return (
    <div className="">
      {/* Deactivated Account Banner for Freelancers */}
      {accountStatus && accountStatus.toString() === AccountStatus.Deactivated.toString() && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 ml-8 mr-16 mt-4"
          role="alert"
          data-testid="deactivated-account-banner"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Account Deactivated</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>Your account has been deactivated. Please contact support for assistance.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <UserProfile canEdit={canEdit} profile={normalizedProfile} />
    </div>
  );
}
