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
    <UserProfile
      canEdit={canEdit}
      profile={normalizedProfile}
      accountOnboarded={accountOnboarded}
      sections={[
        // First Row (Two-Column with Custom Widths)
        [
          {
            formType: "range",
            cardTitle: "Hourly Rate",
            popupTitle: "Hourly Rate",
            triggerLabel: "Add Hourly Rate",
            formName: "freelancer-hourly-rate",
            fieldName: "hourlyRate",
            triggerIcon: <FaDollarSign />,
            minVal: 10,
            maxVal: 100,
            width: "30%", // ✅ Ensures proper width
          },
          {
            formType: "increment",
            cardTitle: "Experience",
            popupTitle: "Years of experience",
            triggerLabel: "Add Years of Experience",
            formName: "freelancer-years-of-experience",
            fieldName: "yearsOfExperience",
            triggerIcon: <SlBadge />,
            width: "30%", // ✅ Ensures proper width
          },
        ],
        // Second Row (Video and About with 49% Width Each)
        [
          {
            formType: "video",
            cardTitle: "Introductory Video",
            popupTitle: "Introductory Video",
            triggerLabel: "Add Video",
            formName: "freelancer-video",
            fieldName: "videoLink",
            width: "47%",
          },
          {
            formType: "textArea",
            cardTitle: "About",
            popupTitle: "Introduce Yourself",
            triggerLabel: "Add Bio",
            formName: "freelancer-about",
            fieldName: "about",
            useRichText: true,
            width: "47%",
          },
        ],
        // Third Row (Projects Full Width)
        [
          {
            formType: "repeatable",
            cardTitle: "Projects",
            popupTitle: "Add a Project",
            triggerLabel: "Add Projects",
            formName: "freelancer-portfolio",
            fieldName: "portfolio",
            repeatableFieldName: "portfolio",
            width: "96%",
          },
        ],
        // Fourth Row (Work History & Certificates Side by Side)
        [
          {
            formType: "repeatable",
            cardTitle: "Work History",
            popupTitle: "Work History",
            triggerLabel: "Add Work History",
            formName: "freelancer-work-history",
            fieldName: "workHistory",
            repeatableFieldName: "workHistory",
            width: "96%",
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
            repeatableFieldName: "certificates",
            width: "96%",
          },
        ],
        // Fifth Row (Education Full Width)
        [
          {
            formType: "repeatable",
            cardTitle: "Education",
            popupTitle: "Add Education",
            triggerLabel: "Add Education",
            formName: "freelancer-educations",
            fieldName: "educations",
            repeatableFieldName: "educations",
            width: "96%",
          },
        ],
      ]}
    />
  );
}
