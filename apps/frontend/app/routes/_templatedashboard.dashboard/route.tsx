import { ActionFunctionArgs, LoaderFunctionArgs, json } from "@remix-run/node";
import {
  getCurrentEployerFreelancerInfo,
  getCurrentUserAccountType,
} from "../../servers/user.server";
import EmployerDashboard from "./employer";
import FreelancerDashboard from "./freelancer/Dashboard";
import { useLoaderData, useActionData, Form } from "@remix-run/react";
import { AccountType } from "../../types/enums";
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
} from "~/servers/employer.server";
import { Employer, EmployerBio } from "~/types/User";

// Action function
export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const target = formData.get("target-updated");

  try {
    const employer = (await getCurrentEployerFreelancerInfo(
      request
    )) as Employer;

    switch (target) {
      case "employer-about":
        const aboutContent = formData.get("about") as string;
        const aboutStatus = await updateEmployerAbout(employer, aboutContent);
        return json({ success: aboutStatus.success });

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
        };
        const bioStatus = await updateEmployerBio(bio, employer);
        return json({ success: bioStatus.success });

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

      case "employer-years-in-business":
        const yearsInBusiness =
          parseInt(formData.get("years-in-business") as string) || 0;
        const yearsStatus = await updateEmployerYearsInBusiness(
          employer,
          yearsInBusiness
        );
        return json({ success: yearsStatus.success });

      case "employer-budget":
        const budget = formData.get("budget") as string;
        const budgetStatus = await updateEmployerBudget(employer, budget);
        return json({ success: budgetStatus.success });

      default:
        throw new Error("Unknown target update");
    }
  } catch (error) {
    console.error("Error processing request", error);

    // Cast the error as an instance of Error to safely access the `message` property
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    return json({ success: false, error: { message: errorMessage } });
  }
}

// Loader function
export async function loader({ request }: LoaderFunctionArgs) {
  const accountType: AccountType = await getCurrentUserAccountType(request);
  const employer = (await getCurrentEployerFreelancerInfo(request)) as Employer;

  const bioInfo = await getEmployerBio(employer);
  const employerIndustries = await getEmployerIndustries(employer);
  const allIndustries = (await getAllIndustries()) || [];
  const yearsInBusiness = await getEmployerYearsInBusiness(employer);
  const employerBudget = await getEmployerBudget(employer);
  const aboutContent = await getEmployerAbout(employer); // Fetch the standalone "About" content

  return json({
    accountType,
    bioInfo,
    employerIndustries,
    allIndustries,
    currentUser: employer,
    yearsInBusiness,
    employerBudget,
    aboutContent, // Include the "About" section content in the loader response
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
