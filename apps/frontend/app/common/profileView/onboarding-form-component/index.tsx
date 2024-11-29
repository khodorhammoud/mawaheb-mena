// This is where the components styling exists :)

import { Card } from "~/common/header/card";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { useFormState } from "./hooks/useFormState";
import { useFormSubmission } from "./hooks/useFormSubmission";
import FormContent from "./formFields/FormContent";
import { FieldTemplates } from "./formFields/fieldTemplates";
import { IoPencilSharp } from "react-icons/io5";
import type { GeneralizableFormCardProps } from "./types";

function GeneralizableFormCard(props: GeneralizableFormCardProps) {
  const formState = useFormState(props.formType, props.fieldName);
  const { handleSubmit, fetcher, showStatusMessage } = useFormSubmission();

  // Get values from formState instead of props
  const { inputValue, repeatableInputValues } = formState;
  const value =
    props.formType === "repeatable" ? repeatableInputValues : inputValue;
  const isFilled = Boolean(
    value && (Array.isArray(value) ? value.length > 0 : value)
  );

  const Template = FieldTemplates[props.formType];
  const TemplateComponent = isFilled
    ? Template.FilledState
    : Template.EmptyState;

  return (
    <Card
      className={`
      border-2 rounded-xl h-auto grid relative
      ${
        isFilled
          ? "bg-[#F1F0F3] border-0"
          : "bg-gray-100 border-gray-300 border-dashed"
      }
    `}
    >
      {/* <CardHeader className="p-0">
        <CardTitle className="text-lg font-semibold mb-2 md:w-[60%]">
          {props.cardTitle}
        </CardTitle>
        {props.cardSubtitle && (
          <CardDescription className="md:w-[300px]">
            {props.cardSubtitle}
          </CardDescription>
        )}
      </CardHeader> */}
      <div className="flex flex-col">
        {/* Render the appropriate template */}
        <TemplateComponent
          value={value}
          fieldName={props.fieldName}
          cardTitle={props.cardTitle}
          cardSubtitle={props.cardSubtitle}
        />

        {/* POPUPS */}
        <Dialog>
          <DialogTrigger>
            {isFilled ? (
              <IoPencilSharp className="h-7 w-7 absolute top-4 right-4 text-[#41474D] hover:bg-[#E4E3E6] transition-all hover:rounded-xl p-1" />
            ) : (
              <Button
                variant="outline"
                className="text-sm rounded-xl flex px-5 py-3 font-semibold tracking-wide space-x-2 text-primaryColor border-gray-300 not-active-gradient hover:text-white mb-4 ml-5"
              >
                {props.triggerIcon}
                <span>{props.triggerLabel}</span>
              </Button>
            )}
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
      </div>
    </Card>
  );
}

export default GeneralizableFormCard;
