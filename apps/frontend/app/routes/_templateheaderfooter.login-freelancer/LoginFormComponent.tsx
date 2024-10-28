import { useEffect, useRef } from "react";
import SocialLinks from "../../common/registration/socialLinks";
import { useActionData, useNavigate, Form } from "@remix-run/react";
import InputForm from "../../components/ui/inputForm";

interface ActionData {
  success?: boolean;
  error?: {
    message: string;
  };
}

export default function LoginFormComponent() {
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
        Log In
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

      {/* the Form */}
      <Form method="post" className="w-full space-y-6">
        <input type="hidden" name="accountType" value="employer" />

        <InputForm
          type="email"
          name="email"
          label="Email Address"
          className="peer mt-1"
        />

        <div className="relative">
          <InputForm
            type="password"
            name="password"
            label="Password"
            className="peer mt-1 pr-12"
          />
          <button className="absolute inset-y-3 right-3 flex text-xl text-gray-400 cursor-pointer">
            👁️
          </button>
          <p className="text-sm font-medium text-primaryColor mt-4 mb-6 mr-4 text-end underline hover:no-underline cursor-pointer">
            Forget Password?
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

      {/* Already have an account? Login */}
      <div className="text-center mt-8">
        <p className="text-sm text-gray-600">
          Don't have an account?{" "}
          <a
            href="/login-employer"
            className="text-primaryColor font-medium hover:underline underline-offset-2 no-underline"
          >
            SignUp
          </a>
        </p>
      </div>
    </div>
  );
}
