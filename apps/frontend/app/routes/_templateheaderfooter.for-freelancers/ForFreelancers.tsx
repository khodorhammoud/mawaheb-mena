// i edit here and as the components i'll make in the comming days

import "../../styles/wavy/wavy.css";
import LayoutContainer from "../../common/layout_container";
import HowItWorks from "../_templateheaderfooter.for-employers/howitworks/HowItWorks";
import Segments from "../_templateheaderfooter.for-employers/Segments";
import Languages from "../_templateheaderfooter.for-employers/Languages";
import MainHeading from "../../common/MainHeading";
import FAQ from "../_templateheaderfooter.for-employers/FAQ";
import Topic from "./topic";
import Jobs from "./jobs";
import Achievements from "./achievements";

export default function ForFreelancersPage() {
  return (
    <LayoutContainer>
      <div className="-mx-4">
        <Topic />
      </div>
      <Jobs />
      <div className="-mb-52">
        <Achievements />
      </div>
      <HowItWorks />
      <Segments />
      <Languages />
      <MainHeading
        title="WHY WORK WITH US?"
        description="At Mawaheb we understand the complexities involved in hiring freelancers. That's why we've streamlined the process to make it as effortless as possible for our clients. From handling all regulatory and legal obligations to ensuring compliance with industry standards, we take care of every detail so you can focus on your business goals. Trust us to navigate the intricacies of hiring, allowing you to enjoy a hassle-free experience from start to finish."
      />
      <div className="mb-20">
        <FAQ />
      </div>
    </LayoutContainer>
  );
}
