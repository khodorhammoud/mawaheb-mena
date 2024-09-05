import LayoutContainer from "../../common/layout_container";
import Achievements from "../_templateheaderfooter.for-freelancers/Achievements";
import Topic from "./topic";
import MoreAboutMawaheb from "./moreaboutmawaheb";
import Swiper from "./swiper";
import HowWeMakeDifference from "./howwemakedifference";
import TheTeam from "./theteam";
import JoinUs from "./joinus";

export default function AboutUsPage() {
  return (
    <LayoutContainer>
      <Topic />
      <MoreAboutMawaheb />
      <Swiper />
      <HowWeMakeDifference />
      <Achievements />
      <TheTeam />
      <JoinUs />
    </LayoutContainer>
  );
}
