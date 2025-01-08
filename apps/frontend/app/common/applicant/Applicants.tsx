import { useState } from "react";
import ApplicantSheet from "./ApplicantSheet";
import { AccountBio, Freelancer } from "~/types/User";
import { JobApplicationStatus } from "~/types/enums";
import { Button } from "~/components/ui/button";
import StatusDropdown from "~/routes/_templatedashboard.jobs.$jobId/common/JobStatus";
import { useLoaderData } from "@remix-run/react";
import { JobApplication } from "~/types/Job";

type ApplicantsProps = {
  freelancers: Freelancer[];
  accountBio: AccountBio;
  about: string;
  status: JobApplicationStatus;
};

export default function Applicants({
  freelancers,
  accountBio,
  about,
  status,
}: ApplicantsProps) {
  const { applications } = useLoaderData<{ applications: JobApplication[] }>();

  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Handle the click event to open the sheet with selected freelancer
  const handleApplicantClick = () => {
    setIsSheetOpen(true);
  };

  return (
    <div className="">
      {freelancers && freelancers.length > 0 ? (
        freelancers.map((freelancer, index) => (
          <div
            className="grid grid-rows-[2fr_1fr] bg-white border rounded-xl shadow-xl gap-8 mb-6"
            key={index}
          >
            <div className="mt-8 lg:mx-7 mx-4">
              <div className="md:flex grid sm:grid-cols-2 grid-cols-1 xl:gap-6 sm:gap-4 gap-8 justify-between">
                <div>
                  <img
                    src={
                      "https://www.fivebranches.edu/wp-content/uploads/2021/08/default-image.jpg"
                    }
                    alt="profile"
                    className="h-24 w-auto rounded-xl"
                  />
                </div>

                <div className="lg:w-[40%] md:w-[30%]">
                  <Button
                    className="text-xl font-semibold tracking-wide mb-4 cursor-pointer hover:underline inline-block transition-transform duration-300 p-0"
                    onClick={handleApplicantClick}
                  >
                    {accountBio.firstName}{" "}
                    {accountBio.lastName?.charAt(0).toUpperCase()}.
                  </Button>
                  <p className="mb-4 text-sm text-gray-400">Invitation sent</p>
                  <p className="text-sm leading-6">{about}</p>
                </div>

                <div>
                  {applications.map((application) => (
                    <div key={application.id}>
                      {/* Render application details */}
                      <StatusDropdown
                        currentStatus={application.status}
                        applicationId={application.id}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <ApplicantSheet
              isOpen={isSheetOpen}
              onClose={() => setIsSheetOpen(false)}
            />

            <div className="mx-7 mb-6">
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
