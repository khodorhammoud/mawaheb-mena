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

  return (
    <div className="lg:grid xl:p-8 p-6 bg-white border rounded-xl shadow-xl gap-4 mb-10">
      {/* STATUS BUTTON AND CONDITIONAL EDIT BUTTON */}
      <div className="flex items-center space-x-2 mb-4">
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
              <DialogDescription className="text-black grid grid-cols-[60%_40%] gap-20 mr-20 items-center">
                <DialogDescription className="text-black">
                  <p className="xl:text-sm text-xs text-gray-400 mb-5">
                    {job.createdAt ? formatTimeAgo(job.createdAt) : 'N/A'}
                  </p>
                  <div className="flex flex-col gap-2 text-sm">
                    <div className="flex xl:gap-10 lg:gap-8 gap-6 items-center justify-between">
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
                        <div className="flex self-end">
                          <ProfilePhotosSection
                            label={`Applicants (${numberOfApplications})`}
                            profiles={Applications}
                          />
                        </div>
                        <div className="flex self-end">
                          <ProfilePhotosSection
                            label={`Hired (${numberOfHired})`}
                            profiles={hiredApplications}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="xl:text-lg lg:text-base text-sm mt-2">
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
          label={`Applicants (${numberOfApplications})`}
          profiles={Applications}
        />

        <div className={`${status === JobStatus.Active ? 'hidden' : ''}`}>
          <ProfilePhotosSection label={`Hired (${numberOfHired})`} profiles={hiredApplications} />
        </div>
      </div>
    </div>
  );
}
