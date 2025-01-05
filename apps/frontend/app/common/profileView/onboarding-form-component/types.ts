export interface GeneralizableFormCardProps {
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
  editable?: boolean;
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
  inputValue: string | number | File | string[];
}

export type FormStateType = number | string | File | null;

export type RepeatableInputType = {
  [key: string]: any;
};

export interface FormContentProps extends GeneralizableFormCardProps {
  formState: {
    inputValue: FormStateType;
    setInputValue: (value: FormStateType) => void;
    repeatableInputValues: RepeatableInputType[];
    repeatableInputFiles: (File | null)[];
    handleAddRepeatableField: () => void;
    handleRemoveRepeatableField: (index: number) => void;
    handleDataChange: (index: number, data: RepeatableInputType) => void;
    expandedIndex: number | null;
    setExpandedIndex: (index: number | null) => void;
  };
  onSubmit: (e: React.FormEvent, formData: FormData) => void;
  fetcher: any; // Replace with proper Remix fetcher type
  showStatusMessage: boolean;
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
