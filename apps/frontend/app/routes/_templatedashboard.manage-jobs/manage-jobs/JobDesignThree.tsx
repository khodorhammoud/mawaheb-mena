import { useState } from 'react';
import { JobCardData } from '@mawaheb/db/types';
import JobStateButton from '~/common/job-state-button/JobStateButton';
import ProfilePhotosSection from '~/common/profile-photos-list/ProfilePhotosSection';
import { Link } from '@remix-run/react';
import { JobStatus } from '@mawaheb/db/enums';
import { cn, parseDate } from '~/lib/utils';
import { formatTimeAgo } from '~/utils/formatTimeAgo';
import { IoPencilSharp } from 'react-icons/io5';
import { EXPERIENCE_LEVEL_LABELS } from '~/common/labels';
import Calendar from '~/common/calender/Calender';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '~/components/ui/dialog';
import ReadMore from '~/common/ReadMore';
import SkillBadgeList from '~/common/skill/SkillBadge';

export default function JobDesignThree({
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
  const [open, setOpen] = useState(false);

  const applicantsPhotos = [
    'https://www.fivebranches.edu/wp-content/uploads/2021/08/default-image.jpg',
    'https://www.fivebranches.edu/wp-content/uploads/2021/08/default-image.jpg',
  ];

  const { job } = data;
  const formattedDate = parseDate(job.createdAt);

  const interviewDates = ['2024-11-5', '2024-11-17', '2024-11-28'];

  return (
    <div
      className={cn(
        'lg:grid xl:p-8 p-6 bg-white border rounded-xl shadow-xl gap-4 mb-10',
        className
      )}
    >
      {/* STATUS BUTTON AND CONDITIONAL EDIT BUTTON */}
      <div className="flex items-center space-x-2 mb-4">
        {/* Show Edit button only when the job status is "draft" */}
        {status === JobStatus.Draft && (
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
        )}

        {status && (
          <JobStateButton
            status={status}
            onStatusChange={onStatusChange}
            jobId={job.id}
            userAccountStatus={userAccountStatus}
            className="w-[106px] h-[36px]"
          />
        )}
      </div>
      {/* JOB INFORMATION */}
      <div>
        {/* Dialog wrap for the title */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <h3
              className="xl:text-2xl lg:text-xl text-base leading-tight mb-4 cursor-pointer hover:underline inline-block transition-transform duration-300"
              onClick={() => setOpen(true)}
            >
              {job.title}
            </h3>
          </DialogTrigger>
          <DialogContent className="max-w-6xl rounded-2xl shadow-lg p-6">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold">
                <h3 className="xl:text-2xl md:text-xl text-lg cursor-pointer hover:underline inline-block transition-transform duration-300">
                  <Link to={`/jobs/${job.id}`}>{job.title}</Link>
                </h3>
              </DialogTitle>
              <DialogDescription
                className="text-black sm:grid lg:grid-cols-[58%_44%] md:grid-cols-[50%_50%] sm:grid-cols-[55%_45%] flex flex-col xl:mr-20 lg:mr-10 md:mr-6 mr-2
               lg:gap-0 gap-2"
              >
                <DialogDescription className="text-black">
                  <p className="xl:text-sm text-xs text-gray-400 mb-5">
                    {job.createdAt ? formatTimeAgo(job.createdAt) : 'N/A'}
                  </p>
                  <div className="flex flex-col gap-2 text-sm">
                    {/* BUDGET - ENTRY LEVEL - APPLICANTS - HIRED */}
                    <div className="grid lg:grid-cols-[50%_50%]  xl:gap-10 lg:gap-8 gap-6 items-center">
                      <div className="flex gap-10">
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
                      </div>
                      <div className="flex gap-10">
                        <div className="flex">
                          <ProfilePhotosSection
                            label="Applicants"
                            images={applicantsPhotos}
                            profiles={data.applications}
                          />
                        </div>
                        <div className="flex">
                          <ProfilePhotosSection
                            label="Hired"
                            images={applicantsPhotos}
                            profiles={data.applications}
                          />
                        </div>
                      </div>
                    </div>

                    {/* DESCRIPTION */}
                    <div className="mt-2 mb-2">
                      <h1 className="text-lg font-normal mb-2">Description:</h1>
                      <ReadMore
                        className="lg:text-base text-sm"
                        html={job.description}
                        charPerChunk={300}
                      />
                    </div>

                    {/* SKILLS */}
                    <div className="xl:text-base text-sm">
                      {job.requiredSkills &&
                      Array.isArray(job.requiredSkills) &&
                      job.requiredSkills.length > 0 ? (
                        <SkillBadgeList skills={job.requiredSkills} />
                      ) : (
                        <p>No skills provided.</p>
                      )}
                    </div>
                  </div>
                </DialogDescription>

                {/* Working hours - Location - Project type - Expected hourly rate - job category */}
                <DialogDescription className="text-black ">
                  <div className="grid grid-cols-2 gap-6 mb-4">
                    <div>
                      <p className="text-gray-400 xl:text-sm text-xs mb-1">
                        Working Hours per week
                      </p>
                      <p className="text-base font-medium">{job.workingHoursPerWeek || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 xl:text-sm text-xs mb-1">Location Preferences</p>
                      <p className="text-base font-medium">{job.locationPreference || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 xl:text-sm text-xs mb-1">Project Type</p>
                      <p className="text-base font-medium">{job.projectType || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 xl:text-sm text-xs mb-1">Expected Hourly Rate</p>
                      <p className="text-base font-medium">${job.expectedHourlyRate || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 xl:text-sm text-xs mb-1">Job Category</p>
                      <p className="text-base font-medium">{job.jobCategoryName || 'N/A'}</p>
                    </div>
                  </div>
                  <Calendar highlightedDates={interviewDates} />
                </DialogDescription>
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>

        <p className="xl:text-sm text-xs text-gray-400 mb-4">
          Fixed price - {job.createdAt ? formatTimeAgo(job.createdAt) : 'N/A'}
        </p>
        <div className="flex xl:gap-10 lg:gap-8 gap-6 mb-6">
          <div>
            <p className="xl:text-xl lg:text-lg mt-4 text-base leading-tight mb-1">${job.budget}</p>
            <p className="text-gray-400 xl:text-sm text-xs">Fixed price</p>
          </div>
          <div>
            <p className="xl:text-xl lg:text-lg text-base mt-4">
              {EXPERIENCE_LEVEL_LABELS[job.experienceLevel] || job.experienceLevel}
            </p>
            <p className="text-gray-400 xl:text-sm text-xs">Experience level</p>
          </div>
        </div>
      </div>

      {/* APPLICANTS SECTION */}
      {/* Applicants ProfilePhotosSection */}
      <div className={`${status === JobStatus.Draft ? 'hidden' : 'flex lg:gap-8 gap-4'}`}>
        <ProfilePhotosSection
          label="Applicants"
          images={applicantsPhotos}
          profiles={data.applications}
        />

        <div className={`${status === JobStatus.Active ? 'hidden' : ''}`}>
          <ProfilePhotosSection
            label="Hired"
            images={applicantsPhotos}
            profiles={data.applications}
          />
        </div>
      </div>

      {/* STATUS BUTTON AND CONDITIONAL EDIT BUTTON */}
      <div className="flex items-center space-x-2 mt-5">
        {/* Show Edit button only when the job status is "draft" */}
        {status === JobStatus.Draft && (
          <Link
            to={`/edit-job/${job.id}`}
            className="w-[106px] h-[36px] bg-white text-primaryColor border border-gray-300 text-sm rounded-xl flex items-center justify-center not-active-gradient hover:text-white group"
          >
            <IoPencilSharp className="h-4 w-4 mr-2 text-primaryColor group-hover:text-white" />
            Edit
          </Link>
        )}

        {status && (
          <JobStateButton
            status={status}
            onStatusChange={onStatusChange}
            jobId={job.id}
            userAccountStatus={userAccountStatus}
            className="w-[106px] h-[36px]"
          />
        )}
      </div>
    </div>
  );
}
