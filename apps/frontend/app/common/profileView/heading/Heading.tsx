import IndustriesServed from "./industries-served";
import Languages from "./languages";
import BioInfo from "./bio-info";
import { useLoaderData } from "@remix-run/react";
import { AccountType } from "~/types/enums";
import Skills from "./skills";

// ✅ Accept `freelancer` prop (optional)
interface HeadingProps {
  isViewing?: boolean; // Optional prop with default false
  profile?: any; // Add freelancer data if viewing a freelancer profile
  canEdit?: boolean; // ✅ Add `canEdit` prop (default true)
}

export default function Heading({
  isViewing = false,
  profile,
  canEdit = true, // ✅ Default to `true`
}: HeadingProps) {
  // i had that previously :)
  // const { accountType } = useLoaderData<{
  //   accountType: AccountType; // account type Enum
  // }>();

  // ✅ Use freelancer data if provided, otherwise default to employer
  // const profileData = freelancer || useLoaderData<{ bioInfo: any }>().bioInfo;

  const { accountType, bioInfo } = useLoaderData<{
    accountType: AccountType;
    bioInfo: any;
  }>();

  // console.log("Freelancer Prop Passed:", freelancer);

  // ✅ Ensure freelancer has languages
  const profileData = profile
    ? {
        ...profile,
        accountType:
          profile.accountType ?? accountType ?? AccountType.Freelancer,
      }
    : { ...bioInfo, accountType };

  // console.log("🔥 USERPROFILE: Received Profile:", profile);
  // console.log(
  //   "🔥 HEADING COMPONENT: Profile Data Before Passing to BioInfo:",
  //   profile
  // );

  return (
    <div className="flex items-center mb-6 font-['Switzer-Regular'] relative">
      {/* Bio Info ✏️ */}
      <div className="z-10 -mt-14">
        <BioInfo
          profile={{ ...profile?.account?.user, ...profileData }}
          canEdit={canEdit}
        />
      </div>

      {profileData.accountType === AccountType.Freelancer ? (
        <div className="sm:absolute sm:flex sm:flex-col sm:gap-4 hidden sm:top-0 xl:-right-14 md:-right-10 right-0 top-20">
          {/* Languages Served ✏️ */}
          <Languages profile={profileData} canEdit={canEdit} />
          <Skills profile={profileData} canEdit={canEdit} />
        </div>
      ) : (
        <>
          {/* Industries Served ✏️ */}
          {!isViewing && (
            <IndustriesServed profile={profileData} canEdit={canEdit} />
          )}
        </>
      )}
    </div>
  );
}
