import { json, LoaderFunctionArgs } from "@remix-run/node";
import Home from "~/routes/_templateheaderfooter.for-employers/Home";
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
  GET_MEET_THE_TEAM_QUERY, // Adding the MeetTheTeam query here
  GET_WANT_TO_JOIN_US_QUERY, // Adding the WantToJoinUs query here
} from "../../../shared/cms-queries";

// Define interfaces for the fetched data
interface HowItWorksItem {
  stepNb: number;
  title: string;
  description: string;
  imageUrl?: string;
}

interface SubHeadline {
  content: string;
}

interface Feature {
  title: string;
  description: string;
}

interface PostHowItWorksItem {
  content: string;
}

interface PreWhatTheySayAboutUs {
  content: string;
}

interface WhyWorkWithUs {
  title: string;
  description: string;
}

interface FAQ {
  faqNb: number;
  faqQuestion: string;
  faqAnswer: string;
}

interface Testimonial {
  iconSVG?: string;
  comment: string;
  imageURL?: string;
  name: string;
  role: string;
}

interface BlogCard {
  imageURL?: string;
  name?: string;
  readFrom: string;
  content: string;
}

interface Job {
  id: string;
  jobTitle: string;
  postedFrom: number;
  priceAmout: number;
  priceType: string;
  levelRequired: string;
  jobDesc: string;
  jobSkills: { id: string; name: string };
}

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
  id: number;
  title: string;
  description: string;
  iconSVG?: string;
  belongingText: string;
}

// Define MeetTheTeam interface
interface TeamMember {
  name: string;
  position: string;
  role: string;
  imageURL: string;
}

interface MeetTheTeam {
  subHeadline: SubHeadline;
  members: TeamMember[];
}

interface WantToJoinUs {
  title: string;
  subHeadline: {
    content: string;
  };
  emailbutton: string;
}

interface LoaderData {
  subHeadline: SubHeadline;
  howItWorksItems: HowItWorksItem[];
  features: Feature[];
  postHowItWorks: PostHowItWorksItem;
  preWhatTheySayAboutUs: PreWhatTheySayAboutUs;
  whyWorkWithUsSection: WhyWorkWithUs[];
  faqSection: FAQ[];
  testimonialsSection: Testimonial[];
  blogCardSection: BlogCard[];
  jobSection: Job[];
  achievementSection: Achievement[];
  mawahebSection: Mawaheb[];
  imageSwiperSection: ImageSwiper[];
  howWeMakeDiffSection: HowWeMakeDiff[];
  meetTheTeamSection: MeetTheTeam[];
  wantToJoinUsSection: WantToJoinUs[]; // Adding WantToJoinUs section
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
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
    GET_MEET_THE_TEAM_QUERY, // Fetching the MeetTheTeam query
    GET_WANT_TO_JOIN_US_QUERY, // Fetching the WantToJoinUs query
  ]);

  // Extract data or provide default values
  const subHeadline: SubHeadline = dataResponse[1]?.data
    ?.forEmployersSubHeadlines?.[0] || {
    content: "Default forEmployersSubheadline content",
  };

  const howItWorksItems: HowItWorksItem[] =
    dataResponse[2]?.data?.howItWorksItems || [];
  const features: Feature[] = dataResponse[0]?.data?.features || [];
  const postHowItWorks: PostHowItWorksItem = dataResponse[3]?.data
    ?.postHowItWorksSection?.[0] || {
    content: "Default PostHowItWorks content",
  };
  const preWhatTheySayAboutUs: PreWhatTheySayAboutUs = dataResponse[4]?.data
    ?.preWhatTheySayAboutUsSection?.[0] || {
    content: "Default PreWhatTheySayAboutUs content",
  };
  const whyWorkWithUsSection: WhyWorkWithUs[] =
    dataResponse[5]?.data?.whyWorkWithUsSection || [];
  const faqSection: FAQ[] = dataResponse[6]?.data?.faqSection || [];
  const testimonialsSection: Testimonial[] =
    dataResponse[7]?.data?.testimonialsSection || [];
  const blogCardSection: BlogCard[] =
    dataResponse[8]?.data?.blogCardSection || [];
  const jobSection: Job[] = dataResponse[9]?.data?.jobSection || [];
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

  console.log(
    "Full Data Response from CMS:",
    JSON.stringify(dataResponse, null, 2)
  );

  // Log individual extracted data for debugging
  console.log("Extracted Subheadline:", subHeadline);
  console.log("Extracted How It Works Items:", howItWorksItems);
  console.log("Extracted Features:", features);
  console.log("Extracted Post How It Works:", postHowItWorks);
  console.log("Extracted Pre What They Say About Us:", preWhatTheySayAboutUs);
  console.log("Extracted Why Work With Us:", whyWorkWithUsSection);
  console.log("Extracted FAQs:", faqSection);
  console.log("Extracted Testimonials:", testimonialsSection);
  console.log("Extracted Blog Cards:", blogCardSection);
  console.log("Extracted Job Data:", jobSection);
  console.log("Extracted Achievements:", achievementSection);
  console.log("Extracted Mawaheb Data:", mawahebSection);
  console.log("Extracted ImageSwiper Data:", imageSwiperSection);
  console.log("Extracted HowWeMakeDiff Data:", howWeMakeDiffSection);
  console.log("Extracted MeetTheTeam Data:", meetTheTeamSection);
  console.log("Extracted WantToJoinUs Data:", wantToJoinUsSection);

  // Return all the extracted data
  return json<LoaderData>({
    subHeadline,
    howItWorksItems,
    features,
    postHowItWorks,
    preWhatTheySayAboutUs,
    whyWorkWithUsSection,
    faqSection,
    testimonialsSection,
    blogCardSection,
    jobSection,
    achievementSection,
    mawahebSection,
    imageSwiperSection,
    howWeMakeDiffSection,
    meetTheTeamSection, // Return MeetTheTeam data
    wantToJoinUsSection, // Return WantToJoinUs data
  });
};

export default function Layout() {
  return (
    <div
      className="container"
      style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}
    >
      <Home />
    </div>
  );
}
