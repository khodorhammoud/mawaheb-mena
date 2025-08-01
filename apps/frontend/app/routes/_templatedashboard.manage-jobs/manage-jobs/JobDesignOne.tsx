import { Link } from '@remix-run/react';
import { cn, parseDate } from '~/lib/utils';
import { JobCardData } from '@mawaheb/db/types';
import Calendar from '~/common/calender/Calender';
import SkillBadgeList from '~/common/skill/SkillBadge';
import JobStateButton from '../../../common/job-state-button/JobStateButton';
import ProfilePhotosSection from '~/common/profile-photos-list/ProfilePhotosSection';
import { JobStatus, AccountStatus } from '@mawaheb/db/enums';
import { formatTimeAgo } from '~/utils/formatTimeAgo';
import { IoPencilSharp } from 'react-icons/io5';
import { EXPERIENCE_LEVEL_LABELS } from '~/common/labels';
import ReadMore from '~/common/ReadMore';

export default function JobDesignOne({
  data,
  status,
  onStatusChange,
  userAccountStatus,
  className,
}: {
  data: JobCardData;
  status?: JobStatus;
  onStatusChange?: (newStatus: JobStatus) => void;
  userAccountStatus?: string;
  className?: string;
}) {
  const { job } = data;

  // console.log('JobDesignOne: User account status:', userAccountStatus);

  const formattedDate = parseDate(job.createdAt);

  // applications and there nb
  const Applications = data.applications || [];
  const numberOfApplications = data.applications?.length || 0;

  // Hired applicants and there nb
  const hiredApplications = data.applications?.filter(app => app.status === 'approved') || [];
  const numberOfHired = hiredApplications.length;

  // shortlisted applicants and there nb
  const shortlistedApplications =
    data.applications?.filter(app => app.status === 'shortlisted') || [];
  const numberOfShortlisted = shortlistedApplications.length;

  const interviewDates = ['2024-11-5', '2024-11-17', '2024-11-28'];

  // Check if the account is deactivated
  const isDeactivated = userAccountStatus === AccountStatus.Deactivated;

  return !data ? (
    <p>Job details are not available.</p>
  ) : (
    <div
      className={cn(
        `grid bg-white border rounded-xl shadow-xl mb-10 ${
          status === JobStatus.Draft
            ? 'xl:grid-cols-[6fr_8fr_3fr_2fr] gap-6 p-10'
            : `${
                status === JobStatus.Paused ||
                status === JobStatus.Active ||
                status === JobStatus.Running
                  ? 'grid-cols-[3fr_1fr_2fr_1fr]'
                  : 'md:grid-cols-[3fr_1fr_1fr]'
              } lg:p-8 p-4 gap-3`
        }`,
        className
      )}
    >
      {/* Draft Jobs Section Only */}
      {status === JobStatus.Draft && (
        <>
          <div className="">
            {/* Column 1: Title, budget, experience */}
            <h3 className="xl:text-2xl md:text-xl text-lg lg:mb-8 mb-2 cursor-pointer hover:underline inline-block transition-transform duration-300">
              <Link to={`/jobs/${job.id}`}>{job.title}</Link>
            </h3>
            <div className="grid grid-cols-2 xl:gap-6 gap-4">
              <div>
                <p className="xl:text-xl lg:text-lg text-base">${job.budget}</p>
                <p className="text-gray-400 xl:text-sm text-xs">Fixed price</p>
              </div>
              <div>
                <p className="xl:text-xl lg:text-lg text-base">
                  {EXPERIENCE_LEVEL_LABELS[job.experienceLevel] || job.experienceLevel}
                </p>

                <p className="text-gray-400 xl:text-sm text-xs">Experience level</p>
              </div>
              <div>
                <p className="text-gray-400 xl:text-sm text-xs mb-1 text-left">
                  Working Hours per week
                </p>
                <p className="text-base font-medium text-left">
                  {job.workingHoursPerWeek || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-gray-400 xl:text-sm text-xs mb-1 text-left">
                  Location Preferences
                </p>
                <p className="text-base font-medium text-left">{job.locationPreference || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-400 xl:text-sm text-xs mb-1 text-left">Project Type</p>
                <p className="text-base font-medium text-left">{job.projectType || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-400 xl:text-sm text-xs mb-1 text-left">
                  Expected Hourly Rate
                </p>
                <p className="text-base font-medium text-left">
                  ${job.expectedHourlyRate || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-gray-400 xl:text-sm text-xs mb-1 text-left">Job Category</p>
                <p className="text-base font-medium text-left">{job.jobCategoryName || 'N/A'}</p>
              </div>
            </div>
          </div>

          <div className="xl:text-lg lg:text-base text-sm">
            <div className="">Description:</div>
            <ReadMore
              className="lg:mt-6 mt-4 xl:text-lg lg:text-base text-sm"
              html={job.description}
              charPerChunk={300}
            />
          </div>

          <div className="xl:text-base text-sm">
            {job.requiredSkills &&
            Array.isArray(job.requiredSkills) &&
            job.requiredSkills.length > 0 ? (
              <SkillBadgeList skills={job.requiredSkills} />
            ) : (
              <p>No skills provided.</p>
            )}
          </div>

          {/* Edit Button and JobStateButton */}
          <div className="flex flex-col gap-4 space-x-2 items-end">
            <Link
              to={`/edit-job/${job.id}`}
              className="w-[106px] h-[36px] bg-white text-primaryColor border border-gray-300 text-sm rounded-xl flex items-center justify-center not-active-gradient hover:text-white group focus:outline-none
    focus-visible:ring-0
    focus-visible:outline-none
    focus:ring-0
    focus:border-none
    focus-visible:border-none
    focus-visible:ring-offset-0"
            >
              <IoPencilSharp className="h-4 w-4 mr-2 text-primaryColor group-hover:text-white" />
              Edit
            </Link>
            <JobStateButton
              status={status}
              onStatusChange={onStatusChange}
              jobId={job.id}
              className="w-[106px] h-[36px]"
              userAccountStatus={userAccountStatus}
            />
          </div>
        </>
      )}

      {/* All sections but without the Draft section */}
      {/* Left Section */}
      <div className={`mr-2 ${status === JobStatus.Draft ? 'hidden' : ''}`}>
        <h3 className="xl:text-2xl md:text-xl text-lg mb-2 cursor-pointer hover:underline inline-block transition-transform duration-300">
          <Link to={`/jobs/${job.id}`}>{job.title}</Link>
        </h3>

        <p className="xl:text-sm text-xs text-gray-400 lg:mb-8 mb-2">
          Fixed price - {job.createdAt ? formatTimeAgo(job.createdAt) : 'N/A'}
        </p>
        <div className="flex xl:gap-10 lg:gap-8 gap-6">
          <div>
            <p className="xl:text-xl lg:text-lg text-base mt-4">${job.budget}</p>
            <p className="text-gray-400 xl:text-sm text-xs">Fixed price</p>
          </div>
          <div>
            <p className="xl:text-xl lg:text-lg text-base mt-4">
              {EXPERIENCE_LEVEL_LABELS[job.experienceLevel] || job.experienceLevel}
            </p>

            <p className="text-gray-400 xl:text-sm text-xs">Experience level</p>
          </div>
        </div>
        {/* in that way, i remove the HTML tags */}
        <ReadMore
          className="lg:mt-10 mt-6 xl:text-lg lg:text-base text-sm"
          html={job.description}
          charPerChunk={300}
        />

        {/* SKILLS */}
        <div className="lg:mt-8 mt-4 xl:text-base text-sm">
          {job.requiredSkills &&
          Array.isArray(job.requiredSkills) &&
          job.requiredSkills.length > 0 ? (
            <SkillBadgeList skills={job.requiredSkills} />
          ) : (
            <p>No skills provided.</p>
          )}
        </div>
      </div>

      {/* Middle Section */}
      <div
        className={`flex flex-col gap-8 text-left ${status === JobStatus.Draft ? 'hidden' : ''}`}
      >
        {/* Applicants Section */}
        <ProfilePhotosSection
          label={`Applicants (${numberOfApplications})`}
          profiles={Applications}
        />

        {/* Interviewed Section */}
        <ProfilePhotosSection
          label={`Interviewed (${numberOfShortlisted})`}
          profiles={shortlistedApplications}
        />

        {/* Hired Section */}
        <ProfilePhotosSection label={`Hired (${numberOfHired})`} profiles={hiredApplications} />
      </div>

      {/* Right Section */}
      <div
        className={`${
          status === JobStatus.Draft ||
          status === JobStatus.Closed ||
          status === JobStatus.Deleted ||
          status === JobStatus.Completed
            ? 'hidden'
            : 'lg:-mr-10'
        }`}
      >
        <p className="font-semibold mb-4 xl:text-base text-sm">Pending Interviews: 3</p>
        <Calendar highlightedDates={interviewDates} />
      </div>

      {/* Action Section */}
      <div
        className={`flex flex-col gap-4 space-x-2 items-end ${status === JobStatus.Draft ? 'hidden' : ''}`}
      >
        {/* JobStateButton - Force Same Width & Height */}
        {status && (
          <JobStateButton
            status={status}
            onStatusChange={onStatusChange}
            jobId={job.id}
            className="w-[106px] h-[36px]" // 👈 Now it matches the Edit button
            userAccountStatus={userAccountStatus}
          />
        )}
      </div>
    </div>
  );
}
