import SocialLinks from "../../common/registration/socialLinks";
import { useEffect, useRef } from "react";
import { useActionData, useNavigate, Form } from "@remix-run/react";
import AppFormField from "../../common/form-fields";
import { AccountType } from "~/types/enums";

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

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto bg-white p-10">
      <h1 className="text-6xl mb-8 self-start font-['BespokeSerif-Medium']">
        Sign Up
      </h1>

      {/* error message in case of error */}
      {actionData?.error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline">{actionData.error.message}</span>
        </div>
      )}

      {/* the Form */}
      <Form method="post" className="w-full space-y-6">
        <input
          type="hidden"
          name="accountType"
          value={AccountType.Freelancer}
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
            href="/login-freelancer"
            className="text-primaryColor font-medium hover:underline underline-offset-2 no-underline"
          >
            Login
          </a>
        </p>
      </div>
    </div>
  );
}
