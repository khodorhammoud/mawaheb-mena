import { json, LoaderFunctionArgs } from "@remix-run/node";
import { verifyUserRegistrationToken } from "../../servers/user.server";
import { SuccessVerificationLoaderStatus } from "../../types/misc";
import { authenticator } from "../../auth/auth.server";
import { useLoaderData, useNavigate } from "@remix-run/react";
import { useEffect, useRef } from "react";

// export async function action({ request }: ActionFunctionArgs) {

// }

export async function loader({ request }: LoaderFunctionArgs) {
  // If the user is already authenticated redirect to /dashboard directly
  await authenticator.isAuthenticated(request, {
    successRedirect: "/dashboard",
  });
  // get verificqtion token from the url
  const url = new URL(request.url);
  const verificationToken = url.searchParams.get("token") as string;
  const verificationResult =
    await verifyUserRegistrationToken(verificationToken);
  if (!verificationResult.success) {
    return json({
      success: false,
      error: true,
      message: verificationResult.message,
    });
  }

  return json({
    success: true,
  });
}

export default function Layout() {
  const { success, error, message } =
    useLoaderData<SuccessVerificationLoaderStatus>();

  const navigate = useNavigate();

  const redirectionFlag = useRef(false);

  useEffect(() => {
    if (!redirectionFlag.current && success) {
      redirectionFlag.current = true;
      // Trigger redirect after 2 seconds
      setTimeout(() => {
        navigate("/login-employer");
      }, 3000);
    }
  }, [navigate, success]);

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      <div className="w-full bg-white flex flex-col justify-center items-center p-8">
        <h1>Account Verification</h1>
        <h1>Account Verification</h1>
        <h1>Account Verification</h1>
        {success ? (
          <p>
            Your account has been verified successfully, you will be redirected
            to the login page shortly
          </p>
        ) : (
          error && <p>{message}</p>
        )}
      </div>
    </div>
  );
}
