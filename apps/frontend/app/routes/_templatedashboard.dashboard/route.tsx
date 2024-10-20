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
import { Employer } from "~/types/User";
import { redirect } from "@remix-run/node";
import { db } from "../../db/drizzle/connector"; // Import your db instance
import { UsersTable } from "../../db/drizzle/schemas/schema"; // Adjust the path to where you define your schema
import { eq } from "drizzle-orm"; // Import 'eq' for comparison

// Action
// Action
// Action

export async function action({ request }: ActionFunctionArgs) {
  try {
    const formData = await request.formData(); // always do this :)
    const target = formData.get("target-updated"); // for the switch, to not use this sentence 2 thousand times :)
    const userIdValue = formData.get("userId"); // Get the user ID from the form data
    console.log("User ID from form: ", userIdValue); // Check the value of userId

    // Ensure userIdValue is a string
    if (typeof userIdValue !== "string" || isNaN(parseInt(userIdValue))) {
      console.error("Invalid user ID format:", userIdValue);
      return json(
        { success: false, error: { message: "Invalid user ID" } },
        { status: 400 }
      );
    }

    const userId = parseInt(userIdValue);
    // console.log("Updating user with ID:", userId);

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
          userId: employer.account?.user?.id, // Ensure this is added
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

        if (isNaN(budget)) {
          return json(
            {
              success: false,
              error: { message: "Budget must be a valid number" },
            },
            { status: 400 }
          );
        }

        const budgetStatus = await updateEmployerBudget(employer, budget);
        return json({ success: budgetStatus.success });

      // ONBOARDING -> TRUE ✅
      case "employer-onboard":
        const updateData: { [key: string]: any } = {
          isOnboarded: true, // the true one is isOnboarded
        };

        // Check if the user exists before updating
        const userExists = await db
          .select()
          .from(UsersTable)
          .where(eq(UsersTable.id, userId)) // we took userId from the form, like when i press on the button, it taked the id for my account, and this id is sent as an userId, this userId is called through this line in this action "const userIdValue = formData.get("userId");", and we are using userId when we want to ❤️
          .limit(1);

        if (userExists.length === 0) {
          console.error("No user found with the given userId.", userId);
          return json(
            { success: false, error: { message: "User not found." } },
            { status: 404 }
          );
        }

        console.log(
          "User found. Proceeding to update onboarding status.",
          userExists
        );

        // Perform the update
        const result = await db
          .update(UsersTable)
          .set(updateData)
          .where(eq(UsersTable.id, userId))
          .returning();

        console.log("Update Result: ", result);

        if (result.length > 0) {
          console.log("User onboarded successfully!");
          return redirect("/dashboard");
        } else {
          console.error(
            "No rows were updated. Check if userId exists or if there is an issue with the update operation."
          );
          return json(
            {
              success: false,
              error: { message: "Failed to update onboarding status" },
            },
            { status: 500 }
          );
        }
      // DEFAULT
      default:
        throw new Error("Unknown target update");
    }
  } catch (error) {
    console.error("Error processing request", error);
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
  const bioInfo = await getEmployerBio(employer);
  const employerIndustries = await getEmployerIndustries(employer);
  const allIndustries = (await getAllIndustries()) || [];
  const yearsInBusiness = await getEmployerYearsInBusiness(employer);
  const employerBudget = await getEmployerBudget(employer);
  const aboutContent = await getEmployerAbout(employer);
  // // Check if the user is onboarded and include that information in the JSON response
  // const accountOnboarded = employer.isOnboarded;
  // console.log("wixxxxxx ohhhhhhhh", accountOnboarded);

  const accountOnboarded = employer.account?.user?.isOnboarded; // this worked for the proceed button, and made me move to another page
  console.log("Employer object in loader:", employer);

  return json({
    accountType,
    bioInfo,
    employerIndustries,
    allIndustries,
    currentUser: employer,
    yearsInBusiness,
    employerBudget,
    aboutContent,
    accountOnboarded, // Include the onboarding status in the return JSON
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
