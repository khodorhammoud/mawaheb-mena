import EmployerOnboardingForm from "./employer";
import FreelancerOnboardingForm from "./freelancer";
import { json, redirect, useLoaderData } from "@remix-run/react";
import { AccountType } from "~/types/enums";
import Header from "../_templatedashboard/header";
import {
  getCurrentEployerFreelancerInfo,
  getCurrentUserAccountType,
} from "~/servers/user.server";
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Employer } from "~/types/User";
import { authenticator } from "~/auth/auth.server";
import {
  getEmployerBio,
  getEmployerIndustries,
  getAllIndustries,
  getEmployerYearsInBusiness,
  getEmployerBudget,
  getEmployerAbout,
  getEmployerDashboardData,
  checkUserExists,
  updateOnboardingStatus,
  updateEmployerBio,
  updateEmployerIndustries,
  updateEmployerYearsInBusiness,
  updateEmployerBudget,
  updateEmployerAbout,
} from "~/servers/employer.server";
import { getCurrentUser } from "~/auth/session.server";

export async function action({ request }: ActionFunctionArgs) {
  try {
    const formData = await request.formData(); // always do this :)
    const target = formData.get("target-updated"); // for the switch, to not use this sentence 2 thousand times :)
    const currentUser = await getCurrentUser(request);

    const userId = currentUser.id;
    const employer = (await getCurrentEployerFreelancerInfo(
      request
    )) as Employer;

    // ABOUT
    if (target == "employer-about") {
      const aboutContent = formData.get("about") as string;
      const aboutStatus = await updateEmployerAbout(employer, aboutContent);
      return json({ success: aboutStatus.success });
    }
    // BIO
    if (target == "employer-bio") {
      const bio = {
        firstName: formData.get("firstName") as string,
        lastName: formData.get("lastName") as string,
        location: formData.get("location") as string,
        websiteURL: formData.get("website") as string,
        socialMediaLinks: {
          linkedin: formData.get("linkedin") as string,
          github: formData.get("github") as string,
          gitlab: formData.get("gitlab") as string,
          dribbble: formData.get("dribbble") as string,
          stackoverflow: formData.get("stackoverflow") as string,
        },
        userId: userId,
      };
      const bioStatus = await updateEmployerBio(bio, employer);
      return json({ success: bioStatus.success });
    }
    // INDUSTRIES
    if (target == "employer-industries") {
      const industries = formData.get("employer-industries") as string;
      const industriesIds = industries
        .split(",")
        .map((industry) => parseInt(industry));
      const industriesStatus = await updateEmployerIndustries(
        employer,
        industriesIds
      );
      return json({ success: industriesStatus.success });
    }
    // YEARS IN BUSINESS
    if (target == "employer-years-in-business") {
      const yearsInBusiness =
        parseInt(formData.get("years-in-business") as string) || 0;
      const yearsStatus = await updateEmployerYearsInBusiness(
        employer,
        yearsInBusiness
      );
      return json({ success: yearsStatus.success });
    }
    // BUDGET
    if (target == "employer-budget") {
      const budgetValue = formData.get("budget");
      const budget = parseInt(budgetValue as string, 10);

      const budgetStatus = await updateEmployerBudget(employer, budget);
      return json({ success: budgetStatus.success });
    }
    // ONBOARDING -> TRUE ✅
    if (target == "employer-onboard") {
      const userId = currentUser.account.user.id;
      const userExists = await checkUserExists(userId);
      if (!userExists.length)
        return json(
          { success: false, error: { message: "User not found." } },
          { status: 404 }
        );

      const result = await updateOnboardingStatus(userId);
      return result.length
        ? redirect("/dashboard")
        : json(
            {
              success: false,
              error: { message: "Failed to update onboarding status" },
            },
            { status: 500 }
          );
    }
    // DEFAULT
    throw new Error("Unknown target update");
  } catch (error) {
    return json(
      { success: false, error: { message: "An unexpected error occurred." } },
      { status: 500 }
    );
  }
}

export async function loader({ request }: LoaderFunctionArgs) {
  const currentUser = await authenticator.isAuthenticated(request);
  if (!currentUser) {
    return redirect("/login-employer");
  }
  const accountType: AccountType = await getCurrentUserAccountType(request);
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

  // Fetch all the necessary data safely
  const bioInfo = await getEmployerBio(employer);
  const employerIndustries = await getEmployerIndustries(employer);
  const allIndustries = (await getAllIndustries()) || [];
  const yearsInBusiness = await getEmployerYearsInBusiness(employer);
  const employerBudget = await getEmployerBudget(employer);
  const aboutContent = await getEmployerAbout(employer);
  const { activeJobCount, draftedJobCount, closedJobCount } =
    await getEmployerDashboardData(request);

  // Check if employer.account exists before accessing nested properties
  const accountOnboarded = employer?.account?.user?.isOnboarded;
  const totalJobCount = activeJobCount + draftedJobCount + closedJobCount;

  // Return the response data
  return json({
    accountType,
    bioInfo,
    employerIndustries,
    allIndustries,
    currentUser: employer,
    yearsInBusiness,
    employerBudget,
    aboutContent,
    accountOnboarded,
    employer,
    activeJobCount,
    draftedJobCount,
    closedJobCount,
    totalJobCount,
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