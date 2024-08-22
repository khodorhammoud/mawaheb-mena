import { ActionFunctionArgs, json } from "@remix-run/node";
import SignUpEmployerPage from "./Signup";
import {
  generateVerificationToken,
  registerEmployer,
} from "../../servers/user.server";
import { EmployerAccountType } from "../../types/User";
import { RegistrationError } from "../../common/errors/UserError";
import { sendEmail } from "../../servers/emails/emailSender.server";

export async function action({ request }: ActionFunctionArgs) {
  const body = await request.formData();
  let newEmployer = null;
  const email = body.get("email") as string;
  const name = (
    body.get("firstName") ? body.get("firstName") : body.get("lastName")
  ) as string;
  try {
    newEmployer = await registerEmployer({
      firstName: body.get("firstName") as string,
      lastName: body.get("lastName") as string,
      email: body.get("email") as string,
      password: body.get("password") as string,
      accountType: body.get("accountType") as EmployerAccountType,
    });
  } catch (error) {
    if (error instanceof RegistrationError) {
      console.error("Error registering employer:", error);
      return json({
        success: false,
        error: {
          code: (error as RegistrationError).code,
          message: (error as RegistrationError).message,
        },
      });
    }
    console.error("Error registering employer:", error);
    return json({ success: false, error });
  }
  if (!newEmployer)
    return json({
      success: false,
      error: false,
      message: "Failed to register user",
    });

  const verificationToken = await generateVerificationToken(newEmployer.userId);
  sendEmail({
    type: "accountVerification",
    email: email,
    name: name,
    data: {
      verificationLink: `http://localhost:5173/verify-account?token=${verificationToken}`,
    },
  });

  return json({ success: true, newEmployer });
}
export default function Layout() {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      <SignUpEmployerPage />
    </div>
  );
}
