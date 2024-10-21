// app/routes/dashboard.tsx

import { FC } from "react";

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
  // Job postings data
  const jobData: JobData[] = [
    {
      title: "Active Jobs",
      count: 0,
      change: "-0.089 than last month",
      changeColor: "text-red-500",
    },
    {
      title: "Drafted Jobs",
      count: 0,
      change: "+20 than last month",
      changeColor: "text-green-500",
    },
    {
      title: "Closed Jobs",
      count: 0,
      change: "+2 than last month",
      changeColor: "text-green-500",
    },
    {
      title: "Paused Jobs",
      count: 0,
      change: "+2 than last month",
      changeColor: "text-green-500",
    },
  ];

  // Applicants summary data
  const applicantData: ApplicantData[] = [
    { title: "Interviewed", count: 5 },
    { title: "Total Applicants", count: 7 },
    { title: "Shortlisted", count: 2 },
  ];

  return (
    <div className="p-10 bg-gray-100 min-h-screen flex flex-col items-center">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Job Postings Section */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-2xl font-bold mb-8">Job Postings</h1>
          <div className="grid grid-cols-1 gap-6">
            {jobData.map((job, index) => (
              <div
                key={index}
                className="flex justify-between items-center p-4 bg-gray-50 rounded-lg"
              >
                <div>
                  <h2 className="text-lg font-medium">{job.title}</h2>
                  <p className="text-5xl font-extrabold mt-2">{job.count}</p>
                </div>
                <div className={`text-sm mt-4 ${job.changeColor}`}>
                  {job.change}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Applicants Summary Section */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-2xl font-bold mb-8">Applicants Summary</h1>
          <div className="grid grid-cols-1 gap-6">
            {applicantData.map((applicant, index) => (
              <div
                key={index}
                className="flex justify-between items-center p-4 bg-gray-50 rounded-lg"
              >
                <div>
                  <h2 className="text-lg font-medium">{applicant.title}</h2>
                  <p className="text-5xl font-extrabold mt-2">
                    {applicant.count}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
