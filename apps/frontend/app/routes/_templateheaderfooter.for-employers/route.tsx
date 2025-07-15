import { json, LoaderFunctionArgs } from '@remix-run/node';
import Home from '~/routes/_templateheaderfooter.for-employers/Home';
import { fetchCMSData } from '~/api/fetch-cms-data.server';
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
} from '../../../../shared/cms-queries';
import {
  HowItWorksItem,
  SubHeadline,
  Feature,
  PostHowItWorksItem,
  PreWhatTheySayAboutUs,
  WhyWorkWithUs,
  FAQ,
  Testimonial,
  BlogCard,
} from '../../types/PageContent';

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
  ]);

  const subHeadline: SubHeadline = dataResponse[1]?.data?.forEmployersSubHeadlines?.[0] || {
    content: 'Default forEmployersSubheadline content',
  };

  const howItWorksItems: HowItWorksItem[] = dataResponse[2]?.data?.howItWorksItems || [];

  const features: Feature[] = dataResponse[0]?.data?.features || [];
  const postHowItWorks: PostHowItWorksItem = dataResponse[3]?.data?.postHowItWorksSection?.[0] || {
    content: 'Default PostHowItWorks content',
  };
  const preWhatTheySayAboutUs: PreWhatTheySayAboutUs = dataResponse[4]?.data
    ?.preWhatTheySayAboutUsSection?.[0] || {
    content: 'Default PreWhatTheySayAboutUs content',
  };
  const whyWorkWithUsSection: WhyWorkWithUs[] = dataResponse[5]?.data?.whyWorkWithUsSection || [];
  const faqSection: FAQ[] = dataResponse[6]?.data?.faqSection || [];
  const testimonialsSection: Testimonial[] = dataResponse[7]?.data?.testimonialsSection || [];
  const blogCardSection: BlogCard[] = dataResponse[8]?.data?.blogCardSection || [];

  // console.log('HOW-IT-WORKS from CMS →', JSON.stringify(dataResponse[0]?.data, null, 2));
  // console.log('postHowItWorks:', postHowItWorks);

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
  });
};

export default function Layout() {
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', lineHeight: '1.8' }}>
      <Home />
    </div>
  );
}
