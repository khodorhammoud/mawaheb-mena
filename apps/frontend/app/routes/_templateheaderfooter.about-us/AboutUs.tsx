import "~/styles/wavy/wavy.css";
import { motion } from "framer-motion";
import LayoutContainer from "../../common/layout_container";
import Achievements from "../_templateheaderfooter.for-freelancers/achievements";
import Topic from "./topic";

export default function ForFreelancersPage() {
  return (
    <LayoutContainer>
      <Topic />
      {/* <MoreAboutMawaheb />
      <Swiper />
      <HowWeMakeDifference />
      <Achievements />
      <TheTeam />
      <JoinUs /> */}
    </LayoutContainer>
  );
}
