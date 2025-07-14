// that route.tsx is for forFrelancers page, and i dont need edit on it // that was on the past 😂
import { json, LoaderFunctionArgs } from '@remix-run/node';
import ForFreelancersPage from './ForFreelancers';
import { fetchCMSData } from '~/api/fetch-cms-data.server';
import {
  GET_HOW_IT_WORKS_QUERY,
  GET_PREWHATTHEYSAYABOUTUS_QUERY,
  GET_WHYWORKWITHUS_QUERY,
  GET_FAQS_QUERY,
  GET_TESTIMONIALS_QUERY,
  GET_ALL_JOBS_QUERY,
  GET_ACHIEVEMENTS_QUERY,
  GET_POSTHOWITWORKS_QUERY,
} from '../../../../shared/cms-queries'; // the problem here is that i cant delete anything in the loader here eventhough i dont need the subheadline or features or blogCard
import {
  HowItWorksItem,
  PreWhatTheySayAboutUs,
  WhyWorkWithUs,
  FAQ,
  Testimonial,
  Job,
  Achievement,
} from '../../types/PageContent';

interface LoaderData {
  howItWorksItems: HowItWorksItem[];
  preWhatTheySayAboutUs: PreWhatTheySayAboutUs;
  postHowItWorks: { content: string };
  whyWorkWithUsSection: WhyWorkWithUs[];
  faqSection: FAQ[];
  testimonialsSection: Testimonial[];
  jobSection: Job[];
  achievementSection: Achievement[];
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const dataResponse = await fetchCMSData([
    GET_HOW_IT_WORKS_QUERY,
    GET_PREWHATTHEYSAYABOUTUS_QUERY,
    GET_POSTHOWITWORKS_QUERY,
    GET_WHYWORKWITHUS_QUERY,
    GET_FAQS_QUERY,
    GET_TESTIMONIALS_QUERY,
    GET_ALL_JOBS_QUERY,
    GET_ACHIEVEMENTS_QUERY,
  ]);

  const howItWorksItems = dataResponse[0]?.data?.howItWorksItems || [];

  const preWhatTheySayAboutUs = dataResponse[1]?.data?.preWhatTheySayAboutUsSection?.[0] ?? {
    content: 'Default PreWhatTheySayAboutUs content',
  };

  const postHowItWorks = dataResponse[2]?.data?.postHowItWorksSection?.[0] ?? {
    content: 'Default PostHowItWorks content',
  };

  const whyWorkWithUsSection = dataResponse[3]?.data?.whyWorkWithUsSection || [];

  const faqSection = dataResponse[4]?.data?.faqSection || [];

  const testimonialsSection = dataResponse[5]?.data?.testimonialsSection || [];

  const jobSection = dataResponse[6]?.data?.jobSection || [];

  const achievementSection = dataResponse[7]?.data?.achievementSection || [];

  // console.log('postHowItWorks:', postHowItWorks);

  return json<LoaderData>({
    howItWorksItems,
    preWhatTheySayAboutUs,
    postHowItWorks,
    whyWorkWithUsSection,
    faqSection,
    testimonialsSection,
    jobSection,
    achievementSection,
  });
};

export default function Layout() {
  return (
    <div className="container" style={{ fontFamily: 'system-ui, sans-serif' }}>
      <ForFreelancersPage />
    </div>
  );
}
