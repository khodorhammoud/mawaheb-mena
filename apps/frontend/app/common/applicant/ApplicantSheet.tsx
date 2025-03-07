import { Sheet, SheetContent, SheetHeader } from "~/components/ui/sheet";

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

  console.log("Normalized Freelancer Data:", normalizedFreelancer);
  console.log("Review data:", normalizedFreelancer.review);

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side="right"
        className="bg-white xl:w-[70%] lg:w-[80%] md:w-[90%] w-[100%]"
      >
        <div className="h-full overflow-y-auto overflow-x-hidden">
          <SheetHeader>
            <div className="w-full ml-6 mb-10">
              <UserProfile canEdit={false} profile={normalizedFreelancer} />
            </div>
          </SheetHeader>
        </div>
      </SheetContent>
    </Sheet>
  );
}
