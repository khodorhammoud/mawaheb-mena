import { ActionFunctionArgs, LoaderFunctionArgs, json } from "@remix-run/node";
import {
  getCurrentEployerFreelancerInfo,
  getCurrentUser,
  // getCurrentUser,
  getCurrentUserAccountType,
} from "../../servers/user.server";
import EmployerDashboard from "./employer";
import FreelancerDashboard from "./freelancer/Dashboard";
import { useLoaderData } from "@remix-run/react";
import { AccountType } from "../../types/enums";
import {
  getAllIndustries,
  getEmployerBio,
  getEmployerIndustries,
  updateEmployerBio,
  updateEmployerIndustries,
  updateEmployerYearsInBusiness,
} from "~/servers/employer.server";
import { Employer, EmployerBio } from "~/types/User";
import { SuccessVerificationLoaderStatus } from "~/types/misc";
// import { getCurrentEmployerAccountInfo } from "../../servers/employer.server";

export async function action({ request }: ActionFunctionArgs) {
  console.log("submitting form 22");

  const formdata = await request.formData();
  if (formdata.get("target-updated") == "employer-bio") {
    const employer = (await getCurrentEployerFreelancerInfo(
      request
    )) as Employer;
    console.log("employer", employer);
    const bio: EmployerBio = {
      firstName: formdata.get("firstName") as string,
      lastName: formdata.get("lastName") as string,
      location: formdata.get("location") as string,
      websiteURL: formdata.get("website") as string,
      socialMediaLinks: {
        linkedin: formdata.get("linkedin") as string,
        github: formdata.get("github") as string,
        gitlab: formdata.get("gitlab") as string,
        dribbble: formdata.get("dribbble") as string,
        stackoverflow: formdata.get("stackoverflow") as string,
      },
    };
    try {
      const status = await updateEmployerBio(bio, employer);
      return { success: status.success };
    } catch (error) {
      console.error("Error updating employer bio", error);
      return json({ success: false, error: error });
    }
  } else if (formdata.get("target-updated") == "employer-industries") {
    const employer = (await getCurrentEployerFreelancerInfo(
      request
    )) as Employer;
    const industries = formdata.get("employer-industries") as string;

    // parse industries from string to list of numbers
    const industriesIds = industries
      .split(",")
      .map((industry) => parseInt(industry));

    try {
      const status = await updateEmployerIndustries(employer, industriesIds);
      return { success: status.success };
    } catch (error) {
      console.error("Error updating employer industries", error);
      return json({ success: false, error: error });
    }

    return json({ success: true });
  } else if (formdata.get("target-updated") == "employer-years-in-business") {
    const employer = (await getCurrentEployerFreelancerInfo(
      request
    )) as Employer;
    const yearsInBusiness =
      parseInt(formdata.get("years-in-business") as string) || 0;

    try {
      const status = await updateEmployerYearsInBusiness(
        employer,
        yearsInBusiness
      );
      return { success: status.success };
    } catch (error) {
      console.error("Error updating employer years in business", error);
      return json({ success: false, error: error });
    }

    return json({ success: true });
  }

  console.log(JSON.stringify(Object.fromEntries(formdata)));
  return json(Object.fromEntries(formdata));
  // return json({ success: true });
}
export async function loader({ request }: LoaderFunctionArgs) {
  // check if the current user is an employer or a freelancer
  // if the current user is an employer, redirect to the employer dashboard
  // if the current user is a freelancer, redirect to the freelancer dashboard
  const accountType: AccountType = await getCurrentUserAccountType(request);
  const accountOnboarded = false;
  if (!accountType) {
    return json({ accountType: "employer", accountOnboarded });
  }

  const employer = (await getCurrentEployerFreelancerInfo(request)) as Employer;

  const bioInfo = await getEmployerBio(employer);
  const employerIndustries = await getEmployerIndustries(employer);
  const allIndustries = (await getAllIndustries()) || [];
  return json({
    accountType,
    bioInfo,
    employerIndustries,
    allIndustries,
    currentUser: employer,
  });
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
