import { JobApplicationStatus } from "~/types/enums";
import Applicants from "./Applicants";
import { AccountBio, Freelancer } from "~/types/User";

type JobApplicansProps = {
  freelancers: Freelancer[];
  accountBio: AccountBio;
  about: string;
  status: JobApplicationStatus;
};

export default function JobApplicants({
  freelancers,
  accountBio,
  about,
  status,
}: JobApplicansProps) {
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

      <Applicants
        freelancers={freelancers} // wassim
        accountBio={accountBio} // wassim T Jaaava
        about={about} // FFFFF
        status={status}
      />
    </div>
  );
}
