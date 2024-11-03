// app/routes/JobManagement.tsx
import { Form } from "@remix-run/react";
import AppFormField from "../../../common/form-fields";
import JobStateButton from "../../../common/job-state-button/JobStateButton";
import Calendar from "~/common/calender/Calender";

export default function JobManagement() {
  const status = "active"; // Can be 'active', 'draft', 'closed', or 'paused'
  return (
    <div className="p-8 mt-20 font-['Switzer-Regular'] w-full">
      <div className="flex items-center gap-6 justify-between">
        {/* Search */}
        <Form method="post" className="space-y-6 -mt-4">
          <input type="hidden" name="accountType" value="employer" />

          {/* AppFormField for email */}
          <AppFormField
            id="search"
            name="search"
            label="🔍 Hinted search text"
          />
        </Form>

        {/* Filter Buttons */}
        <div className="flex space-x-2 mt-1">
          <button className="bg-primaryColor text-white rounded-xl px-4 py-2 hover:bg-primaryColor-dark transition duration-300 not-active-gradient">
            Active Jobs
          </button>
          <button className="bg-primaryColor text-white rounded-xl px-4 py-2 hover:bg-primaryColor-dark transition duration-300 not-active-gradient">
            Drafted Jobs
          </button>
          <button className="bg-primaryColor text-white rounded-xl px-4 py-2 hover:bg-primaryColor-dark transition duration-300 not-active-gradient">
            Paused Jobs
          </button>
          <button className="bg-primaryColor text-white rounded-xl px-4 py-2 hover:bg-primaryColor-dark transition duration-300 not-active-gradient">
            Closed Jobs
          </button>
        </div>

        {/* Icons (as anchors) */}
        <div className="flex items-center gap-2">
          <a href="#" className="text-4xl">
            🔳
          </a>
          <a href="#" className="text-4xl flex">
            <p className="-mr-4">🔳</p>
            <p className="transform">🔳</p>
          </a>
          <a href="#" className="text-2xl">
            <div className="flex">
              <p className="-mr-3">🔳</p>
              <p>🔳</p>
            </div>
            <div className="flex -mt-3">
              <p className="-mr-3">🔳</p>
              <p>🔳</p>
            </div>
          </a>
        </div>
      </div>

      {/* Static Sentence */}
      <p className="text-black text-sm mt-2 ml-4">23 Jobs Found</p>

      <section>
        <h2 className="text-3xl font-semibold mt-10 mb-10">Active Jobs</h2>
        {/* Job Card */}
        <div className="flex p-8 bg-white border rounded-xl shadow-xl">
          {/* IOS */}
          <div className="w-[42%] mr-2">
            <h3 className="text-2xl">
              IOS, Android Sensor API Plugin for Unity
            </h3>
            <p className="text-sm text-gray-400 mb-8">
              Fixed price - Posted 20 hours ago
            </p>
            {/* Job Details */}
            <div className="flex justify-between items-center">
              <div className="">
                <div className="flex gap-10">
                  <div className="">
                    <p className="text-lg">$500</p>
                    <p className="text-gray-400 text-sm">Fixed price</p>
                  </div>
                  <div className="">
                    <p className="text-lg">Entry</p>
                    <p className="text-gray-400 text-sm">Experience level</p>
                  </div>
                </div>
                <p className="mt-10">
                  We are looking for the candidate having 0-3 years of
                  experience in below technologies skills: IOS, Android
                </p>
                {/* Tags */}
                <div className="mt-8 flex flex-wrap gap-2">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    Java Development
                  </span>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    Android
                  </span>
                  <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
                    iOS
                  </span>
                  <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                    C#
                  </span>
                  <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                    Kotlin
                  </span>
                </div>
              </div>
            </div>
          </div>
          {/* Applicants and Interviews */}
          <div className="w-[18%] mr-2">
            <div className="text-center">
              <p className="font-semibold">Applicants 4</p>
              <p className="text-gray-500">photos</p>
            </div>
            <div className="text-center mt-4">
              <p className="font-semibold">Interviewed 2</p>
              <p className="text-gray-500">photos</p>
            </div>
          </div>
          {/* Calendar */}
          <div className="w-[28%] -mr-10">
            <p className="font-semibold mb-4">Pending Interviews 3</p>
            <Calendar />{" "}
            {/* Here’s where we include the interactive Calendar component */}
          </div>
          <div className="w-[16%] flex justify-end h-min -ml-4">
            {/* Render different job sections */}
            <JobStateButton
              status={status}
              className="inline-flex w-auto h-auto"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
