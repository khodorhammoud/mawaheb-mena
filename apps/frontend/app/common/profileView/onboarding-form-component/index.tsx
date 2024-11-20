import { Card, CardHeader, CardTitle, CardDescription } from "~/common/header/card";
import { Dialog, DialogTrigger, DialogContent, DialogTitle } from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { useFormState } from "./hooks/useFormState";
import { useFormSubmission } from "./hooks/useFormSubmission";
import FormContent from "./formFields/FormContent";
import type { GeneralizableFormCardProps } from "./types";

function GeneralizableFormCard(props: GeneralizableFormCardProps) {
  const formState = useFormState(props.formType, props.fieldName);
  const { handleSubmit, fetcher, showStatusMessage } = useFormSubmission();

  return (
    <Card className="bg-gray-100 border-2 border-gray-300 rounded-xl border-dashed pl-8 pb-5 pt-5 h-auto grid">
      <CardHeader className="p-0">
        <CardTitle className="text-lg font-semibold mb-2 md:w-[60%]">
          {props.cardTitle}
        </CardTitle>
        {props.cardSubtitle && (
          <CardDescription className="md:w-[300px]">
            {props.cardSubtitle}
          </CardDescription>
        )}
      </CardHeader>

      <Dialog>
        <DialogTrigger>
          <Button
            variant="outline"
            className="text-sm rounded-xl flex text-primaryColor border border-gray-300 px-5 py-3 font-semibold tracking-wide not-active-gradient hover:text-white space-x-2 mt-6"
          >
            {props.triggerIcon}
            <span>{props.triggerLabel}</span>
          </Button>
        </DialogTrigger>

        <DialogContent className="bg-white">
          <DialogTitle className="mt-3 tracking-normal">
            {props.popupTitle}
          </DialogTitle>

          <FormContent
            {...props}
            formState={formState}
            onSubmit={handleSubmit}
            fetcher={fetcher}
            showStatusMessage={showStatusMessage}
          />
        </DialogContent>
      </Dialog>
    </Card>
  );
}

export default GeneralizableFormCard;