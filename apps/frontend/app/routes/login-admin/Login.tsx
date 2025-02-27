import { Form, useActionData } from "@remix-run/react";
import AppFormField from "../../common/form-fields";

interface ActionData {
  success?: boolean;
  error?: {
    message: string;
  };
}

export default function AdminLoginPage() {
  const actionData = useActionData<ActionData>();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-10 shadow">
        <div>
          <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900">
            Admin Login
          </h2>
        </div>

        {actionData?.error && (
          <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
            {actionData.error.message}
          </div>
        )}

        <Form method="post" className="mt-8 space-y-6">
          <input type="hidden" name="accountType" value="admin" />

          <AppFormField
            id="email"
            name="email"
            label="Email Address"
            type="email"
          />

          <AppFormField
            id="password"
            name="password"
            label="Password"
            type="password"
          />

          <button
            type="submit"
            className="group relative flex w-full justify-center rounded-md bg-primaryColor px-3 py-2 text-sm font-semibold text-white hover:bg-primaryColor/90"
          >
            Sign in
          </button>
        </Form>
      </div>
    </div>
  );
}
