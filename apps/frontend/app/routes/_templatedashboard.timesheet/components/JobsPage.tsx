import { useLoaderData } from '@remix-run/react';
import JobApplicationCard from './jobApplicationCard';
import { JobApplication } from '@mawaheb/db/types';
export default function JobsPage({
  onJobSelect,
}: {
  onJobSelect: (jobApplication: JobApplication) => void;
}) {
  const { jobApplications } = useLoaderData<{
    jobApplications: JobApplication[];
  }>();
  return (
    <div>
      {jobApplications.map(jobApplication => (
        <JobApplicationCard
          onSelect={onJobSelect}
          key={jobApplication.id}
          jobApplication={jobApplication}
        />
      ))}
    </div>
  );
}
