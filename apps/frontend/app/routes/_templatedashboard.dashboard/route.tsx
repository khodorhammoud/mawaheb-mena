import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  redirect,
} from "@remix-run/node";
import {
  getCurrentProfileInfo,
  getCurrentUserAccountType,
  getCurrentUser,
  getCurrentUserAccountInfo,
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
  saveAvailability,
  getFreelancerAvailability,
} from "~/servers/employer.server";
import { Employer, Freelancer } from "~/types/User";
import Header from "../_templatedashboard/header";
import { requireUserOnboarded } from "~/auth/auth.server";
import { Job } from "~/types/Job";
import { createJobPosting } from "~/servers/job.server";

export async function action({ request }: ActionFunctionArgs) {
  try {
    const formData = await request.formData(); // always do this :)
    const target = formData.get("target-updated"); // for the if and else, to not use this sentence 2 thousand times :)
    const currentUser = await getCurrentUser(request);
    const userId = currentUser.id;
    const employer = (await getCurrentProfileInfo(request)) as Employer;

    // Get the current account info
    const currentAccount = await getCurrentUserAccountInfo(request);
    if (!currentAccount) {
      return Response.json(
        { success: false, error: { message: "User not logged in." } },
        { status: 401 }
      );
    }

    const accountId = currentAccount.id;

    // Extract form fields
    console.log("Form Data Entries:", Array.from(formData.entries()));

    const availableForWork = formData.get("available_for_work") === "true";
    const jobsOpenTo = formData.getAll("jobs_open_to");
    const availableFrom = formData.get("available_from");
    const hoursAvailableFrom = formData.get("hours_available_from");
    const hoursAvailableTo = formData.get("hours_available_to");

    if (!availableFrom) {
      console.error("Missing 'available_from' field in FormData");
    }

    // AVAILABILITY
    if (formData.get("target-updated") === "freelancer-availability") {
      // Extract form fields
      const availableForWork = formData.get("available_for_work") === "true";
      const availableFrom = formData.get("available_from"); // string
      const hoursAvailableFrom = formData.get("hours_available_from");
      const hoursAvailableTo = formData.get("hours_available_to");
      const jobsOpenTo = formData.getAll("jobs_open_to");

      // transfer the string date, into an actual date
      const availableFromAsADate = new Date(availableFrom as string);

      // jobsOpenTo is array .
      const jobsOpenToArray = Array.from(
        formData.getAll("jobs_open_to")
      ) as string[];

      const result = await saveAvailability({
        accountId,
        availableForWork,
        dateAvailableFrom: availableFromAsADate,
        jobsOpenTo: jobsOpenToArray,
        hoursAvailableFrom: hoursAvailableFrom as string,
        hoursAvailableTo: hoursAvailableTo as string,
      });

      console.log("Form Data:", Array.from(formData.entries()));

      return result
        ? Response.json({ success: true })
        : Response.json(
            {
              success: false,
              error: { message: "Failed to save availability." },
            },
            { status: 500 }
          );
    }

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
    if (target == "years-in-business") {
      const fetchedValue = formData.get("years-in-business");
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
      if (!userExists.length) {
        console.warn("User not found.");
        return Response.json(
          { success: false, error: { message: "User not found." } },
          { status: 404 }
        );
      }

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
  // Require that the current user is verified
  await requireUserOnboarded(request);

  // Get the account type
  const accountType: AccountType = await getCurrentUserAccountType(request);

  // Get the current profile
  let currentProfile = await getCurrentProfileInfo(request);

  // Get the account onboarding status
  const accountOnboarded = currentProfile?.account?.user?.isOnboarded;

  // Get the bio information
  const bioInfo = await getAccountBio(currentProfile.account);

  // Check if the user is an Employer
  if (accountType === AccountType.Employer) {
    currentProfile = currentProfile as Employer;
    const employerIndustries = await getEmployerIndustries(currentProfile);
    const allIndustries = (await getAllIndustries()) || [];
    const yearsInBusiness = await getEmployerYearsInBusiness(currentProfile);
    const employerBudget = await getEmployerBudget(currentProfile);
    const aboutContent = await getEmployerAbout(currentProfile);
    const { activeJobCount, draftedJobCount, closedJobCount } =
      await getEmployerDashboardData(request);
    const totalJobCount = activeJobCount + draftedJobCount + closedJobCount;

    // Return response for Employer
    return Response.json({
      accountType,
      bioInfo,
      employerIndustries,
      allIndustries,
      currentUser: currentProfile,
      yearsInBusiness,
      employerBudget,
      aboutContent,
      accountOnboarded,
      activeJobCount,
      draftedJobCount,
      closedJobCount,
      totalJobCount,
    });
  } else {
    // Freelancer-specific data
    currentProfile = currentProfile as Freelancer;

    // Get the freelancer availability data
    const freelancerAvailability = await getFreelancerAvailability(
      currentProfile.accountId
    );

    // Return response for Freelancer
    return Response.json({
      accountType,
      currentUser: currentProfile,
      accountOnboarded: currentProfile.account?.user?.isOnboarded,
      bioInfo,
      freelancerAvailability,
    });
  }
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
