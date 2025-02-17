import { Sheet, SheetContent, SheetHeader } from "~/components/ui/sheet";
import { SlBadge } from "react-icons/sl";
import { FaDollarSign } from "react-icons/fa";

import UserProfile from "../UserProfile";

type ApplicantSheetProps = {
  isOpen: boolean;
  onClose: () => void;
  freelancer: any;
};

export default function ApplicantSheet({
  isOpen,
  onClose,
  freelancer,
}: ApplicantSheetProps) {
  if (!freelancer || Object.keys(freelancer).length === 0) {
    console.warn("⚠️ No freelancer data received or missing fields!");
    return null;
  }

  const parseArray = (data: any) => {
    try {
      return Array.isArray(data) ? data : JSON.parse(data ?? "[]");
    } catch {
      return [];
    }
  };

  const normalizedFreelancer = {
    ...freelancer,
    portfolio: parseArray(freelancer.portfolio),
    workHistory: parseArray(freelancer.workHistory),
    certificates: parseArray(freelancer.certificates),
    educations: parseArray(freelancer.educations),
  };

  // console.log("Freelancer Data:", freelancer);

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side="right"
        className="bg-white xl:w-[70%] lg:w-[80%] md:w-[90%] w-[100%]"
      >
        <div className="h-full overflow-y-auto overflow-x-hidden">
          <SheetHeader>
            <div className="w-full ml-6 mb-10">
              <UserProfile
                canEdit={false} // Read-only mode
                accountOnboarded={true} // Assume already onboarded
                profile={freelancer} // ✅ Pass the freelancer data
                sections={[
                  [
                    {
                      formType: "range",
                      cardTitle: "Hourly Rate",
                      popupTitle: "Hourly Rate",
                      triggerLabel: "Add Hourly Rate",
                      formName: "freelancer-hourly-rate",
                      fieldName: "hourlyRate",
                      triggerIcon: <FaDollarSign />,
                      value: freelancer.hourlyRate, // needed
                      minVal: 10,
                      maxVal: 100,
                      width: "38%",
                    },
                    {
                      formType: "increment",
                      cardTitle: "Experience",
                      popupTitle: "Years of experience",
                      triggerLabel: "Add Years of Experience",
                      formName: "freelancer-years-of-experience",
                      fieldName: "yearsOfExperience",
                      value: freelancer.yearsOfExperience,
                      triggerIcon: <SlBadge />,
                      width: "38%",
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
                      value: freelancer.videoLink,
                      width: "38%",
                    },
                    {
                      formType: "textArea",
                      cardTitle: "About",
                      popupTitle: "Introduce Yourself",
                      triggerLabel: "Add Bio",
                      formName: "freelancer-about",
                      fieldName: "about",
                      value: freelancer.about,
                      useRichText: true,
                      width: "38%",
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
                      value: normalizedFreelancer.portfolio,
                      repeatableFieldName: "portfolio",
                      width: "92%",
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
                      value: normalizedFreelancer.workHistory,
                      repeatableFieldName: "workHistory",
                      width: "92%",
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
                      value: normalizedFreelancer.certificates,
                      repeatableFieldName: "certificates",
                      width: "92%",
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
                      value: normalizedFreelancer.educations,
                      repeatableFieldName: "educations",
                      width: "92%",
                    },
                  ],
                ]}
              />
            </div>
          </SheetHeader>
        </div>
      </SheetContent>
    </Sheet>
  );
}
