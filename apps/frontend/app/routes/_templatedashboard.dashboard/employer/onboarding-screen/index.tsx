import Heading from "./heading/Heading";
import ProjectBudget from "./budget-module/Form";
import YearsInBusiness from "./years-in-business-module/Form";
import About from "./about-module/Form";
export default function Body() {
  return (
    <div>
      <Heading />
      <div className="flex justify-between">
        <ProjectBudget />
        <YearsInBusiness />
      </div>
      <About />
    </div>
  );
}
