// import Sidebar from "~/routes/_templatedashboard/Sidebar";
import { Link, useLoaderData, useNavigate } from '@remix-run/react';
// import { useState } from "react";
// import type { Employer } from '@mawaheb/db/types';
import { AccountStatus } from '@mawaheb/db/enums';
import { useToast } from '~/components/hooks/use-toast';
import { ToastAction } from '~/components/ui/toast';
import { Button } from '~/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog';
import { useState } from 'react';

type JobData = {
  title: string;
  count: number;
  change: string;
  changeColor: string;
};

type ApplicantData = {
  title: string;
  count: number;
};

// i am here since the account type is an employer.
// now if the employer is onboarded, then i will be directed to index.tsx inside dashboard-screen. Else, i am still not onboarded, and i am directed to index.tsx inside onboarding-screen
export default function Dashboard() {
  // const { accountOnboarded } = useLoaderData<{ accountOnboarded: boolean }>();
  // Fetch loader data
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  const loaderData = useLoaderData<any>();

  // Extract all possible relevant data
  const currentProfile = loaderData?.currentProfile;
  const activeJobCount = loaderData?.activeJobCount || 0;
  const draftedJobCount = loaderData?.draftedJobCount || 0;
  const closedJobCount = loaderData?.closedJobCount || 0;
  const pausedJobCount = loaderData?.pausedJobCount || 0;
  const totalJobCount = loaderData?.totalJobCount || 0;

  // Access the firstName from the nested structure of currentProfile
  const firstName = currentProfile?.account?.user?.firstName || 'User';

  // Get account status from various possible locations in the data structure
  let accountStatus = loaderData?.accountStatus;
  if (!accountStatus && currentProfile?.account?.accountStatus) {
    accountStatus = currentProfile.account.accountStatus;
  }
  if (!accountStatus && loaderData?.profile?.account?.accountStatus) {
    accountStatus = loaderData.profile.account.accountStatus;
  }
  if (!accountStatus && loaderData?.currentUser?.account?.accountStatus) {
    accountStatus = loaderData.currentUser.account.accountStatus;
  }

  // Function to handle create job click
  const handleCreateJobClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    // Check if account is deactivated - compare as string to be safe
    if (accountStatus && accountStatus.toString() === AccountStatus.Deactivated.toString()) {
      event.preventDefault();
      toast({
        variant: 'destructive',
        title: 'Action Not Allowed',
        description: "You can't create a new job while your account is deactivated",
      });
    }
  };

  // Job postings data
  const jobData: JobData[] = [
    {
      title: 'Active Jobs',
      count: activeJobCount,
      change: '+0 from last month', // Update this dynamically if needed
      changeColor: activeJobCount > 0 ? 'text-green-700' : 'text-red-600',
    },
    {
      title: 'Drafted Jobs',
      count: draftedJobCount,
      change: '+0 from last month', // Update this dynamically if needed
      changeColor: draftedJobCount > 0 ? 'text-green-700' : 'text-red-600',
    },
    {
      title: 'Closed Jobs',
      count: closedJobCount,
      change: '+0 from last month', // Update this dynamically if needed
      changeColor: closedJobCount > 0 ? 'text-green-700' : 'text-red-600',
    },
    {
      title: 'Paused Jobs',
      count: pausedJobCount,
      change: '+0 from last month', // Update this dynamically if needed
      changeColor: pausedJobCount > 0 ? 'text-green-700' : 'text-red-600',
    },
  ];

  // Applicants summary data
  const applicantData: ApplicantData[] = [
    { title: 'Interviewed', count: 5 },
    { title: 'Total Applicants', count: 7 },
    { title: 'Shortlisted', count: 2 },
  ];

  return (
    <div className="flex">
      {/* Main Content */}
      {/* <div className="flex-1 p-6">
          {accountOnboarded ? <DashboardScreen /> : <OnboardingScreen />}
        </div> */}
      <div className="flex-1 pl-6">
        <div className="min-h-screen flex flex-col">
          {/* Conditionally render the welcome message and button only if there are no jobs */}
          {totalJobCount === 0 && (
            <>
              <h1 className="text-2xl ml-6">
                Welcome, <span className="text-primary font-bold">{firstName}!</span>
              </h1>
              <p className="text-2xl ml-6">Good to hear from you. Are you hiring?</p>

              {/* Centered Button Container */}
              <div className="flex justify-start ml-6 mt-4">
                <Link
                  to="/new-job"
                  onClick={handleCreateJobClick}
                  className="bg-primaryColor text-white rounded-md px-4 py-2 hover:bg-primaryColor-dark transition duration-300 w-auto mr-4"
                >
                  Create New Job
                </Link>
              </div>
            </>
          )}

          {/* Main Section */}
          <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 xl:gap-12 gap-4 my-8">
            {/* Job Postings Section */}
            <div className="bg-white">
              <h1 className="xl:text-2xl md:text-xl text-lg font-semibold mb-6">Job Postings</h1>
              <div className="bg-gray-100 rounded-2xl p-8 space-y-10">
                {jobData.map((job, index) => (
                  <div key={index}>
                    {/* title and count */}
                    <h2 className="xl:text-lg text-base font-semibold text-gray-800">
                      {job.title}
                    </h2>
                    <div className="flex items-center gap-10">
                      <p className="xl:text-3xl md:text-2xl text-xl font-bold text-black">
                        {job.count}
                      </p>
                      <div className={`md:text-sm text-xs mt-1 ${job.changeColor}`}>
                        {job.change}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Applicants Summary Section */}
            <div className="bg-white">
              <h1 className="xl:text-2xl md:text-xl text-lg font-semibold mb-6">
                Applicants Summary
              </h1>
              <div className="md:grid md:grid-cols-3">
                {/* Left side: Two small boxes stacked vertically */}
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col justify-center xl:p-6 p-4 bg-gray-100 rounded-xl xl:h-[212px] lg:h-[196px]">
                    <p className="xl:text-3xl md:text-2xl text-xl font-bold text-black">
                      {applicantData[0].count}
                    </p>
                    <h2 className="xl:text-lg md:text-base text-sm font-medium text-gray-800">
                      {applicantData[0].title}
                    </h2>
                  </div>
                  <div className="flex flex-col justify-center xl:p-6 p-4 bg-gray-100 rounded-xl xl:h-[212px] lg:h-[196px]">
                    <p className="xl:text-3xl md:text-2xl text-xl font-bold text-black">
                      {applicantData[2].count}
                    </p>
                    <h2 className="xl:text-lg md:text-base text-sm font-medium text-gray-800">
                      {applicantData[2].title}
                    </h2>
                  </div>
                </div>

                {/* Right side: One big box spanning two rows */}
                <div className="md:col-span-2 flex flex-col justify-center xl:p-6 p-4 bg-gray-100 rounded-xl h-full md:ml-3 md:mt-0 mt-4 xl:h-[440px] lg:h-[408px]">
                  <p className="xl:text-3xl md:text-2xl text-xl font-bold text-black">
                    {applicantData[1].count}
                  </p>
                  <h2 className="xl:text-lg md:text-base text-sm font-medium text-gray-800">
                    {applicantData[1].title}
                  </h2>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// this is the main page that i open, where there is a navigation, and a sidebar ❤️
