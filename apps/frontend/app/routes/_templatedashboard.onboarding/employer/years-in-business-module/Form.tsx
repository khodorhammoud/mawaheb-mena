import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { useActionData, useLoaderData, useSubmit } from "@remix-run/react";
import { SlBadge } from "react-icons/sl";
import { Employer } from "~/types/User";

// Define the type for the action data
interface ActionData {
  success?: boolean;
  error?: {
    message: string;
  };
}

export default function YearsInBusinessCard() {
  const actionData = useActionData<ActionData>();
  const { yearsInBusiness: initialYearsInBusiness, currentUser } =
    useLoaderData<{
      yearsInBusiness: number;
      currentUser: Employer;
    }>();

  const [open, setOpen] = useState(false);
  const [yearsInBusiness, setYearsInBusiness] = useState(
    initialYearsInBusiness || 1
  );
  const [showMessage, setShowMessage] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [message, setMessage] = useState(""); // State for dynamic message
  const [messageType, setMessageType] = useState<"success" | "error">(
    "success"
  ); // Track message type
  const [cumulativeCount, setCumulativeCount] = useState(0); // New state for tracking cumulative count
  const submit = useSubmit(); // Hook for submitting the form programmatically

  useEffect(() => {
    if (formSubmitted && (actionData?.success || actionData?.error)) {
      setShowMessage(true); // Show the message when form is submitted
      setFormSubmitted(false); // Reset formSubmitted to prevent showing the message again without a new submission
    }
  }, [actionData, formSubmitted]);

  // Reset the message and cumulative count when the dialog is closed
  const handleDialogChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setShowMessage(false); // Clear the message when dialog is closed
      setCumulativeCount(0); // Reset cumulative count when dialog is closed
    }
  };

  const handleYearsChange = (
    value: number,
    action: "increase" | "decrease"
  ) => {
    setYearsInBusiness(value);
    setFormSubmitted(true);

    // Reset the cumulative count to 1 if the action type changes, otherwise increment
    setCumulativeCount((prev) => {
      if (
        (action === "increase" && messageType === "error") ||
        (action === "decrease" && messageType === "success")
      ) {
        return 1; // Reset the count if the action type changes
      } else {
        return prev + 1; // Otherwise, increment the count
      }
    });

    // Update the message and message type based on the action
    const newCount =
      (action === "increase" && messageType === "error") ||
      (action === "decrease" && messageType === "success")
        ? 1
        : cumulativeCount + 1;

    if (action === "increase") {
      setMessage(`${newCount} year${newCount > 1 ? "s" : ""} added`);
      setMessageType("success");
    } else if (action === "decrease") {
      setMessage(`${newCount} year${newCount > 1 ? "s" : ""} removed`);
      setMessageType("error");
    }

    // Submit the form programmatically
    submit(
      {
        "target-updated": "years-in-business",
        userId: currentUser.account?.user?.id,
        "years-in-business": value.toString(),
      },
      { method: "post" }
    );
  };

  const increaseYears = () => {
    if (yearsInBusiness < 30) {
      handleYearsChange(yearsInBusiness + 1, "increase");
    }
  };

  const decreaseYears = () => {
    if (yearsInBusiness > 1) {
      handleYearsChange(yearsInBusiness - 1, "decrease");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Years in Business</CardTitle>
      </CardHeader>
      <CardContent>
        <Dialog open={open} onOpenChange={handleDialogChange}>
          <DialogTrigger asChild>
            <Button variant="link">
              <SlBadge className="text-lg mr-2" />
              {yearsInBusiness} years in business {/* Display years */}
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white p-6">
            <DialogHeader>
              <DialogTitle>Years in business</DialogTitle>
            </DialogHeader>

            {/* Display Message */}
            {/* {showMessage &&
              messageType === "success" &&
              actionData?.success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
                  <strong className="font-bold">Success! </strong>
                  <span className="block sm:inline">{message}</span>
                </div>
              )} */}
            {showMessage && messageType === "error" && actionData?.error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                <span className="block sm:inline">{message}</span>
              </div>
            )}

            <div className="flex items-center justify-center space-x-4 my-4">
              {/* Decrease Button */}
              <Button
                variant="outline"
                className="w-10 h-10"
                onClick={decreaseYears}
              >
                -
              </Button>

              {/* Display Current Years */}
              <Input
                value={yearsInBusiness}
                className="text-center w-16 h-10"
                name="years-in-business"
                min={1}
                max={30}
                readOnly // Make the input read-only
              />

              {/* Increase Button */}
              <Button
                variant="outline"
                className="w-10 h-10"
                onClick={increaseYears}
              >
                +
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
