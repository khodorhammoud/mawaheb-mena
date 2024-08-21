import { useState } from "react";
import { Form } from "@remix-run/react";
import SocialLinks from "../../common/registration/socialLinks";

export default function SignupLeftComponent() {
  const [userType, setUserType] = useState("personal");
  return (
    <>
      <div className="w-full max-w-sm">
        <h1 className="text-4xl font-bold mb-6">Sign Up</h1>
        <p className="text-sm text-gray-600 mb-4">Select user type</p>
        <div className="flex mb-6 space-x-2">
          <button
            onClick={() => setUserType("personal")}
            className={`w-1/2 py-2 px-4 border rounded-md text-sm font-medium ${
              userType === "personal"
                ? "bg-gray-100 border-gray-300"
                : "border-gray-200"
            }`}
          >
            <div className="flex flex-col items-center">
              <span>👤</span>
              <span>Personal</span>
              <span className="text-xs text-gray-500">
                Set Up Your Dream Team
              </span>
            </div>
          </button>
          <button
            onClick={() => setUserType("company")}
            className={`w-1/2 py-2 px-4 border rounded-md text-sm font-medium ${
              userType === "company"
                ? "bg-gray-100 border-gray-300"
                : "border-gray-200"
            }`}
          >
            <div className="flex flex-col items-center">
              <span>🏢</span>
              <span>Company</span>
              <span className="text-xs text-gray-500">Hire Top Talent</span>
            </div>
          </button>
        </div>

        <Form method="post" className="space-y-4">
          <input type="hidden" name="userType" value={userType} />
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div className="flex space-x-4">
            <div className="w-1/2">
              <label
                htmlFor="firstname"
                className="block text-sm font-medium text-gray-700"
              >
                First Name
              </label>
              <input
                type="text"
                id="firstname"
                name="firstname"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div className="w-1/2">
              <label
                htmlFor="lastname"
                className="block text-sm font-medium text-gray-700"
              >
                Last Name
              </label>
              <input
                type="text"
                id="lastname"
                name="lastname"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                id="password"
                name="password"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M2.166 10C2.166 5.55 5.551 2.166 10 2.166c4.45 0 7.834 3.384 7.834 7.834 0 4.45-3.384 7.834-7.834 7.834-4.45 0-7.834-3.384-7.834-7.834zM10 0c5.523 0 10 4.477 10 10s-4.477 10-10 10S0 15.523 0 10 4.477 0 10 0zm-1 5a1 1 0 012 0v2a1 1 0 11-2 0V5z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Password must be 8 characters, upper capital, lower case, symbols
            </p>
          </div>
          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Continue
            </button>
          </div>
        </Form>
        <div className="relative mt-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">or</span>
          </div>
        </div>
        <SocialLinks />
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Don&apos;t have an account?{" "}
            <a href="/" className="text-blue-600 hover:text-blue-500">
              Sign Up
            </a>
          </p>
        </div>
      </div>
    </>
  );
}
