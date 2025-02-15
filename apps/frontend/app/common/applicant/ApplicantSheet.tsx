import { Sheet, SheetContent, SheetHeader } from "~/components/ui/sheet";
import GeneralizableFormCard from "~/common/profileView/onboarding-form-component";
import { SlBadge } from "react-icons/sl";
import { FaDollarSign } from "react-icons/fa";
import Heading from "~/common/profileView/heading/Heading";
import { AiFillStar } from "react-icons/ai";

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
  // console.log("🟡 Freelancer Data:", freelancer);

  if (!freelancer) {
    console.warn("⚠️ No freelancer data received!");
    return null;
  }

  // console.log("💰 Hourly Rate:", freelancer.hourlyRate);
  // console.log("🏅 Experience:", freelancer.yearsOfExperience);
  // console.log("📹 Video Link:", freelancer.videoLink);
  // console.log("📜 About:", freelancer.about);
  // console.log("🖼 Portfolio:", freelancer.portfolio);
  // console.log("💼 Work History:", freelancer.workHistory);
  // console.log("🎓 Education:", freelancer.educations);

  // console.log("🟡 Passing to GeneralizableFormCard:", {
  //   hourlyRate: freelancer.hourlyRate,
  //   yearsOfExperience: freelancer.yearsOfExperience,
  //   videoLink: freelancer.videoLink,
  //   about: freelancer.about,
  //   portfolio: freelancer.portfolio,
  // });

  // console.log("📚 Freelancer Educations Data:", freelancer.educations);
  // console.log("📚 Freelancer Cerfiticates Data:", freelancer.certificates);
  // console.log("📚 Freelancer WorkHistory Data:", freelancer.workHistory);
  // console.log("📚 Freelancer Portfolio Data:", freelancer.portfolio);

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

  // console.log(
  //   "🟢 Portfolio passed to GeneralizableFormCard:",
  //   normalizedFreelancer.portfolio
  // );

  // console.log("Video value:", freelancer.videoLink);
  // console.log("About value:", freelancer.about);

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side="right"
        className="bg-white xl:w-[70%] lg:w-[80%] md:w-[90%] w-[100%] py-4"
      >
        <div className="h-full overflow-y-auto">
          <SheetHeader>
            <div
              className="h-32 sm:h-36 md:h-40 w-auto sm:m-4 mb-2 rounded-xl border-2 relative"
              style={{
                background: "linear-gradient(to right, #27638a 0%, white 75%)",
              }}
            >
              {/* <div className="xl:right-40 lg:right-32 md:right-24 sm:right-16 right-10"> */}
              {/* Conditionally Render Star Rating */}
              {/* {!freelancer.accountOnboarded && ( */}
              {/* <div className="flex items-center justify-end mt-6 mr-1"> */}
              {/* <AiFillStar className="text-yellow-500 h-5 w-5 mr-1" /> */}
              {/* <span>0/5</span> */}
              {/* </div> */}
              {/* )} */}
              {/* </div> */}
            </div>

            {/* <div className="mt-28 -mb-32">
              <Heading isViewing={true} />
            </div> */}

            {/* GeneralizableFormCard Sections */}
            <div className="grid grid-cols-1 mb-4">
              <div className="grid mb-4 grid-cols-1 gap-4 lg:grid-cols-2 xl:w-[70%] lg:w-[76%] md:ml-20 md:mr-20 ml-10 mr-10">
                {/* Hourly Rate */}
                <GeneralizableFormCard
                  // Add this line
                  formType="range"
                  cardTitle="Hourly Rate"
                  popupTitle="Hourly Rate"
                  triggerLabel="Add Hourly Rate"
                  formName="freelancer-hourly-rate"
                  fieldName="hourlyRate"
                  triggerIcon={<FaDollarSign />}
                  value={freelancer.hourlyRate}
                  minVal={10}
                  maxVal={100}
                />

                {/* Years of Experience */}
                <GeneralizableFormCard
                  formType="increment"
                  cardTitle="Experience"
                  popupTitle="Years of experience"
                  triggerLabel="Add Years of Experience"
                  formName="freelancer-years-of-experience"
                  fieldName="yearsOfExperience"
                  value={freelancer.yearsOfExperience} // Fix prop name
                  triggerIcon={<SlBadge />}
                />
              </div>
              <div className="grid mb-4 grid-cols-1 gap-4 md:grid-cols-1 lg:grid-cols-2 md:ml-20 md:mr-20 ml-10 mr-10">
                {/* Introductory Video */}
                <GeneralizableFormCard
                  formType="video"
                  cardTitle="Introductory Video"
                  cardSubtitle="Introduce yourself and your business."
                  popupTitle="Introductory video"
                  triggerLabel="Add Video"
                  formName="freelancer-video"
                  fieldName="videoLink"
                  value={freelancer.videoLink}
                />

                {/* About */}
                <GeneralizableFormCard
                  formType="textArea"
                  cardTitle="About"
                  cardSubtitle="Share more about yourself."
                  popupTitle="Introduce Yourself"
                  triggerLabel="Add Bio"
                  formName="freelancer-about"
                  fieldName="about"
                  value={freelancer.about}
                  useRichText={true}
                />
              </div>
              <div className="grid mb-4 grid-cols-1 gap-4 sm:grid-cols-1 md:grid-cols-1 md:ml-20 md:mr-20 ml-10 mr-10">
                {/* Portfolio */}
                <GeneralizableFormCard
                  formType="repeatable"
                  cardTitle="Portfolio"
                  popupTitle="Add a Project"
                  triggerLabel="Add Projects"
                  formName="freelancer-portfolio"
                  fieldName="portfolio"
                  value={
                    Array.isArray(normalizedFreelancer.portfolio)
                      ? normalizedFreelancer.portfolio
                      : JSON.parse(normalizedFreelancer.portfolio ?? "[]")
                  }
                  repeatableFieldName="portfolio"
                />

                {/* Work History */}
                <GeneralizableFormCard
                  formType="repeatable"
                  cardTitle="Work History"
                  popupTitle="Add Work History"
                  triggerLabel="Add Work History"
                  formName="freelancer-work-history"
                  fieldName="workHistory"
                  value={normalizedFreelancer.workHistory}
                  repeatableFieldName="workHistory"
                />

                {/* Certificates */}
                <GeneralizableFormCard
                  formType="repeatable"
                  cardTitle="Certificates"
                  popupTitle="Add Certificates"
                  triggerLabel="Add Certificates"
                  formName="freelancer-certificates"
                  fieldName="certificates"
                  value={normalizedFreelancer.certificates}
                  repeatableFieldName="certificates"
                />

                {/* Education */}
                <GeneralizableFormCard
                  formType="repeatable"
                  cardTitle="Education"
                  popupTitle="Add Education"
                  triggerLabel="Add Education"
                  formName="freelancer-educations"
                  fieldName="educations"
                  value={normalizedFreelancer.educations}
                  repeatableFieldName="educations"
                />
              </div>
            </div>
          </SheetHeader>
        </div>
      </SheetContent>
    </Sheet>
  );
}
