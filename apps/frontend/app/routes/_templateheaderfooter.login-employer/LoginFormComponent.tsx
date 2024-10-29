import SocialLinks from "../../common/registration/socialLinks";
import { useActionData, Form } from "@remix-run/react";
import AppFormField from "../../common/form-fields";

export default function LoginFormComponent() {
  const actionData = useActionData();

  return (
    <div className="w-full md:w-1/2 bg-white flex flex-col justify-center items-center p-8">
      <div className="w-full max-w-sm">
        <h1 className="text-4xl font-bold mb-6">Log In</h1>

        {/* error message in case of error */}
        {actionData?.error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            <strong className="font-bold">Error! </strong>
            <span className="block sm:inline">
              {actionData?.error?.message}
            </span>
          </div>
        )}
        <Form method="post" className="space-y-6">
          <input type="hidden" name="accountType" value="employer" />

          {/* AppFormField for email */}
          <AppFormField id="email" name="email" label="Email Address" />

          {/* AppFormField for password */}
          <AppFormField
            id="password"
            name="password"
            label="Password"
            type="password"
            showPasswordHint={false}
          />

          <div className="text-right">
            <a href="/" className="text-sm text-blue-600 hover:text-blue-500">
              Forgot Password?
            </a>
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
            <a
              href="/signup-employer"
              className="text-blue-600 hover:text-blue-500"
            >
              Sign Up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
