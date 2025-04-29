import { FC } from 'react';
import { useLoaderData } from '@remix-run/react';
import SkillBadgeList from '~/common/skill/SkillBadge';

// Define the Job type (adjust based on your CMS data structure)
type Job = {
  id: string;
  jobTitle: string;
  priceAmout: number;
  postedFrom: number;
  priceType: string;
  levelRequired: string;
  jobDesc: string;
  jobSkills: { id: string; name: string; isStarred: boolean }[];
};

const Jobs: FC = () => {
  // Use loader data to get jobs from CMS
  const { jobSection } = useLoaderData<{ jobSection: Job[] }>();

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-x-12 gap-y-6 p-6 mt-16">
        {jobSection.map(job => (
          <div
            key={job.id}
            className="bg-white border border-gray-200 rounded-xl shadow-xl p-6 flex flex-col"
          >
            <div className="mb-2">
              <h3 className="text-xl font-semibold">{job.jobTitle}</h3>
            </div>
            <div className="flex flex-row">
              <p className="text-sm text-gray-400">{job.priceType} -&nbsp;</p>
              <p className="text-sm text-gray-400 mb-4">Posted {job.postedFrom} hours ago</p>
            </div>
            <div className="flex flex-row gap-24 mt-2 mb-6">
              <div>
                <p className="text-md text-gray-800">${job.priceAmout}</p>
                <p className="text-sm text-gray-400">{job.priceType}</p>
              </div>
              <div>
                <p className="text-md text-black">Entry</p>
                <p className="text-sm text-gray-400">{job.levelRequired}</p>
              </div>
            </div>
            <div className="leading-tight mb-4">{job.jobDesc}</div>
            <div className="mb-4">
              {job.jobSkills.length > 0 ? (
                <SkillBadgeList
                  skills={job.jobSkills.map((skill, index) => ({
                    name: skill.name,
                    isStarred: index === 0 || skill.isStarred,
                  }))}
                />
              ) : (
                <span className="text-sm text-gray-400">No skills listed</span>
              )}
            </div>
            <button className="mt-auto bg-white hover:text-white text-primaryColor border-2 text-sm font-medium px-5 py-2 rounded-xl gradient-box not-active-gradient max-w-fit">
              See more
            </button>
          </div>
        ))}
      </div>
      <div className="text-center flex justify-center gap-3 items-center mt-5">
        <p className="text-lg font-semibold">Want to browse more jobs?</p>
        <button className="text-white bg-primaryColor gradient-box not-active-gradient max-w-fit rounded-xl px-5 py-2 text-sm">
          Sign Up
        </button>
      </div>
    </div>
  );
};

export default Jobs;
