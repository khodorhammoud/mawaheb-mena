import { LoaderFunctionArgs, json } from "@remix-run/node";
import {
  // getCurrentUser,
  getCurrentUserAccountType,
} from "../../servers/user.server";
import EmployerDashboard from "./employer";
import FreelancerDashboard from "./freelancer/Dashboard";
import { useLoaderData } from "@remix-run/react";
import { AccountType } from "../../types/enums";
// import { getCurrentEmployerAccountInfo } from "../../servers/employer.server";

export async function loader({ request }: LoaderFunctionArgs) {
  // check if the current user is an employer or a freelancer
  // if the current user is an employer, redirect to the employer dashboard
  // if the current user is a freelancer, redirect to the freelancer dashboard
  const accountType: AccountType = await getCurrentUserAccountType(request);
  const accountOnboarded = false;
  if (!accountType) {
    return json({ accountType: "employer", accountOnboarded });
  }
  // let accountInfo = null;
  // const userInfo = await getCurrentUser(request);
  // accountInfo = await getCurrentEmployerAccountInfo(request);

  /* if (accountType === "employer") {
  } else {
    accountInfo = await getFreelancerAccountInfo(request);
  } */
  return json({ accountType });
}
export default function Layout() {
  const { accountType } = useLoaderData<{ accountType: AccountType }>();
  return (
    <div>
      {accountType === "employer" ? (
        <EmployerDashboard />
      ) : (
        <FreelancerDashboard />
      )}
    </div>
  );
}
