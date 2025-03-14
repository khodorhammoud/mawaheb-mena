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
import { useState } from "react";

function GeneralizableFormCard(props: GeneralizableFormCardProps) {
  const formState = useFormState(props.formType, props.fieldName);
  const {
    handleSubmit: localHandleSubmit,
    fetcher: localFetcher,
    showStatusMessage: localShowStatusMessage,
  } = useFormSubmission();

  // Add state to control dialog open/close
  const [dialogOpen, setDialogOpen] = useState(false);

  // Use the provided fetcher or the local one
  const fetcher = props.fetcher || localFetcher;
  const handleSubmit = (e: React.FormEvent, formData: FormData) => {
    localHandleSubmit(e, formData);
    // Close dialog after successful submission
    setTimeout(() => {
      if (fetcher.state !== "submitting") {
        setDialogOpen(false);
      }
    }, 500);
  };
  const showStatusMessage = localShowStatusMessage;

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

  // Handle button click to open dialog and prevent form submission
  const handleButtonClick = (e: React.MouseEvent) => {
    // Stop event propagation to prevent it from reaching the parent form
    e.stopPropagation();
    // Prevent the default form submission
    e.preventDefault();
    // Open the dialog
    setDialogOpen(true);
  };

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
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            {isFilled ? (
              <button
                type="button"
                className="absolute top-3 right-3"
                onClick={handleButtonClick}
              >
                <IoPencilSharp className="h-7 w-7 text-primaryColor hover:bg-[#E4E3E6] transition-all rounded-full p-1" />
              </button>
            ) : (
              <Button
                type="button"
                variant="outline"
                className="text-primaryColor border-gray-300"
                onClick={handleButtonClick}
              >
                {props.triggerIcon} {props.triggerLabel}
              </Button>
            )}
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
