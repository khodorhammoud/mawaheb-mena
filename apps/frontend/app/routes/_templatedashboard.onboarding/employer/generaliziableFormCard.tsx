import { useState, ReactNode } from "react";
import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogFooter,
} from "~/components/ui/dialog";
import { FaDollarSign } from "react-icons/fa";

interface FormDialogProps {
  title: string;
  children: React.ReactNode;
  onSave: () => void;
  triggerLabel: string;
  triggerIcon?: React.ReactNode;
}

function FormDialog({
  title,
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
      <DialogContent className="space-y-4">
        <DialogTitle>{title}</DialogTitle>
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
  title: string;
  triggerLabel: string;
  onSave: (value: any) => void;
  customComponents?: ReactNode;
}

function GeneralizableFormCard({
  formType,
  title,
  triggerLabel,
  onSave,
  customComponents,
}: GeneralizableFormCardProps) {
  const [inputValue, setInputValue] = useState<any>(
    formType === "increment" ? 0 : ""
  );
  const [components, setComponents] = useState<ReactNode[]>(
    customComponents ? [customComponents] : []
  );

  const handleIncrement = (step: number) => {
    setInputValue((prev: number) => prev + step);
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
            className="w-full p-3 border border-gray-300 rounded-md"
          />
        );
      case "number":
        return (
          <Input
            type="number"
            placeholder="Enter a number"
            value={inputValue}
            onChange={(e) => setInputValue(Number(e.target.value))}
            className="w-full p-3 border border-gray-300 rounded-md"
          />
        );
      case "textArea":
        return (
          <textarea
            placeholder="Enter detailed text"
            value={inputValue}
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
            onChange={(e) => setInputValue(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md"
          />
        );
      case "file":
        return (
          <Input
            type="file"
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
      <FormDialog
        title={title}
        triggerLabel={triggerLabel}
        onSave={() => onSave(inputValue)}
      >
        {renderFormField()}
      </FormDialog>
    </Card>
  );
}

export default GeneralizableFormCard;
