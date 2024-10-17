import { sidebarEmployerNav } from "~/constants/navigation";
import { useTranslation } from "react-i18next";
import Sidebar from "~/routes/_templatedashboard/Sidebar";
import { json, LoaderFunctionArgs } from "@remix-run/node";
// import { getCurrentUser } from "~/servers/user.server";
import { useLoaderData } from "@remix-run/react";
import OnboardingScreen from "./onboarding-screen";
import DashboardScreen from "./dashboard-screen";

// import { BsCurrencyDollar } from "react-icons/bs";
// import { Button } from "../../../components/ui/button"

// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from "../../../components/ui/card";

// loader function
// export async function loader({ request }: LoaderFunctionArgs) {
//   // const currentUser = await getCurrentUser(request);
//   // check if current employer has finished setting up their account
//   const accountOnboarded = false;
//   return json({ hi: "hi" });
// }

// i am here since the account type is an employer.
// now if the employer is onboarded, then i will be directed to index.tsx inside dashboard-screen. Else, i am still not onboarded, and i am directed to index.tsx inside onboarding-screen
export default function Dashboard() {
  const { accountOnboarded } = useLoaderData<{ accountOnboarded: boolean }>();

  return (
    <div>
      <div className="flex">
        <Sidebar accountType="employer" />

        {/* Main Content */}
        <div className="flex-1 p-6">
          {accountOnboarded ? <DashboardScreen /> : <OnboardingScreen />}
        </div>
      </div>
    </div>
  );
}
