import { useState } from 'react';
import { JobCardData } from '@mawaheb/db/types';
import JobStateButton from '~/common/job-state-button/JobStateButton';
import ProfilePhotosSection from '~/common/profile-photos-list/ProfilePhotosSection';
import { Link } from '@remix-run/react';
import { JobStatus } from '@mawaheb/db/enums';
import { parseDate } from '~/lib/utils';
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
}: {
  data: JobCardData;
  status?: JobStatus;
  onStatusChange?: (newStatus: JobStatus) => void;
  userAccountStatus?: string;
}) {
  const [open, setOpen] = useState(false);

  const { job } = data;
  const formattedDate = parseDate(job.createdAt);

  const interviewDates = ['2024-11-5', '2024-11-17', '2024-11-28'];

  const applicantProfiles = data.applications;

  const hiredProfiles = data.applications.filter(app => app.status === 'approved'); // adjust field name as needed

  return (
    <div className="lg:grid xl:p-6 p-4 bg-white border rounded-xl shadow-xl gap-4 mb-10">
      {/* JOB INFORMATION */}
      <div>
        {/* Dialog wrap for the title */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <h3
              className="xl:text-xl lg:text-lg md:text-base text-sm leading-tight mb-1 cursor-pointer hover:underline inline-block transition-transform duration-300"
              onClick={() => setOpen(true)}
            >
              {job.title}
            </h3>
          </DialogTrigger>
          <DialogContent className="max-w-4xl rounded-2xl shadow-lg p-6">
            <DialogHeader>
              <DialogTitle className="-mb-2">
                <h3 className="xl:text-xl lg:text-lg md:text-base text-sm leading-tight mb-1 cursor-pointer hover:underline inline-block transition-transform duration-300">
                  <Link to={`/jobs/${job.id}`}>{job.title}</Link>
                </h3>
              </DialogTitle>
              <p className="text-xs text-gray-400 mb-4">
                {job.createdAt ? formatTimeAgo(job.createdAt) : 'N/A'}
              </p>
              <DialogDescription className="text-black grid grid-cols-[60%_40%] gap-20 mr-20 items-center">
                <DialogDescription className="text-black">
                  <div className="flex flex-col gap-2 text-sm">
                    <div className="flex lg:gap-8 gap-6 items-center justify-between md:mt-0 mt-10">
                      <div className="flex lg:gap-8 gap-6 items-center justify-between">
                        <div>
                          <p className="lg:text-lg md:text-sm text-xs leading-tight">
                            ${job.budget}
                          </p>
                          <p className="text-gray-400 text-xs">Fixed price</p>
                        </div>
                        <div>
                          <p className="lg:text-lg md:text-sm text-xs leading-tight">
                            {EXPERIENCE_LEVEL_LABELS[job.experienceLevel] || job.experienceLevel}
                          </p>
                          <p className="text-gray-400 text-xs">Experience level</p>
                        </div>
                      </div>
                      <div className="flex gap-10">
                        <div className="flex self-end">
                          <ProfilePhotosSection label="Applicants" profiles={applicantProfiles} />
                        </div>
                        <div className="flex self-end">
                          <ProfilePhotosSection label="Hired" profiles={hiredProfiles} />
                        </div>
                      </div>
                    </div>
                    <div className="text-base lg:text-sm mt-2">
                      <ReadMore
                        className="mt-4 xl:text-lg lg:text-base text-sm"
                        html={job.description}
                        wordsPerChunk={40}
                      />
                    </div>
                    <div className="mt-8 xl:text-base text-sm">
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
                <DialogDescription className="text-black">
                  <Calendar highlightedDates={interviewDates} />
                </DialogDescription>
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
        <p className="text-xs text-gray-400 mb-4">
          Fixed price - {job.createdAt ? formatTimeAgo(job.createdAt) : 'N/A'}
        </p>
        <div className="flex xl:gap-8 lg:gap-6 gap-4 mb-6">
          <div>
            <p className="mt-4 lg:text-lg md:text-sm text-xs leading-tight">${job.budget}</p>
            <p className="text-gray-400 text-xs">Fixed price</p>
          </div>
          <div>
            <p className="mt-4 lg:text-lg md:text-sm text-xs leading-tight">
              {EXPERIENCE_LEVEL_LABELS[job.experienceLevel] || job.experienceLevel}
            </p>
            <p className="text-gray-400 text-xs">Experience level</p>
          </div>
        </div>
      </div>

      {/* APPLICANTS SECTION */}
      {/* Applicants ProfilePhotosSection */}
      <div className="xl:flex gap-4 xl:justify-between">
        <div
          className={`${status === JobStatus.Draft ? 'hidden' : 'flex items-center xl:gap-6 gap-4 xl:justify-between'}`}
        >
          <div className="">
            <ProfilePhotosSection label="Applicants" profiles={applicantProfiles} />
          </div>

          <div className={`${status === JobStatus.Active ? 'hidden' : ''}`}>
            <ProfilePhotosSection label="Hired" profiles={hiredProfiles} />
          </div>
        </div>

        {/* STATUS BUTTON AND CONDITIONAL EDIT BUTTON */}
        <div
          className={`flex items-center space-x-2 ${status === JobStatus.Draft ? '' : 'xl:mt-5 mt-7'}`}
        >
          {/* Show Edit button only when the job status is "draft" */}
          {status === JobStatus.Draft && (
            <Link
              to={`/edit-job/${job.id}`}
              className="px-2 h-7 bg-white text-primaryColor text-xs border border-gray-300 rounded-xl flex items-center justify-center not-active-gradient hover:text-white group"
            >
              <IoPencilSharp className="h-3 w-3 text-xs mr-2 text-primaryColor group-hover:text-white" />
              Edit
            </Link>
          )}

          {status && (
            <JobStateButton
              status={status}
              onStatusChange={onStatusChange}
              jobId={job.id}
              userAccountStatus={userAccountStatus}
              className="h-7"
            />
          )}
        </div>
      </div>
    </div>
  );
}
