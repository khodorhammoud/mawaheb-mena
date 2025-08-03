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
            <div key={freelancer.id} className="bg-white border rounded-xl shadow-xl p-4 mb-8">
              <div className="mt-8 lg:mx-7 mx-4">
                <div className="grid xl:grid-cols-[1fr_6fr_1fr] lg:grid-cols-[2fr_6fr_1fr] grid-cols-1 justify-between gap-4">
                  {/* Image */}
                  <div className="flex justify-between">
                    <img
                      src={
                        freelancer.email
                          ? `https://www.gravatar.com/avatar/${freelancer.email}?d=identicon`
                          : 'https://www.fivebranches.edu/wp-content/uploads/2021/08/default-image.jpg'
                      }
                      alt="profile"
                      className="md:h-24 h-16 w-auto rounded-xl"
                    />
                    <div className="lg:hidden block">
                      <StatusDropdown
                        currentStatus={application?.status ?? status}
                        applicationId={application?.id}
                      />
                    </div>
                  </div>

                  {/* Freelancer + Description */}
                  <div className="">
                    <h2 className="tracking-wide inline-block transition-transform duration-300 p-0">
                      <button
                        className="xl:text-xl sm:text-lg text-base leading-tight cursor-pointer hover:underline inline-block transition-transform duration-300"
                        onClick={() => handleApplicantClick(freelancer)}
                      >
                        {freelancer.firstName ?? 'Unknown'}{' '}
                        {freelancer.lastName?.charAt(0).toUpperCase() ?? ''}.
                      </button>
                    </h2>
                    <p className="mb-6 lg:text-sm text-xs text-gray-400">Invitation sent</p>
                    <div
                      className="lg:text-sm text-xs leading-6 mb-6"
                      dangerouslySetInnerHTML={{
                        __html: freelancer.about || 'No description available',
                      }}
                    ></div>
                  </div>

                  {/* Status Button */}
                  <div className="lg:block hidden">
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
              <div className="lg:mx-7 mx-4 mt-4">
                <div className="md:flex md:justify-between grid grid-cols-2 gap-y-4">
                  <div className="flex flex-col">
                    <p className="text-gray-400 lg:text-sm text-xs">Invitation sent</p>
                    <p className="lg:text-base text-sm">date 1</p>
                  </div>
                  <div className="flex flex-col">
                    <p className="text-gray-400 lg:text-sm text-xs">Invitation accepted</p>
                    <p className="lg:text-base text-sm">date 2</p>
                  </div>
                  <div className="flex flex-col">
                    <p className="text-gray-400 lg:text-sm text-xs">Interview booked</p>
                    <p className="lg:text-base text-sm">date 3</p>
                  </div>
                  <div className="lg:mr-5 flex flex-col">
                    <p className="text-gray-400 lg:text-sm text-xs">Interviewed</p>
                    <p className="lg:text-base text-sm">date 4</p>
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
