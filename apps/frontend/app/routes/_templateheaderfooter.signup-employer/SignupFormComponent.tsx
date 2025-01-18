import { useState, useEffect, useRef } from "react";
import SocialLinks from "../../common/registration/socialLinks";
import { useActionData, useNavigate, Form } from "@remix-run/react";
import AppFormField from "../../common/form-fields";
import { AccountType } from "~/types/enums";
import { Link } from "@chakra-ui/react";
import { Checkbox } from "~/components/ui/checkbox";

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
  const [termsAccepted, setTermsAccepted] = useState(false); // State for checkbox

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

      {/* the 2 buttons */}
      <div className="flex mb-6 space-x-4 lg:w-[450px] self-start">
        <button
          onClick={() => setEmployerAccountType("personal")}
          className={`flex-1 py-4 border rounded-xl text-sm font-medium ${
            employerAccountType === "personal"
              ? "bg-blue-100 border-blue-300"
              : "border-gray-200"
          }`}
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
        <input type="hidden" name="accountType" value={AccountType.Employer} />
        <input
          type="hidden"
          name="employerAccountType"
          value={employerAccountType}
        />

        {/* AppFormField for email */}
        <AppFormField id="email" name="email" label="Email Address" />

        <div className="flex space-x-4">
          {/* AppFormField for first name */}
          <AppFormField
            className="w-1/2"
            id="firstName"
            name="firstName"
            label="First Name"
          />

          {/* AppFormField for last name */}
          <AppFormField
            className="w-1/2"
            id="lastName"
            name="lastName"
            label="Last Name"
          />
        </div>

        <AppFormField
          type="password"
          id="password"
          name="password"
          label="Password"
        />

        {/* Checkbox for Terms and Conditions */}
        <div className="flex flex-col space-y-3">
          <div className="flex items-center space-x-3 ml-3">
            <Checkbox
              name="termsAccepted"
              id="termsAccepted"
              required
              className="peer"
            />
            <label
              htmlFor="termsAccepted"
              className="text-sm tracking-tight text-gray-500"
            >
              I accept the{" "}
              <a
                href="/terms-and-conditions"
                className="text-primaryColor font-semibold hover:underline"
                rel="noopener noreferrer"
              >
                terms and conditions
              </a>
            </label>
          </div>

          <button
            type="submit"
            className="w-full py-3 text-lg font-semibold text-white bg-primaryColor rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Continue
          </button>
        </div>

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

      {/* Already have an account? Login */}
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
