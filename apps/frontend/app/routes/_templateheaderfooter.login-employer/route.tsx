import { ActionFunctionArgs, json } from "@remix-run/node";
import LoginEmployerPage from "./Login";
import { authenticator } from "../../auth/auth.server";
import { Employer, Freelancer } from "../../types/User";
import { createUserSession } from "../../auth/session.server";
import { AuthorizationError } from "remix-auth";

export async function action({ request }: ActionFunctionArgs) {
  let employerFreelancer: Employer | Freelancer = null;
  try {
    employerFreelancer = await authenticator.authenticate("login", request, {
      throwOnError: true,
    });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      // here the error is related to the authentication process
      return json({
        success: false,
        error: {
          code: error.cause,
          message: error.message,
        },
      });
    }
    return json({
      success: false,
      error: {
        code: (error as Response).status,
        message: "unhandled error",
      },
    });
  }
  //
  return await createUserSession(request, employerFreelancer, "/dashboard"); // this is not working bro wix 🌟🌟

  // return json({ success: true });
}
export default function Layout() {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      <LoginEmployerPage />
    </div>
  );
}
