import EmployerOnboardingForm from "./employer";
import FreelancerOnboardingForm from "./freelancer";
import { json, redirect, useLoaderData } from "@remix-run/react";
import { AccountType } from "~/types/enums";
import Header from "../_templatedashboard/header";
import {
  getCurrentEployerFreelancerInfo,
  getCurrentUserAccountType,
} from "~/servers/user.server";
import { LoaderFunctionArgs } from "@remix-run/node";
import { Employer, Freelancer } from "~/types/User";
import { authenticator } from "~/auth/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const currentUser = await authenticator.isAuthenticated(request);
  if (!currentUser) {
    return redirect("/login-employer");
  }
  const accountType: AccountType = await getCurrentUserAccountType(request);
  console.log(
    "await getCurrentEployerFreelancerInfo(request)",
    await getCurrentEployerFreelancerInfo(request)
  );
  const employer = (await getCurrentEployerFreelancerInfo(request)) as Employer;

  // !!IMPortant!! If the employer object is not available, return an error response early
  if (!employer) {
    return json(
      {
        success: false,
        error: { message: "Employer information not found." },
      },
      { status: 404 }
    );
  }

  // if the current user is not onboarded, redirect them to the onboarding screen
  if (employer.account.user.isOnboarded) {
    return redirect("/dashboard");
  }

  return json({
    accountType,
    currentUser,
  });
}

// Layout component
export default function Layout() {
  const { accountType } = useLoaderData<{
    accountType: AccountType;
  }>();

  return (
    <div>
      {/* adding the header like that shall be temporary, and i shall ask about it */}
      <Header />
      {accountType === "employer" ? (
        <EmployerOnboardingForm />
      ) : (
        <FreelancerOnboardingForm />
      )}
    </div>
  );
}
