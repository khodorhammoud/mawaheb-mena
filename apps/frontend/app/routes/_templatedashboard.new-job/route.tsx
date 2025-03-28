import { ActionFunctionArgs, redirect } from '@remix-run/node';
import { createJobPosting, getAllJobCategories } from '~/servers/job.server';
import { getCurrentProfileInfo } from '~/servers/user.server';
import { Job } from '~/types/Job';
import { Employer } from '~/types/User';
import { JobStatus, AccountStatus } from '~/types/enums';
import NewJob from './jobs/NewJob';
import { getAllSkills } from '~/servers/skill.server';

export async function action({ request }: ActionFunctionArgs) {
  try {
    const formData = await request.formData();
    const target = formData.get('target') as string;
    const employer = (await getCurrentProfileInfo(request)) as Employer;

    // Check if the employer is deactivated
    if (employer?.account?.accountStatus === AccountStatus.Deactivated) {
      return Response.json(
        {
          success: false,
          error: { message: 'Deactivated accounts cannot create new jobs' },
        },
        { status: 403 }
      );
    }

    const jobStatus = target === 'save-draft' ? JobStatus.Draft : JobStatus.Active;

    // ✅ Extract skills separately
    const skillsRaw = formData.get('jobSkills') as string;
    const skills: { name: string; isStarred: boolean }[] = JSON.parse(skillsRaw);

    // ✅ Create job object (WITHOUT `requiredSkills`)
    const jobData: Job = {
      id: null,
      employerId: employer.id,
      title: formData.get('jobTitle') as string,
      description: formData.get('jobDescription') as string,
      createdAt: null,
      jobCategoryId: parseInt(formData.get('jobCategory') as string) || null,
      workingHoursPerWeek: parseInt(formData.get('workingHours') as string, 10) || 0,
      locationPreference: formData.get('location') as string,
      projectType: formData.get('projectType') as string,
      budget: parseInt(formData.get('budget') as string, 10) || 0,
      experienceLevel: formData.get('experienceLevel') as string,
      status: jobStatus,
      fulfilledAt: null,
    };

    // console.log("📝 Job Data to be inserted:", jobData);
    // console.log("📌 Skills to be linked:", skills);

    const jobStatusResponse = await createJobPosting(jobData, skills);

    if (jobStatusResponse.success) {
      return redirect('/dashboard');
    } else {
      return Response.json(
        { success: false, error: { message: 'Failed to create job posting' } },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error while creating or saving a job as draft', error);
    return Response.json(
      { success: false, error: { message: 'An unexpected error occurred.' } },
      { status: 500 }
    );
  }
}

export async function loader({ request }) {
  try {
    // Get current user profile
    const employer = (await getCurrentProfileInfo(request)) as Employer;

    console.log('New Job route: employer account status:', employer?.account?.accountStatus);
    console.log(
      'New Job route: comparing with AccountStatus.Deactivated:',
      AccountStatus.Deactivated
    );

    // Check if the employer is deactivated
    if (employer?.account?.accountStatus === AccountStatus.Deactivated) {
      console.log('Employer is deactivated, redirecting to dashboard');
      return redirect('/dashboard');
    }

    const jobCategories = await getAllJobCategories();
    const allSkills = await getAllSkills();

    return Response.json({
      jobCategories: jobCategories || [],
      skills: allSkills || [],
    });
  } catch (error) {
    console.error('Error in new-job loader:', error);
    return redirect('/dashboard');
  }
}

export default function JobPostingForm() {
  return <NewJob />;
}
