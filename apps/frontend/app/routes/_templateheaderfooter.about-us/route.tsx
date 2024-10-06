import AboutUsPage from "./AboutUs";
import { json, LoaderFunctionArgs } from "@remix-run/node";
import { fetchCMSData } from "~/api/fetch-cms-data.server";
import {
  GET_FEATURES_QUERY,
  GET_FOREMPLOYERSSUBHEADLINE_QUERY,
  GET_HOW_IT_WORKS_QUERY,
  GET_POSTHOWITWORKS_QUERY,
  GET_PREWHATTHEYSAYABOUTUS_QUERY,
  GET_WHYWORKWITHUS_QUERY,
  GET_FAQS_QUERY,
  GET_TESTIMONIALS_QUERY,
  GET_BLOG_CARDS_QUERY,
  GET_ALL_JOBS_QUERY,
  GET_ACHIEVEMENTS_QUERY,
  GET_MAWAHEB_QUERY,
  GET_IMAGE_SWIPER_QUERY,
  GET_HOW_WE_MAKE_DIFF_QUERY,
  GET_MEET_THE_TEAM_QUERY, // Add the MeetTheTeam query here
  GET_WANT_TO_JOIN_US_QUERY, // Add the WantToJoinUs query here
} from "../../../../shared/cms-queries";

// Define interfaces for the data to be fetched
interface Achievement {
  title: string;
  count: number;
  desc: string;
}

interface MawahebTopic {
  topic: string;
}

interface MawahebDescription {
  description: string;
}

interface Mawaheb {
  mawahebTopics: MawahebTopic[];
  mawahebDescription: MawahebDescription[];
}

interface ImageSwiper {
  imageURL: string;
}

interface HowWeMakeDiff {
  id: string;
  title: string;
  description: string;
  iconSVG?: string;
  belongingText: string;
}

interface MeetTheTeam {
  subHeadline: { content: string };
  members: {
    name: string;
    position: string;
    role: string;
    imageURL: string;
  }[];
}

interface WantToJoinUs {
  title: string;
  subHeadline: {
    content: string;
  };
  emailbutton: string;
}

// Define the LoaderData interface for the JSON return type
interface LoaderData {
  achievementSection: Achievement[];
  mawahebSection: Mawaheb[];
  imageSwiperSection: ImageSwiper[];
  howWeMakeDiffSection: HowWeMakeDiff[];
  meetTheTeamSection: MeetTheTeam[]; // Fix naming here
  wantToJoinUsSection: WantToJoinUs[]; // Add WantToJoinUs section data
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  // Fetch data from the CMS using multiple GraphQL queries
  const dataResponse = await fetchCMSData([
    GET_FEATURES_QUERY,
    GET_FOREMPLOYERSSUBHEADLINE_QUERY,
    GET_HOW_IT_WORKS_QUERY,
    GET_POSTHOWITWORKS_QUERY,
    GET_PREWHATTHEYSAYABOUTUS_QUERY,
    GET_WHYWORKWITHUS_QUERY,
    GET_FAQS_QUERY,
    GET_TESTIMONIALS_QUERY,
    GET_BLOG_CARDS_QUERY,
    GET_ALL_JOBS_QUERY,
    GET_ACHIEVEMENTS_QUERY,
    GET_MAWAHEB_QUERY,
    GET_IMAGE_SWIPER_QUERY,
    GET_HOW_WE_MAKE_DIFF_QUERY,
    GET_MEET_THE_TEAM_QUERY, // Fetching MeetTheTeam data
    GET_WANT_TO_JOIN_US_QUERY, // Fetching WantToJoinUs data
  ]);

  console.log(JSON.stringify(dataResponse, null, 2));

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
    dataResponse[14]?.data?.meetTheTeamSection || []; // Use the correct name here

  const wantToJoinUsSection: WantToJoinUs[] =
    dataResponse[15]?.data?.wantToJoinUsSection || []; // Extract WantToJoinUs data

  // Log individual extracted data for debugging
  console.log("Extracted Achievements:", achievementSection);
  console.log("Extracted Mawaheb Data:", mawahebSection);
  console.log("Extracted ImageSwiper Data:", imageSwiperSection);
  console.log("Extracted HowWeMakeDiff Data:", howWeMakeDiffSection);
  console.log("Extracted MeetTheTeam Data:", meetTheTeamSection);
  console.log("Extracted WantToJoinUs Data:", wantToJoinUsSection);
  console.log("about-us now");

  return json<LoaderData>({
    achievementSection,
    mawahebSection,
    imageSwiperSection,
    howWeMakeDiffSection, // Return HowWeMakeDiff data
    meetTheTeamSection, // Return MeetTheTeam data with the correct name
    wantToJoinUsSection, // Return WantToJoinUs data
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
