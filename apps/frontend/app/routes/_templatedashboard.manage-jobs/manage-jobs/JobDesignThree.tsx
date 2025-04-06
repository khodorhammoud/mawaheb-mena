import { JobCardData } from '@mawaheb/db/src/types/Job';
import JobStateButton from '~/common/job-state-button/JobStateButton';
import ProfilePhotosSection from '~/common/profile-photos-list/ProfilePhotosSection';
import { Link } from '@remix-run/react';
import { JobStatus } from '@mawaheb/db/src/types/enums';
import { parseDate } from '~/lib/utils';
import { formatTimeAgo } from '~/utils/formatTimeAgo';
import { IoPencilSharp } from 'react-icons/io5';

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
  // console.log('JobDesignThree: User account status:', userAccountStatus);

  const applicantsPhotos = [
    'https://www.fivebranches.edu/wp-content/uploads/2021/08/default-image.jpg',
    'https://www.fivebranches.edu/wp-content/uploads/2021/08/default-image.jpg',
  ];

  const { job } = data;

  const formattedDate = parseDate(job.createdAt);

  return (
    <div className="lg:grid xl:p-8 p-6 bg-white border rounded-xl shadow-xl gap-4 mb-10">
      {/* STATUS BUTTON AND CONDITIONAL EDIT BUTTON */}
      {/* STATUS BUTTON AND CONDITIONAL EDIT BUTTON */}
      <div className="flex items-center space-x-2">
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
        <h3 className="xl:text-2xl lg:text-xl text-base leading-tight mb-4  cursor-pointer hover:underline inline-block transition-transform duration-300">
          <Link to={`/jobs/${job.id}`}>{job.title}</Link>
        </h3>
        <p className="xl:text-sm text-xs text-gray-400 mb-4">
          Fixed price - {job.createdAt ? formatTimeAgo(job.createdAt) : 'N/A'}
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
    </div>
  );
}
