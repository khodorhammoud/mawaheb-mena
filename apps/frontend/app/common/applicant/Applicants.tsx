import { JobApplicationStatus } from "~/types/enums";
import { useState } from "react";
import StatusDropdown from "~/routes/_templatedashboard.jobs.$jobId/common/JobStatus";
import ApplicantSheet from "./ApplicantSheet";
import DOMPurify from "dompurify";

type ApplicantsProps = {
  freelancers: any[];
  accountBio: any;
  status: JobApplicationStatus;
};

export default function Applicants({
  freelancers,
  accountBio,
  status,
}: ApplicantsProps) {
  const [selectedFreelancer, setSelectedFreelancer] = useState<any>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Handle the click event to open the sheet with selected freelancer
  const handleApplicantClick = (freelancer: any) => {
    setSelectedFreelancer(freelancer);
    setIsSheetOpen(true);
  };

  return (
    <div className="">
      {freelancers && freelancers.length > 0 ? (
        freelancers.map((freelancer) => (
          <div
            key={freelancer.id}
            className="grid grid-rows-[2fr_1fr] bg-white border rounded-xl shadow-xl p-4 mb-8"
          >
            {/* Header Section */}
            <div className="mt-8 lg:mx-7 mx-4">
              <div className="md:flex grid sm:grid-cols-2 grid-cols-1 xl:gap-6 sm:gap-4 gap-8 justify-between">
                <div className="">
                  <img
                    src={
                      freelancer.email
                        ? `https://www.gravatar.com/avatar/${freelancer.email}?d=identicon`
                        : "https://www.fivebranches.edu/wp-content/uploads/2021/08/default-image.jpg"
                    }
                    alt="profile"
                    className="h-24 w-auto rounded-xl"
                  />
                </div>

                <div className="lg:w-[40%] md:w-[30%]">
                  <h2
                    className="text-xl font-semibold tracking-wide mb-4 cursor-pointer hover:underline inline-block transition-transform duration-300 p-0"
                    onClick={() => handleApplicantClick(freelancer)}
                  >
                    {freelancer.firstName ?? "Unknown"}{" "}
                    {freelancer.lastName?.charAt(0).toUpperCase() ?? ""}.
                  </h2>

                  <p className="mb-4 text-sm text-gray-400">Invitation sent</p>
                  <p
                    className="text-sm leading-6 mb-6"
                    dangerouslySetInnerHTML={{
                      __html: freelancer.about
                        ? DOMPurify.sanitize(freelancer.about)
                        : "No portfolio description available",
                    }}
                  />
                </div>
                <div>
                  <div>
                    {/* Render application details */}
                    <StatusDropdown
                      currentStatus={status}
                      applicationId={freelancer.id}
                    />
                  </div>
                </div>
              </div>
            </div>

            {selectedFreelancer && (
              <ApplicantSheet
                isOpen={isSheetOpen}
                onClose={() => setIsSheetOpen(false)}
                freelancer={selectedFreelancer}
              />
            )}

            {/* Timeline Section */}
            <div className="mx-7">
              <div className="lg:flex grid grid-cols-2 gap-y-4 lg:justify-between">
                <div className="flex flex-col items-center">
                  <p className="mb-1 text-sm text-gray-400">Invitation sent</p>
                  <p className="">date 1</p>
                </div>
                <div className="flex flex-col items-center">
                  <p className="mb-1 text-sm text-gray-400">
                    Invitation accepted
                  </p>
                  <p className="">date 2</p>
                </div>
                <div className="flex flex-col items-center">
                  <p className="mb-1 text-sm text-gray-400">Interview booked</p>
                  <p className="">date 3</p>
                </div>
                <div className="lg:mr-5 flex flex-col items-center">
                  <p className="mb-1 text-sm text-gray-400">Interviewed</p>
                  <p className="">date 4</p>
                </div>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center text-gray-500 mt-10">
          <p>This job has no applicants yet</p>
        </div>
      )}
    </div>
  );
}
