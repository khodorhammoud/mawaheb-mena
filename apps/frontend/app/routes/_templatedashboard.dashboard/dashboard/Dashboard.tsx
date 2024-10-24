import { ActionFunctionArgs, LoaderFunctionArgs, json } from "@remix-run/node";
import {
  getCurrentEployerFreelancerInfo,
  getCurrentUserAccountType,
} from "../../../servers/user.server";
import EmployerDashboard from "../employer";
import FreelancerDashboard from "../freelancer/Dashboard";
import { useLoaderData, useActionData, Form } from "@remix-run/react";
import { AccountType } from "../../../types/enums";
import {
  getAllIndustries,
  getEmployerBio,
  getEmployerIndustries,
  updateEmployerBio,
  updateEmployerIndustries,
  updateEmployerYearsInBusiness,
  getEmployerYearsInBusiness,
  getEmployerBudget,
  updateEmployerBudget,
  updateEmployerAbout,
  getEmployerAbout,
  checkUserExists,
  updateOnboardingStatus,
  createJobPosting,
  getEmployerDashboardData,
} from "~/servers/employer.server";
import { Employer } from "~/types/User";
import { redirect } from "@remix-run/node";
import { db } from "../../../db/drizzle/connector"; // Import your db instance
import { UsersTable } from "../../../db/drizzle/schemas/schema"; // Adjust the path to where you define your schema
import { eq } from "drizzle-orm"; // Import 'eq' for comparison
import { getCurrentUser } from "../../../servers/user.server";

// Action
// Action
// Action

export async function action({ request }: ActionFunctionArgs) {
  try {
    const formData = await request.formData(); // always do this :)
    const target = formData.get("target-updated"); // for the switch, to not use this sentence 2 thousand times :)
    const currentUser = await getCurrentUser(request);
    const userId = currentUser.id;

    console.log("Form submitted with target:", target); // Debug: check the form target
    console.log("hii");

    const employer = (await getCurrentEployerFreelancerInfo(
      request
    )) as Employer;

    switch (target) {
      // ABOUT
      case "employer-about":
        const aboutContent = formData.get("about") as string;
        const aboutStatus = await updateEmployerAbout(employer, aboutContent);
        return json({ success: aboutStatus.success });

      // BIO
      case "employer-bio":
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
          // userId: employer.account?.user?.id, // Ensure this is added
          userId: userId,
        };
        const bioStatus = await updateEmployerBio(bio, employer);
        return json({ success: bioStatus.success });

      // INDUSTRIES
      case "employer-industries":
        const industries = formData.get("employer-industries") as string;
        const industriesIds = industries
          .split(",")
          .map((industry) => parseInt(industry));
        const industriesStatus = await updateEmployerIndustries(
          employer,
          industriesIds
        );
        return json({ success: industriesStatus.success });

      // YEARS IN BUSINESS
      case "employer-years-in-business":
        const yearsInBusiness =
          parseInt(formData.get("years-in-business") as string) || 0;
        const yearsStatus = await updateEmployerYearsInBusiness(
          employer,
          yearsInBusiness
        );
        return json({ success: yearsStatus.success });

      // BUDGET
      case "employer-budget":
        const budgetValue = formData.get("budget");
        const budget = parseInt(budgetValue as string, 10);

        const budgetStatus = await updateEmployerBudget(employer, budget);
        return json({ success: budgetStatus.success });

      // ONBOARDING -> TRUE ✅
      case "employer-onboard":
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

      case "post-job": {
        console.log("Current user and employer data:", currentUser, employer); // Debug: check user and employer
        console.log("kifo");

        const jobData = {
          employerId: employer.id,
          title: formData.get("jobTitle") as string,
          description: formData.get("jobDescription") as string,
          workingHoursPerWeek:
            parseInt(formData.get("workingHours") as string, 10) || 0,
          locationPreference: formData.get("location") as string,
          requiredSkills: (formData.get("skills") as string)
            .split(",")
            .map((skill) => skill.trim()),
          projectType: formData.get("projectType") as string,
          budget: parseInt(formData.get("budget") as string, 10) || 0,
          experienceLevel: formData.get("experienceLevel") as string,
          isDraft: false, // Set to false as it's being posted directly
        };
        console.log("Job data prepared for insertion:", jobData); // Debug: check the job data

        const jobStatus = await createJobPosting(jobData);

        console.log("Job creation status:", jobStatus); // Debug: check job creation response
        console.log("yayyy");

        if (jobStatus.success) {
          return redirect("/dashboard");
        } else {
          return json(
            {
              success: false,
              error: { message: "Failed to create job posting" },
            },
            { status: 500 }
          );
        }
      }

      // DEFAULT
      default:
        throw new Error("Unknown target update");
    }
  } catch (error) {
    return json(
      { success: false, error: { message: "An unexpected error occurred." } },
      { status: 500 }
    );
  }
}

// Loader
// Loader
// Loader

export async function loader({ request }: LoaderFunctionArgs) {
  const accountType: AccountType = await getCurrentUserAccountType(request);
  const employer = (await getCurrentEployerFreelancerInfo(request)) as Employer;

  // If the employer object is not available, return an error response early
  if (!employer) {
    return json(
      {
        success: false,
        error: { message: "Employer information not found." },
      },
      { status: 404 }
    );
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
      {accountType === "employer" ? (
        <EmployerDashboard />
      ) : (
        <FreelancerDashboard />
      )}
    </div>
  );
}
