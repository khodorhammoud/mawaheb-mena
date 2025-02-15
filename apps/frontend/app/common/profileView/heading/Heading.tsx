import IndustriesServed from "./industries-served";
import Languages from "./languages";
import BioInfo from "./bio-info";
import { useLoaderData } from "@remix-run/react";
import { AccountType } from "~/types/enums";
import Skills from "./skills";

// ✅ Added Type for Props
interface HeadingProps {
  isViewing?: boolean; // Optional prop with default false
}

export default function Heading({ isViewing = false }: HeadingProps) {
  const { accountType } = useLoaderData<{
    accountType: AccountType; // account type Enum
  }>();

  return (
    <div className="flex items-center mb-6 font-['Switzer-Regular'] relative">
      {/* Bio Info ✏️ */}
      <div className="z-10 -mt-14">
        <BioInfo />
      </div>

      {accountType === AccountType.Freelancer ? (
        <div className="sm:absolute sm:flex sm:flex-col sm:gap-24 hidden sm:top-0 xl:-right-14 md:-right-10 right-0 top-20">
          {/* Languages Served ✏️ */}
          <Languages />
          <Skills />
        </div>
      ) : (
        <>
          {/* Industries Served ✏️ */}
          {!isViewing && <IndustriesServed />}
        </>
      )}
    </div>
  );
}
