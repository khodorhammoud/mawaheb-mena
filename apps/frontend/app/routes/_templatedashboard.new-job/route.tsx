import { ActionFunctionArgs, redirect, json } from "@remix-run/node";
import { createJobPosting, getAllJobCategories } from "~/servers/job.server";
import { getCurrentProfileInfo } from "~/servers/user.server";
import { Job } from "~/types/Job";
import { Employer } from "~/types/User";
import { JobStatus } from "~/types/enums";
import NewJob from "./jobs/NewJob";
import { preventDuplicateSubmission } from "~/utils/api-helpers";

export async function loader() {
  const jobCategories = await getAllJobCategories();
  return Response.json({
    jobCategories: jobCategories || [],
  });
}

export async function action({ request }: ActionFunctionArgs) {
  try {
    const formData = await request.formData();
    // extract the timestamp
    const timestamp = formData.get("timestamp") as string;
    // check for duplicate submissions using at that timestamp
    try {
      preventDuplicateSubmission(timestamp);
    } catch (error: any) {
      return Response.json(
        { success: false, error: { message: error.message } },
        { status: 400 }
      );
    }

    const target = formData.get("target") as string;
    const employer = (await getCurrentProfileInfo(request)) as Employer;

    const jobStatus =
      target === "save-draft" ? JobStatus.Draft : JobStatus.Active;

    // Prepare the job data
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
      status: jobStatus,
      fulfilledAt: null,
    };

    // Save the job to the database
    const jobStatusResponse = await createJobPosting(jobData);

    if (jobStatusResponse.success) {
      return redirect("/dashboard");
    } else {
      return Response.json(
        { success: false, error: { message: "Failed to save job." } },
        { status: 500 }
      );
    }
  } catch (error) {
    return Response.json(
      { success: false, error: { message: "An unexpected error occurred." } },
      { status: 500 }
    );
  }
}

export default function JobPostingForm() {
  return <NewJob />;
}
