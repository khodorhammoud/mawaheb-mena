import { useFetcher } from '@remix-run/react';
import Heading from '~/common/profileView/heading/Heading';
import GeneralizableFormCard from '~/common/profileView/onboarding-form-component';
import { AiFillStar } from 'react-icons/ai';
import { FaDollarSign, FaStar } from 'react-icons/fa';
import { SlBadge } from 'react-icons/sl';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '~/components/ui/dialog';
import AppFormField from '~/common/form-fields';
import { Button } from '~/components/ui/button';

interface UserProfileProps {
  canEdit: boolean;
  profile?: any;
}

export default function UserProfile({ canEdit, profile = {} }: UserProfileProps) {
  const fetcher = useFetcher();
  const reviewFetcher = useFetcher<{
    overallRating?: number;
    reviews?: { id: number; rating: number; comment: string }[];
  }>();

  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  // Check if there's an existing review
  const hasReview = profile.review && profile.review.rating !== undefined;

  useEffect(() => {
    if (hasReview && profile.review) {
      setRating(profile.review.rating);
      setComment(profile.review.comment || '');
    } else {
      setRating(0);
      setComment('');
    }
  }, [profile.review, hasReview]);

  // ✅ Fetch overall review rating & all reviews when profile updates
  useEffect(() => {
    if (profile.id) {
      reviewFetcher.load(`/api/freelancers/${profile.id}/reviews`);
    }
  }, [profile.id]);

  // ✅ Overall Rating Data
  const overallRating = Number(reviewFetcher.data?.overallRating) || 0;

  const allReviews = reviewFetcher.data?.reviews || [];

  const handleStarClick = () => {
    if (!canEdit) {
      setOpen(true);
    }
  };

  const sections = [
    [
      {
        formType: 'range',
        cardTitle: 'Hourly Rate',
        popupTitle: 'Hourly Rate',
        triggerLabel: 'Add Hourly Rate',
        formName: 'freelancer-hourly-rate',
        fieldName: 'hourlyRate',
        triggerIcon: <FaDollarSign />,
        value: profile.hourlyRate || 0,
        minVal: 10,
        maxVal: 100,
        width: 'w-full md:w-[48%]',
      },
      {
        formType: 'increment',
        cardTitle: 'Experience',
        popupTitle: 'Years of experience',
        triggerLabel: 'Add Years of Experience',
        formName: 'freelancer-years-of-experience',
        fieldName: 'yearsOfExperience',
        triggerIcon: <SlBadge />,
        value: profile.yearsOfExperience || 0,
        width: 'w-full md:w-[48%]',
      },
    ],
    [
      {
        formType: 'video',
        cardTitle: 'Introductory Video',
        popupTitle: 'Introductory Video',
        triggerLabel: 'Add Video',
        formName: 'freelancer-video',
        fieldName: 'videoLink',
        value: (() => {
          // If we have video type information, create the new object format
          if (profile.videoType || profile.videoAttachmentId) {
            const videoData: any = {
              videoType: profile.videoType || 'link',
              videoLink: profile.videoLink || '',
              videoAttachmentId: profile.videoAttachmentId || null,
            };

            // Add fileName if it's an attachment and we have it in profile data
            if (profile.videoType === 'attachment' && profile.videoFileName) {
              videoData.fileName = profile.videoFileName;
            }

            return videoData;
          }
          // Legacy format - just return the video link string if it exists
          return profile.videoLink || '';
        })(),
        width: 'w-full md:w-[48%]',
      },
      {
        formType: 'textArea',
        cardTitle: 'About',
        popupTitle: 'Introduce Yourself',
        triggerLabel: 'Add Bio',
        formName: 'freelancer-about',
        fieldName: 'about',
        value: profile.about || '',
        useRichText: true,
        width: 'w-full md:w-[48%]',
      },
    ],
    [
      {
        formType: 'repeatable',
        cardTitle: 'Portfolio',
        popupTitle: 'Add a Project',
        triggerLabel: 'Add Projects',
        formName: 'freelancer-portfolio',
        fieldName: 'portfolio',
        value: profile.portfolio || [],
        repeatableFieldName: 'portfolio',
        width: 'w-full',
      },
    ],
    [
      {
        formType: 'repeatable',
        cardTitle: 'Work History',
        popupTitle: 'Add Work History',
        triggerLabel: 'Add Work History',
        formName: 'freelancer-work-history',
        fieldName: 'workHistory',
        value: profile.workHistory || [],
        repeatableFieldName: 'workHistory',
        width: 'w-full',
      },
    ],
    [
      {
        formType: 'repeatable',
        cardTitle: 'Certificates',
        popupTitle: 'Add Certificates',
        triggerLabel: 'Add Certificates',
        formName: 'freelancer-certificates',
        fieldName: 'certificates',
        value: profile.certificates || [],
        repeatableFieldName: 'certificates',
        width: 'w-full',
      },
    ],
    [
      {
        formType: 'repeatable',
        cardTitle: 'Education',
        popupTitle: 'Add Education',
        triggerLabel: 'Add Education',
        formName: 'freelancer-educations',
        fieldName: 'educations',
        value: profile.educations || [],
        repeatableFieldName: 'educations',
        width: 'w-full',
      },
    ],
  ];

  // console.log("profile.review", profile.review);

  return (
    <div className="relative w-full max-w-7xl mx-auto pr-10">
      {/* Profile Header */}
      <div
        className="h-32 sm:h-36 md:h-40 w-full my-4 rounded-xl border-2 relative"
        style={{
          background: 'linear-gradient(to right, #27638a 0%, white 75%)',
        }}
      >
        {/* {canEdit && (
          <div className="absolute top-4 right-4">
            <button className="text-sm rounded-xl flex items-center justify-center text-primaryColor border border-gray-300 sm:px-5 sm:py-3 px-3 py-2 font-semibold hover:bg-primaryColor hover:text-white transition-all">
              Add Title
            </button>
          </div>
        )} */}

        {/* ⭐⭐⭐⭐⭐ Reviews Section */}
        <div className="absolute sm:top-20 top-14 right-4 flex flex-col sm:flex-row items-start sm:items-center cursor-pointer gap-2 sm:gap-2">
          {/* Current Employer's Review */}
          {!canEdit && (
            <div
              className={`flex items-center xl:text-xl lg:text-lg text-sm ${
                hasReview
                  ? 'bg-green-50 border border-green-200 px-3 py-1 rounded-lg'
                  : 'bg-gray-50 border border-gray-200 px-3 py-1 rounded-lg'
              }`}
              onClick={handleStarClick}
            >
              <AiFillStar
                className={`xl:h-6 xl:w-6 lg:h-5 lg:w-5 h-4 w-4 mr-1 ${
                  hasReview ? 'text-yellow-500' : 'text-gray-400'
                }`}
              />
              <span className="font-semibold">{profile.review?.rating || '0'}/5</span>
              <span className="text-gray-500 xl:text-base md:text-sm text-xs ml-2">
                {hasReview ? '(Your Review)' : '(Click to Review)'}
              </span>
            </div>
          )}

          {!canEdit && <span className="text-gray-400 hidden sm:block">|</span>}

          {/* Overall Employer Reviews */}
          <div className="flex items-center xl:text-xl lg:text-lg text-sm">
            <AiFillStar className="text-yellow-500 xl:h-6 xl:w-6 lg:h-5 lg:w-5 h-4 w-4 mr-1" />
            <span className="font-semibold">{overallRating}/5</span>
            <span className="text-gray-500 xl:text-base md:text-sm text-xs ml-2">
              ({allReviews.length} employer reviews)
            </span>
          </div>
        </div>
      </div>

      {/* Profile Heading */}
      <div className="mb-10">
        <Heading profile={profile} canEdit={canEdit} />
      </div>

      {/* Grid Layout for Sections */}
      <div className="flex flex-col items-center gap-6">
        {sections.map((row, rowIndex) => (
          <div key={rowIndex} className="flex flex-wrap gap-6 w-full justify-between">
            {row.map((section, index) => (
              <div key={index} className={`${section.width} flex-shrink-0`}>
                <GeneralizableFormCard
                  formType={section.formType}
                  cardTitle={section.cardTitle}
                  popupTitle={section.popupTitle}
                  triggerLabel={section.triggerLabel}
                  formName={section.formName}
                  fieldName={section.fieldName}
                  repeatableFieldName={section.repeatableFieldName}
                  triggerIcon={section.triggerIcon}
                  minVal={section.minVal}
                  maxVal={section.maxVal}
                  useRichText={section.useRichText}
                  editable={canEdit}
                  fetcher={fetcher}
                  value={section.value}
                />
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Review Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="p-6 bg-white rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              {hasReview ? 'Edit your review' : 'Leave a review'}
            </DialogTitle>
            {hasReview && (
              <p className="text-sm text-gray-500 mt-1">
                You've already reviewed this freelancer. You can update your review below.
              </p>
            )}
          </DialogHeader>

          {/* ⭐ Star Rating */}
          <div className="flex bg-gray-100 rounded-xl gap-3 mt-4 mb-2 py-4 px-4 justify-center">
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                onClick={() => setRating(star)}
                className={`text-3xl transition-all transform hover:scale-110 ${
                  star <= rating ? 'text-yellow-400' : 'text-gray-300'
                }`}
              >
                <FaStar className="w-6 h-6" />
              </button>
            ))}
          </div>

          {/* Review Form */}
          <fetcher.Form method="post">
            <input type="hidden" name="_action" value="review" />
            <input type="hidden" name="rating" value={rating} />
            <input type="hidden" name="freelancerId" value={profile.id} />

            <AppFormField
              id="reviewComment"
              name="comment"
              type="textarea"
              label="Comments"
              placeholder="Write your feedback..."
              defaultValue={comment}
              col={6}
              onChange={e => setComment(e.target.value)}
            />

            <div className="flex justify-end">
              <Button
                type="submit"
                className="mt-2 w-fit bg-primaryColor text-white rounded-xl px-10"
                disabled={rating === 0 || fetcher.state === 'submitting'}
              >
                {fetcher.state === 'submitting'
                  ? 'Submitting...'
                  : hasReview
                    ? 'Update Review'
                    : 'Submit Review'}
              </Button>
            </div>
          </fetcher.Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
