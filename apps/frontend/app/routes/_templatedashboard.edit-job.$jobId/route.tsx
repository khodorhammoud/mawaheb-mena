import { ActionFunctionArgs, redirect } from "@remix-run/node";
import EditJob from "./EditJob";
import {
  getAllJobCategories,
  getJobById,
  updateJob,
} from "~/servers/job.server";
import { requireUserIsEmployerPublished } from "~/auth/auth.server";
import {
  getCurrentUserAccountInfo,
  getProfileInfo,
} from "~/servers/user.server";

export async function loader({
  params,
  request,
}: {
  params: { jobId: number };
  request: Request;
}) {
  const { jobId } = params;

  // Step 1: Ensure the user is logged in and an employer
  await requireUserIsEmployerPublished(request);

  const currentAccount = await getCurrentUserAccountInfo(request);

  const profile = await getProfileInfo({ accountId: currentAccount.id });

  const employerId = profile.id;

  // Step 2: Fetch the job and check if the logged-in employer owns it
  const job = await getJobById(jobId);
  if (!job) {
    throw new Response("Job not found", { status: 404 });
  }

  if (job.employerId !== employerId) {
    const referrer = "/manage-jobs";
    return redirect(referrer);
  }

  // Step 3: Fetch job categories
  const jobCategories = await getAllJobCategories();

  // Step 4: Return the job and categories if all checks pass
  return Response.json({
    job,
    jobCategories: jobCategories || [],
  });
}

export async function action({ request }: ActionFunctionArgs) {
  try {
    await requireUserIsEmployerPublished(request);

    // step 1 to get the employerId of the current login user
    const currentAccount = await getCurrentUserAccountInfo(request);

    // step 2 to get the employerId of the current login user
    const profile = await getProfileInfo({ accountId: currentAccount.id });

    // last step to get the employerId of the current login user
    const employerId = profile.id;

    const formData = await request.formData();

    const target = formData.get("target") as string;
    if (target === "save-draft") {
      return redirect("/manage-jobs");
    }

    const jobId = parseInt(formData.get("jobId") as string);
    if (!jobId) {
      return Response.json(
        { success: false, error: { message: "Job ID is required" } },
        { status: 400 }
      );
    }

    // take the job to take its employerId
    const job = await getJobById(jobId);
    if (!job) {
      return Response.json(
        { success: false, error: { message: "Access denied" } },
        { status: 403 }
      );
    }

    // compare the employerId of the job with the logged-in employerId
    if (job.employerId !== employerId) {
      return Response.json(
        {
          success: false,
          error: {
            message: "Access denied.",
          },
        },
        { status: 403 }
      );
    }

    if (!jobId) {
      return Response.json(
        { success: false, error: { message: "Job ID is required" } },
        { status: 400 }
      );
    }

    const jobData = {
      employerId, // Use the employer ID as part of the job data
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
      status: job.status,
      jobCategoryId:
        parseInt(formData.get("jobCategory") as string, 10) || null,
    };

    // Use the updateJob now :)
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
