import { RepeatableInputType } from "../types";
import type { FieldTemplateState, FormStateType } from "../types";
// import { Pencil } from "lucide-react";

interface FieldTemplateProps {
  value: FormStateType | RepeatableInputType[];
  cardTitle: string;
}

export const TextFieldTemplate: FieldTemplateState = {
  FilledState: ({ value, cardTitle }: FieldTemplateProps) => (
    <div className="flex flex-col">
      <span className="text-base font-medium">{cardTitle}</span>
      <span className="font-medium">{value as string}</span>
    </div>
  ),
  EmptyState: ({ cardTitle }: FieldTemplateProps) => (
    <div className="flex flex-col">
      <span className="text-base font-medium">{cardTitle}</span>
      <span className="text-gray-400 italic">Not filled</span>
    </div>
  ),
};

export const TextAreaFieldTemplate: FieldTemplateState = {
  FilledState: ({ value, cardTitle }: FieldTemplateProps) => (
    <div className="flex flex-col">
      <span className="text-base font-medium">{cardTitle}</span>
      <span className="font-medium">{value as string}</span>
    </div>
  ),
  EmptyState: ({ cardTitle }: FieldTemplateProps) => (
    <div className="flex flex-col">
      <span className="text-base font-medium">{cardTitle}</span>
      <span className="text-gray-400 italic">Not filled</span>
    </div>
  ),
};

export const NumberFieldTemplate: FieldTemplateState = {
  FilledState: ({ value, cardTitle }: FieldTemplateProps) => (
    <div className="flex flex-col">
      <span className="text-base font-medium">{cardTitle}</span>
      <span className="font-medium">{value as number}</span>
    </div>
  ),
  EmptyState: ({ cardTitle }: FieldTemplateProps) => (
    <div className="flex flex-col">
      <span className="text-base font-medium">{cardTitle}</span>
      <span className="text-gray-400 italic">No number set</span>
    </div>
  ),
};

export const RepeatableFieldTemplate: FieldTemplateState = {
  FilledState: ({ value, cardTitle }: FieldTemplateProps) => (
    <div className="flex flex-col">
      <span className="text-base font-medium">{cardTitle}</span>
      <span className="font-medium">
        {(value as RepeatableInputType[]).length} items added
      </span>
    </div>
  ),
  EmptyState: ({ cardTitle }: FieldTemplateProps) => (
    <div className="flex flex-col">
      <span className="text-base font-medium">{cardTitle}</span>
      <span className="text-gray-400 italic">No items added</span>
    </div>
  ),
};

export const IncrementFieldTemplate: FieldTemplateState = {
  FilledState: ({ value, cardTitle }: FieldTemplateProps) => (
    <div className="flex items-center justify-between">
      <div className="flex flex-col gap-1">
        <span className="text-base font-medium">{cardTitle}</span>
        <span className="text-2xl font-semibold">
          {value as number} year
          {(value as number) > 1 || (value as number) == 0 ? "s" : ""}
        </span>
      </div>
    </div>
  ),
  EmptyState: ({ cardTitle }: FieldTemplateProps) => (
    <div className="flex flex-col">
      <span className="text-base font-medium">{cardTitle}</span>
      <span className="text-gray-400 italic">No number set</span>
    </div>
  ),
};

// function extractYouTubeId(url: string) {
//   const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
//   const match = url.match(regExp);
//   return match && match[2].length === 11 ? match[2] : null;
// }

export const VideoFieldTemplate: FieldTemplateState = {
  FilledState: ({ value, cardTitle }: FieldTemplateProps) => (
    <div className="flex flex-col w-full max-w-[80%]">
      <span className="text-base font-medium">{cardTitle}</span>
      <span className="font-medium">{value as string}</span>
    </div>
  ),
  EmptyState: ({ cardTitle }: FieldTemplateProps) => (
    <div className="flex flex-col">
      <span className="text-base font-medium">{cardTitle}</span>
      <span className="text-gray-400 italic">No video added</span>
    </div>
  ),
};

export const FileFieldTemplate: FieldTemplateState = {
  FilledState: ({ value, cardTitle }: FieldTemplateProps) => (
    <div className="flex flex-col">
      <span className="text-base font-medium">{cardTitle}</span>
      <span className="font-medium">{value as string}</span>
    </div>
  ),
  EmptyState: ({ cardTitle }: FieldTemplateProps) => (
    <div className="flex flex-col">
      <span className="text-base font-medium">{cardTitle}</span>
      <span className="text-gray-400 italic">No file added</span>
    </div>
  ),
};

export const RangeFieldTemplate: FieldTemplateState = {
  FilledState: ({ value, cardTitle }: FieldTemplateProps) => (
    <div className="flex items-center justify-between">
      <div className="flex flex-col gap-1">
        <span className="text-base font-medium">{cardTitle}</span>
        <span className="text-2xl font-semibold">
          ${value as number} / hour
        </span>
      </div>
    </div>
  ),
  EmptyState: ({ cardTitle }: FieldTemplateProps) => (
    <div className="flex flex-col">
      <span className="text-base font-medium">{cardTitle}</span>
      <span className="text-gray-400 italic">No range set</span>
    </div>
  ),
};

export const CustomFieldTemplate: FieldTemplateState = {
  FilledState: ({ value, cardTitle }: FieldTemplateProps) => (
    <div className="flex flex-col">
      <span className="text-base font-medium">{cardTitle}</span>
      <span className="font-medium">{value as string}</span>
    </div>
  ),
  EmptyState: ({ cardTitle }: FieldTemplateProps) => (
    <div className="flex flex-col">
      <span className="text-base font-medium">{cardTitle}</span>
      <span className="text-gray-400 italic">No custom field added</span>
    </div>
  ),
};

export const FieldTemplates: Record<string, FieldTemplateState> = {
  text: TextFieldTemplate,
  textArea: TextFieldTemplate,
  number: NumberFieldTemplate,
  repeatable: RepeatableFieldTemplate,
  increment: IncrementFieldTemplate,
  video: VideoFieldTemplate,
  file: FileFieldTemplate,
  range: RangeFieldTemplate,
  custom: CustomFieldTemplate,
};
