import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import {
  Form,
  useActionData,
  useNavigation,
  useLoaderData,
} from "@remix-run/react";
import { SlBadge } from "react-icons/sl";

// Define the type for the action data
interface ActionData {
  success?: boolean;
  error?: {
    message: string;
  };
}

export default function YearsInBusinessCard() {
  const actionData = useActionData<ActionData>();
  const { yearsInBusiness: initialYearsInBusiness } = useLoaderData<{
    yearsInBusiness: number;
  }>(); // Fetch initial years
  const [open, setOpen] = useState(false);
  const [yearsInBusiness, setYearsInBusiness] = useState(
    initialYearsInBusiness || 1
  );
  const [showMessage, setShowMessage] = useState(false); // Track message visibility

  // Show the message if the form is submitted successfully or if there's an error
  useEffect(() => {
    if (actionData?.success || actionData?.error) {
      setShowMessage(true); // Show the message when form is submitted
    }
  }, [actionData]);

  // Reset the message when the dialog is closed and reopened
  const handleDialogChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setShowMessage(false); // Clear the message when dialog is closed
    }
  };

  const handleYearsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setYearsInBusiness(Number(e.target.value));
  };

  const increaseYears = () => {
    setYearsInBusiness((prev) => (prev < 30 ? prev + 1 : prev));
  };

  const decreaseYears = () => {
    setYearsInBusiness((prev) => (prev > 1 ? prev - 1 : prev));
  };

  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Years in Business</CardTitle>
      </CardHeader>
      <CardContent>
        <Dialog open={open} onOpenChange={handleDialogChange}>
          <DialogTrigger asChild>
            <Button variant="link">
              <SlBadge className="text-lg mr-2" />
              {/* here */}
              {yearsInBusiness} years in business{" "}
              {/* Display years nb beside the button */}
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white p-6">
            <DialogHeader>
              <DialogTitle>Years in business</DialogTitle>
            </DialogHeader>

            {/* Display Error Message */}
            {showMessage && actionData?.error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                <strong className="font-bold">Error! </strong>
                <span className="block sm:inline">
                  {actionData.error.message}
                </span>
              </div>
            )}
            {/* Display Success Message */}
            {showMessage && actionData?.success && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
                <strong className="font-bold">Success! </strong>
                <span className="block sm:inline">
                  Years in Business added successfully
                </span>
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

              {/* Form */}
              <Form method="post" id="experience-form">
                <input
                  type="hidden"
                  name="target-updated"
                  value="employer-years-in-business"
                />
                {/* Display Current Years */}
                <Input
                  value={yearsInBusiness}
                  className="text-center w-16 h-10"
                  name="years-in-business"
                  min={1}
                  max={30}
                  onChange={handleYearsChange}
                />
              </Form>

              {/* Increase Button */}
              <Button
                variant="outline"
                className="w-10 h-10"
                onClick={increaseYears}
              >
                +
              </Button>
            </div>

            {/* Submit Button */}
            <DialogFooter className="mt-4">
              <Button className="px-6" type="submit" form="experience-form">
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
