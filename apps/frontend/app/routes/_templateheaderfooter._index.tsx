// that route.tsx calls home :)

import { json, LoaderFunctionArgs } from "@remix-run/node";
import Home from "~/routes/_templateheaderfooter.for-employers/Home";
import { fetchCMSData } from "~/api/fetch-cms-data.server";
import {
  GET_FEATURES_QUERY,
  GET_SUBHEADLINE_QUERY,
  GET_HOW_IT_WORKS_QUERY,
} from "../../../shared/cms-queries";

/* 
we use this function to fetch the data for the entire page, and pass it to the Layout component
*/
export const loader = async ({ request }: LoaderFunctionArgs) => {
  console.log("Loading data for freelancers home");
  const dataResponse = await fetchCMSData([
    GET_FEATURES_QUERY,
    GET_SUBHEADLINE_QUERY,
    GET_HOW_IT_WORKS_QUERY,
  ]);
  if (!dataResponse.length) {
    return json({ error: "Error fetching data" }, { status: 500 });
  }
  console.log("Data response: ", dataResponse);
  const data = {
    features: dataResponse[0]?.data?.features,
    forFreelancersSubHeadlines:
      dataResponse[1]?.data?.forFreelancersSubHeadline,
    howItWorksItems: dataResponse[2]?.data?.howItWorksItems,
  };
  return json(data);
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
