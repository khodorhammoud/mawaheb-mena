import LayoutContainer from "../../common/layout_container";
import Achievements from "../_templateheaderfooter.for-freelancers/achievements";
import Topic from "./topic";
import MoreAboutMawaheb from "./moreaboutmawaheb";
import Swiper from "./swiper";

export default function AboutUsPage() {
  return (
    <LayoutContainer>
      <Topic />
      <MoreAboutMawaheb />
      <Swiper />
      {/* <HowWeMakeDifference /> */}
      {/*
      <Achievements />
      <TheTeam />
      <JoinUs /> */}
    </LayoutContainer>
  );
}
