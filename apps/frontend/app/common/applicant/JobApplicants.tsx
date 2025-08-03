import { useState } from 'react';
import { useLoaderData } from '@remix-run/react';
import { JobApplicationStatus } from '@mawaheb/db/enums';
import Applicants from './Applicants';
import { AccountBio, Freelancer } from '@mawaheb/db/types';
import { JobCardData } from '@mawaheb/db/types';

type JobApplicantsProps = {
  freelancers: Freelancer[];
  accountBio: AccountBio;
  status: JobApplicationStatus;
};

export default function JobApplicants({ freelancers, accountBio, status }: JobApplicantsProps) {
  const { jobData } = useLoaderData<{ jobData: JobCardData }>();
  const [selectedStatus, setSelectedStatus] = useState<JobApplicationStatus>(
    JobApplicationStatus.Pending
  );

  // Filter Applicants Based on Status
  const filteredApplicants = freelancers.filter(freelancer =>
    jobData.applications.some(
      application =>
        application.freelancerId === freelancer.id && application.status === selectedStatus
    )
  );

  return (
    <div>
      {/* Title & Filter Buttons */}
      <div className="mt-14 mb-8 md:flex md:gap-8 gap-6 items-center">
        <h2 className="font-semibold xl:text-2xl lg:text-xl text-lg ml-1">Applicants</h2>
        <div className="sm:flex grid grid-cols-2 w-fit lg:ml-10 ml-0 gap-2 md:mt-0 mt-4">
          {Object.values(JobApplicationStatus).map(status => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`rounded-xl xl:px-4 px-3 py-1 xl:text-sm text-xs transition-all text-center
              ${
                selectedStatus === status
                  ? 'bg-primaryColor text-white border'
                  : 'text-primaryColor border border-gray-300 hover:bg-primaryColor hover:text-white'
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
          status={selectedStatus}
        />
      ) : (
        <p className="text-center text-gray-400 xl:text-base text-sm">
          No applicants found for this status.
        </p>
      )}
    </div>
  );
}
