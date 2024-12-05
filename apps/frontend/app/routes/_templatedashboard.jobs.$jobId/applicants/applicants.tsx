import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLoaderData } from "@remix-run/react";
import { LoaderData } from "../route"; // Adjust the import path as necessary
import { Badge } from "~/components/ui/badge";
import ApplicantSheet from "./applicantSheet";

const Applicants = () => {
  const navigate = useNavigate();
  const { job, freelancers, accountBio, about } = useLoaderData<LoaderData>();

  const [isSheetOpen, setIsSheetOpen] = useState(false); // State for the sheet visibility
  const [selectedFreelancer, setSelectedFreelancer] = useState(null); // State for the selected freelancer

  // Handle the click event to open the sheet with selected freelancer
  const handleApplicantClick = (freelancer) => {
    setSelectedFreelancer(freelancer); // Set the selected freelancer
    setIsSheetOpen(true); // Open the sheet
  };

  return (
    <div>
      {freelancers && freelancers.length > 0 ? (
        freelancers.map((freelancer, index) => (
          <div
            className="grid grid-rows-[2fr_1fr] bg-white border rounded-xl shadow-xl gap-8"
            key={index}
          >
            <div className="mt-8 mx-7">
              {/* FREELANCER PROFILE CONTENT */}
              <div className="flex gap-10 justify-between">
                {/* Image Container - 10% Width */}
                <div className="flex-shrink-0 w-[8%]">
                  <img
                    src="https://www.fivebranches.edu/wp-content/uploads/2021/08/default-image.jpg"
                    alt="image"
                    className="w-24 h-24 rounded-xl"
                  />
                </div>

                {/* Freelancer Details - 40% Width */}
                <div className="w-[40%]">
                  <h1
                    className="text-xl font-semibold tracking-wide mb-4 cursor-pointer hover:underline inline-block transition-transform duration-300"
                    onClick={() => handleApplicantClick(freelancer)}
                  >
                    {accountBio.firstName}{" "}
                    {accountBio.lastName?.charAt(0).toUpperCase()}.
                  </h1>
                  <p className="mb-4 text-sm text-gray-400">Invitation sent</p>
                  <p className="text-sm leading-6">{about}</p>
                </div>

                {/* Additional Details - 30% Width */}
                <div className="w-[25%]">
                  <h1 className="text-xl font-semibold tracking-wide mb-4">
                    Skills
                  </h1>
                </div>

                {/* Action / Other Information - 20% Width */}
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

            {/* DATES */}
            <div className="mx-7 mb-6">
              <div className="flex justify-between">
                <div>
                  <p className="mb-1 text-sm text-gray-400">Invitation sent</p>
                  <p className="">date 1</p>
                </div>
                <div>
                  <p className="mb-1 text-sm text-gray-400">
                    Invitation accepted
                  </p>
                  <p className="">date 2</p>
                </div>
                <div>
                  <p className="mb-1 text-sm text-gray-400">Interview booked</p>
                  <p className="">date 3</p>
                </div>
                <div className="mr-5">
                  <p className="mb-1 text-sm text-gray-400">Interviewed</p>
                  <p className="">date 4</p>
                </div>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center text-gray-500 mt-10">
          <p>Nothing to map through.</p>
        </div>
      )}
    </div>
  );
};

export default Applicants;

{
  /* Job Details */
}
{
  /* <div className="xl:w-[42%] lg:w-[30%] mr-2">
  <h3
    onClick={() => navigate(`/jobs/${job.id}`)}
    className="xl:text-2xl md:text-xl text-lg mb-2 cursor-pointer hover:underline inline-block transition-transform duration-300"
  >
    {job.title}
  </h3>

  <p className="xl:text-sm text-xs text-gray-400 lg:mb-8 mb-2">
    Posted on {new Date(job.createdAt).toLocaleDateString()}
  </p>
  <div className="flex xl:gap-10 lg:gap-8 gap-6">
    <div>
      <p className="xl:text-xl lg:text-lg text-base mt-4">
        ${job.budget}
      </p>
      <p className="text-gray-400 xl:text-sm text-xs">Budget</p>
    </div>
    <div>
      <p className="xl:text-xl lg:text-lg text-base mt-4">
        {job.experienceLevel}
      </p>
      <p className="text-gray-400 xl:text-sm text-xs">Experience Level</p>
    </div>
  </div>
  <p className="lg:mt-10 mt-6 xl:text-lg lg:text-base text-sm">
    {job.description}
  </p>
  <div className="lg:mt-8 mt-4 flex flex-wrap gap-2 xl:text-base text-sm">
    {job.requiredSkills.map((skill, index) => (
      <span
        key={index}
        className="bg-gray-200 rounded px-2 py-1 text-sm text-gray-700"
      >
        {skill.name}
      </span>
    ))}
  </div>
</div> */
}

{
  /* Freelancer Details */
}
{
  /* <div className="lg:w-[18%] text-left">
  <p className="font-semibold xl:text-base text-sm flex items-center mb-2">
    Total Freelancers: {freelancers.length}
  </p> */
}

{
  /* {freelancers.map((freelancer, index) => (
    <div key={index} className="mb-4">
      <p className="font-semibold xl:text-base text-sm">
        yahh ma fi about
      </p>
      <p className="xl:text-base text-sm">
        Years of Experience: {freelancer.yearsOfExperience}
      </p>
    </div>
  ))} */
}
{
  /* </div> */
}

{
  /* Applicants and Interviews */
}
{
  /* <div className="lg:w-[30%] lg:-mr-10">
  <p className="font-semibold mb-4 xl:text-base text-sm">
    Applicants: {job.applicants.length}
  </p>
  <p className="font-semibold mb-4 xl:text-base text-sm">
    Pending Interviews: 3
  </p>
</div> */
}
