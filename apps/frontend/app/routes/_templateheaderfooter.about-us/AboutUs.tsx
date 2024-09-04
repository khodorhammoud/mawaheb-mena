import LayoutContainer from "../../common/layout_container";
import Achievements from "../_templateheaderfooter.for-freelancers/achievements";
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

// <motion.a
//           href="mailto:apply@mawaheb.mena"
//           className="w-52 h-52 bg-white text-primaryColor rounded-full flex items-center justify-center text-lg font-bold shadow-lg cursor-pointer"
//           whileHover={{
//             scale: 1.1,
//             boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.3)",
//           }}
//           transition={{ duration: 0.3 }}
//         >
//           apply@mawaheb.mena
//         </motion.a>
