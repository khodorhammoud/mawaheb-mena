import Industries from './industries-served';
import Languages from './languages';
import BioInfo from './bio-info';
import { useLoaderData } from '@remix-run/react';
import { AccountType } from '@mawaheb/db/enums';
import Skills from './skills';

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

  const { accountType, bioInfo, employerIndustries } = useLoaderData<{
    accountType: AccountType;
    bioInfo: any;
    employerIndustries?: { id: number; name: string }[];
  }>();

  // console.log('EMPPPPPPPPPPP:', employerIndustries);

  // ✅ Ensure freelancer has languages, and employer has industries!
  const baseProfile = profile ? { ...profile } : { ...bioInfo };
  const isEmployer = (profile?.accountType ?? accountType) === AccountType.Employer;

  const profileData = {
    ...baseProfile,
    accountType: profile?.accountType ?? accountType ?? AccountType.Freelancer,
    ...(isEmployer && employerIndustries ? { industries: employerIndustries } : {}),
  };

  // console.log("🔥 USERPROFILE: Received Profile:", profile);
  // console.log(
  //   "🔥 HEADING COMPONENT: Profile Data Before Passing to BioInfo:",
  //   profile
  // );

  return (
    <div className="flex items-center mb-6 font-['Switzer-Regular'] relative">
      {/* Bio Info ✏️ */}
      <div className="z-10 -mt-14 lg:mb-4 md:mb-24 mb-40">
        <BioInfo profile={{ ...profile?.account?.user, ...profileData }} canEdit={canEdit} />
      </div>

      {profileData.accountType === AccountType.Freelancer ? (
        <div className="absolute flex flex-col gap-4 xl:-right-10 lg:right-0 lg:top-0 left-2 md:top-20 top-24 md:mr-0 mr-10">
          {/* Languages Served ✏️ */}
          <Languages profile={profileData} canEdit={canEdit} />
          <Skills profile={profileData} canEdit={canEdit} />
        </div>
      ) : (
        <>
          {/* Industries Served ✏️ */}
          {!isViewing && <Industries profile={profileData} canEdit={canEdit} />}
        </>
      )}
    </div>
  );
}
