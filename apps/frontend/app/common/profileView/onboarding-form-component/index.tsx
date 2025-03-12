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
import type {
  FormStateType,
  RepeatableInputType,
  GeneralizableFormCardProps,
} from "./types";

function GeneralizableFormCard(props: GeneralizableFormCardProps) {
  const formState = useFormState(props.formType, props.fieldName);
  const { handleSubmit, fetcher, showStatusMessage } = useFormSubmission();

  // Get values from formState
  const { inputValue, repeatableInputValues } = formState;

  // console.log("🛠️ [GeneralizableFormCard] inputValue:", inputValue);

  // Fix: Ensure inputValue does not overwrite props.value with incorrect data
  const value =
    props.formType === "repeatable"
      ? Array.isArray(repeatableInputValues) && repeatableInputValues.length > 0
        ? repeatableInputValues
        : Array.isArray(props.value)
          ? props.value
          : []
      : inputValue && inputValue !== "this is the about me section..."
        ? inputValue
        : props.value;

  const isFilled = Array.isArray(value) ? value.length > 0 : Boolean(value);
  const templateKey =
    props.formType === "repeatable"
      ? `repeatable_${props.repeatableFieldName}`
      : props.formType;

  const Template = FieldTemplates[templateKey];
  if (!Template) return null;

  const TemplateComponent = isFilled
    ? Template.FilledState
    : Template.EmptyState;

  // console.log("🔍 [GeneralizableFormCard] Props on First Render:", props);
  // console.log(
  //   "🚀 [GeneralizableFormCard] Before Passing to TemplateComponent:",
  //   {
  //     fieldName: props.fieldName,
  //     value,
  //     type: typeof value,
  //     isArray: Array.isArray(value),
  //   }
  // );

  return (
    <Card
      className={`border-2 rounded-xl flex flex-col h-full ${
        isFilled ? "bg-[#F1F0F3]" : "bg-gray-100 border-gray-300 border-dashed"
      }`}
    >
      <div
        className={`flex flex-col relative ${
          props.formType === "video" && value ? "" : "pt-8 pb-6 pl-7 pr-10"
        }`}
      >
        <TemplateComponent
          value={
            Array.isArray(value)
              ? (value as RepeatableInputType[])
              : (value as FormStateType)
          }
          fieldName={props.fieldName}
          cardTitle={props.cardTitle}
          cardSubtitle={props.cardSubtitle}
        />
        {props.editable && (
          <Dialog>
            <DialogTrigger>
              {isFilled ? (
                <IoPencilSharp className="h-7 w-7 absolute top-3 right-3 text-primaryColor hover:bg-[#E4E3E6] transition-all rounded-full p-1" />
              ) : (
                <Button
                  variant="outline"
                  className="text-primaryColor border-gray-300"
                >
                  {props.triggerIcon} {props.triggerLabel}
                </Button>
              )}
            </DialogTrigger>
            <DialogContent>
              <DialogTitle>{props.popupTitle}</DialogTitle>
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
