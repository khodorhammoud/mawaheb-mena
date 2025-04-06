import { Link } from '@remix-run/react';
import { Button } from '~/components/ui/button';
import { JobApplication } from '@mawaheb/db/src/types/Job';

interface FreelancerListItemProps {
  jobApplication: JobApplication;
}

export function FreelancerListItem({ jobApplication }: FreelancerListItemProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
      <div>
        <p className="font-medium">
          {jobApplication.freelancer?.firstName} {jobApplication.freelancer?.lastName}
        </p>
        <p className="text-sm text-gray-500">
          Applied {new Date(jobApplication.createdAt).toLocaleDateString()}
        </p>
      </div>
      <Link to={`/timesheet/${jobApplication.jobId}/${jobApplication.freelancerId}`}>
        <Button variant="outline">View Timesheet</Button>
      </Link>
    </div>
  );
}
