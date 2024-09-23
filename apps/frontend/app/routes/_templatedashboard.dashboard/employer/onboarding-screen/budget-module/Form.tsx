// CardComponent.tsx
import { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { BsCurrencyDollar } from "react-icons/bs";
import { ActionFunctionArgs, json } from "@remix-run/node";
import { useActionData, Form } from "@remix-run/react";

/* export async function action({ request }: ActionFunctionArgs) {
  console.log("submitting form");
  return json({ success: true });
} */

export default function CardComponent() {
  const actionData = useActionData();

  const [open, setOpen] = useState(false); // Dialog state
  const [budget, setBudget] = useState<string | null>(null); // To store the inputted budget
  const [inputValue, setInputValue] = useState(""); // To control input field

  const handleSave = () => {
    setBudget(inputValue); // Save the input to the card
    setOpen(false); // Close the dialog
  };

  return (
    <div className="p-4 rounded-lg border-2 border-dashed border-gray-300 w-64">
      <h3 className="text-lg font-semibold mb-2">Average Project Budget</h3>
      <div className="flex items-center">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="link">
              {budget ? (
                <span>{budget}</span>
              ) : (
                <>
                  <BsCurrencyDollar />{" "}
                  <span className="ml-2">Add Average Budget</span>
                </>
              )}
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white">
            <DialogHeader>
              <DialogTitle>
                Add Average Budget
                {JSON.stringify(actionData)}
              </DialogTitle>
            </DialogHeader>
            <Form method="post" className="space-y-6">
              <Input
                placeholder="Enter amount"
                type="text"
                value={inputValue}
                name="ha"
                onChange={(e) => setInputValue(e.target.value)}
              />
              <button type="submit">ssssave</button>
            </Form>

            <Input
              placeholder="Enter amount"
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <DialogFooter>
              <Button onClick={handleSave}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
