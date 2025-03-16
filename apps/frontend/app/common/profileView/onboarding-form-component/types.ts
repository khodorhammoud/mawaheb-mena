import { FetcherWithComponents } from "@remix-run/react";
import { MutableRefObject } from "react";

export type FormType =
  | "text"
  | "number"
  | "range"
  | "textArea"
  | "increment"
  | "video"
  | "file"
  | "repeatable"
  | "select"
  | "textarea"
  | "custom";

export interface GeneralizableFormCardProps {
  fetcher?: FetcherWithComponents<any>; // Make fetcher optional
  formType: FormType;
  cardTitle: string;
  cardSubtitle?: string;
  popupTitle: string;
  triggerLabel: string;
  triggerIcon?: React.ReactNode;
  formName: string;
  fieldName: string;
  acceptedFileTypes?: string;
  multiple?: boolean; // Allow multiple file uploads
  formRef?: MutableRefObject<any>; // Reference to access form methods
  showStatusMessage?: boolean; // Add showStatusMessage property

  minVal?: number;
  maxVal?: number;
  repeatableFieldName?: string;
  editable?: boolean;
  useRichText?: boolean;
  value?: string | number | string[] | null; // ✅ Ensure value prop exists
  showLoadingOnSubmit?: boolean; // Add showLoadingOnSubmit property
}

export interface FilledGeneralizableFormCardProps {
  formType:
    | "text"
    | "number"
    | "range"
    | "textArea"
    | "increment"
    | "video"
    | "file"
    | "repeatable"
    | "custom";
  cardTitle: string;
  cardSubtitle?: string;
  popupTitle: string;
  triggerLabel: string;
  triggerIcon?: React.ReactNode;
  formName: string;
  fieldName: string;
  minVal?: number;
  maxVal?: number;
  repeatableFieldName?: string;
  repeatableInputValues: any[];
  inputValue: string | number | File | string[] | null;
}

export type FormStateType = string | number | File | null;

export type RepeatableInputType = {
  [key: string]: any;
};

export interface FormContentProps {
  formType: FormType;
  formState: any;
  onSubmit: (e: React.FormEvent, formData: FormData) => void;
  fetcher: any;
  showStatusMessage?: boolean;
  formName: string;
  fieldName: string;
  repeatableFieldName?: string;
  showLoadingOnSubmit?: boolean;
  value?: any;
  acceptedFileTypes?: string;
  multiple?: boolean;
  cardTitle?: string;
  popupTitle?: string;
  triggerLabel?: string;
  [key: string]: any;
}

export interface RepeatableFieldsProps {
  fieldName: string;
  values: RepeatableInputType[];
  files?: (File | null)[];
  expandedIndex: number | null;
  onAdd: () => void;
  onRemove: (index: number) => void;
  onDataChange: (index: number, data: RepeatableInputType) => void;
  onToggleExpand: (index: number | null) => void;
}

export interface FormFieldProps {
  value: FormStateType;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleIncrement: (step: number) => void;
  name: string;
  props?: GeneralizableFormCardProps;
}

export interface FieldTemplateProps {
  value: FormStateType | RepeatableInputType[];
  fieldName: string;
  cardTitle: string;
  cardSubtitle?: string;
}

export interface FieldTemplateState {
  FilledState: React.FC<FieldTemplateProps>;
  EmptyState: React.FC<FieldTemplateProps>;
}
