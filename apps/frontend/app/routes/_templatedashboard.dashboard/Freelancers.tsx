// import React from 'react';

const UserProfile = () => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white p-4 shadow-lg">
        <div className="flex items-center space-x-2">
          <div className="w-12 h-12 rounded-full bg-blue-400 flex items-center justify-center text-white text-2xl">
            DT
          </div>
          <div>
            <h2 className="text-lg font-semibold">Darine Tleiss</h2>
            <p className="text-sm text-gray-500">Add Title</p>
            <p className="text-sm text-gray-500">Add Location</p>
          </div>
        </div>
        <nav className="mt-8">
          <ul>
            <li className="py-2 text-gray-700 hover:text-blue-600 cursor-pointer">
              Dashboard
            </li>
            <li className="py-2 text-gray-700 hover:text-blue-600 cursor-pointer">
              Browse Jobs
            </li>
            <li className="py-2 text-gray-700 hover:text-blue-600 cursor-pointer">
              Time Sheet
            </li>
            <li className="py-2 text-gray-700 hover:text-blue-600 cursor-pointer">
              Report
            </li>
            <li className="py-2 text-gray-700 hover:text-blue-600 cursor-pointer">
              Settings
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-grow p-8">
        <div className="bg-white p-6 shadow-md rounded-lg">
          {/* Profile Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-24 h-24 rounded-full bg-blue-400 flex items-center justify-center text-white text-4xl">
                DT
              </div>
              <div className="ml-4">
                <h1 className="text-2xl font-bold">Darine Tleiss</h1>
                <div className="flex space-x-4 mt-2">
                  <button className="text-blue-600 underline">
                    Add Location
                  </button>
                  <button className="text-blue-600 underline">
                    Add Websites
                  </button>
                </div>
              </div>
            </div>
            <button className="bg-gray-200 text-gray-600 py-2 px-4 rounded-lg">
              Add Title
            </button>
          </div>

          {/* Profile Stats */}
          <div className="flex space-x-4 mt-6">
            <div className="w-1/2 bg-gray-100 p-4 rounded-lg shadow-sm">
              <button className="text-blue-600 underline">
                Add Hourly Rate
              </button>
            </div>
            <div className="w-1/2 bg-gray-100 p-4 rounded-lg shadow-sm">
              <button className="text-blue-600 underline">
                Add Years of Experience
              </button>
            </div>
          </div>

          {/* Additional Sections */}
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="bg-gray-100 p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold">
                Don’t miss out on this opportunity to make a great first
                impression.
              </h2>
              <button className="mt-2 bg-blue-600 text-white py-2 px-4 rounded-lg">
                Add video
              </button>
            </div>
            <div className="bg-gray-100 p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold">About</h2>
              <button className="mt-2 bg-blue-600 text-white py-2 px-4 rounded-lg">
                Add bio
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="bg-gray-100 p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold">Projects</h2>
              <button className="mt-2 bg-blue-600 text-white py-2 px-4 rounded-lg">
                Add Projects
              </button>
            </div>
            <div className="bg-gray-100 p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold">Work History</h2>
              <button className="mt-2 bg-blue-600 text-white py-2 px-4 rounded-lg">
                Add Work History
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="bg-gray-100 p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold">Certificates</h2>
              <button className="mt-2 bg-blue-600 text-white py-2 px-4 rounded-lg">
                Add Certificates
              </button>
            </div>
            <div className="bg-gray-100 p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold">Education</h2>
              <button className="mt-2 bg-blue-600 text-white py-2 px-4 rounded-lg">
                Add Education
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserProfile;
