import { ActionFunctionArgs, json, LoaderFunctionArgs } from "@remix-run/node";
import SignUpEmployerPage from "./Signup";
import {
  generateVerificationToken,
  getProfileInfo,
  // registerEmployer,
} from "../../servers/user.server";
// import { EmployerAccountType } from "../../types/User";
import { RegistrationError } from "../../common/errors/UserError";
import { sendEmail } from "../../servers/emails/emailSender.server";
import { authenticator } from "../../auth/auth.server";
import { Employer } from "../../types/User";

export async function action({ request }: ActionFunctionArgs) {
  // holds the newly registered user object once registration is successful
  let newEmployer: Employer = null;
  const clonedRequest = request.clone();

  // use the authentication strategy to authenticate the submitted form data and register the user
  try {
    const user = await authenticator.authenticate("register", request);
    newEmployer = (await getProfileInfo({
      userId: user.account.user.id,
    })) as Employer;
  } catch (error) {
    console.error("Error registering user:", error);
    // handle registration errors
    if (error instanceof RegistrationError) {
      return json({
        success: false,
        error: {
          code: (error as RegistrationError).code,
          message: (error as RegistrationError).message,
        },
      });
    }

    return json({ success: false, error });
  }
  // if registration was not successful, return an error response
  if (!newEmployer) {
    console.error("Failed to register user", newEmployer);
    return json({
      success: false,
      error: false,
      message: "Failed to register user",
    });
  }

  // send the account verification email
  try {
    const body = await clonedRequest.formData();

    const email = body.get("email") as string;
    const name = (
      body.get("firstName") ? body.get("firstName") : body.get("lastName")
    ) as string;
    const userId = newEmployer.account?.user?.id;
    const verificationToken = await generateVerificationToken(userId);
    sendEmail({
      type: "accountVerification",
      email: email,
      name: name,
      data: {
        // TODO: change the verification link to the actual production URL
        verificationLink: `${process.env.HOST_URL}/verify-account?token=${verificationToken}`,
      },
    });
  } catch (error) {
    console.error("Error sending verification email:", error);
    return json({ success: false, error });
  }

  return json({ success: true, newEmployer });
}

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await authenticator.isAuthenticated(request);

  // SO !--IMPORTANT--!
  // If the user is authenticated, redirect to the dashboard.
  if (user) {
    return json({ redirect: "/dashboard" });
  }

  // Otherwise, let them stay on the signup page.
  return json({ success: false });
}

export default function Layout() {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      <SignUpEmployerPage />
    </div>
  );
}
