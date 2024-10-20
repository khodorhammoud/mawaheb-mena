import React, { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogClose,
} from "@radix-ui/react-dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../../../components/ui/card";
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";
import { Employer } from "~/types/User";

// Define ActionData type for TypeScript safety
interface ActionData {
  success?: boolean;
  error?: { message: string };
}

const UserAboutPopup = () => {
  const { aboutContent, currentUser } = useLoaderData<{
    aboutContent: string;
    currentUser: Employer;
  }>(); // Fetch initial aboutContent and user
  const [isOpen, setIsOpen] = useState(false);
  const [about, setAbout] = useState(aboutContent || ""); // About state

  const actionData = useActionData<ActionData>(); // Handle form response
  const navigation = useNavigation(); // Get navigation state (e.g., submitting)

  const handleAboutChange = (e: React.ChangeEvent<HTMLTextAreaElement>) =>
    setAbout(e.target.value); // Update about state

  return (
    <>
      <Card className="border border-gray-200 rounded-lg shadow-md md:w-[350px] mt-10">
        <CardHeader className="p-4">
          <CardTitle className="text-xl font-semibold">About</CardTitle>
          <CardDescription className="text-sm text-gray-500 mt-2">
            {aboutContent ? (
              <span>{aboutContent}</span>
            ) : (
              "Add your headline and bio. Share more about yourself and what you hope to accomplish."
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <button className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition">
                {aboutContent ? "Edit Bio" : "Add Bio"}
              </button>
            </DialogTrigger>
            <DialogContent className="fixed inset-0 flex items-center justify-center p-4 bg-black/50">
              <div className="w-full max-w-md bg-white rounded-lg p-6 shadow-lg">
                <div className="flex justify-between items-center mb-4">
                  <DialogTitle className="text-xl font-semibold">
                    {aboutContent ? "Edit Your Bio" : "Add Your Bio"}
                  </DialogTitle>
                  <DialogClose asChild>
                    <button className="text-gray-500 hover:text-black">
                      ✕
                    </button>
                  </DialogClose>
                </div>

                {actionData?.error && (
                  <div className="bg-red-100 text-red-700 px-4 py-3 rounded mb-4">
                    <strong>Error: </strong> {actionData.error.message}
                  </div>
                )}
                {actionData?.success && (
                  <div className="bg-green-100 text-green-700 px-4 py-3 rounded mb-4">
                    About section updated successfully!
                  </div>
                )}

                <Form method="post" className="grid gap-4">
                  <input
                    type="hidden"
                    name="userId"
                    value={currentUser.account?.user?.id} // Pass the userId dynamically
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
                  <div className="flex justify-end gap-2">
                    <DialogClose asChild>
                      <button className="bg-gray-200 text-black px-4 py-2 rounded-md hover:bg-gray-300 transition">
                        Cancel
                      </button>
                    </DialogClose>
                    <button
                      type="submit"
                      disabled={navigation.state === "submitting"}
                      className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition disabled:opacity-50"
                    >
                      {navigation.state === "submitting" ? "Saving..." : "Save"}
                    </button>
                  </div>
                </Form>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </>
  );
};

export default UserAboutPopup;
