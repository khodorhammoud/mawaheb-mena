import { ActionFunctionArgs, redirect } from '@remix-run/node';
import EditJob from './EditJob';
import { getAllJobCategories, getJobById, updateJob } from '~/servers/job.server';
import { requireUserIsEmployerPublishedOrDeactivated } from '~/auth/auth.server';
import { getCurrentUserAccountInfo, getProfileInfo } from '~/servers/user.server';
import { getAllSkills } from '~/servers/skill.server';
import { Job } from '~/types/Job';

export async function loader({ params, request }: { params: { jobId: number }; request: Request }) {
  const { jobId } = params;

  await requireUserIsEmployerPublishedOrDeactivated(request);

  const currentAccount = await getCurrentUserAccountInfo(request);
  const profile = await getProfileInfo({ accountId: currentAccount.id });
  const employerId = profile.id;

  const job = await getJobById(jobId);
  if (!job) {
    throw new Response('Job not found', { status: 404 });
  }

  if (job.employerId !== employerId) {
    return redirect('/manage-jobs');
  }

  const jobCategories = await getAllJobCategories();
  const allSkills = await getAllSkills();

  return Response.json({
    job,
    jobCategories: jobCategories || [],
    skills: allSkills || [],
  });
}

export async function action({ request }: ActionFunctionArgs) {
  try {
    await requireUserIsEmployerPublishedOrDeactivated(request);

    const formData = await request.formData();
    const currentAccount = await getCurrentUserAccountInfo(request);
    const profile = await getProfileInfo({ accountId: currentAccount.id });

    const jobId = parseInt(formData.get('jobId') as string, 10);
    if (!jobId) {
      return Response.json(
        { success: false, error: { message: 'Job ID is required' } },
        { status: 400 }
      );
    }

    // ✅ Extract skills correctly
    const skillsRaw = formData.get('jobSkills') as string;
    let requiredSkills = [];
    if (skillsRaw) {
      try {
        requiredSkills = JSON.parse(skillsRaw).map((skill: any) => ({
          id: skill.id || null,
          name: skill.name.trim(),
          isStarred: skill.isStarred || false,
        }));
      } catch (error) {
        console.error('❌ Error parsing jobSkills JSON:', error);
      }
    }

    // ✅ Structure job data properly
    const jobData: Partial<Job> = {
      employerId: profile.id,
      title: formData.get('jobTitle') as string,
      description: formData.get('jobDescription') as string,
      locationPreference: formData.get('location') as string,
      workingHoursPerWeek: parseInt(formData.get('workingHours') as string, 10) || undefined,
      requiredSkills, // Pass correctly parsed skills
      projectType: formData.get('projectType') as string,
      budget: parseInt(formData.get('budget') as string, 10) || undefined,
      experienceLevel: formData.get('experienceLevel') as string,
      status: formData.get('status') as string,
      jobCategoryId: parseInt(formData.get('jobCategory') as string, 10) || null,
    };

    const updatingJob = await updateJob(jobId, jobData);

    if (updatingJob.success) {
      return redirect('/manage-jobs');
    } else {
      return Response.json({ success: false, error: updatingJob.error }, { status: 500 });
    }
  } catch (error) {
    console.error('❌ Error while updating a job:', error);
    return Response.json(
      { success: false, error: { message: 'An unexpected error occurred.' } },
      { status: 500 }
    );
  }
}

export default function JobEditingForm() {
  return <EditJob />;
}
