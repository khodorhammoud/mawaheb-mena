import { useFetcher } from "@remix-run/react";
import Heading from "~/common/profileView/heading/Heading";
import GeneralizableFormCard from "~/common/profileView/onboarding-form-component";
import { AiFillStar } from "react-icons/ai";
import { FaDollarSign } from "react-icons/fa";
import { SlBadge } from "react-icons/sl";

interface UserProfileProps {
  canEdit: boolean;
  accountOnboarded: boolean;
  profile?: any;
}

export default function UserProfile({
  canEdit,
  accountOnboarded,
  profile = {},
}: UserProfileProps) {
  const fetcher = useFetcher();

  const sections = [
    [
      {
        formType: "range",
        cardTitle: "Hourly Rate",
        popupTitle: "Hourly Rate",
        triggerLabel: "Add Hourly Rate",
        formName: "freelancer-hourly-rate",
        fieldName: "hourlyRate",
        triggerIcon: <FaDollarSign />,
        value: profile.hourlyRate || 0,
        minVal: 10,
        maxVal: 100,
        width: "w-full md:w-[48%]",
      },
      {
        formType: "increment",
        cardTitle: "Experience",
        popupTitle: "Years of experience",
        triggerLabel: "Add Years of Experience",
        formName: "freelancer-years-of-experience",
        fieldName: "yearsOfExperience",
        triggerIcon: <SlBadge />,
        value: profile.yearsOfExperience || 0,
        width: "w-full md:w-[48%]",
      },
    ],
    [
      {
        formType: "video",
        cardTitle: "Introductory Video",
        popupTitle: "Introductory Video",
        triggerLabel: "Add Video",
        formName: "freelancer-video",
        fieldName: "videoLink",
        value: profile.videoLink || "",
        width: "w-full md:w-[48%]",
      },
      {
        formType: "textArea",
        cardTitle: "About",
        popupTitle: "Introduce Yourself",
        triggerLabel: "Add Bio",
        formName: "freelancer-about",
        fieldName: "about",
        value: profile.about || "",
        useRichText: true,
        width: "w-full md:w-[48%]",
      },
    ],
    [
      {
        formType: "repeatable",
        cardTitle: "Portfolio",
        popupTitle: "Add a Project",
        triggerLabel: "Add Projects",
        formName: "freelancer-portfolio",
        fieldName: "portfolio",
        value: profile.portfolio || [],
        repeatableFieldName: "portfolio",
        width: "w-full",
      },
    ],
    [
      {
        formType: "repeatable",
        cardTitle: "Work History",
        popupTitle: "Add Work History",
        triggerLabel: "Add Work History",
        formName: "freelancer-work-history",
        fieldName: "workHistory",
        value: profile.workHistory || [],
        repeatableFieldName: "workHistory",
        width: "w-full",
      },
    ],
    [
      {
        formType: "repeatable",
        cardTitle: "Certificates",
        popupTitle: "Add Certificates",
        triggerLabel: "Add Certificates",
        formName: "freelancer-certificates",
        fieldName: "certificates",
        value: profile.certificates || [],
        repeatableFieldName: "certificates",
        width: "w-full",
      },
    ],
    [
      {
        formType: "repeatable",
        cardTitle: "Education",
        popupTitle: "Add Education",
        triggerLabel: "Add Education",
        formName: "freelancer-educations",
        fieldName: "educations",
        value: profile.educations || [],
        repeatableFieldName: "educations",
        width: "w-full",
      },
    ],
  ];

  return (
    <div className="relative w-full max-w-7xl mx-auto pr-10">
      {/* Profile Header */}
      <div
        className="h-32 sm:h-36 md:h-40 w-full my-4 rounded-xl border-2 relative"
        style={{
          background: "linear-gradient(to right, #27638a 0%, white 75%)",
        }}
      >
        {canEdit && (
          <div className="absolute top-4 right-4">
            <button className="text-sm rounded-xl flex items-center justify-center text-primaryColor border border-gray-300 sm:px-5 sm:py-3 px-3 py-2 font-semibold hover:bg-primaryColor hover:text-white transition-all">
              Add Title
            </button>
          </div>
        )}
        <div className="flex justify-end mt-6 mr-4">
          {!accountOnboarded && (
            <div className="flex items-center">
              <AiFillStar className="text-yellow-500 h-5 w-5 mr-1" />
              <span>0/5</span>
            </div>
          )}
        </div>
      </div>

      {/* Profile Heading */}
      <div className="mb-10">
        <Heading profile={profile} canEdit={canEdit} />
      </div>

      {/* Grid Layout for Sections */}
      <div className="flex flex-col items-center gap-6">
        {sections.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className="flex flex-wrap gap-6 w-full justify-between"
          >
            {row.map((section, index) => (
              <div key={index} className={`${section.width} flex-shrink-0`}>
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
                  fetcher={fetcher}
                  value={section.value}
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
