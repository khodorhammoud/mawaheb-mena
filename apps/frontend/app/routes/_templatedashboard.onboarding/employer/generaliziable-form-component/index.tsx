import { useState, ReactNode, useEffect, useRef } from "react";
import { Card, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import RangeComponent from "./RangeComponent";
import { useFetcher, useLoaderData } from "@remix-run/react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogFooter,
} from "~/components/ui/dialog";
import { OnboardingFields } from "~/types/User";

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
  // onSave: (value: any) => void;
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
  // onSave,
  triggerIcon,
  minVal,
  maxVal,
  customComponents,
}: GeneralizableFormCardProps) {
  const initialData = useLoaderData<OnboardingFields>();

  const [inputValue, setInputValue] = useState<number | string | File>(
    initialData?.[fieldName] ?? (formType === "increment" ? 0 : "")
  );
  const [components, setComponents] = useState<ReactNode[]>(
    customComponents ? [customComponents] : []
  );

  // -----------------------------
  // form fetcher fields
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

  const formRef = useRef<HTMLFormElement>(null);

  const handleIncrement = (step: number) => {
    console.log("Incrementing", step);
    fetcher.submit(
      {
        "target-updated": formName,
        [fieldName]: ((inputValue as number) + step).toString(),
      },
      { method: "post" }
    );

    setInputValue((prev) => {
      if (typeof prev === "number") {
        return prev + step;
      } else {
        // Handle the case where `prev` is not a number, if necessary
        console.warn("Expected a number but got a different type");
        return prev;
      }
    });
  };

  const renderFormField = () => {
    switch (formType) {
      case "text":
        return (
          <Input
            type="text"
            placeholder="Enter text"
            value={inputValue as string}
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
            value={inputValue as number}
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
              value={inputValue as number}
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
              value={inputValue as string}
              name={fieldName}
              placeholder="Add content to describe yourself"
              onChange={(e) => setInputValue(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md"
              rows={6}
              maxLength={2000}
            />
            <div className="text-right text-sm text-gray-500">
              {(inputValue as string).length} / 2000 characters
            </div>
          </>
        );
      case "increment":
        return (
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="w-10 h-10"
              type="button"
              onClick={() => handleIncrement(-1)}
            >
              -
            </Button>
            <Input
              type="number"
              value={inputValue as number}
              name={fieldName}
              readOnly
              className="w-full p-3 border border-gray-300 rounded-md"
            />
            <Button
              variant="outline"
              className="w-10 h-10"
              type="button"
              onClick={() => {
                handleIncrement(1);
              }}
            >
              +
            </Button>
          </div>
        );
      case "video":
        return (
          <Input
            type="text"
            placeholder="Paste YouTube URL or upload video"
            value={inputValue as string}
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

      <Dialog>
        <DialogTrigger>
          <Button
            variant="outline"
            className="trigger flex items-center space-x-2 border border-gray-400"
            style={{
              borderWidth: "2px",
              borderColor: "#cbd5e1",
              borderRadius: "8px",
            }}
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
          {/* Display Success Message */}
          {showStatusMessage && fetcher.data?.success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
              <span className="block sm:inline">updated successfully</span>
            </div>
          )}
          <fetcher.Form method="post" className="space-y-6" ref={formRef}>
            <input type="hidden" name="target-updated" value={formName} />
            {renderFormField()}
            <DialogFooter>
              <Button
                type="submit"
                className="action bg-blue-600 text-white px-4 py-2 rounded-lg"
              >
                Save
              </Button>
            </DialogFooter>
          </fetcher.Form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

export default GeneralizableFormCard;
