import { useFetcher, useLoaderData } from "@remix-run/react";
import Heading from "~/common/profileView/heading/Heading";
import GeneralizableFormCard from "~/common/profileView/onboarding-form-component";
import { AiFillStar } from "react-icons/ai";
import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import AppFormField from "~/common/form-fields";
import { FaStar } from "react-icons/fa";

interface UserProfileProps {
  canEdit: boolean;
  accountOnboarded: boolean;
  profile?: any;
  canReview?: boolean;
  review?: { rating: number; comment: string; freelancerId: number } | null;
  averageRating?: number; // ✅ New prop from loader
  sections: {
    formType:
      | "number"
      | "text"
      | "range"
      | "textArea"
      | "increment"
      | "video"
      | "file"
      | "repeatable"
      | "custom";
    cardTitle: string;
    popupTitle: string;
    triggerLabel: string;
    formName: string;
    fieldName: string;
    repeatableFieldName?: string;
    triggerIcon?: JSX.Element;
    minVal?: number;
    maxVal?: number;
    useRichText?: boolean;
    width?: string;
    value?: any;
  }[][];
}

export default function UserProfile({
  canEdit,
  accountOnboarded,
  profile = {},
  canReview,
  review,
  averageRating = 0, // ✅ Default value if not provided
  sections,
}: UserProfileProps) {
  const fetcher = useFetcher();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  // ✅ Load review data if it exists
  useEffect(() => {
    if (review) {
      setRating(review.rating);
      setComment(review.comment);
    }
  }, [review]);

  return (
    <div className="relative">
      {/* Profile Header */}
      <div
        className="h-32 sm:h-36 md:h-40 w-auto sm:m-4 mb-2 rounded-xl border-2 relative"
        style={{
          background: "linear-gradient(to right, #27638a 0%, white 75%)",
        }}
      >
        {canEdit && (
          <div className="absolute top-4 right-4">
            <button className="text-sm rounded-xl flex items-center justify-center text-primaryColor border border-gray-300 sm:px-5 sm:py-3 px-3 py-2 font-semibold hover:text-white w-fit">
              Add Title
            </button>
          </div>
        )}

        {/* Star Rating + Review Text */}
        <div className="xl:right-4 top-12 absolute">
          <div className="flex flex-col items-end">
            {/* ✅ Your Review */}
            {review ? (
              <p className="text-sm font-semibold text-gray-700">
                Your Review: {review.rating}/5
              </p>
            ) : (
              <p className="text-sm text-gray-500">No review yet</p>
            )}

            {/* ⭐ Star Display */}
            <div className="flex items-center">
              <AiFillStar className="text-yellow-500 h-5 w-5 mr-1" />
              <span>{review ? review.rating : "0"}/5</span>
            </div>

            {/* ✅ Average Review */}
            <p className="text-sm font-semibold text-gray-700 mt-1">
              Average Reviews: {averageRating}/5
            </p>

            {/* Review Button */}
            {canReview && (
              <Button
                className="mt-2 bg-primaryColor text-white py-1 px-3 rounded-lg"
                onClick={() => setOpen(true)}
              >
                {review ? "Edit Review" : "Review Freelancer"}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Review Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="p-6 bg-white rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              {review ? "Edit your review" : "Leave a review"}
            </DialogTitle>
          </DialogHeader>

          <div className="flex bg-gray-100 rounded-xl gap-3 mt-4 mb-2 py-4 px-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                className={`text-3xl ${
                  star <= rating ? "text-yellow-400" : "text-gray-300"
                }`}
              >
                <FaStar className="w-6 h-6" />
              </button>
            ))}
          </div>

          <fetcher.Form method="post" action="/profile">
            <input type="hidden" name="_action" value="review" />
            <input type="hidden" name="freelancerId" value={profile.id || ""} />
            <input type="hidden" name="rating" value={rating} />

            <AppFormField
              id="reviewComment"
              name="comment"
              type="textarea"
              label="Comments"
              placeholder="Write your feedback..."
              defaultValue={comment}
              onChange={(e) => setComment(e.target.value)}
            />

            <div className="flex justify-end">
              <Button
                type="submit"
                className="mt-2 bg-primaryColor text-white rounded-xl px-6"
              >
                {review ? "Update Review" : "Submit"}
              </Button>
            </div>
          </fetcher.Form>
        </DialogContent>
      </Dialog>

      {/* Profile Details */}
      <div className="mb-10">
        <Heading profile={profile} canEdit={canEdit} />
      </div>

      {/* Sections Grid */}
      <div className="flex flex-col items-center gap-6">
        {sections.map((row, rowIndex) => (
          <div key={rowIndex} className="flex flex-wrap gap-6 w-full">
            {row.map((section, index) => (
              <div
                key={index}
                style={{ width: section.width || "80%" }}
                className="max-w-full flex-shrink-0"
              >
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
    </div>
  );
}
