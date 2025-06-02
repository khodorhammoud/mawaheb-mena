import { useFetcher } from '@remix-run/react';
import { useEffect, useState } from 'react';
import { Job as JobType } from '@mawaheb/db/types';
import { Button } from '~/components/ui/button';
import SkillBadgeList from '~/common/skill/SkillBadge';
import { formatTimeAgo } from '~/utils/formatTimeAgo';
import ReadMore from '~/common/ReadMore';

interface JobProps {
  job: JobType & { applicationStatus?: string }; // ✅ Add applicationStatus
  onSelect: (job: JobType) => void;
}

export default function JobCard({ job, onSelect }: JobProps) {
  const fetcher = useFetcher<{
    jobSkills: { id: number; name: string; isStarred: boolean }[];
  }>();
  const [skills, setSkills] = useState<{ id: number; name: string; isStarred: boolean }[]>([]);

  useEffect(() => {
    fetcher.load(`/browse-jobs?jobId=${job.id}`);
  }, [job.id]);

  useEffect(() => {
    if (fetcher.data) {
      setSkills(fetcher.data.jobSkills);
    }
  }, [fetcher.data]);

  return (
    <div className="lg:grid xl:p-6 p-4 bg-white border rounded-xl shadow-xl gap-4 mb-10">
      {/* JOB INFORMATION */}
      <div className="flex flex-col">
        <h1 className="text-2xl mb-3">{job.title}</h1>
        <p className="xl:text-sm text-xs text-gray-400 mb-4">
          Fixed price - {formatTimeAgo(job.createdAt)}
        </p>
        <div className="flex xl:gap-10 lg:gap-8 gap-6 mb-6">
          <div>
            <p className="xl:text-xl lg:text-lg mt-4 text-base leading-tight mb-1">${job.budget}</p>
            <p className="text-gray-400 xl:text-sm text-xs">Fixed price</p>
          </div>
          <div>
            <p className="xl:text-xl lg:text-lg mt-4 text-base leading-tight mb-1">
              {job.experienceLevel}
            </p>
            <p className="text-gray-400 xl:text-sm text-xs">Experience level</p>
          </div>
        </div>
        <div className="xl:text-lg lg:text-base text-sm mt-4">
          <div>Description:</div>
          <ReadMore
            className="lg:mt-6 mt-4 xl:text-lg lg:text-base text-sm"
            html={job.description}
            wordsPerChunk={40}
          />
        </div>

        {/* Dynamic Skills from Database */}
        <div className="lg:mt-8 mt-4 xl:text-base text-sm">
          {skills.length > 0 ? (
            <SkillBadgeList skills={skills} />
          ) : (
            <p className="text-gray-500">No skills listed for this job.</p>
          )}
        </div>
      </div>

      {/* ✅ Change Button Text if Job is Applied */}
      <Button
        className="border border-gray-300 text-primaryColor bg-white rounded-[10px] md:text-base text-sm xl:px-6 py-2 px-4 gradient-box not-active-gradient w-fit whitespace-nowrap hover:text-white hover:bg-primaryColor not-active-gradient mt-4 self-end"
        onClick={() => onSelect(job)}
      >
        {job.applicationStatus ? 'Read more' : 'Interested'}
      </Button>
    </div>
  );
}
