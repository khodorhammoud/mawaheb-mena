import Sidebar from "~/routes/_templatedashboard/Sidebar";
import { useLoaderData } from "@remix-run/react";
import OnboardingScreen from "./onboarding-screen";
import DashboardScreen from "./dashboard-screen";

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

// this is the main page that i open, where there is a navigation, and a sidebar ❤️
