import { useState, ReactNode } from "react";
import { Card, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogFooter,
} from "~/components/ui/dialog";

interface FormDialogProps {
  popupTitle: string;
  children: React.ReactNode;
  onSave: () => void;
  triggerLabel: string;
  triggerIcon?: React.ReactNode;
}

function FormDialog({
  popupTitle,
  children,
  onSave,
  triggerLabel,
  triggerIcon,
}: FormDialogProps) {
  return (
    <Dialog>
      <DialogTrigger>
        <Button
          variant="outline"
          className="trigger flex items-center space-x-2 border border-gray-400"
          style={{ borderWidth: "2px", borderColor: "#cbd5e1" }}
        >
          {triggerIcon}
          <span>{triggerLabel}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="space-y-4 bg-white">
        <DialogTitle>{popupTitle}</DialogTitle>
        {children}
        <DialogFooter>
          <Button
            onClick={onSave}
            className="action bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface GeneralizableFormCardProps {
  formType:
    | "text"
    | "number"
    | "textArea"
    | "increment"
    | "video"
    | "file"
    | "custom";
  cardTitle: string;
  popupTitle: string;

  triggerLabel: string;
  triggerIcon?: React.ReactNode;
  formName: string;
  fieldName: string;
  onSave: (value: any) => void;
  customComponents?: ReactNode;
}

function GeneralizableFormCard({
  formType,
  cardTitle,
  popupTitle,
  triggerLabel,
  formName,
  fieldName,
  onSave,
  triggerIcon,
  customComponents,
}: GeneralizableFormCardProps) {
  const [inputValue, setInputValue] = useState<any>(
    formType === "increment" ? 0 : ""
  );
  const [components, setComponents] = useState<ReactNode[]>(
    customComponents ? [customComponents] : []
  );

  const handleIncrement = (step: number) => {
    setInputValue((prev: number) => (prev as number) + step);
  };

  const renderFormField = () => {
    switch (formType) {
      case "text":
        return (
          <Input
            type="text"
            placeholder="Enter text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            name={fieldName}
            className="w-full p-3 border border-gray-300 rounded-md"
          />
        );
      case "number":
        return (
          <Input
            type="number"
            placeholder="Enter a number"
            value={inputValue}
            name={fieldName}
            onChange={(e) => setInputValue(Number(e.target.value))}
            className="w-full p-3 border border-gray-300 rounded-md"
          />
        );
      case "textArea":
        return (
          <textarea
            placeholder="Enter detailed text"
            value={inputValue}
            name={fieldName}
            onChange={(e) => setInputValue(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md"
            rows={4}
          />
        );
      case "increment":
        return (
          <div className="flex items-center space-x-2">
            <Button onClick={() => handleIncrement(-1)}>-</Button>
            <Input
              type="number"
              value={inputValue}
              name={fieldName}
              readOnly
              className="w-full p-3 border border-gray-300 rounded-md"
            />
            <Button onClick={() => handleIncrement(1)}>+</Button>
          </div>
        );
      case "video":
        return (
          <Input
            type="text"
            placeholder="Paste YouTube URL or upload video"
            value={inputValue}
            name={fieldName}
            onChange={(e) => setInputValue(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md"
          />
        );
      case "file":
        return (
          <Input
            type="file"
            name={fieldName}
            onChange={(e) =>
              setInputValue(e.target.files ? e.target.files[0] : null)
            }
            className="w-full p-3 border border-gray-300 rounded-md"
          />
        );
      case "custom":
        return (
          <div className="space-y-2">
            {components.map((component, index) => (
              <div key={index} className="flex items-center space-x-2">
                {component}
              </div>
            ))}
            <Button
              variant="outline"
              onClick={() => setComponents([...components, customComponents])}
            >
              + Add Another
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Card
      className="w-full p-6 bg-gray-100 border border-gray-400 border-dashed rounded-2xl"
      style={{
        borderWidth: "2px",
        borderStyle: "dashed",
        borderColor: "#cbd5e1",
        borderSpacing: "10px",
      }}
    >
      <CardHeader className="p-4">
        <CardTitle className="text-lg font-semibold text-center">
          {cardTitle}
        </CardTitle>
      </CardHeader>
      <FormDialog
        popupTitle={popupTitle}
        triggerLabel={triggerLabel}
        onSave={() => onSave(inputValue)}
        triggerIcon={triggerIcon}
      >
        <input type="hidden" name="target-updated" value={formName} />
        {renderFormField()}
      </FormDialog>
    </Card>
  );
}

export default GeneralizableFormCard;
