import { json, LoaderFunctionArgs } from "@remix-run/node";
import Home from "~/routes/_templateheaderfooter.for-employers/Home";
import { fetchCMSData } from "~/api/fetch-cms-data.server";
import {
  GET_FEATURES_QUERY,
  GET_FOREMPLOYERSSUBHEADLINE_QUERY,
  GET_HOW_IT_WORKS_QUERY,
  GET_POSTHOWITWORKS_QUERY,
  GET_PREWHATTHEYSAYABOUTUS_QUERY,
} from "../../../shared/cms-queries";

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

interface LoaderData {
  subHeadline: SubHeadline;
  howItWorksItems: HowItWorksItem[];
  features: Feature[];
  postHowItWorks: PostHowItWorksItem;
  preWhatTheySayAboutUs: PreWhatTheySayAboutUs;
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const dataResponse = await fetchCMSData([
    GET_FEATURES_QUERY,
    GET_FOREMPLOYERSSUBHEADLINE_QUERY,
    GET_HOW_IT_WORKS_QUERY,
    GET_POSTHOWITWORKS_QUERY,
    GET_PREWHATTHEYSAYABOUTUS_QUERY,
  ]);

  console.log(
    "Full Data Response from CMS:",
    JSON.stringify(dataResponse, null, 2)
  );

  const subHeadline: SubHeadline = dataResponse[1]?.data
    ?.forEmployersSubHeadlines?.[0] || {
    content: "Default forEmployersSubheadline content",
  };

  const howItWorksItems: HowItWorksItem[] =
    dataResponse[2]?.data?.howItWorksItems || [];
  const features: Feature[] = dataResponse[0]?.data?.features || [];

  // Use the correct fields as suggested by GraphQL playground
  const postHowItWorks: PostHowItWorksItem = dataResponse[3]?.data
    ?.postHowItWorksSection?.[0] || {
    content: "Default PostHowItWorks content",
  };

  const preWhatTheySayAboutUs: PreWhatTheySayAboutUs = dataResponse[4]?.data
    ?.preWhatTheySayAboutUsSection?.[0] || {
    content: "Default PreWhatTheySayAboutUs content",
  };

  console.log("Extracted For Employers Subheadline:", subHeadline);
  console.log("Extracted How It Works Items:", howItWorksItems);
  console.log("Extracted Features:", features);
  console.log("Extracted Post How It Works:", postHowItWorks);
  console.log("Extracted Pre What They Say About Us:", preWhatTheySayAboutUs);

  return json<LoaderData>({
    subHeadline,
    howItWorksItems,
    features,
    postHowItWorks,
    preWhatTheySayAboutUs,
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
