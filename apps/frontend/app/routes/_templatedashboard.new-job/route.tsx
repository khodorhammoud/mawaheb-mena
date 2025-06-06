import { ActionFunctionArgs, redirect } from '@remix-run/node';
import { createJobPosting, getAllJobCategories } from '~/servers/job.server';
import { getCurrentProfileInfo } from '~/servers/user.server';
import { Job } from '@mawaheb/db/types';
import { Employer } from '@mawaheb/db/types';
import { JobStatus, AccountStatus } from '@mawaheb/db/enums';
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

    // ✅ Extract expectedHourlyRate
    const expectedHourlyRate = parseInt(formData.get('expectedHourlyRate') as string, 10) || 0;

    // ✅ Create job object (INCLUDING expectedHourlyRate)
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
      expectedHourlyRate, // <-- Add this line
      experienceLevel: formData.get('experienceLevel') as string,
      status: jobStatus,
      fulfilledAt: null,
    };

    const jobStatusResponse = await createJobPosting(jobData, skills);

    if (jobStatusResponse.success) {
      // <-- ADD THE JOB ADDED PARAM
      return redirect('/dashboard?job_added=1');
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

    // Check if the employer is deactivated
    if (employer?.account?.accountStatus === AccountStatus.Deactivated) {
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
