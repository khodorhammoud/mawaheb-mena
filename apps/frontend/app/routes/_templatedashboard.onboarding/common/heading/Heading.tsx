import IndustriesServed from "./industries-served";
import Languages from "./languages";
import BioInfo from "./bio-info";
import { useLoaderData } from "@remix-run/react";
import { AccountType } from "~/types/enums";
export default function Heading() {
  const { accountType } = useLoaderData<{
    accountType: AccountType;
  }>();
  return (
    <>
      <div className="flex items-center mb-6">
        {/* Bio Info ✏️ */}
        <BioInfo />

        {accountType === "freelancer" ? (
          <>
            {/* Languages Served ✏️ */}
            <Languages />
          </>
        ) : (
          <>
            {/* Industries Served ✏️ */}
            <IndustriesServed />
          </>
        )}
      </div>
    </>
  );
}
