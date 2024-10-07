// that route.tsx is for forFrelancers page, and i dont need edit on it // that was on the past 😂
import { json, LoaderFunctionArgs } from "@remix-run/node";
import ForFreelancersPage from "./ForFreelancers";
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
} from "../../../../shared/cms-queries"; // the problem here is that i cant delete anything in the loader here eventhough i dont need the subheadline or features or blogCards

interface HowItWorksItem {
  stepNb: number;
  title: string;
  description: string;
  imageUrl?: string;
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

interface LoaderData {
  howItWorksItems: HowItWorksItem[];
  preWhatTheySayAboutUs: PreWhatTheySayAboutUs;
  whyWorkWithUsSection: WhyWorkWithUs[];
  faqSection: FAQ[];
  testimonialsSection: Testimonial[];
  jobSection: Job[];
  achievementSection: Achievement[];
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
  ]);

  const howItWorksItems: HowItWorksItem[] =
    dataResponse[2]?.data?.howItWorksItems || [];

  const preWhatTheySayAboutUs: PreWhatTheySayAboutUs = dataResponse[4]?.data
    ?.preWhatTheySayAboutUsSection?.[0] || {
    content: "Default PreWhatTheySayAboutUs content",
  };

  const whyWorkWithUsSection: WhyWorkWithUs[] =
    dataResponse[5]?.data?.whyWorkWithUsSection || [];

  const faqSection: FAQ[] = dataResponse[6]?.data?.faqSection || [];

  const testimonialsSection: Testimonial[] =
    dataResponse[7]?.data?.testimonialsSection || [];

  const jobSection: Job[] = dataResponse[9]?.data?.jobSection || [];

  const achievementSection: Achievement[] =
    dataResponse[10]?.data?.achievementSection || [];

  return json<LoaderData>({
    howItWorksItems,
    preWhatTheySayAboutUs,
    whyWorkWithUsSection,
    faqSection,
    testimonialsSection,
    jobSection,
    achievementSection,
  });
};

export default function Layout() {
  return (
    <div className="container" style={{ fontFamily: "system-ui, sans-serif" }}>
      <ForFreelancersPage />
    </div>
  );
}
