import { Job /* , JobApplication */ } from '@mawaheb/db/src/types/Job';
import { EmployerJobCard } from './EmployerJobCard';
// import { useEffect, useState } from "react";

interface EmployerJobsListProps {
  jobs: Job[];
}

export function EmployerJobsList({ jobs }: EmployerJobsListProps) {
  // const [jobApplications, setJobApplications] = useState<JobApplication[]>([]);

  // fetch job applications for the current job with useEffect
  /*  useEffect(() => {
    const fetchJobApplications = async () => {
      // const query = jobs.map((job) => `jobIds=${job.id}`).join("&");
      // const response = await fetch(`/api/job-applications?${query}`);
      // const data = await response.json();
      // console.log("jobApplications fetched", data);
      // setJobApplications(data.jobApplications);
      // now make it as post
      const formData = new FormData();
      formData.append("jobIds", JSON.stringify(jobs.map((job) => job.id)));
      console.log("formData", formData);
      const response = await fetch("/api/job-applications", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      console.log("jobApplications fetched", data);
      setJobApplications(data.jobApplications);
    };
    fetchJobApplications();
  }, [jobs]); */

  return (
    <div className="space-y-6">
      {jobs.map(job => (
        <EmployerJobCard key={job.id} job={job} />
      ))}
    </div>
  );
}
