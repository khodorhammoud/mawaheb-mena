import { ActionFunctionArgs, redirect } from "@remix-run/node";
import { createJobPosting, getAllJobCategories } from "~/servers/job.server";
import { getCurrentProfileInfo } from "~/servers/user.server";
import { Job } from "~/types/Job";
import { Employer } from "~/types/User";
import { JobStatus } from "~/types/enums";
import NewJob from "./jobs/NewJob";

export async function loader() {
  const jobCategories = await getAllJobCategories();
  return Response.json({
    jobCategories: jobCategories || [],
  });
}

export async function action({ request }: ActionFunctionArgs) {
  try {
    const formData = await request.formData();
    const target = formData.get("target") as string; // Updated to use the target
    const employer = (await getCurrentProfileInfo(request)) as Employer;

    // Determine job status based on the target action
    const jobStatus =
      target === "save-draft" ? JobStatus.Draft : JobStatus.Active;

    const jobData: Job = {
      id: null, // id is auto generated in database
      employerId: employer.id,
      title: formData.get("jobTitle") as string,
      description: formData.get("jobDescription") as string,
      createdAt: null, // createdAt is set by the database
      jobCategoryId: parseInt(formData.get("jobCategory") as string) || null,
      workingHoursPerWeek:
        parseInt(formData.get("workingHours") as string, 10) || 0,
      locationPreference: formData.get("location") as string,
      requiredSkills: (formData.getAll("jobSkills") as string[]).map(
        (skill) => ({
          name: skill.trim(),
          isStarred: false,
        })
      ),
      projectType: formData.get("projectType") as string,
      budget: parseInt(formData.get("budget") as string, 10) || 0,
      experienceLevel: formData.get("experienceLevel") as string,
      status: jobStatus, // based on action i did
      fulfilledAt: null,
    };

    const jobStatusResponse = await createJobPosting(jobData);

    if (jobStatusResponse.success) {
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
  } catch (error) {
    console.error("Error while creating or saving a job as draft", error);
    return Response.json(
      { success: false, error: { message: "An unexpected error occurred." } },
      { status: 500 }
    );
  }
}

export default function JobPostingForm() {
  return <NewJob />;
}
