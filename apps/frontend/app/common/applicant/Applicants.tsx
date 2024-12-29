import { useState } from "react";
import ApplicantSheet from "./ApplicantSheet";
import { AccountBio, Freelancer } from "~/types/User";
import { JobApplicationStatus } from "~/types/enums";
import { Button } from "~/components/ui/button";

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
  const [isSheetOpen, setIsSheetOpen] = useState(false); // State for the sheet visibility
  // const [selectedFreelancer, setSelectedFreelancer] = useState(null); // State for the selected freelancer

  // Handle the click event to open the sheet with selected freelancer
  const handleApplicantClick = (/* freelancer */) => {
    // setSelectedFreelancer(freelancer); // Set the selected freelancer
    setIsSheetOpen(true); // Open the sheet
  };
  return (
    <div className="">
      {freelancers && freelancers.length > 0 ? (
        freelancers.map((freelancer, index) => {
          // Check if the state is default; otherwise, skip processing.
          if (status === JobApplicationStatus.Pending) {
            return (
              <div
                className="grid grid-rows-[2fr_1fr] bg-white border rounded-xl shadow-xl gap-8 mb-6"
                key={index}
              >
                <div className="mt-8 lg:mx-7 mx-4">
                  {/* FREELANCER PROFILE CONTENT */}
                  <div
                    className="md:flex grid sm:grid-cols-2 grid-cols-1 xl:gap-6 sm:gap-4 gap-8 justify-between"
                    key={index}
                  >
                    {/* Image Container */}
                    <div className="">
                      <img
                        src={
                          // freelancer.photoUrl ||
                          "https://www.fivebranches.edu/wp-content/uploads/2021/08/default-image.jpg"
                        }
                        alt="profile 1"
                        className="h-24 w-auto rounded-xl"
                      />
                    </div>

                    {/* Freelancer Details */}
                    <div className="lg:w-[40%] md:w-[30%]">
                      <Button
                        className="text-xl font-semibold tracking-wide mb-4 cursor-pointer hover:underline inline-block transition-transform duration-300 p-0"
                        onClick={() => handleApplicantClick(/* freelancer */)}
                      >
                        {accountBio.firstName}{" "}
                        {accountBio.lastName?.charAt(0).toUpperCase()}.
                      </Button>
                      <p className="mb-4 text-sm text-gray-400">
                        Invitation sent
                      </p>
                      <p className="text-sm leading-6">{about}</p>
                    </div>

                    {/* Additional Details */}
                    <div className="lg:w-[22%] md:ml-0 sm:ml-2">
                      <h1 className="md:text-xl text-lg font-semibold tracking-wide mb-4">
                        Skills Skills Skills Skills Skills Skills Skills Skills
                        Skills
                      </h1>
                    </div>

                    {/* Actions */}
                    <div className="lg:w-[10%] flex flex-col items-center justify-center md:justify-start sm:mt-0 -mt-4">
                      <button className="text-primaryColor hover:text-white border border-gray-300 rounded-xl xl:px-4 px-2 py-2 hover:bg-primaryColor-dark not-active-gradient text-sm xl:text-base">
                        shortlisted
                      </button>
                    </div>
                  </div>
                </div>

                {/* ApplicantSheet Component */}
                <ApplicantSheet
                  isOpen={isSheetOpen}
                  onClose={() => setIsSheetOpen(false)}
                />

                {/* Dates Section */}
                <div className="mx-7 mb-6">
                  <div className="lg:flex grid grid-cols-2 gap-y-4 lg:justify-between">
                    <div className="flex flex-col items-center">
                      <p className="mb-1 text-sm text-gray-400">
                        Invitation sent
                      </p>
                      <p className="">date 1</p>
                    </div>
                    <div className="flex flex-col items-center">
                      <p className="mb-1 text-sm text-gray-400">
                        Invitation accepted
                      </p>
                      <p className="">date 2</p>
                    </div>
                    <div className="flex flex-col items-center">
                      <p className="mb-1 text-sm text-gray-400">
                        Interview booked
                      </p>
                      <p className="">date 3</p>
                    </div>
                    <div className="lg:mr-5 flex flex-col items-center">
                      <p className="mb-1 text-sm text-gray-400">Interviewed</p>
                      <p className="">date 4</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          } else if (status === JobApplicationStatus.Shortlisted) {
            <h1>state is shortlisted :D</h1>;
          } else if (status === JobApplicationStatus.Approved) {
            <h1>state is interviewed</h1>;
          } else {
            <h1>state is pending</h1>;
          }
        })
      ) : (
        <div className="text-center text-gray-500 mt-10">
          <p>This job has no applicants yet</p>
        </div>
      )}
    </div>
  );
}
