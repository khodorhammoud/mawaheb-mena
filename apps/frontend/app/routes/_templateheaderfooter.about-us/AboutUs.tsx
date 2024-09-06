import LayoutContainer from "../../common/layout_container";
import Achievements from "../_templateheaderfooter.for-freelancers/Achievements";
import Topic from "./Topic";
import MoreAboutMawaheb from "./MoreAboutMawaheb";
import Swiper from "./Swiper";
import HowWeMakeDifference from "./HowWeMakeDifference";
import TheTeam from "./TheTeam";
import JoinUs from "./JoinUs";

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
