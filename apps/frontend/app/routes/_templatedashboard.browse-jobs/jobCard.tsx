import { useFetcher } from '@remix-run/react';
import { useEffect, useState } from 'react';
import { Job as JobType } from '@mawaheb/db/types';
import { Button } from '~/components/ui/button';
import SkillBadgeList from '~/common/skill/SkillBadge';
import { formatTimeAgo } from '~/utils/formatTimeAgo';
import ReadMore from '~/common/ReadMore';

interface JobProps {
  job: JobType & { applicationStatus?: string };
  onSelect: (job: JobType) => void;
  isSuggested?: boolean;
  scrollSheetTop?: () => void;
}

export default function JobCard({ job, onSelect, isSuggested = false, scrollSheetTop }: JobProps) {
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

  //  to go to the top when clicking on the interested of a JobCard fetched as suggestions
  function handleClick() {
    if (isSuggested && scrollSheetTop) {
      scrollSheetTop();
    }
    onSelect(job);
  }

  return (
    <div className="lg:grid xl:p-6 p-4 bg-white border rounded-xl shadow-xl gap-4 mb-10">
      {/* JOB INFORMATION */}
      <div className="flex flex-col">
        <h1 className="text-2xl mb-3">{job.title}</h1>
        <p className="xl:text-sm text-xs text-gray-400 mb-4">
          Fixed price - {formatTimeAgo(job.createdAt)}
        </p>
        <div className="grid xl:grid-cols-3 grid-cols-2 gap-y-6 gap-x-4 items-center my-6">
          <div className="flex flex-col items-start gap-1">
            <p className="text-base">${job.budget}</p>
            <p className="text-sm text-gray-500">Fixed price</p>
          </div>
          <div className="flex flex-col items-start gap-1">
            <p className="text-base">{job.experienceLevel}</p>
            <p className="text-sm text-gray-500">Experience level</p>
          </div>
          <div className="flex flex-col items-start gap-1">
            <span className="text-base">{job.projectType}</span>
            <span className="text-sm text-gray-500">Project type</span>
          </div>
          <div>
            <p className="text-base">{job.jobCategoryName || 'N/A'}</p>
            <p className="text-sm text-gray-500">Job Category</p>
          </div>
          <div>
            <p className="text-base font-medium text-left">{job.workingHoursPerWeek || 'N/A'}</p>
            <p className="text-sm text-gray-500">Working Hours per week</p>
          </div>
          <div>
            <p className="text-base">${job.expectedHourlyRate || 'N/A'}</p>
            <p className="text-sm text-gray-500">Expected Hourly Rate</p>
          </div>
          <div>
            <p className="text-base font-medium text-left">{job.locationPreference || 'N/A'}</p>
            <p className="text-sm text-gray-500">Location Preferences</p>
          </div>
        </div>

        <div className="xl:text-lg lg:text-base text-sm mt-4">
          <div>Description:</div>
          <ReadMore
            className="lg:mt-6 mt-4 xl:text-lg lg:text-base text-sm"
            html={job.description}
            charPerChunk={300}
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

      <Button
        className="border border-gray-300 text-primaryColor bg-white rounded-[10px] md:text-base text-sm xl:px-6 py-2 px-4 gradient-box not-active-gradient w-fit whitespace-nowrap hover:text-white hover:bg-primaryColor not-active-gradient mt-4 self-end"
        onClick={handleClick}
      >
        {job.applicationStatus ? 'Read more' : 'Interested'}
      </Button>
    </div>
  );
}
