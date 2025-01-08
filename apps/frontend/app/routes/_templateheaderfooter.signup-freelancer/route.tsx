import SignUpFreelancerPage from "./Signup";

import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import {
  generateVerificationToken,
  getProfileInfo,
} from "../../servers/user.server";
import { RegistrationError } from "../../common/errors/UserError";
import { sendEmail } from "../../servers/emails/emailSender.server";
import { authenticator } from "../../auth/auth.server";
// import { useLoaderData } from "@remix-run/react";
import { Freelancer } from "../../types/User";

export async function action({ request }: ActionFunctionArgs) {
  // holds the newly registered user object once registration is successful
  let newFreelancer: Freelancer = null;
  const clonedRequest = request.clone();

  // use the authentication strategy to authenticate the submitted form data and register the user
  try {
    const userId = await authenticator.authenticate("register", request);
    newFreelancer = (await getProfileInfo({
      userId,
    })) as Freelancer;
  } catch (error) {
    // handle registration errors
    if (error instanceof RegistrationError) {
      console.error("Registration error:", error);
      return Response.json({
        success: false,
        error: {
          code: (error as RegistrationError).code,
          message: (error as RegistrationError).message,
        },
      });
    }
    console.error("Error registering user:", error);

    return Response.json({ success: false, error });
  }
  // if registration was not successful, return an error response
  if (!newFreelancer)
    return Response.json({
      success: false,
      error: false,
      message: "Failed to register user",
    });

  // send the account verification email
  try {
    const body = await clonedRequest.formData();

    const email = body.get("email") as string;
    const name = (
      body.get("firstName") ? body.get("firstName") : body.get("lastName")
    ) as string;
    const userId = newFreelancer.account?.user?.id;
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
    return Response.json({ success: false, error });
  }

  return Response.json({ success: true, newFreelancer });
}

export async function loader({ request }: LoaderFunctionArgs) {
  // If the user is already authenticated redirect to / dashboard directly
  return await authenticator.isAuthenticated(request, {
    successRedirect: "/dashboard",
  });
}

export default function Layout() {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      <SignUpFreelancerPage />
    </div>
  );
}
