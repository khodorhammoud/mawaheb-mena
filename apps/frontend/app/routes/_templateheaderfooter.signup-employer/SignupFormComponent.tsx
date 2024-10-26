import { useState, useEffect, useRef } from "react";
import SocialLinks from "../../common/registration/socialLinks";
import { useActionData, useNavigate, Form } from "@remix-run/react";

interface ActionData {
  success?: boolean;
  error?: {
    message: string;
  };
}

export default function SignupLeftComponent() {
  const actionData = useActionData<ActionData>();
  const navigate = useNavigate();

  const redirectionFlag = useRef(false);

  useEffect(() => {
    if (!redirectionFlag.current && actionData?.success) {
      redirectionFlag.current = true;
    }
  }, [actionData, navigate]);

  const [employerAccountType, setEmployerAccountType] = useState("personal");
  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto bg-white p-10">
      <h1 className="text-6xl mb-8 self-start font-['BespokeSerif-Medium']">
        Sign Up
      </h1>

      {/* Error message in case of error */}
      {actionData?.error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6 w-full">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline ml-2">
            {actionData.error.message}
          </span>
        </div>
      )}

      <p className="text-xl font-semibold text-gray-800 self-start">
        Select user type
      </p>
      <p className="text-md text-gray-400 mb-6 self-start">
        You can change your account at any time
      </p>

      {/* the 2 buttons 🔳🔲 */}
      <div className="flex mb-6 space-x-4 lg:w-[450px] self-start">
        <button
          onClick={() => setEmployerAccountType("personal")}
          className={`flex-1 py-4 border rounded-xl text-sm font-medium ${
            employerAccountType === "personal"
              ? "bg-blue-100 border-blue-300"
              : "border-gray-200"
          }`}
          // this is for the selected button 👍
        >
          <div className="flex flex-col items-center rounded-xl">
            <span className="text-4xl">👤</span>
            <span className="font-semibold text-lg">Personal</span>
            <span className="text-md">Set Up Your Dream Team</span>
          </div>
        </button>
        <button
          onClick={() => setEmployerAccountType("company")}
          className={`flex-1 py-4 border rounded-xl text-sm font-medium ${
            employerAccountType === "company"
              ? "bg-blue-100 border-blue-300"
              : "border-gray-200"
          }`}
        >
          <div className="flex flex-col items-center">
            <span className="text-4xl">🏢</span>
            <span className="font-semibold text-lg">Company</span>
            <span className="text-md">Hire Top Talent</span>
          </div>
        </button>
      </div>

      {/* the Form */}
      <Form method="post" className="w-full space-y-6">
        <input type="hidden" name="accountType" value="employer" />
        <input
          type="hidden"
          name="employerAccountType"
          value={employerAccountType}
        />

        <div className="relative">
          <input
            type="email"
            id="email"
            name="email"
            placeholder=" "
            className="peer mt-1 block w-full px-4 py-3 border border-gray-300 rounded-xl placeholder-transparent focus:outline-none focus:ring-2 focus:ring-primaryColor focus:border-primaryColor text-lg"
          />
          <label
            htmlFor="email"
            className="absolute left-4 top-3 text-gray-500 text-lg bg-white px-1 transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:left-4 peer-placeholder-shown:text-gray-500 peer-placeholder-shown:text-base transform -translate-y-3 peer-focus:top-0 peer-focus:left-4 peer-focus:text-primaryColor peer-focus:bg-white peer-focus:px-1"
          >
            Email Address
          </label>
        </div>

        <div className="flex space-x-4">
          <div className="relative w-1/2">
            <input
              type="text"
              id="firstName"
              name="firstName"
              placeholder=" "
              className="peer mt-1 block w-full px-4 py-3 border border-gray-300 rounded-xl placeholder-transparent focus:outline-none focus:ring-2 focus:ring-primaryColor focus:border-primaryColor text-lg"
            />
            <label
              htmlFor="firstName"
              className="absolute left-4 top-3 text-gray-500 text-lg bg-white px-1 transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:left-4 peer-placeholder-shown:text-gray-500 peer-placeholder-shown:text-base transform -translate-y-1/2 peer-focus:top-1 peer-focus:left-4 peer-focus:text-primaryColor peer-focus:bg-white peer-focus:px-1"
            >
              First Name
            </label>
          </div>
          <div className="relative w-1/2">
            <input
              type="text"
              id="lastName"
              name="lastName"
              placeholder=" "
              className="peer mt-1 block w-full px-4 py-3 border border-gray-300 rounded-xl placeholder-transparent focus:outline-none focus:ring-2 focus:ring-primaryColor focus:border-primaryColor text-lg"
            />
            <label
              htmlFor="lastName"
              className="absolute left-4 top-3 text-gray-500 text-lg bg-white px-1 transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:left-4 peer-placeholder-shown:text-gray-500 peer-placeholder-shown:text-base transform -translate-y-1/2 peer-focus:top-1 peer-focus:left-4 peer-focus:text-primaryColor peer-focus:bg-white peer-focus:px-1"
            >
              Last Name
            </label>
          </div>
        </div>

        <div className="relative">
          <input
            type="password"
            id="password"
            name="password"
            placeholder=" "
            className="peer mt-1 block w-full px-4 py-3 border border-gray-300 rounded-xl placeholder-transparent focus:outline-none focus:ring-2 focus:ring-primaryColor focus:border-primaryColor text-lg pr-12"
          />
          <label
            htmlFor="password"
            className="absolute left-4 top-0 text-gray-500 text-lg bg-white px-1 transition-all peer-placeholder-shown:top-[30%] peer-placeholder-shown:left-4 peer-placeholder-shown:text-gray-500 peer-placeholder-shown:text-base transform -translate-y-1/2 peer-focus:top-0 peer-focus:left-4 peer-focus:text-primaryColor peer-focus:bg-white peer-focus:px-1"
          >
            Password
          </label>
          <button className="absolute inset-y-3 right-3 flex text-xl text-gray-400 cursor-pointer">
            👁️
          </button>
          <p className="text-xs text-gray-600 mt-3 mb-6 ml-4">
            Password must be 8 characters, upper capital, lower case, symbols
          </p>
        </div>

        <button
          type="submit"
          className="w-full py-3 text-lg font-semibold text-white bg-primaryColor rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 not-active-gradient"
        >
          Continue
        </button>

        {/* success message when all is done */}
        {actionData?.success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
            <strong className="font-bold">
              ✅ A verification email has been sent to you.
            </strong>
          </div>
        )}
      </Form>

      {/* or */}
      <div className="relative flex items-center justify-center mt-6 mb-2">
        <div className="flex-grow border border-gray-200 w-[270px] mt-1"></div>
        <span className="px-2">or</span>
        <div className="flex-grow border border-gray-200 w-[270px] mt-1"></div>
      </div>

      <SocialLinks />

      {/* Alredy have an account? Login */}
      <div className="text-center mt-8">
        <p className="text-sm text-gray-600">
          Already have an account?{" "}
          <a
            href="/login-employer"
            className="text-primaryColor font-medium hover:underline underline-offset-2 no-underline"
          >
            Login
          </a>
        </p>
      </div>
    </div>
  );
}
