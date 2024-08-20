import LayoutContainer from "../../common/layout_container";
import { useState } from "react";

export default function SignUpEmployerPage() {
  const [userType, setUserType] = useState("personal");
  return (
    <LayoutContainer>
      return (
      <div className="flex h-screen">
        {/* Left Side - Sign Up Form */}
        <div className="w-full md:w-1/2 bg-white flex flex-col justify-center items-center p-8">
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

            <form className="space-y-4">
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
                  Password must be 8 characters, upper capital, lower case,
                  symbols
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
            </form>

            <div className="relative mt-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">or</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3">
              <div>
                <a
                  href="/"
                  className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <span className="sr-only">Continue with Google</span>
                  <svg
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    {/* Google Icon */}
                    <path
                      d="M12 12h9.5c.3-.7.5-1.5.5-2.5s-.2-1.8-.5-2.5H12V6.4c1.5-.1 3.1-.5 4.4-1.2C15.2 2.6 13.6 2 12 2S8.8 2.6 7.6 3.2c1.3.7 2.9 1.1 4.4 1.2V12z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 2C7.6 2 4 5.6 4 10c0 1.1.2 2.2.6 3.2l3.3-2.5c-.1-.3-.2-.6-.2-1.2s.1-.9.2-1.2l-3.3-2.5C4.2 7.9 4 8.9 4 10c0 4.4 3.6 8 8 8 2.2 0 4.2-.8 5.6-2.4l-3.3-2.5c-.6.5-1.5.9-2.3 1V12z"
                      fill="#34A853"
                    />
                  </svg>
                </a>
              </div>
              <div>
                <a
                  href="/"
                  className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <span className="sr-only">Continue with LinkedIn</span>
                  <svg
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    {/* LinkedIn Icon */}
                    <path
                      d="M12 12h9.5c.3-.7.5-1.5.5-2.5s-.2-1.8-.5-2.5H12V6.4c1.5-.1 3.1-.5 4.4-1.2C15.2 2.6 13.6 2 12 2S8.8 2.6 7.6 3.2c1.3.7 2.9 1.1 4.4 1.2V12z"
                      fill="#0A66C2"
                    />
                    <path
                      d="M12 2C7.6 2 4 5.6 4 10c0 1.1.2 2.2.6 3.2l3.3-2.5c-.1-.3-.2-.6-.2-1.2s.1-.9.2-1.2l-3.3-2.5C4.2 7.9 4 8.9 4 10c0 4.4 3.6 8 8 8 2.2 0 4.2-.8 5.6-2.4l-3.3-2.5c-.6.5-1.5.9-2.3 1V12z"
                      fill="#0A66C2"
                    />
                  </svg>
                </a>
              </div>
              <div>
                <a
                  href="/"
                  className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <span className="sr-only">Continue with Microsoft</span>
                  <svg
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    {/* Microsoft Icon */}
                    <path
                      fill="#F25022"
                      d="M12 12h9.5c.3-.7.5-1.5.5-2.5s-.2-1.8-.5-2.5H12V6.4c1.5-.1 3.1-.5 4.4-1.2C15.2 2.6 13.6 2 12 2S8.8 2.6 7.6 3.2c1.3.7 2.9 1.1 4.4 1.2V12z"
                    />
                    <path
                      fill="#7FBA00"
                      d="M12 2C7.6 2 4 5.6 4 10c0 1.1.2 2.2.6 3.2l3.3-2.5c-.1-.3-.2-.6-.2-1.2s.1-.9.2-1.2l-3.3-2.5C4.2 7.9 4 8.9 4 10c0 4.4 3.6 8 8 8 2.2 0 4.2-.8 5.6-2.4l-3.3-2.5c-.6.5-1.5.9-2.3 1V12z"
                    />
                    <path
                      fill="#00A4EF"
                      d="M12 12h9.5c.3-.7.5-1.5.5-2.5s-.2-1.8-.5-2.5H12V6.4c1.5-.1 3.1-.5 4.4-1.2C15.2 2.6 13.6 2 12 2S8.8 2.6 7.6 3.2c1.3.7 2.9 1.1 4.4 1.2V12z"
                    />
                    <path
                      fill="#FFB900"
                      d="M12 2C7.6 2 4 5.6 4 10c0 1.1.2 2.2.6 3.2l3.3-2.5c-.1-.3-.2-.6-.2-1.2s.1-.9.2-1.2l-3.3-2.5C4.2 7.9 4 8.9 4 10c0 4.4 3.6 8 8 8 2.2 0 4.2-.8 5.6-2.4l-3.3-2.5c-.6.5-1.5.9-2.3 1V12z"
                    />
                  </svg>
                </a>
              </div>
            </div>

            <div className="text-center mt-6">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <a
                  href="/login-employer"
                  className="text-blue-600 hover:text-blue-500"
                >
                  Login
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Right Side - Image and Testimonial */}
        <div className="hidden md:block w-1/2 bg-gray-50 relative">
          <div className="absolute inset-0 flex justify-center items-center">
            <div className="max-w-md text-center p-4">
              <img
                src="https://via.placeholder.com/300" // Replace this with the actual image URL
                alt="Testimonial"
                className="mb-4 rounded-full w-48 h-48 mx-auto object-cover"
              />
              <p className="text-lg text-gray-800 font-medium mb-2">
                Working with Mawaheb MENA has been an incredible experience. The
                platform not only provided me with access to a wide range of
                exciting jobs but also supported me every step of the way.
              </p>
              <p className="text-sm text-gray-500">Ahmad Ramal</p>
              <p className="text-sm text-gray-400">CEO, Waxy</p>
              <div className="flex justify-center mt-2">
                <div className="text-blue-600 bg-gray-200 px-2 py-1 rounded-full text-xs">
                  562.21 x Hug (168)
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      );
    </LayoutContainer>
  );
}
