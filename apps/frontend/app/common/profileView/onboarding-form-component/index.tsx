// This is where the popup styling exists :)

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

  const Template =
    props.formType === "repeatable"
      ? FieldTemplates[`repeatable_${props.repeatableFieldName}`]
      : FieldTemplates[props.formType];
  const TemplateComponent = isFilled
    ? Template.FilledState
    : Template.EmptyState;
  return (
    <Card
      className={`border-2 rounded-xl h-auto grid relative ${
        isFilled
          ? "bg-[#F1F0F3] border-0"
          : "bg-gray-100 border-gray-300 border-dashed"
      }
  text-left break-words whitespace-normal overflow-hidden`}
      style={{ wordBreak: "break-word", hyphens: "auto" }} // this is to let the typing go down to the second line
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
      <div
        className={`flex flex-col ${props.formType === "video" && value ? "" : "pt-8 pb-6 pl-7 pr-10"}`}
      >
        {/* Render the appropriate template that is one of the templates inside form fields */}
        <TemplateComponent
          value={value}
          fieldName={props.fieldName}
          cardTitle={props.cardTitle}
          cardSubtitle={props.cardSubtitle}
        />

        {/* Button of the components and its border */}
        {/* Conditionally render edit functionality based on `editable` */}
        {props.editable && (
          <Dialog>
            <DialogTrigger>
              {isFilled ? (
                <IoPencilSharp className="h-7 w-7 absolute top-4 right-4 text-primaryColor hover:bg-[#E4E3E6] transition-all rounded-full p-1" />
              ) : (
                <Button
                  variant="outline"
                  asChild={true}
                  className="items-left float-left lg:mb-0 sm:mb-0 text-sm rounded-xl  font-semibold tracking-wide space-x-2 text-primaryColor border-gray-300 not-active-gradient hover:text-white mb-4"
                >
                  <span>
                    {props.triggerIcon}
                    <span>{props.triggerLabel}</span>
                  </span>
                </Button>
              )}
            </DialogTrigger>

            <DialogContent className="bg-white">
              <DialogTitle className="mt-3 tracking-normal mb-2">
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
        )}
      </div>
    </Card>
  );
}
export default GeneralizableFormCard;
