import { RepeatableInputType } from "../types";
import type { FieldTemplateState } from "../types";

export const TextFieldTemplate: FieldTemplateState = {
    FilledState: ({ value, cardTitle }) => (
        <div className="flex flex-col">
            <span className="text-sm text-gray-500">{cardTitle}</span>
            <span className="font-medium">{value as string}</span>
        </div>
    ),
    EmptyState: ({ cardTitle }) => (
        <div className="flex flex-col">
            <span className="text-sm text-gray-500">{cardTitle}</span>
            <span className="text-gray-400 italic">Not filled</span>
        </div>
    ),
};

export const TextAreaFieldTemplate: FieldTemplateState = {
    FilledState: ({ value, cardTitle }) => (
        <div className="flex flex-col">
            <span className="text-sm text-gray-500">{cardTitle}</span>
            <span className="font-medium">{value as string}</span>
        </div>
    ),
    EmptyState: ({ cardTitle }) => (
        <div className="flex flex-col">
            <span className="text-sm text-gray-500">{cardTitle}</span>
            <span className="text-gray-400 italic">Not filled</span>
        </div>
    ),
};

export const NumberFieldTemplate: FieldTemplateState = {
    FilledState: ({ value, cardTitle }) => (
        <div className="flex flex-col">
            <span className="text-sm text-gray-500">{cardTitle}</span>
            <span className="font-medium">{value as number}</span>
        </div>
    ),
    EmptyState: ({ cardTitle }) => (
        <div className="flex flex-col">
            <span className="text-sm text-gray-500">{cardTitle}</span>
            <span className="text-gray-400 italic">No number set</span>
        </div>
    ),
};

export const RepeatableFieldTemplate: FieldTemplateState = {
    FilledState: ({ value, cardTitle }) => (
        <div className="flex flex-col">
            <span className="text-sm text-gray-500">{cardTitle}</span>
            <span className="font-medium">{(value as RepeatableInputType[]).length} items added</span>
        </div>
    ),
    EmptyState: ({ cardTitle }) => (
        <div className="flex flex-col">
            <span className="text-sm text-gray-500">{cardTitle}</span>
            <span className="text-gray-400 italic">No items added</span>
        </div>
    ),
};

export const IncrementFieldTemplate: FieldTemplateState = {
    FilledState: ({ value, cardTitle }) => (
        <div className="flex flex-col">
            <span className="text-sm text-gray-500">{cardTitle}</span>
            <span className="font-medium">{value as number}</span>
        </div>
    ),
    EmptyState: ({ cardTitle }) => (
        <div className="flex flex-col">
            <span className="text-sm text-gray-500">{cardTitle}</span>
            <span className="text-gray-400 italic">No number set</span>
        </div>
    ),
};

export const VideoFieldTemplate: FieldTemplateState = {
    FilledState: ({ value, cardTitle }) => (
        <div className="flex flex-col">
            <span className="text-sm text-gray-500">{cardTitle}</span>
            <span className="font-medium">{value as string}</span>
        </div>
    ),
    EmptyState: ({ cardTitle }) => (
        <div className="flex flex-col">
            <span className="text-sm text-gray-500">{cardTitle}</span>
            <span className="text-gray-400 italic">No video added</span>
        </div>
    ),
};

export const FileFieldTemplate: FieldTemplateState = {
    FilledState: ({ value, cardTitle }) => (
        <div className="flex flex-col">
            <span className="text-sm text-gray-500">{cardTitle}</span>
            <span className="font-medium">{value as string}</span>
        </div>
    ),
    EmptyState: ({ cardTitle }) => (
        <div className="flex flex-col">
            <span className="text-sm text-gray-500">{cardTitle}</span>
            <span className="text-gray-400 italic">No file added</span>
        </div>
    ),
};

export const RangeFieldTemplate: FieldTemplateState = {
    FilledState: ({ value, cardTitle }) => (
        <div className="flex flex-col">
            <span className="text-sm text-gray-500">{cardTitle}</span>
            <span className="font-medium">{value as number}</span>
        </div>
    ),
    EmptyState: ({ cardTitle }) => (
        <div className="flex flex-col">
            <span className="text-sm text-gray-500">{cardTitle}</span>
            <span className="text-gray-400 italic">No range set</span>
        </div>
    ),
};

export const CustomFieldTemplate: FieldTemplateState = {
    FilledState: ({ value, cardTitle }) => (
        <div className="flex flex-col">
            <span className="text-sm text-gray-500">{cardTitle}</span>
            <span className="font-medium">{value as string}</span>
        </div>
    ),
    EmptyState: ({ cardTitle }) => (
        <div className="flex flex-col">
            <span className="text-sm text-gray-500">{cardTitle}</span>
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