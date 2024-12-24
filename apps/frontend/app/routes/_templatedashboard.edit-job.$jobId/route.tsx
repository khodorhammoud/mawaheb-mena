import { ActionFunctionArgs, redirect } from "@remix-run/node";
import EditJob from "./EditJob";
import {
  getAllJobCategories,
  getJobById,
  updateJob,
} from "~/servers/job.server";
import { JobStatus, AccountType } from "~/types/enums";
import { requireUserIsEmployerPublished } from "~/auth/auth.server";
import {
  getCurrentUserAccountInfo,
  getProfileInfo,
} from "~/servers/user.server";

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
    await requireUserIsEmployerPublished(request);

    // step 1 to get the employerId of the current login user
    const currentAccount = await getCurrentUserAccountInfo(request);
    if (!currentAccount) {
      return Response.json(
        { success: false, error: { message: "User not authenticated" } },
        { status: 401 }
      );
    }

    // step 2 to get the employerId of the current login user
    const profile = await getProfileInfo({ accountId: currentAccount.id });
    if (!profile || profile.account.accountType !== "employer") {
      return Response.json(
        { success: false, error: { message: "Employer profile not found" } },
        { status: 404 }
      );
    }

    // last step to get the employerId of the current login user
    const employerId = profile.id;

    const formData = await request.formData();

    const jobId = parseInt(formData.get("jobId") as string, 10);
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
        { success: false, error: { message: "Job not found" } },
        { status: 404 }
      );
    }

    // compare the employerId of the job with the logged-in employerId
    if (job.employerId !== employerId) {
      // ToDo: remove console later
      // ToDo: remove console later
      console.log("ma fik bro");
      return Response.json(
        {
          success: false,
          error: {
            message: "You are not authorized to edit this job. Access denied.",
          },
        },
        { status: 403 }
      );
    }

    // ToDo: remove console later
    // ToDo: remove console later
    console.log("wix");
    console.log(
      `Employer ID matches: Logged-in Employer ID (${employerId}) is the owner of the job (${jobId}).`
    );

    const target = formData.get("target") as string;
    const jobStatus =
      target === "save-draft" ? JobStatus.Draft : JobStatus.Active;

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
