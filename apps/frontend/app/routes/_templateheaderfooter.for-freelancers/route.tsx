// that route.tsx is for forFrelancers page, and i dont need edit on it
import { json, LoaderFunctionArgs } from "@remix-run/node";
import ForFreelancersPage from "./ForFreelancers";
import { fetchCMSData } from "~/api/fetch-cms-data.server";
import {
  GET_FEATURES_QUERY, // Still fetched, but unused
  GET_FOREMPLOYERSSUBHEADLINE_QUERY, // Still fetched, but unused
  GET_HOW_IT_WORKS_QUERY,
  GET_POSTHOWITWORKS_QUERY, // Still fetched, but unused
  GET_PREWHATTHEYSAYABOUTUS_QUERY,
  GET_WHYWORKWITHUS_QUERY,
  GET_FAQS_QUERY,
  GET_TESTIMONIALS_QUERY,
  GET_BLOG_CARDS_QUERY, // Still fetched, but unused
  GET_ALL_JOBS_QUERY, // Add the new jobs query here
  GET_ACHIEVEMENTS_QUERY, // Add the new achievements query here
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
  jobSection: Job[]; // Add jobSection to the loader data
  achievementSection: Achievement[]; // Add achievementSection to the loader data
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const dataResponse = await fetchCMSData([
    GET_FEATURES_QUERY, // Still fetched, but unused
    GET_FOREMPLOYERSSUBHEADLINE_QUERY, // Still fetched, but unused
    GET_HOW_IT_WORKS_QUERY,
    GET_POSTHOWITWORKS_QUERY, // Still fetched, but unused
    GET_PREWHATTHEYSAYABOUTUS_QUERY,
    GET_WHYWORKWITHUS_QUERY,
    GET_FAQS_QUERY,
    GET_TESTIMONIALS_QUERY,
    GET_BLOG_CARDS_QUERY, // Still fetched, but unused
    GET_ALL_JOBS_QUERY, // Add the new jobs query
    GET_ACHIEVEMENTS_QUERY, // Add the new achievements query
  ]);

  // Extract only the relevant data from the response
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

  // Extract job data from the JobSection query
  const jobSection: Job[] = dataResponse[9]?.data?.jobSection || [];

  // Extract achievement data from the achievementSection query
  const achievementSection: Achievement[] =
    dataResponse[10]?.data?.achievementSection || [];

  console.log("Full Data Response:", JSON.stringify(dataResponse, null, 2));
  // Log the extracted job data for debugging
  console.log("Extracted How It Works Items:", howItWorksItems);
  console.log("Extracted Pre What They Say About Us:", preWhatTheySayAboutUs);
  console.log("Extracted Why Work With Us:", whyWorkWithUsSection);
  console.log("Extracted FAQs:", faqSection);
  console.log("Extracted Testimonials:", testimonialsSection);
  console.log("Extracted Job Data:", jobSection);
  console.log("Extracted Achievement Data:", achievementSection);
  console.log("hiii");

  return json<LoaderData>({
    howItWorksItems,
    preWhatTheySayAboutUs,
    whyWorkWithUsSection,
    faqSection,
    testimonialsSection,
    jobSection, // Include jobSection
    achievementSection, // Include achievementSection
  });
};

export default function Layout() {
  return (
    <div className="container" style={{ fontFamily: "system-ui, sans-serif" }}>
      <ForFreelancersPage />
    </div>
  );
}
