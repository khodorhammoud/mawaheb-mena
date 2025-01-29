import { useFetcher } from "@remix-run/react";
import { useEffect, useState } from "react";
import { Job as JobType } from "~/types/Job";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";

interface JobProps {
  job: JobType;
  onSelect: (job: JobType) => void;
}

export default function JobCard({ job, onSelect }: JobProps) {
  const fetcher = useFetcher<{
    jobSkills: { id: number; name: string; isStarred: boolean }[];
  }>();
  const [skills, setSkills] = useState<
    { id: number; name: string; isStarred: boolean }[]
  >([]);

  useEffect(() => {
    // console.log(`🔎 Fetching skills for job ID: ${job.id}`);
    fetcher.load(`/browse-jobs?jobId=${job.id}`); // THIS FIXES IT
  }, [job.id]);

  useEffect(() => {
    if (fetcher.data) {
      // console.log(
      //   `✅ Loaded skills for job ${job.id}:`,
      //   fetcher.data.jobSkills
      // );
      setSkills(fetcher.data.jobSkills);
    }
  }, [fetcher.data]);

  return (
    <div className="lg:grid xl:p-6 p-4 bg-white border rounded-xl shadow-xl gap-4 mb-10">
      {/* JOB INFORMATION */}
      <div>
        <h1 className="text-2xl mb-3">{job.title}</h1>
        <p className="xl:text-sm text-xs text-gray-400 mb-4">
          Fixed price - Posted {new Date(job.createdAt).toDateString()}
        </p>
        <div className="flex xl:gap-10 lg:gap-8 gap-6 mb-6">
          <div>
            <p className="xl:text-xl lg:text-lg mt-4 text-base leading-tight mb-1">
              ${job.budget}
            </p>
            <p className="text-gray-400 xl:text-sm text-xs">Fixed price</p>
          </div>
          <div>
            <p className="xl:text-xl lg:text-lg mt-4 text-base leading-tight mb-1">
              {job.experienceLevel}
            </p>
            <p className="text-gray-400 xl:text-sm text-xs">Experience level</p>
          </div>
        </div>
        <div className="mt-4">{job.description}</div>

        {/* Dynamic Skills from Database */}
        <div className="flex flex-wrap gap-2 mt-3">
          {skills.length > 0 ? (
            skills.map((skill) => (
              <Badge
                key={skill.id}
                className={`cursor-pointer px-4 py-2 rounded-full border bg-white hover:bg-blue-100 ${
                  skill.isStarred
                    ? "bg-blue-100 text-blue-600 border-blue-600"
                    : "text-gray-600 border-gray-300"
                }`}
              >
                {skill.name}
              </Badge>
            ))
          ) : (
            <p className="text-gray-500">No skills listed for this job.</p>
          )}
        </div>
      </div>

      <Button
        className="border border-gray-300 text-primaryColor bg-white rounded-[10px] md:text-base text-sm xl:px-6 py-2 px-4 gradient-box not-active-gradient w-fit whitespace-nowrap hover:text-white mt-4"
        onClick={() => onSelect(job)}
      >
        Interested
      </Button>
    </div>
  );
}
