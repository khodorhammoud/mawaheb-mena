import { LoaderFunctionArgs, json } from "@remix-run/node";
import { getCurrentUserAccountType } from "../../servers/user.server";

export async function loader({ request }: LoaderFunctionArgs) {
  // check if the current user is an employer or a freelancer
  // if the current user is an employer, redirect to the employer dashboard
  // if the current user is a freelancer, redirect to the freelancer dashboard
  const accountType = await getCurrentUserAccountType(request);
  console.log("accountType", accountType);
  return json({});
}
export default function Layout() {
  return (
    <div>
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      this is the dashboard layout
    </div>
  );
}
