import { json, LoaderFunctionArgs } from "@remix-run/node";
import Home from "~/routes/_templateheaderfooter.for-employers/Home";
import { fetchCMSData } from "~/api/fetch-cms-data.server";
import {
  GET_FEATURES_QUERY,
  GET_SUBHEADLINE_QUERY, // Add this to fetch the subheadline
  GET_HOW_IT_WORKS_QUERY,
} from "../../../shared/cms-queries";

// Define TypeScript types for the loader data structure
interface HowItWorksItem {
  stepNb: number;
  title: string;
  description: string;
  imageUrl?: string; // Optional, in case the image is missing
}

interface SubHeadline {
  content: string;
}

// Define the overall data structure returned by the loader
interface LoaderData {
  subHeadline: SubHeadline; // Add the subheadline type
  howItWorksItems: HowItWorksItem[];
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const dataResponse = await fetchCMSData([
    GET_FEATURES_QUERY,
    GET_SUBHEADLINE_QUERY, // Fetch the subheadline
    GET_HOW_IT_WORKS_QUERY,
  ]);

  // Log the full data response
  console.log(
    "Full Data Response from CMS:",
    JSON.stringify(dataResponse, null, 2)
  );

  // Extract the subheadline from the array
  const subHeadline: SubHeadline = dataResponse[1]?.data
    ?.forEmployersSubHeadlines?.[0] || {
    content: "Default subheadline content",
  };

  const howItWorksItems: HowItWorksItem[] =
    dataResponse[2]?.data?.howItWorksItems || [];

  // Log the extracted subheadline to verify correctness
  console.log("Extracted Subheadline:", subHeadline);

  // Return the data in JSON format to the component
  return json<LoaderData>({
    subHeadline, // Now using the correct field and first array item
    howItWorksItems,
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
