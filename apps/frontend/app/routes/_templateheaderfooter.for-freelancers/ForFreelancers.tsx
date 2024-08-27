// i edit here and as the components i'll make in the comming days

import "~/styles/wavy/wavy.css";
import { motion } from "framer-motion";
import React from "react";
import LayoutContainer from "../../common/layout_container";
import { useNavigate } from "@remix-run/react";
import HowItWorks from "../_templateheaderfooter.home/howitworks/howitworks";
import Segments from "../_templateheaderfooter.home/segments";
import Languages from "../_templateheaderfooter.home/languages";
import Wtsau from "../_templateheaderfooter.home/wtsau";
import MainHeading from "~/common/main_heading";
import FAQ from "../_templateheaderfooter.home/faq";
import Topic from "./topic";
import Jobs from "./jobs";

export default function ForFreelancersPage() {
  const navigate = useNavigate();
  return (
    <LayoutContainer>
      <div className="-mx-4">
        <Topic />
      </div>
      <Jobs />
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
