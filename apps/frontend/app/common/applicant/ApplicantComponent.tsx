import { useState } from "react";
import ApplicantSheet from "./ApplicantSheet";

type ApplicantComponentProps = {
  job;
  freelancers;
  accountBio;
  about: string;
  state: "default" | "hired" | "interviewed" | "pending";
};

const ApplicantComponent: React.FC<ApplicantComponentProps> = ({
  job,
  freelancers,
  accountBio,
  about,
  state,
}) => {
  const [isSheetOpen, setIsSheetOpen] = useState(false); // State for the sheet visibility
  const [selectedFreelancer, setSelectedFreelancer] = useState(null); // State for the selected freelancer

  // Handle the click event to open the sheet with selected freelancer
  const handleApplicantClick = (freelancer) => {
    setSelectedFreelancer(freelancer); // Set the selected freelancer
    setIsSheetOpen(true); // Open the sheet
  };

  return (
    <div>
      {/* TITLE and BUTTONS */}
      <div className="mt-20 mb-10 md:flex md:gap-10 gap-4 items-center">
        <h2 className="font-semibold xl:text-3xl md:text-2xl text-xl ml-1">
          Applicants
        </h2>
        <div className="sm:flex grid grid-cols-1 w-[60%] xs:w-[60%] ml-0 gap-1 xl:space-x-2 lg:space-x-1 md:mt-0 mt-4">
          <button className="text-primaryColor hover:text-white border border-gray-300 rounded-xl xl:px-4 px-2 py-2 hover:bg-primaryColor-dark not-active-gradient text-sm xl:text-base">
            Interviewed
          </button>
          <button className="text-primaryColor hover:text-white border border-gray-300 rounded-xl xl:px-4 px-2 py-2 hover:bg-primaryColor-dark not-active-gradient text-sm xl:text-base">
            shortlisted
          </button>
          <button className="text-primaryColor hover:text-white border border-gray-300 rounded-xl xl:px-4 px-2 py-2 hover:bg-primaryColor-dark not-active-gradient text-sm xl:text-base">
            Hired
          </button>
        </div>
      </div>

      {freelancers && freelancers.length > 0 ? (
        freelancers.map((freelancer, index) => {
          // Check if the state is default; otherwise, skip processing.
          if (state === "default") {
            return (
              <div
                className="grid grid-rows-[2fr_1fr] bg-white border rounded-xl shadow-xl gap-8 mb-6"
                key={index}
              >
                <div className="mt-8 mx-7">
                  {/* FREELANCER PROFILE CONTENT */}
                  <div className="flex gap-10 justify-between">
                    {/* Image Container */}
                    <div className="flex-shrink-0 w-[8%]">
                      <img
                        src={
                          freelancer.photoUrl ||
                          "https://www.fivebranches.edu/wp-content/uploads/2021/08/default-image.jpg"
                        }
                        alt="image"
                        className="w-24 h-24 rounded-xl"
                      />
                    </div>

                    {/* Freelancer Details */}
                    <div className="w-[40%]">
                      <h1
                        className="text-xl font-semibold tracking-wide mb-4 cursor-pointer hover:underline inline-block transition-transform duration-300"
                        onClick={() => handleApplicantClick(freelancer)}
                      >
                        {accountBio.firstName}{" "}
                        {accountBio.lastName?.charAt(0).toUpperCase()}.
                      </h1>
                      <p className="mb-4 text-sm text-gray-400">
                        Invitation sent
                      </p>
                      <p className="text-sm leading-6">{about}</p>
                    </div>

                    {/* Additional Details */}
                    <div className="w-[22%]">
                      <h1 className="text-xl font-semibold tracking-wide mb-4">
                        Skills
                      </h1>
                    </div>

                    {/* Actions */}
                    <div className="w-[10%]">
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
                  <div className="flex justify-between">
                    <div>
                      <p className="mb-1 text-sm text-gray-400">
                        Invitation sent
                      </p>
                      <p className="">date 1</p>
                    </div>
                    <div>
                      <p className="mb-1 text-sm text-gray-400">
                        Invitation accepted
                      </p>
                      <p className="">date 2</p>
                    </div>
                    <div>
                      <p className="mb-1 text-sm text-gray-400">
                        Interview booked
                      </p>
                      <p className="">date 3</p>
                    </div>
                    <div className="mr-5">
                      <p className="mb-1 text-sm text-gray-400">Interviewed</p>
                      <p className="">date 4</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          } else if (state === "hired") {
            <h1>state is hired :D</h1>;
          } else if (state === "interviewed") {
            <h1>state is interviewed</h1>;
          } else {
            <h1>state is pending</h1>;
          }
        })
      ) : (
        <div className="text-center text-gray-500 mt-10">
          <p>Nothing to map through.</p>
        </div>
      )}
    </div>
  );
};

export default ApplicantComponent;
