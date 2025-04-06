import { JobApplication } from '@mawaheb/db/src/types/Job';
import { Link } from '@remix-run/react';

interface OtherFreelancersProps {
  jobApplications: JobApplication[];
  currentFreelancerId: number;
  jobId: number;
}

export function OtherFreelancers({
  jobApplications,
  currentFreelancerId,
  jobId,
}: OtherFreelancersProps) {
  const otherFreelancers = jobApplications.filter(app => app.freelancerId !== currentFreelancerId);

  if (otherFreelancers.length === 0) {
    return null;
  }

  return (
    <div className="mt-8 border-t pt-6">
      <h3 className="text-lg font-semibold mb-4">Other Freelancers on this Project</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {otherFreelancers.map(application => (
          <Link
            key={application.id}
            to={`/timesheet/${jobId}/${application.freelancerId}`}
            className="block"
          >
            <div className="p-4 bg-white border rounded-lg hover:shadow-md transition-shadow">
              <p className="font-medium">
                Placeholder Firstname Lastname
                {/* {application.freelancer?.firstName}{" "}
                {application.freelancer?.lastName} */}
              </p>
              <p className="text-sm text-gray-500">View Timesheet</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
