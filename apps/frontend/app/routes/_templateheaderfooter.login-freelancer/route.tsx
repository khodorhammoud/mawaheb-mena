import { ActionFunctionArgs } from "@remix-run/node";
import { getCurrentUser } from "../../auth/session.server";
import LoginFreelancerPage from "./Login";

export async function action({ request }: ActionFunctionArgs) {
  // get current user from session
  console.log("--------------current user", await getCurrentUser(request));
  return null;
}
export default function Layout() {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      <LoginFreelancerPage />
    </div>
  );
}
