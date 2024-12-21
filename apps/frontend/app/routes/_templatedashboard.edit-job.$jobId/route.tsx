import { getAllJobCategories } from "~/servers/job.server";
import { ActionFunctionArgs, redirect } from "@remix-run/node";
import EditJob from "./EditJob";
import { getJobById, updateJob } from "~/servers/job.server";

export async function loader({ params }: { params: { jobId: number } }) {
  const { jobId } = params;
  const job = await getJobById(jobId);
  const jobCategories = await getAllJobCategories();

  if (!job) {
    throw new Response("Job not found", { status: 404 });
  }

  return Response.json({
    job,
    jobCategories: jobCategories || [],
  });
}

export async function action({ request }: ActionFunctionArgs) {
  try {
    const formData = await request.formData();
    const jobId = parseInt(formData.get("jobId") as string, 10);
    const target = formData.get("target") as string;
    const jobStatus = target === "save-draft" ? "draft" : "active";

    if (!jobId) {
      return Response.json(
        { success: false, error: { message: "Job ID is required" } },
        { status: 400 }
      );
    }

    const jobData = {
      title: formData.get("jobTitle") as string,
      description: formData.get("jobDescription") as string,
      locationPreference: formData.get("location") as string,
      workingHoursPerWeek:
        parseInt(formData.get("workingHours") as string, 10) || undefined,
      requiredSkills: (formData.getAll("requiredSkills") as string[]).map(
        (skill) => ({
          name: skill.trim(),
          isStarred: false,
        })
      ),
      projectType: formData.get("projectType") as string,
      budget: parseInt(formData.get("budget") as string, 10) || undefined,
      experienceLevel: formData.get("experienceLevel") as string,
      status: jobStatus,
      jobCategoryId:
        parseInt(formData.get("jobCategory") as string, 10) || null,
    };

    // Use the updateJobPosting function
    const updatingJob = await updateJob(jobId, jobData);

    if (updatingJob.success) {
      return redirect("/manage-jobs");
    } else {
      return Response.json(
        { success: false, error: updatingJob.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error while updating a job:", error);
    return Response.json(
      { success: false, error: { message: "An unexpected error occurred." } },
      { status: 500 }
    );
  }
}

export default function JobEditingForm() {
  return <EditJob />;
}
