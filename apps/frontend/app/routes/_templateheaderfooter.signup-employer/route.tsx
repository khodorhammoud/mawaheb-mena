import { ActionFunctionArgs, redirect } from "@remix-run/node";
import SignUpEmployerPage from "./Signup";
import { registerEmployer, registerUser } from "../../servers/user.server";
import { EmployerAccountType } from "../../types/User";

export async function action({ request }: ActionFunctionArgs) {
  const body = await request.formData();

  registerEmployer({
    firstName: body.get("firstName") as string,
    lastName: body.get("lastName") as string,
    email: body.get("email") as string,
    password: body.get("password") as string,
    accountType: body.get("accountType") as EmployerAccountType,
  });
  console.log("body date:", body);
  return null;
}
export default function Layout() {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      <SignUpEmployerPage />
    </div>
  );
}
