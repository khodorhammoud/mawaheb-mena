import { Job, JobApplication } from '@mawaheb/db/src/types/Job';
import { useEffect, useState } from 'react';
import { FreelancerListItem } from './FreelancerListItem';

interface EmployerJobCardProps {
  job: Job;
}

export function EmployerJobCard({ job }: EmployerJobCardProps) {
  const [jobApplications, setJobApplications] = useState<JobApplication[]>([]);
  const formattedDate = new Date(job.createdAt).toDateString();

  useEffect(() => {
    const fetchJobApplications = async () => {
      const formData = new FormData();
      formData.append('jobId', job.id.toString());

      const response = await fetch('/api/job-applications', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      setJobApplications(data.jobApplications);
    };

    fetchJobApplications();
  }, [job.id]);

  return (
    <div className="bg-white border rounded-xl shadow-xl p-6">
      <div className="mb-6">
        <h3 className="text-2xl leading-tight mb-4">{job.title}</h3>
        <p className="text-sm text-gray-400 mb-4">Fixed price - Posted {formattedDate}</p>
        <div className="flex gap-10 mb-6">
          <div>
            <p className="text-xl leading-tight mb-1">${job.budget}</p>
            <p className="text-gray-400 text-sm">Fixed price</p>
          </div>
          <div>
            <p className="text-xl leading-tight mb-1">{job.experienceLevel}</p>
            <p className="text-gray-400 text-sm">Experience level</p>
          </div>
        </div>
      </div>

      <div className="border-t pt-4">
        <h4 className="text-lg font-semibold mb-4">Freelancers ({jobApplications.length})</h4>
        <div className="space-y-4">
          {jobApplications.map(application => (
            <FreelancerListItem key={application.id} jobApplication={application} />
          ))}
        </div>
      </div>
    </div>
  );
}
