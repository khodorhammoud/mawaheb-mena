export default function Dashboard() {
  return (
    <div>
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-gray-100 h-screen p-5">
          <div className="flex flex-col items-center">
            <div className="bg-gray-300 rounded-full w-24 h-24 flex items-center justify-center mb-4">
              <span className="text-xl font-bold">AM</span>
            </div>
            <div className="text-center">
              <h2 className="text-lg font-medium">Ahmad M.</h2>
              <p className="text-sm text-gray-500">Add Title</p>
              <p className="text-sm text-gray-500">Add Location</p>
            </div>
          </div>

          <nav className="mt-8">
            <ul>
              <li className="mb-4">
                <a
                  href="#"
                  className="text-gray-700 font-medium flex items-center"
                >
                  <span>Dashboard</span>
                </a>
              </li>
              <li className="mb-4">
                <a
                  href="#"
                  className="text-gray-700 font-medium flex items-center"
                >
                  <span>Manage Jobs</span>
                </a>
              </li>
              <li className="mb-4">
                <a
                  href="#"
                  className="text-gray-700 font-medium flex items-center"
                >
                  <span>Time Sheet</span>
                </a>
              </li>
              <li className="mb-4">
                <a
                  href="#"
                  className="text-gray-700 font-medium flex items-center"
                >
                  <span>Settings</span>
                </a>
              </li>
            </ul>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="bg-gray-200 h-32 rounded-md mb-4 relative">
            <button className="absolute top-2 right-2 bg-gray-100 px-2 py-1 text-sm rounded-md">
              Add Title
            </button>
          </div>

          <div className="flex items-center mb-6">
            <div className="bg-gray-300 rounded-full w-24 h-24 flex items-center justify-center mr-4">
              <span className="text-3xl font-bold">AM</span>
            </div>
            <div>
              <h1 className="text-2xl font-semibold">Ahmad Mostafa</h1>
              <div className="flex space-x-2 mt-2">
                <button className="text-sm bg-gray-200 px-3 py-1 rounded-md">
                  Add Location
                </button>
                <button className="text-sm bg-gray-200 px-3 py-1 rounded-md">
                  Add Websites
                </button>
              </div>
            </div>
            <div className="ml-auto text-sm flex items-center">
              <span>Industries Served</span>
              <button className="ml-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m4 4h-1V9h-1m6 2h-2a9 9 0 11-18 0h2a7 7 0 1014 0z"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <button className="p-4 border rounded-md">
              <h3 className="text-sm text-gray-500">Average Project Budget</h3>
              <button className="text-blue-500 text-sm">
                Add Average Budget
              </button>
            </button>
            <button className="p-4 border rounded-md">
              <h3 className="text-sm text-gray-500">Years in Business</h3>
              <button className="text-blue-500 text-sm">
                Add Years in Business
              </button>
            </button>
          </div>

          {/* About Section */}
          <div className="mb-6 p-4 border rounded-md">
            <h3 className="text-lg font-medium mb-2">About</h3>
            <button className="text-blue-500 text-sm">Add bio</button>
          </div>

          {/* Posted Jobs Section */}
          <div className="p-4 border rounded-md">
            <h3 className="text-lg font-medium mb-2">Posted Jobs</h3>
            <button className="text-blue-500 text-sm">Post Job</button>
          </div>
        </div>
      </div>
    </div>
  );
}
