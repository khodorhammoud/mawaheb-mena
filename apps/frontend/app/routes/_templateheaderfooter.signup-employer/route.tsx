import { ActionFunctionArgs, redirect } from "@remix-run/node";
import SignUpEmployerPage from "./Signup";

export async function action({ request }: ActionFunctionArgs) {
  const body = await request.formData();
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
