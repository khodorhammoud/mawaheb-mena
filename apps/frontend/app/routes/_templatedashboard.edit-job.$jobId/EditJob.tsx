import { useLoaderData } from '@remix-run/react';
import JobForm from '~/common/job-form/JobForm';
import { JobCategory } from '@mawaheb/db/src/types/User';
import { Skill } from '@mawaheb/db/src/types/Skill';

interface LoaderData {
  job: {
    id: string;
    title: string;
    description: string;
    locationPreference: string;
    workingHoursPerWeek: number;
    requiredSkills: Skill[];
    projectType: string;
    budget: number;
    experienceLevel: string;
    jobCategoryId: number | null;
  };
  jobCategories: JobCategory[];
}

export default function EditJob() {
  const { job, jobCategories } = useLoaderData<LoaderData>();
  return (
    <div className="p-6 bg-white">
      <JobForm job={job} jobCategories={jobCategories} isEdit={true} />
    </div>
  );
}
