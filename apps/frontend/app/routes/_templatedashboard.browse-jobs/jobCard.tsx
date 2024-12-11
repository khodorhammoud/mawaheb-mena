import { Job as JobType } from "~/types/Job";
import { Button } from "~/components/ui/button";
import SkillBadge from "~/common/skill/SkillBadge";

interface JobProps {
  job: JobType;
  onSelect: (job: JobType) => void;
}

export default function Job(props: JobProps) {
  const { job, onSelect } = props;
  const formattedDate =
    typeof job.createdAt === "string" ? new Date(job.createdAt) : job.createdAt;

  return (
    <div className="lg:grid xl:p-8 p-6 bg-white border rounded-xl shadow-xl gap-4 mb-10 w-auto">
      {/* JOB INFORMATION */}
      <div>
        <h3 className="xl:text-2xl lg:text-xl text-base leading-tight mb-4">
          {job.title}
        </h3>
        <p className="xl:text-sm text-xs text-gray-400 mb-4">
          Fixed price - Posted {formattedDate.toDateString()}
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
      </div>
      <div className="">{job.description}</div>
      <div className="mt-4">
        {job.requiredSkills &&
        Array.isArray(job.requiredSkills) &&
        job.requiredSkills.length > 0 ? (
          job.requiredSkills.map((skill, index) => (
            <SkillBadge
              key={index}
              name={skill.name}
              isStarred={skill.isStarred}
            />
          ))
        ) : (
          <p>No skills provided.</p>
        )}
      </div>
      <Button
        onClick={() => onSelect(job)}
        className="text-primaryColor mt-4 rounded-xl xl:px-4 md:px-2 md:py-2 hover:bg-primaryColor-dark transition duration-300 not-active-gradient text-sm xl:text-base w-fit border border-gray-200 hover:text-white"
      >
        Intrested
      </Button>

      {/* <Button onClick={() => onSelect(job)}>View Details</Button> */}
    </div>
  );
}
