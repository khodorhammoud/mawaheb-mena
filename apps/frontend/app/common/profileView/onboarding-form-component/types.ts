import { FetcherWithComponents } from '@remix-run/react';
import type { ReactNode, FormEvent, ChangeEvent, FC } from 'react';
export interface GeneralizableFormCardProps {
  fetcher: FetcherWithComponents<unknown>; // ✅ Accept fetcher from UserProfile
  formType:
    | 'text'
    | 'number'
    | 'range'
    | 'textArea'
    | 'increment'
    | 'video'
    | 'file'
    | 'repeatable'
    | 'custom';
  cardTitle: string;
  cardSubtitle?: string;
  popupTitle: string;
  triggerLabel: string;
  triggerIcon?: ReactNode;
  formName: string;
  fieldName: string;
  acceptedFileTypes?: string;
  minVal?: number;
  maxVal?: number;
  repeatableFieldName?: string;
  editable?: boolean;
  useRichText?: boolean;
  value?: string | number | string[]; // ✅ Ensure value prop exists
}

export interface FilledGeneralizableFormCardProps {
  formType:
    | 'text'
    | 'number'
    | 'range'
    | 'textArea'
    | 'increment'
    | 'video'
    | 'file'
    | 'repeatable'
    | 'custom';
  cardTitle: string;
  cardSubtitle?: string;
  popupTitle: string;
  triggerLabel: string;
  triggerIcon?: ReactNode;
  formName: string;
  fieldName: string;
  minVal?: number;
  maxVal?: number;
  repeatableFieldName?: string;
  repeatableInputValues: unknown[];
  inputValue: string | number | File | string[];
}

export type FormStateType = number | string | File | null;

export type RepeatableInputType = {
  [key: string]: unknown;
};

export interface FormContentProps extends GeneralizableFormCardProps {
  formState: {
    inputValue: FormStateType;
    // eslint-disable-next-line no-unused-vars
    setInputValue: (value: FormStateType) => void;
    repeatableInputValues: RepeatableInputType[];
    repeatableInputFiles: (File | null)[];
    handleAddRepeatableField: () => void;
    // eslint-disable-next-line no-unused-vars
    handleRemoveRepeatableField: (index: number) => void;
    // eslint-disable-next-line no-unused-vars
    handleDataChange: (index: number, data: RepeatableInputType) => void;
    expandedIndex: number | null;
    // eslint-disable-next-line no-unused-vars
    setExpandedIndex: (index: number | null) => void;
  };
  // eslint-disable-next-line no-unused-vars
  onSubmit: (e: FormEvent, formData: FormData) => void;
  fetcher: FetcherWithComponents<unknown>; // Replace with proper Remix fetcher type
  showStatusMessage: boolean;
}

export interface RepeatableFieldsProps {
  fieldName: string;
  values: RepeatableInputType[];
  files?: (File | null)[];
  expandedIndex: number | null;
  onAdd: () => void;
  // eslint-disable-next-line no-unused-vars
  onRemove: (index: number) => void;
  // eslint-disable-next-line no-unused-vars
  onDataChange: (index: number, data: RepeatableInputType) => void;
  // eslint-disable-next-line no-unused-vars
  onToggleExpand: (index: number | null) => void;
}

export interface FormFieldProps {
  value: FormStateType;
  // eslint-disable-next-line no-unused-vars
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  // eslint-disable-next-line no-unused-vars
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
  FilledState: FC<FieldTemplateProps>;
  EmptyState: FC<FieldTemplateProps>;
}
