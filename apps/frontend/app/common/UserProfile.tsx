import { useFetcher } from "@remix-run/react";
import Heading from "~/common/profileView/heading/Heading";
import GeneralizableFormCard from "~/common/profileView/onboarding-form-component";
import { AiFillStar } from "react-icons/ai";
import { useEffect } from "react";

interface UserProfileProps {
  canEdit: boolean;
  accountOnboarded: boolean;
  profile?: any; // ✅ Accept freelancer prop
  sections: {
    formType:
      | "number"
      | "text"
      | "range"
      | "textArea"
      | "increment"
      | "video"
      | "file"
      | "repeatable"
      | "custom";
    cardTitle: string;
    popupTitle: string;
    triggerLabel: string;
    formName: string;
    fieldName: string;
    repeatableFieldName?: string;
    triggerIcon?: JSX.Element;
    minVal?: number;
    maxVal?: number;
    useRichText?: boolean;
    width?: string;
    value?: any; // needed
  }[][];
}

export default function UserProfile({
  canEdit,
  accountOnboarded,
  profile = {},
  sections,
}: UserProfileProps) {
  useEffect(() => {
    // console.log("🔥 USERPROFILE: Received Profile:", profile);
  }, [profile]);

  const fetcher = useFetcher(); // ✅ Enables form submissions

  return (
    <div className="relative">
      {/* Profile Header */}
      <div
        className="h-32 sm:h-36 md:h-40 w-auto sm:my-4 mb-2 rounded-xl border-2 relative"
        style={{
          background: "linear-gradient(to right, #27638a 0%, white 75%)",
        }}
      >
        {canEdit && (
          <div className="absolute top-4 right-4">
            <button className="underline-none text-sm rounded-xl flex items-center justify-center text-primaryColor border border-gray-300 sm:px-5 sm:py-3 px-3 py-2 font-semibold tracking-wide not-active-gradient hover:text-white w-fit">
              Add Title
            </button>
          </div>
        )}
        <div className="xl:right-40 lg:right-32 md:right-24 sm:right-16 right-10">
          {!accountOnboarded && (
            <div className="flex items-center justify-end mt-6 mr-1">
              <AiFillStar className="text-yellow-500 h-5 w-5 mr-1" />
              <span>0/5</span>
            </div>
          )}
        </div>
      </div>

      <Heading profile={profile} canEdit={canEdit} />

      {/* Grid Layout with Flexbox */}
      <div className="flex flex-col items-center gap-6">
        {sections.map((row, rowIndex) => (
          <div key={rowIndex} className="flex flex-wrap gap-6 w-full">
            {row.map((section, index) => (
              <div
                key={index}
                style={{ width: section.width || "80%" }}
                className="max-w-full flex-shrink-0"
              >
                <GeneralizableFormCard
                  formType={section.formType}
                  cardTitle={section.cardTitle}
                  popupTitle={section.popupTitle}
                  triggerLabel={section.triggerLabel}
                  formName={section.formName}
                  fieldName={section.fieldName}
                  repeatableFieldName={section.repeatableFieldName}
                  triggerIcon={section.triggerIcon}
                  minVal={section.minVal}
                  maxVal={section.maxVal}
                  useRichText={section.useRichText}
                  editable={canEdit}
                  fetcher={fetcher} // ✅ This fixes form submission
                  value={section.value} // needed
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
