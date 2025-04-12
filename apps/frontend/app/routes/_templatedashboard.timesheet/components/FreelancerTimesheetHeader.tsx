import { JobApplication } from '@mawaheb/db';

interface FreelancerTimesheetHeaderProps {
  jobApplication: JobApplication;
}

export function FreelancerTimesheetHeader({ jobApplication }: FreelancerTimesheetHeaderProps) {
  return (
    <div className="mb-6">
      <h2 className="text-2xl font-semibold mb-2">
        {/* {jobApplication.freelancer?.firstName}{" "}
        {jobApplication.freelancer?.lastName} */}
        Placeholder Firstname Lastname&apos;s Timesheet
      </h2>
      <p className="text-gray-500">Project: {jobApplication.job?.title}</p>
    </div>
  );
}
