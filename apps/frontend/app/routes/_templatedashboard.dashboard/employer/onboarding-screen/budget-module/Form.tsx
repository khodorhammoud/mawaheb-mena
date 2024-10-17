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

// Define the type for the action data
interface ActionData {
  success?: boolean;
  error?: {
    message: string;
  };
}

export default function BudgetModuleForm() {
  const actionData = useActionData<ActionData>();
  const { initialBudget } = useLoaderData<{ initialBudget: string }>(); // Fetch initial budget
  const [open, setOpen] = useState(false);
  const [budget, setBudget] = useState(initialBudget || "0");
  const [inputValue, setInputValue] = useState(budget); // Initialize input with initial budget value
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

  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const saveBudget = () => {
    setBudget(inputValue);
    setOpen(false);
  };

  return (
    <Card className="w-[350px] border border-dashed border-gray-300 rounded-lg">
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
              {budget ? `${budget}` : "Add Average Budget"}
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white rounded-lg p-6 shadow-lg w-[320px]">
            <DialogHeader>
              <DialogTitle className="text-center font-semibold text-xl mb-4">
                Add Average Budget
              </DialogTitle>
            </DialogHeader>
            <Form method="post" className="space-y-4">
              <input
                type="hidden"
                name="target-updated"
                value="employer-budget"
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
                onClick={saveBudget}
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
