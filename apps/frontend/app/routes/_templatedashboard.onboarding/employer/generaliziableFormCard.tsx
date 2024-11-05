import { useState, ReactNode, useRef, useEffect } from "react";
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
import { useLoaderData, useFetcher } from "@remix-run/react";

interface FormDialogProps {
  popupTitle: string;
  children: React.ReactNode;
  onSave: () => void;
  triggerLabel: string;
  triggerIcon?: React.ReactNode;
}

function RangeComponent({
  minVal,
  maxVal,
}: {
  minVal: number;
  maxVal: number;
}
) {

  // Calculate the percentage position of the min and max values
  const minValPercent = (minVal / 40) * 100;
  const maxValPercent = (maxVal / 40) * 100;

  return (
    <div className="relative w-full flex items-center mt-4">
      {/* Slider Track */}
      <div className="relative w-full h-2 bg-blue-200 rounded-full">
        {/* Line representing min to max values */}
        <div
          className="absolute h-full bg-blue-600"
          style={{
            left: `${minValPercent}%`,
            right: `${100 - maxValPercent}%`,
          }}
        ></div>

        {/* Min Value Cursor */}
        <div
          className="absolute bottom-0 transform -translate-x-1/2"
          style={{ left: `${minValPercent}%` }}
        >
          <div className="flex flex-col items-center">
            <div className="mb-1 flex items-center justify-center w-8 h-8 bg-gray-800 text-white text-sm rounded-full">
              {minVal}
            </div>
            <div className="w-1 h-6 bg-blue-600"></div>
          </div>
        </div>

        {/* Max Value Cursor */}
        <div
          className="absolute bottom-0 transform -translate-x-1/2"
          style={{ left: `${maxValPercent}%` }}
        >
          <div className="flex flex-col items-center">
            <div className="mb-1 flex items-center justify-center w-8 h-8 bg-gray-800 text-white text-sm rounded-full">
              {maxVal}
            </div>
            <div className="w-1 h-6 bg-blue-600"></div>
          </div>
        </div>
      </div>
    </div>
  );

};

function FormDialog({
  popupTitle,
  children,
  onSave,
  triggerLabel,
  triggerIcon,
}: FormDialogProps) {

  const fetcher = useFetcher<{
    success?: boolean;
    error?: { message: string };
  }>(); // Fetcher for bio form

  const [showStatusMessage, setShowStatusMessage] = useState(false); // Track bio message visibility


  // Handle showing the bio submission message
  useEffect(() => {
    if (fetcher.data?.success || fetcher.data?.error) {
      setShowStatusMessage(true);
    }
  }, [fetcher.data]);



  return (
    <Dialog>
      <DialogTrigger>
        <Button
          variant="outline"
          className="trigger flex items-center space-x-2 border border-gray-400"
          style={{ borderWidth: "2px", borderColor: "#cbd5e1", borderRadius: "8px" }}
        >
          {triggerIcon}
          <span>{triggerLabel}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-white">
        <DialogTitle>{popupTitle}</DialogTitle>
        {/* Display Error Message */}
        {showStatusMessage && fetcher.data?.error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            <span className="block sm:inline">
              {fetcher.data.error.message}
            </span>
          </div>
        )}
        {/* Display Success Message for Bio */}
        {showStatusMessage && fetcher.data?.success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
            <span className="block sm:inline">
              Bio updated successfully
            </span>
          </div>
        )}
        <fetcher.Form method="post" className="space-y-6">
          {children}
          <DialogFooter>
            <Button
              onClick={onSave}
              className="action bg-blue-600 text-white px-4 py-2 rounded-lg"
            >
              Save
            </Button>
          </DialogFooter>
        </fetcher.Form>
      </DialogContent>
    </Dialog>
  );
}

interface GeneralizableFormCardProps {
  formType:
  | "text"
  | "number"
  | "range"
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
  minVal?: number;
  maxVal?: number;
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
  minVal,
  maxVal,
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
      case "range":
        return (
          <>
            <Input
              type="number"
              placeholder="Enter a number"
              value={inputValue}
              name={fieldName}
              onChange={(e) => setInputValue(Number(e.target.value))}
              className="w-full p-3 border border-gray-300 rounded-md mb-8"
            />

            <RangeComponent minVal={minVal} maxVal={maxVal} />
          </>
        );
      case "textArea":
        return (
          <>
            <textarea
              value={inputValue}
              name={fieldName}
              placeholder="Add content to describe yourself"
              onChange={(e) => setInputValue(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md"
              rows={6}
              maxLength={2000}
            />
            <div className="text-right text-sm text-gray-500">
              {inputValue.length} / 2000 characters
            </div>
          </>
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
      className="w-full p-4 bg-gray-100 border border-gray-400 border-dashed rounded-2xl"
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
