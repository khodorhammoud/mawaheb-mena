import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  redirect,
} from "@remix-run/node";
import {
  getCurrentProfileInfo,
  getCurrentUserAccountType,
  getCurrentUser,
} from "~/servers/user.server";
import EmployerDashboard from "./employer";
import FreelancerDashboard from "./freelancer";
import { useLoaderData } from "@remix-run/react";
import { AccountType, JobStatus } from "~/types/enums";
import {
  getAllIndustries,
  getAccountBio,
  getEmployerIndustries,
  updateAccountBio,
  updateEmployerIndustries,
  updateEmployerYearsInBusiness,
  getEmployerYearsInBusiness,
  getEmployerBudget,
  updateEmployerBudget,
  updateEmployerAbout,
  getEmployerAbout,
  checkUserExists,
  updateOnboardingStatus,
  getEmployerDashboardData,
} from "~/servers/employer.server";
import { Employer } from "~/types/User";
import Header from "../_templatedashboard/header";
import { authenticator } from "~/auth/auth.server";
import { Job } from "~/types/Job";
import { createJobPosting } from "~/servers/job.server";

export async function action({ request }: ActionFunctionArgs) {
  try {
    console.log("action");
    const formData = await request.formData(); // always do this :)
    const target = formData.get("target-updated"); // for the if and else, to not use this sentence 2 thousand times :)
    const currentUser = await getCurrentUser(request);
    const userId = currentUser.id;
    const employer = (await getCurrentProfileInfo(request)) as Employer;

    // ABOUT
    if (target == "employer-about") {
      const aboutContent = formData.get("about") as string;
      const aboutStatus = await updateEmployerAbout(employer, aboutContent);
      return Response.json({ success: aboutStatus.success });
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
      const bioStatus = await updateAccountBio(bio, employer.account);
      return Response.json({ success: bioStatus.success });
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
      return Response.json({ success: industriesStatus.success });
    }
    // YEARS IN BUSINESS
    console.log("target", target);
    if (target == "years-in-business") {
      const fetchedValue = formData.get("years-in-business");
      console.log("fetchedValue", fetchedValue);
      const yearsInBusiness = parseInt(fetchedValue as string) || 0;

      const yearsStatus = await updateEmployerYearsInBusiness(
        employer,
        yearsInBusiness
      );
      return Response.json({ success: yearsStatus.success });
    }
    // BUDGET
    if (target == "employer-budget") {
      const budgetValue = formData.get("budget");
      const budget = parseInt(budgetValue as string, 10);

      const budgetStatus = await updateEmployerBudget(employer, budget);
      return Response.json({ success: budgetStatus.success });
    }
    // ONBOARDING -> TRUE ✅
    if (target == "employer-onboard") {
      const userExists = await checkUserExists(userId);
      if (!userExists.length)
        return Response.json(
          { success: false, error: { message: "User not found." } },
          { status: 404 }
        );

      const result = await updateOnboardingStatus(userId);
      return result.length
        ? redirect("/dashboard")
        : Response.json(
            {
              success: false,
              error: { message: "Failed to update onboarding status" },
            },
            { status: 500 }
          );
    }
    if (target == "post-job") {
      // TODO: Add validation for the form fields
      const jobData: Job = {
        employerId: employer.id,
        title: formData.get("jobTitle") as string,
        description: formData.get("jobDescription") as string,
        workingHoursPerWeek:
          parseInt(formData.get("workingHours") as string, 10) || 0,
        locationPreference: formData.get("location") as string,
        requiredSkills: (formData.get("skills") as string)
          .split(",")
          .map((skill) => ({ name: skill.trim(), isStarred: false })),

        projectType: formData.get("projectType") as string,
        budget: parseInt(formData.get("budget") as string, 10) || 0,
        experienceLevel: formData.get("experienceLevel") as string,
        status: JobStatus.Active,
      };

      const jobStatus = await createJobPosting(jobData);

      if (jobStatus.success) {
        return redirect("/dashboard");
      } else {
        return Response.json(
          {
            success: false,
            error: { message: "Failed to create job posting" },
          },
          { status: 500 }
        );
      }
    }
    // DEFAULT
    throw new Error("Unknown target update");
  } catch (error) {
    return Response.json(
      { success: false, error: { message: "An unexpected error occurred." } },
      { status: 500 }
    );
  }
}

export async function loader({ request }: LoaderFunctionArgs) {
  // if the curretn user is not logged in, redirect them to the login screen
  const user = await authenticator.isAuthenticated(request);
  if (!user) {
    return redirect("/login-employer");
  }
  const accountType: AccountType = await getCurrentUserAccountType(request);
  const employer = (await getCurrentProfileInfo(request)) as Employer;

  // !!IMPortant!! If the employer object is not available, return an error response early
  if (!employer) {
    return Response.json(
      {
        success: false,
        error: { message: "Employer information not found." },
      },
      { status: 404 }
    );
  }

  // if the current user is not onboarded, redirect them to the onboarding screen
  if (!employer.account.user.isOnboarded) {
    return redirect("/onboarding");
  }

  // Fetch all the necessary data safely
  const bioInfo = await getAccountBio(employer.account);
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
  return Response.json({
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
        <EmployerDashboard />
      ) : (
        <FreelancerDashboard />
      )}
    </div>
  );
}
