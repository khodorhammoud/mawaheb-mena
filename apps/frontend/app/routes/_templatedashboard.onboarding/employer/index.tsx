import Heading from "./heading/Heading";
import YearsInBusiness from "./years-in-business-module/Form";
import About from "./about-module/Form";
import BudgetModuleForm from "./budget-module/Form";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import type { Employer } from "~/types/User";
import HourlyRate from "./hourlyRate";
import GeneralizableFormCard from "./generaliziableFormCard";
export default function EmployerOnboardingScreen() {
  // Use loader data to retrieve the user information
  const { currentUser } = useLoaderData<{ currentUser: Employer }>();

  type ActionData = {
    error?: { message: string };
  };
  const actionData = useActionData<ActionData>();

  return (
    <div className="mt-20">
      <Heading />
      <div className="flex justify-between mb-4">
        <BudgetModuleForm />
        <YearsInBusiness />
        <HourlyRate />
        {/* 
        "text"
    | "number"
    | "textArea"
    | "increment"
    | "video"
    | "file"
    | "custom";
        */}
        <GeneralizableFormCard
          formType="text"
          title="Text"
          triggerLabel="Trigger Label"
          onSave={() => alert("save")}
        />
        <GeneralizableFormCard
          formType="number"
          title="Number"
          triggerLabel="Trigger Label"
          onSave={() => alert("save")}
        />
        <GeneralizableFormCard
          formType="textArea"
          title="Text Area"
          triggerLabel="Trigger Label"
          onSave={() => alert("save")}
        />
        <GeneralizableFormCard
          formType="increment"
          title="Increment"
          triggerLabel="Trigger Label"
          onSave={() => alert("save")}
        />
        <GeneralizableFormCard
          formType="video"
          title="Video"
          triggerLabel="Trigger Label"
          onSave={() => alert("save")}
        />
        <GeneralizableFormCard
          formType="file"
          title="File"
          triggerLabel="Trigger Label"
          onSave={() => alert("save")}
        />
        <GeneralizableFormCard
          formType="custom"
          title="Custom"
          triggerLabel="Trigger Label"
          onSave={() => alert("save")}
          customComponents={[
            <div key="custom-component">Custom Component</div>,
          ]}
        />
      </div>
      <About />
      <div className="mt-6 flex justify-center">
        {/* Form to update the user's onboard status */}
        <Form method="post">
          {/* this input sends the userId to be used in the action (queries, ....) */}
          <input
            type="hidden"
            name="userId"
            value={currentUser.account.user.id}
          />
          <input type="hidden" name="target-updated" value="employer-onboard" />
          {/* in the switch case, use value employer-onboard */}
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
          >
            Proceed
          </button>
        </Form>
        {actionData?.error && (
          <p className="text-red-500 mt-2">{actionData.error.message}</p>
        )}
      </div>
    </div>
  );
}
