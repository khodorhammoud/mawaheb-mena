import { FC } from "react";
import { useLoaderData, Link } from "@remix-run/react";
import type { Employer } from "~/types/User";

// Type definitions for job and applicant data
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

const Dashboard: FC = () => {
  // Fetch loader data
  const {
    currentUser,
    activeJobCount,
    draftedJobCount,
    closedJobCount,
    totalJobCount,
  } = useLoaderData<{
    currentUser: Employer;
    activeJobCount: number;
    draftedJobCount: number;
    closedJobCount: number;
    totalJobCount: number;
  }>();

  // Access the firstName from the nested structure of currentUser
  const firstName = currentUser?.account?.user?.firstName || "User"; // Safely access the firstName

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

  return (
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

          {/* Button to redirect to job posting page */}
          <Link to="/dashboard/jobs">
            <button className="bg-primaryColor hover:bg-blue-700 text-white px-6 rounded-md text-lg mt-4 ml-6 transition">
              Create New Job
            </button>
          </Link>
        </>
      )}

      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-12 mt-8">
        {/* Job Postings Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
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
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h1 className="text-3xl font-semibold mb-6">Applicants Summary</h1>
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
  );
};

export default Dashboard;
