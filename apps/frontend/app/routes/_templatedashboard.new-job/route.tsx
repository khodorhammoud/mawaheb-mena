import { createJobPosting, getAllJobCategories } from "~/servers/job.server";
import NewJob from "./jobs/NewJob";
import { ActionFunctionArgs, redirect } from "@remix-run/node";
import { getCurrentProfileInfo } from "~/servers/user.server";
import { Job } from "~/types/Job";
import { Employer, JobCategory } from "~/types/User";
import { JobStatus } from "~/types/enums";

export interface LoaderData {
  jobCategories: JobCategory[];
}

export async function loader() {
  const jobCategories = await getAllJobCategories();
  return Response.json({
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
        requiredSkills: (formData.getAll("jobSkills") as string[]).map(
          (skill) => ({
            name: skill.trim(),
            isStarred: false, // Default value for isStarred
          })
        ),
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

    throw new Error("Unknown target update");
  } catch (error) {
    console.error("error while creating a job", error);
    return Response.json(
      { success: false, error: { message: "An unexpected error occurred." } },
      { status: 500 }
    );
  }
}

export default function JobPostingForm() {
  return <NewJob />;
}
