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
import { Employer } from "~/types/User";

// Define the type for the action data
interface ActionData {
  success?: boolean;
  error?: {
    message: string;
  };
}

export default function UserAboutPopup() {
  const actionData = useActionData<ActionData>();
  const { aboutContent, currentUser } = useLoaderData<{
    aboutContent: string;
    currentUser: Employer;
  }>();

  const [open, setOpen] = useState(false);
  const [about, setAbout] = useState(aboutContent || "");
  const [showMessage, setShowMessage] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);

  useEffect(() => {
    if (formSubmitted && (actionData?.success || actionData?.error)) {
      setShowMessage(true);
      setFormSubmitted(false);
    }
  }, [actionData, formSubmitted]);

  const handleDialogChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setShowMessage(false);
    }
  };

  const handleAboutChange = (e: React.ChangeEvent<HTMLTextAreaElement>) =>
    setAbout(e.target.value);

  const handleFormSubmit = () => {
    setFormSubmitted(true);
  };

  return (
    <Card className="w-[350px] border border-dashed border-gray-300 rounded-lg">
      <CardHeader className="p-4">
        <CardTitle className="text-lg font-semibold text-center">
          About
        </CardTitle>
        {/* Display about content from the database */}
        <p className="text-sm text-center text-gray-600 mt-2">
          {aboutContent
            ? aboutContent
            : "No information available. Add your bio!"}
        </p>
      </CardHeader>
      <CardContent className="p-4">
        <Dialog open={open} onOpenChange={handleDialogChange}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="flex items-center justify-center w-full py-3 border border-gray-300 rounded-lg hover:bg-gray-100"
            >
              {aboutContent ? "Edit Bio" : "Add Bio"}
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white rounded-lg p-6 shadow-lg w-[320px]">
            <DialogHeader>
              <DialogTitle className="text-center font-semibold text-xl mb-4">
                {aboutContent ? "Edit Your Bio" : "Add Your Bio"}
              </DialogTitle>
            </DialogHeader>

            {showMessage && actionData?.error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                <strong className="font-bold">Error! </strong>
                <span className="block sm:inline">
                  {actionData.error.message}
                </span>
              </div>
            )}
            {showMessage && actionData?.success && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
                <strong className="font-bold">Success! </strong>
                <span className="block sm:inline">
                  About section updated successfully
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
                name="userId"
                value={currentUser.account?.user?.id}
              />
              <input
                type="hidden"
                name="target-updated"
                value="employer-about"
              />
              <div className="grid gap-2">
                <label htmlFor="about" className="text-gray-700">
                  Tell us about yourself
                </label>
                <textarea
                  id="about"
                  name="about"
                  value={about}
                  onChange={handleAboutChange}
                  placeholder="Add content to describe yourself"
                  rows={6}
                  className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  maxLength={2000}
                />
                <div className="text-right text-sm text-gray-500">
                  {about.length} / 2000 characters
                </div>
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
