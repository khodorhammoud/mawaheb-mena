import { useLoaderData } from '@remix-run/react';
import JobForm from '~/common/job-form/JobForm';
import { JobCategory } from '@mawaheb/db/src/types/User';

export default function NewJob() {
  const { jobCategories } = useLoaderData<{ jobCategories: JobCategory[] }>();
  return (
    <div>
      <JobForm jobCategories={jobCategories} isEdit={false} />
    </div>
  );
}
