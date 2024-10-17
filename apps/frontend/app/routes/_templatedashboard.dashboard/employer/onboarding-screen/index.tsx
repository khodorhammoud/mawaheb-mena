// Import necessary components
import Heading from "./heading/Heading";
import YearsInBusiness from "./years-in-business-module/Form";
import About from "./about-module/Form";
import BudgetModuleForm from "./budget-module/Form";
import { Link } from "@remix-run/react";

export default function Body() {
  return (
    <div>
      <Heading />
      <div className="flex justify-between mb-4">
        <BudgetModuleForm />
        <YearsInBusiness />
      </div>
      <About />
      <div className="mt-6 flex justify-center">
        {/* Button to navigate to another page */}
        <Link
          to="../dashboard/dashboard-screen/index.tsx"
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
        >
          Proceed
        </Link>
      </div>
    </div>
  );
}
