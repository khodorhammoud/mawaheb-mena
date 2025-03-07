import UserProfile from "~/common/UserProfile";
import { useLoaderData } from "@remix-run/react";
import { FaDollarSign } from "react-icons/fa";
import { SlBadge } from "react-icons/sl";
import { AccountType } from "~/types/enums";

export default function Dashboard() {
  const { accountOnboarded, accountType, isOwner, currentProfile } =
    useLoaderData<{
      accountOnboarded: boolean;
      accountType: AccountType;
      isOwner: boolean;
      currentProfile: any;
    }>();

  if (!currentProfile || Object.keys(currentProfile).length === 0) {
    return <p>Loading...</p>; // ✅ Prevents rendering before data is ready
  }

  const canEdit = accountType === AccountType.Freelancer && isOwner;

  const safeParseArray = (data: any): any[] => {
    try {
      return Array.isArray(data) ? data : JSON.parse(data ?? "[]");
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
    <div className="-mx-8">
      <UserProfile
        canEdit={canEdit}
        accountOnboarded={accountOnboarded}
        profile={normalizedProfile}
      />
    </div>
  );
}
