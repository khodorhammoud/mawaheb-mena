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
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { BsCurrencyDollar } from "react-icons/bs";
// import { Employer } from "~/types/User";

// Define the type for the action data
interface ActionData {
  success?: boolean;
  error?: {
    message: string;
  };
}

export default function BudgetModuleForm() {
  const actionData = useActionData<ActionData>();
  const { employerBudget /* , currentProfile */ } = useLoaderData<{
    employerBudget: number;
    /* currentProfile: Employer; */
  }>(); // Fetch the employer budget and user

  const [open, setOpen] = useState(false);
  const [budget, setBudget] = useState(employerBudget?.toString() || "0");
  const [inputValue, setInputValue] = useState(budget);
  const [showMessage, setShowMessage] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false); // Track if form was submitted

  useEffect(() => {
    if (formSubmitted && (actionData?.success || actionData?.error)) {
      setShowMessage(true); // Show the message when form is submitted
      setFormSubmitted(false); // Reset formSubmitted to prevent showing the message again without a new submission
    }
  }, [actionData, formSubmitted]);

  const handleDialogChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setShowMessage(false); // Clear the message when dialog is closed
    }
  };

  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    setInputValue(value);
  };

  // Update budget state after successful form submission
  useEffect(() => {
    if (actionData?.success) {
      setBudget(parseFloat(inputValue).toString());
    }
  }, [actionData?.success]);

  // Handle form submission to set formSubmitted to true
  const handleFormSubmit = () => {
    setFormSubmitted(true);
  };

  return (
    <Card className="border border-dashed border-gray-300 rounded-lg">
      <CardHeader className="p-4">
        <CardTitle className="text-lg font-semibold text-center">
          Average Project Budget
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <Dialog open={open} onOpenChange={handleDialogChange}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="flex items-center justify-center w-full py-3 border border-gray-300 rounded-lg hover:bg-gray-100"
            >
              <BsCurrencyDollar className="text-lg mr-2" />
              {budget !== "0" ? ` ${budget}` : "Add Average Budget"}
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white rounded-lg p-6 shadow-lg w-[320px]">
            <DialogHeader>
              <DialogTitle className="text-center font-semibold text-xl mb-4">
                Add Average Budget
              </DialogTitle>
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
                <span className="block sm:inline">
                  Budget updated successfully
                </span>
              </div>
            )}

            <Form
              method="post"
              className="space-y-4"
              onSubmit={handleFormSubmit}
            >
              <input
                type="hidden"
                name="target-updated"
                value="employerbudget"
              />
              <div className="flex items-center justify-center border border-gray-300 rounded-md px-4 py-2">
                <Input
                  placeholder="Enter amount"
                  type="text"
                  value={inputValue}
                  name="budget"
                  onChange={handleBudgetChange}
                  className="w-full"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded-md font-medium hover:bg-blue-700"
              >
                Save
              </button>
            </Form>
            <DialogFooter className="flex justify-center mt-4">
              <Button
                variant="ghost"
                type="button"
                onClick={() => setOpen(false)}
                className="text-gray-500"
              >
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
