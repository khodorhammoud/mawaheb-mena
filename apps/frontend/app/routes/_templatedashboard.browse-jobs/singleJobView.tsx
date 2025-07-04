import { useState, useEffect } from 'react';
import { Job } from '@mawaheb/db/types';
import JobCard from './jobCard';
import { Button } from '~/components/ui/button';
import { Skill } from '@mawaheb/db/types';
import SkillBadgeList from '~/common/skill/SkillBadge';
import { formatTimeAgo } from '~/utils/formatTimeAgo';
import { InformationCircleIcon } from '@heroicons/react/24/solid';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '~/components/ui/dialog';
import AppFormField from '~/common/form-fields';
import { FaStar } from 'react-icons/fa';
import ReadMore from '~/common/ReadMore';
import { useFetcher } from '@remix-run/react';

interface JobCardProps {
  job: Job & { applicationStatus?: string };
  jobSkills: Skill[];
  review?: { rating: number; comment: string; employerId: number } | null;
  canReview: boolean;
  appStats: { interested: number; interviewed: number; invites: number };
  suggestedJobs: Job[];
  onSelect: (job: Job) => void; // <<==== ADD THIS LINE!
  refetchJob: (job: Job) => void; // <<< add this!
  scrollSheetTop?: () => void;
}

export default function SingleJobView({
  job,
  jobSkills,
  review,
  canReview,
  appStats,
  suggestedJobs,
  onSelect, // <<==== ADD THIS LINE
  refetchJob,
  scrollSheetTop,
}: JobCardProps) {
  // Only fetcher for review
  const reviewFetcher = useFetcher<{ success?: boolean; message?: string }>();
  const interestFetcher = useFetcher<{ success?: boolean; error?: string }>();
  const fetcher = useFetcher<{
    jobs: Job[];
    success?: boolean;
    error?: { message: string };
  }>();

  const relatedJobs = Array.isArray(fetcher.data?.jobs)
    ? fetcher.data.jobs.map(job => ({
        ...job,
        createdAt: job.createdAt ? new Date(job.createdAt) : new Date(),
        fulfilledAt: job.fulfilledAt ? new Date(job.fulfilledAt) : null,
      }))
    : [];

  const requiredSkills = jobSkills.map(skill => ({
    name: skill.name,
    isStarred: skill.isStarred || false,
  }));

  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  // Ensure correct employer review is loaded
  const isCorrectReview = review && review.employerId === job.employerId;
  const hasReview = isCorrectReview && review.rating !== undefined && review.comment !== undefined;

  const handleOpenReview = () => {
    if (!canReview) {
      alert('You must have an application to review this employer.');
      return;
    }
    setOpen(true);
  };

  useEffect(() => {
    if (reviewFetcher.data?.success) {
      refetchJob(job); // <<< call the parent-provided function!
    }
  }, [reviewFetcher.data]);

  // Set review data when opening the modal
  useEffect(() => {
    if (isCorrectReview) {
      setRating(review.rating);
      setComment(review.comment);
    } else {
      setRating(0);
      setComment('');
    }
  }, [review, job.employerId]);

  // Close dialog when review is successfully submitted
  useEffect(() => {
    if (reviewFetcher.data?.success) {
      setOpen(false);
    }
  }, [reviewFetcher.data]);

  return (
    <div className="rounded-lg mx-auto text-black pr-10">
      <div className="pt-6 px-6">
        <h2 className="lg:text-3xl md:text-2xl text-xl mb-3">{job.title}</h2>
        <p className="text-sm mb-8 text-gray-400">
          Fixed price - {job.createdAt ? formatTimeAgo(job.createdAt) : 'recently'}
        </p>
      </div>

      <div className="grid grid-cols-[60%,40%] mb-8">
        <div className="px-6 py-4 border-r border-gray-200">
          <ReadMore className="mb-12 text-base" html={job.description} charPerChunk={300} />

          <div className="flex justify-between items-center mb-12">
            <div className="flex flex-col items-start gap-1">
              <span className="text-base">${job.budget}</span>
              <span className="text-sm text-gray-500">Fixed price</span>
            </div>
            <div className="flex flex-col items-start gap-1">
              <span className="text-base">{job.experienceLevel}</span>
              <span className="text-sm text-gray-500">Experience level</span>
            </div>
            <div className="flex flex-col items-start gap-1">
              <span className="text-base">{job.projectType}</span>
              <span className="text-sm text-gray-500">Project type</span>
            </div>
          </div>

          {/* Skills Section */}
          <div className="mb-12">
            <p className="text-base mb-2">Skills</p>
            <div className="mt-2 text-base">
              {requiredSkills.length > 0 ? (
                <SkillBadgeList skills={requiredSkills} />
              ) : (
                <p>No skills provided.</p>
              )}
            </div>
          </div>

          {/* Activity Section */}
          <div className="mb-6">
            <p className="text-base font-medium text-gray-900 mb-2">Activity on this job</p>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>Interested: {appStats.interested}</li>
              <li>Interviewed: {appStats.interviewed}</li>
              <li>Invites sent: {appStats.invites}</li>
            </ul>
          </div>
        </div>

        {/* Interested / Review Employer / Edit Review Button */}
        <div className="pl-6 pr-6 pt-4">
          {job.applicationStatus ? (
            canReview ? (
              <Button
                className="w-full mb-4 bg-primaryColor text-white py-2 rounded-xl font-semibold not-active-gradient"
                onClick={handleOpenReview}
              >
                {hasReview ? 'Edit Review' : 'Review Employer'}
              </Button>
            ) : (
              <Button
                className="w-full mb-4 bg-gray-400 text-white py-2 rounded-xl font-semibold not-active-gradient"
                disabled
              >
                Review Unavailable
              </Button>
            )
          ) : (
            <Button
              disabled={
                interestFetcher.data?.success === true || interestFetcher.state === 'submitting'
              }
              onClick={() => {
                if (!interestFetcher.data?.success) {
                  interestFetcher.submit(null, {
                    method: 'post',
                    action: `/api/jobs/${job.id}/interested`,
                  });
                }
              }}
              className={`w-full mb-4 not-active-gradient ${
                interestFetcher.data?.success
                  ? 'bg-slate-600 cursor-not-allowed'
                  : 'bg-primaryColor'
              } text-white py-2 rounded-xl font-semibold`}
            >
              {interestFetcher.data?.success
                ? 'Applied'
                : interestFetcher.data?.error
                  ? `Error: the job is fullfilled`
                  : 'Interested'}
            </Button>
          )}
          <div className="flex items-start text-gray-500 text-sm">
            <InformationCircleIcon className="w-8 h-8 text-gray-600 mr-2" />
            <p className="mt-1">
              Clicking &quot;Interested&quot; notifies the job poster, who can then interview you.
            </p>
          </div>
        </div>
      </div>

      {/* Review Employer Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="p-6 bg-white rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              {hasReview ? 'Edit your review' : 'Leave a review'}
            </DialogTitle>
          </DialogHeader>

          <reviewFetcher.Form method="post" action="/browse-jobs">
            <input type="hidden" name="_action" value="review" />
            <input type="hidden" name="jobId" value={job.id || ''} />
            <input type="hidden" name="employerId" value={job.employerId || ''} />
            <input type="hidden" name="rating" value={rating || 0} />

            <div className="flex bg-gray-100 rounded-xl gap-3 mt-4 mb-2 py-4 px-4">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className={`text-3xl ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
                  type="button"
                >
                  <FaStar className="w-6 h-6" />
                </button>
              ))}
            </div>

            <AppFormField
              id="reviewComment"
              name="comment"
              type="textarea"
              label="Comments"
              placeholder="Write your feedback..."
              defaultValue={comment || ''}
              col={6}
              onChange={e => setComment(e.target.value || '')}
            />

            <div className="flex justify-end">
              <Button
                type="submit"
                className="mt-2 w-fit bg-primaryColor text-white rounded-xl px-10"
                disabled={rating === 0 || reviewFetcher.state === 'submitting'}
              >
                {reviewFetcher.state === 'submitting'
                  ? 'Submitting...'
                  : hasReview
                    ? 'Update Review'
                    : 'Submit'}
              </Button>
            </div>
          </reviewFetcher.Form>
        </DialogContent>
      </Dialog>

      {/* --- SUGGESTED JOBS SECTION --- */}
      {suggestedJobs.length > 0 && (
        <div className="grid grid-cols-[60%,40%] mb-10">
          <div className="pl-6 py-10 pr-2">
            <p className="text-lg mb-6">Suggested Jobs for You ({suggestedJobs.length})</p>
            {suggestedJobs.map(relatedJob => (
              <JobCard
                key={relatedJob.id}
                job={relatedJob}
                onSelect={onSelect}
                isSuggested={true}
                scrollSheetTop={scrollSheetTop} // Pass it down!
              />
            ))}
          </div>
          <div className=""></div>
        </div>
      )}
    </div>
  );
}
