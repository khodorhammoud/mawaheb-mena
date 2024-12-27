// import Sidebar from "~/routes/_templatedashboard/Sidebar";
import { Link, useLoaderData } from "@remix-run/react";
// import { useState } from "react";
import type { Employer } from "~/types/User";
/* import JobPostingForm from "../jobs/NewJob";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "~/components/ui/dialog"; */
// import { Button } from "~/components/ui/button";

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
  const {
    currentProfile,
    activeJobCount,
    draftedJobCount,
    closedJobCount,
    totalJobCount,
  } = useLoaderData<{
    currentProfile: Employer;
    activeJobCount: number;
    draftedJobCount: number;
    closedJobCount: number;
    totalJobCount: number;
  }>();

  // Access the firstName from the nested structure of currentProfile
  const firstName = currentProfile?.account?.user?.firstName || "User"; // Safely access the firstName

  // Job postings data
  const jobData: JobData[] = [
    {
      title: "Active Jobs",
      count: activeJobCount,
      change: "+0 from last month", // Update this dynamically if needed
      changeColor: activeJobCount > 0 ? "text-green-500" : "text-red-500",
    },
    {
      title: "Drafted Jobs",
      count: draftedJobCount,
      change: "+0 from last month", // Update this dynamically if needed
      changeColor: draftedJobCount > 0 ? "text-green-500" : "text-red-500",
    },
    {
      title: "Closed Jobs",
      count: closedJobCount,
      change: "+0 from last month", // Update this dynamically if needed
      changeColor: closedJobCount > 0 ? "text-green-500" : "text-red-500",
    },
  ];

  // Applicants summary data
  const applicantData: ApplicantData[] = [
    { title: "Interviewed", count: 5 },
    { title: "Total Applicants", count: 7 },
    { title: "Shortlisted", count: 2 },
  ];

  // State for dialog visibility
  // const [isDialogOpen, setIsDialogOpen] = useState(false);

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
                Welcome,{" "}
                <span className="text-primary font-bold">{firstName}!</span>
              </h1>
              <p className="text-2xl ml-6">
                Good to hear from you. Are you hiring?
              </p>

              {/* Centered Button Container */}
              <div className="flex justify-start ml-6 mt-4">
                <Link
                  to="/new-job"
                  className="bg-primaryColor text-white rounded-md px-4 py-2 hover:bg-primaryColor-dark transition duration-300 w-auto"
                >
                  Create New Job
                </Link>
                {/* Button to open the job posting form dialog */}
                {/* <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-primaryColor text-white rounded-md px-4 py-2 hover:bg-primaryColor-dark transition duration-300 w-auto">
                      Create New Job
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-white rounded-lg p-6 shadow-lg w-full max-w-4xl mx-auto">
                    <DialogHeader>
                      <DialogTitle className="text-center font-semibold text-xl mb-4">
                        Create a New Job
                      </DialogTitle>
                    </DialogHeader>

                    <div className="overflow-y-auto max-h-[70vh] px-4">
                      <JobPostingForm />
                    </div>

                    <DialogFooter className="flex justify-center mt-4">
                      <Button
                        variant="ghost"
                        type="button"
                        onClick={() => setIsDialogOpen(false)}
                        className="text-gray-500"
                      >
                        Cancel
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog> */}
              </div>
            </>
          )}

          <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-12 mt-8">
            {/* Job Postings Section */}
            <div className="bg-white p-6">
              <h1 className="text-3xl font-semibold mb-6">Job Postings</h1>
              <div className="grid grid-cols-1">
                {jobData.map((job, index) => (
                  <div
                    key={index}
                    className="flex flex-col justify-between px-10 py-4 bg-gray-100 rounded-md mb-4"
                  >
                    <h2 className="text-xl font-medium text-gray-800">
                      {job.title}
                    </h2>
                    <div className="flex gap-10">
                      <p className="text-4xl font-bold mt-2 text-black">
                        {job.count}
                      </p>
                      <div className={`text-md mt-6 ${job.changeColor}`}>
                        {job.change}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Applicants Summary Section */}
            <div className="bg-white p-6">
              <h1 className="text-3xl font-semibold mb-6">
                Applicants Summary
              </h1>
              <div className="grid grid-cols-2 gap-6">
                {applicantData.map((applicant, index) => (
                  <div
                    key={index}
                    className="flex flex-col justify-between p-4 bg-gray-100 rounded-md"
                  >
                    <h2 className="text-xl font-medium text-gray-800">
                      {applicant.title}
                    </h2>
                    <p className="text-4xl font-bold mt-2 text-black">
                      {applicant.count}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// this is the main page that i open, where there is a navigation, and a sidebar ❤️
