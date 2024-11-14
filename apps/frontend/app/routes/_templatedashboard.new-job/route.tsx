import { createJobPosting, getAllJobCategories } from "~/servers/job.server";
import { ActionFunctionArgs, json, redirect } from "@remix-run/node";
import { getCurrentProfileInfo } from "~/servers/user.server";
import { Job } from "~/types/Job";
import { Employer } from "~/types/User";
import NewJob from "./jobs/NewJob";
// import { JobStatus } from "~/types/enums";

interface JobCategory {
  id: number;
  label: string;
}

// Define the type for the loader's response
export interface LoaderData {
  jobCategories: JobCategory[];
}

export async function loader() {
  const jobCategories = await getAllJobCategories();
  return json<LoaderData>({
    jobCategories: jobCategories || [],
  });
}

export async function action({ request }: ActionFunctionArgs) {
  try {
    const formData = await request.formData();
    const target = formData.get("target-updated");
    const employer = (await getCurrentProfileInfo(request)) as Employer;

    if (target === "post-job") {
      const jobData: Job = {
        employerId: employer.id,
        title: formData.get("jobTitle") as string,
        description: formData.get("jobDescription") as string,
        jobCategoryId: parseInt(formData.get("jobCategory") as string) || null,
        workingHoursPerWeek:
          parseInt(formData.get("workingHours") as string, 10) || 0,
        locationPreference: formData.get("location") as string,
        requiredSkills: ((formData.get("jobSkills") as string) || "")
          .split(",")
          .map((skill) => ({
            name: skill.trim(),
            isStarred: false,
          })),
        projectType: formData.get("projectType") as string,
        budget: parseInt(formData.get("budget") as string, 10) || 0,
        experienceLevel: formData.get("experienceLevel") as string,
        status: "active",
      };

      console.log("Job data for insertion:", jobData);
      const jobStatus = await createJobPosting(jobData);

      if (jobStatus.success) {
        return redirect("/dashboard");
      } else {
        console.error("Failed to create job posting:", jobStatus.error);
        return json(
          {
            success: false,
            error: { message: "Failed to create job posting" },
          },
          { status: 500 }
        );
      }
    }

    throw new Error("Unknown target update");
  } catch (error) {
    console.error("Unexpected error while creating a job:", error);
    return json(
      { success: false, error: { message: "An unexpected error occurred." } },
      { status: 500 }
    );
  }
}

export default function JobPostingForm() {
  return <NewJob />;
}
