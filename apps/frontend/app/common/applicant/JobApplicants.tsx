import { useState } from "react";
import { useLoaderData } from "@remix-run/react";
import { JobApplicationStatus } from "~/types/enums";
import Applicants from "./Applicants";
import { AccountBio, Freelancer } from "~/types/User";
import { JobCardData } from "~/types/Job";

type JobApplicantsProps = {
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
}: JobApplicantsProps) {
  // Use the loader data to get job applications
  const { jobData } = useLoaderData<{ jobData: JobCardData }>();
  const [selectedStatus, setSelectedStatus] = useState<JobApplicationStatus>(
    JobApplicationStatus.Pending
  );

  // Filter job applications based on the selected status

  const filteredApplicants = jobData.applications.filter((applicant) => {
    return applicant.status === selectedStatus;
  });

  return (
    <div>
      {/* TITLE and BUTTONS */}
      <div className="mt-20 mb-10 md:flex md:gap-10 gap-4 items-center">
        <h2 className="font-semibold xl:text-3xl md:text-2xl text-xl ml-1">
          Applicants
        </h2>
        <div className="sm:flex grid grid-cols-1 w-[40%] lg:ml-10 ml-0 gap-2 xl:space-x-2 lg:space-x-1 md:mt-0 mt-4">
          {Object.values(JobApplicationStatus).map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`rounded-xl xl:px-4 px-2 py-2 text-sm xl:text-base transition-all text-center h-full lg:min-w-28 min-w-[86px]
              ${
                selectedStatus === status
                  ? "bg-primaryColor text-white border"
                  : "text-primaryColor border border-gray-300 hover:bg-primaryColor hover:text-white"
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Display Applicants */}
      {filteredApplicants.length > 0 ? (
        <Applicants
          freelancers={filteredApplicants}
          accountBio={accountBio}
          about={about}
          status={selectedStatus}
        />
      ) : (
        <p className="text-center text-gray-500">
          No applicants found for this status.
        </p>
      )}
    </div>
  );
}
