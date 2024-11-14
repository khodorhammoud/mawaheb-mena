import { Badge } from "~/components/ui/badge";
import { Card } from "~/common/header/card";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { IoIosSearch } from "react-icons/io";
import { FaRegStar } from "react-icons/fa6";
import { PiUserCircleFill } from "react-icons/pi";
import { GoBellFill } from "react-icons/go";
import { AiOutlineMenu, AiOutlineClose } from "react-icons/ai";
import { useState } from "react";
import { motion } from "framer-motion";

function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Full-width Header */}
      <div className="w-full bg-white p-4 shadow-md flex justify-between items-center border-b border-gray-300">
        <div className="flex items-center space-x-4">
          <button
            className="md:hidden text-gray-600 text-3xl"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? <AiOutlineClose /> : <AiOutlineMenu />}
          </button>
          <h1 className="font-bold text-xl">MAWAHEB MENA</h1>
          <div className="relative hidden md:block w-1/3">
            <Input
              type="text"
              placeholder="Hinted search text"
              className="w-full p-3 border border-gray-400 rounded-lg pr-10"
            />

            <div className="absolute right-3 top-3">
              <IoIosSearch className="text-gray-600" />
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <Button className="hidden md:block bg-blue-600 text-white px-4 py-2 rounded-lg">
            Post Job
          </Button>
          <Button variant="link">
            <GoBellFill className="text-gray-600 text-3xl" />
          </Button>
          <Button variant="link">
            <PiUserCircleFill className="text-gray-600 text-3xl" />
          </Button>
        </div>
      </div>

      <div className="flex h-full relative">
        {/* Sidebar */}
        <motion.div
          animate={{
            x:
              isSidebarOpen ||
              (typeof window !== "undefined" &&
                (typeof window !== "undefined" ? window.innerWidth : 1024) >=
                  768)
                ? 0
                : "-100%",
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className={`${isSidebarOpen || (typeof window !== "undefined" && window.innerWidth >= 768) ? "block" : "hidden"} md:block w-4/5 md:w-1/5 bg-gray-200 p-5 border-r border-gray-300 md:h-full absolute md:relative z-20`}
        >
          <div className="flex items-center space-x-3 mb-8 border-b border-gray-300 pb-4">
            <Avatar className="h-12 w-12">
              <AvatarFallback>AM</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">Ahmad M.</h3>
              <p className="text-gray-600 text-sm">Add Title</p>
              <button className="text-xs text-blue-500 hover:underline">
                Add Location
              </button>
            </div>
          </div>
          <ul className="space-y-4">
            <li>
              <button className="text-gray-800 w-full text-left hover:bg-gray-300 rounded-lg px-3 py-2">
                Dashboard
              </button>
            </li>
            <li>
              <button className="text-gray-800 w-full text-left hover:bg-gray-300 rounded-lg px-3 py-2">
                Manage Jobs
              </button>
            </li>
            <li>
              <button className="text-gray-800 w-full text-left hover:bg-gray-300 rounded-lg px-3 py-2">
                Time Sheet
              </button>
            </li>
            <li>
              <button className="text-gray-800 w-full text-left hover:bg-gray-300 rounded-lg px-3 py-2">
                Settings
              </button>
            </li>
          </ul>
        </motion.div>

        {/* Main Content */}
        <div className="flex-1 bg-white p-4 md:p-10">
          {/* Gradient Banner with Profile Picture Overlay */}
          <div className="relative bg-gradient-to-r from-blue-700 via-blue-500 to-blue-300 h-36 mb-10 rounded-lg">
            <div className="absolute -bottom-12 left-10">
              <Avatar className="h-24 w-24 border-4 border-white">
                <AvatarFallback>AM</AvatarFallback>
              </Avatar>
            </div>
            <div className="absolute top-4 right-4 flex items-center space-x-4">
              <button className="text-white border border-white px-3 py-1 rounded-md hover:bg-white hover:text-blue-500 transition">
                Add Title
              </button>
            </div>
            <div className="absolute top-14 right-4 flex items-center space-x-2 text-white">
              <span>0/5</span>
              <FaRegStar className="text-yellow-400" />
            </div>
          </div>

          {/* Profile Details */}
          <div className="flex flex-col md:flex-row items-center mb-10 mt-14 space-y-8 md:space-y-0 md:space-x-8">
            <div className="w-full md:w-1/4 flex justify-center md:justify-start">
              <Avatar className="h-24 w-24 border-4 border-white">
                <AvatarFallback>AM</AvatarFallback>
              </Avatar>
            </div>
            <div className="w-full md:w-3/4">
              <div className="flex flex-col md:flex-row items-start md:items-center mb-4 space-y-2 md:space-y-0">
                <h2 className="text-2xl md:text-3xl font-bold mr-4">
                  Ahmad Mostafa
                </h2>
                <button className="text-blue-500 hover:underline">
                  Add Title
                </button>
              </div>
              <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4 mb-4">
                <button className="text-blue-500 hover:underline">
                  Add Location
                </button>
                <button className="text-blue-500 hover:underline">
                  Add Websites
                </button>
              </div>
              <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-8">
                <Card className="w-full md:w-1/2 p-5 bg-gray-100 border border-dotted border-gray-400">
                  <p className="font-bold mb-2 text-gray-700">
                    Average Project Budget
                  </p>
                  <Button variant="link" className="text-blue-500">
                    Add Average Budget
                  </Button>
                </Card>
                <Card className="w-full md:w-1/2 p-5 bg-gray-100 border border-dotted border-gray-400">
                  <p className="font-bold mb-2 text-gray-700">
                    Years in Business
                  </p>
                  <Button variant="link" className="text-blue-500">
                    Add Years in Business
                  </Button>
                </Card>
              </div>
            </div>
          </div>

          {/* About Section */}
          <Card className="mb-10 p-6 bg-gray-100 border border-dotted border-gray-400">
            <p className="font-bold mb-4 text-gray-700">About</p>
            <p className="text-gray-500 mb-2">Add your headline and bio</p>
            <Button variant="link" className="text-blue-500">
              Add bio
            </Button>
          </Card>

          {/* Posted Jobs Section */}
          <Card className="p-6 bg-gray-100 border border-dotted border-gray-400">
            <p className="font-bold mb-4 text-gray-700">Posted Jobs</p>
            <p className="text-gray-500 mb-2">
              Start posting jobs to grow your business.
            </p>
            <Button className="bg-blue-600 text-white px-4 py-2 rounded-lg">
              Post Job
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
