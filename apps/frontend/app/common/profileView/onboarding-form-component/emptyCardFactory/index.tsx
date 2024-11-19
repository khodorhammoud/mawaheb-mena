import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "~/common/header/card";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogFooter,
} from "~/components/ui/dialog";
import { GeneralizableFormCardProps } from "../types";
import { useFetcher } from "@remix-run/react";
import { useState, useEffect } from "react";

interface EmptyCardFactoryProps extends GeneralizableFormCardProps {
  renderFormField: () => React.ReactNode;
  formRef: React.RefObject<HTMLFormElement>;
  handleSubmit?: (e: React.FormEvent) => void;
}

export function EmptyCardFactory({
  cardTitle,
  cardSubtitle,
  triggerIcon,
  triggerLabel,
  popupTitle,
  formName,
  formType,
  renderFormField,
  formRef,
  handleSubmit,
}: EmptyCardFactoryProps) {
  const fetcher = useFetcher<{
    success?: boolean;
    error?: { message: string };
  }>();

  const [showStatusMessage, setShowStatusMessage] = useState(false);

  // Handle showing the submission message
  useEffect(() => {
    if (fetcher.data?.success || fetcher.data?.error) {
      setShowStatusMessage(true);
    }
  }, [fetcher.data]);

  return (
    <Card className="bg-gray-100 border-2 border-gray-300 rounded-xl border-dashed pl-8 pb-5 pt-5 h-auto grid">
      <CardHeader className="p-0">
        <CardTitle className="text-lg font-semibold mb-2 md:w-[60%]">
          {cardTitle}
        </CardTitle>
        {cardSubtitle && (
          <CardDescription className="md:w-[300px]">
            {cardSubtitle}
          </CardDescription>
        )}
      </CardHeader>

      <Dialog>
        <DialogTrigger>
          <Button
            variant="outline"
            className="text-sm rounded-xl flex text-primaryColor border border-gray-300 px-5 py-3 font-semibold tracking-wide not-active-gradient hover:text-white space-x-2 mt-6"
          >
            {triggerIcon}
            <span>{triggerLabel}</span>
          </Button>
        </DialogTrigger>

        <DialogContent className="bg-white">
          <DialogTitle className="mt-3 tracking-normal">
            {popupTitle}
          </DialogTitle>

          {/* Error Message */}
          {showStatusMessage && fetcher.data?.error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 mt-6">
              <span className="block sm:inline">
                {fetcher.data.error.message}
              </span>
            </div>
          )}

          {/* Success Message */}
          {showStatusMessage && fetcher.data?.success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4 mt-6">
              <span className="block sm:inline">updated successfully</span>
            </div>
          )}

          {/* Form */}
          <fetcher.Form
            method="post"
            className="space-y-6"
            ref={formRef}
            {...(formType === "repeatable"
              ? { encType: "multipart/form-data", onSubmit: handleSubmit }
              : {})}
          >
            <input type="hidden" name="target-updated" value={formName} />
            {renderFormField()}

            <DialogFooter>
              <Button
                className="text-white py-4 px-10 rounded-xl bg-primaryColor font-medium not-active-gradient mt-6"
                type="submit"
              >
                Save
              </Button>
            </DialogFooter>
          </fetcher.Form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
