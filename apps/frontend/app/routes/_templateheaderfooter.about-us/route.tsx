import AboutUsPage from "./AboutUs";
import { json, LoaderFunctionArgs } from "@remix-run/node";
import { fetchCMSData } from "~/api/fetch-cms-data.server";
import {
  GET_ACHIEVEMENTS_QUERY,
  GET_MAWAHEB_QUERY,
  GET_IMAGE_SWIPER_QUERY,
  GET_HOW_WE_MAKE_DIFF_QUERY,
  GET_MEET_THE_TEAM_QUERY,
  GET_WANT_TO_JOIN_US_QUERY,
} from "../../../../shared/cms-queries";
import {
  Achievement,
  Mawaheb,
  ImageSwiper,
  HowWeMakeDiff,
  MeetTheTeam,
  WantToJoinUs,
} from "../../types/PageContent";

interface LoaderData {
  achievementSection: Achievement[];
  mawahebSection: Mawaheb[];
  imageSwiperSection: ImageSwiper[];
  howWeMakeDiffSection: HowWeMakeDiff[];
  meetTheTeamSection: MeetTheTeam[];
  wantToJoinUsSection: WantToJoinUs[];
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const dataResponse = await fetchCMSData([
    GET_ACHIEVEMENTS_QUERY,
    GET_MAWAHEB_QUERY,
    GET_IMAGE_SWIPER_QUERY,
    GET_HOW_WE_MAKE_DIFF_QUERY,
    GET_MEET_THE_TEAM_QUERY,
    GET_WANT_TO_JOIN_US_QUERY,
  ]);

  const achievementSection: Achievement[] =
    dataResponse[10]?.data?.achievementSection || [];

  const mawahebSection: Mawaheb[] =
    dataResponse[11]?.data?.mawahebSection?.map((item: any) => ({
      mawahebTopics: item.mawahebTopics || [],
      mawahebDescription: item.mawahebDescription || [],
    })) || [];

  const imageSwiperSection: ImageSwiper[] =
    dataResponse[12]?.data?.imageSwiperSection || [];

  const howWeMakeDiffSection: HowWeMakeDiff[] =
    dataResponse[13]?.data?.howWeMakeDiffSection || [];

  const meetTheTeamSection: MeetTheTeam[] =
    dataResponse[14]?.data?.meetTheTeamSection || [];

  const wantToJoinUsSection: WantToJoinUs[] =
    dataResponse[15]?.data?.wantToJoinUsSection || [];

  return json<LoaderData>({
    achievementSection,
    mawahebSection,
    imageSwiperSection,
    howWeMakeDiffSection,
    meetTheTeamSection,
    wantToJoinUsSection,
  });
};

export default function Layout() {
  return (
    <div
      className="container"
      style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}
    >
      <AboutUsPage />
    </div>
  );
}
