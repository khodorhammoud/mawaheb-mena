import { JobApplicationStatus } from '@mawaheb/db/enums';
import { useState } from 'react';
import { useLoaderData } from '@remix-run/react';
import StatusDropdown from '~/routes/_templatedashboard.jobs.$jobId/common/JobStatus';
import ApplicantSheet from './ApplicantSheet';
import { JobCardData } from '@mawaheb/db/types';

type ApplicantsProps = {
  freelancers: any[];
  accountBio: any;
  status: JobApplicationStatus;
};

export default function Applicants({ freelancers, accountBio, status }: ApplicantsProps) {
  const { jobData } = useLoaderData<{ jobData: JobCardData }>();
  const [selectedFreelancer, setSelectedFreelancer] = useState<any>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleApplicantClick = (freelancer: any) => {
    setSelectedFreelancer(freelancer);
    setIsSheetOpen(true);
  };

  return (
    <div className="">
      {freelancers && freelancers.length > 0 ? (
        freelancers.map(freelancer => {
          // Get this freelancer's application
          const application = jobData.applications.find(app => app.freelancerId === freelancer.id);

          return (
            <div
              key={freelancer.id}
              className="grid grid-rows-[2fr_1fr] bg-white border rounded-xl shadow-xl p-4 mb-8"
            >
              <div className="mt-8 lg:mx-7 mx-4">
                <div className="md:flex grid sm:grid-cols-2 grid-cols-1 xl:gap-6 sm:gap-4 gap-8 justify-between">
                  <div className="">
                    <img
                      src={
                        freelancer.email
                          ? `https://www.gravatar.com/avatar/${freelancer.email}?d=identicon`
                          : 'https://www.fivebranches.edu/wp-content/uploads/2021/08/default-image.jpg'
                      }
                      alt="profile"
                      className="h-24 w-auto rounded-xl"
                    />
                  </div>

                  <div className="lg:w-[40%] md:w-[30%]">
                    <h2 className="tracking-wide mb-4  inline-block transition-transform duration-300 p-0">
                      <button
                        className="text-xl font-semibold hover:underline"
                        onClick={() => handleApplicantClick(freelancer)}
                      >
                        {freelancer.firstName ?? 'Unknown'}{' '}
                        {freelancer.lastName?.charAt(0).toUpperCase() ?? ''}.
                      </button>
                    </h2>
                    <p className="mb-4 text-sm text-gray-400">Invitation sent</p>
                    <div
                      className="text-sm leading-6 mb-6"
                      dangerouslySetInnerHTML={{
                        __html: freelancer.about || 'No description available',
                      }}
                    ></div>
                  </div>
                  <div>
                    <StatusDropdown
                      currentStatus={application?.status ?? status}
                      applicationId={application?.id}
                    />
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
                    <p className="mb-1 text-sm text-gray-400">Invitation accepted</p>
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
          );
        })
      ) : (
        <div className="text-center text-gray-500 mt-10">
          <p>This job has no applicants yet</p>
        </div>
      )}
    </div>
  );
}
